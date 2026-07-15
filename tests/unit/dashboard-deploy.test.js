import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { dashboardEngine } from '../../src/engines/dashboard-engine.js';
import { cloudflareAdapter } from '../../src/adapters/deployment/cloudflare-adapter.js';

describe('Dashboard & Deployment Layer Tests', () => {
  const reportsDir = path.resolve('generated/reports');
  const backupsDir = path.resolve('data/derived/deployments');
  const historyFile = path.resolve('data/derived/deploy-history.json');
  const testPagesDir = path.resolve('src/pages');

  before(async () => {
    // Setup dummy page in src/pages to deploy
    await fs.mkdir(testPagesDir, { recursive: true });
    await fs.writeFile(path.join(testPagesDir, 'dummy.html'), '<h1>Test</h1>', 'utf8');
  });

  after(async () => {
    // Cleanup generated artifacts
    await fs.unlink(path.join(reportsDir, 'build-report.json')).catch(() => {});
    await fs.unlink(path.join(reportsDir, 'dashboard.html')).catch(() => {});
    await fs.rmdir(reportsDir).catch(() => {});
    await fs.unlink(path.join(testPagesDir, 'dummy.html')).catch(() => {});
    await fs.rmdir(testPagesDir).catch(() => {});
    await fs.rm(backupsDir, { recursive: true, force: true }).catch(() => {});
    await fs.unlink(historyFile).catch(() => {});
  });

  describe('DashboardEngine', () => {
    it('should generate build-report.json and dashboard.html', async () => {
      const summary = {
        mode: 'preview',
        totalTargets: 1,
        successCount: 1,
        failedCount: 0,
        failedPages: [],
      };

      const targetsDetail = [
        {
          state: 'TX',
          city: 'Austin',
          service: 'Termite Control',
          status: 'PASS',
          score: 100,
          reason: null,
          outputPath: 'src/pages/tx/austin-termite-control.html',
        }
      ];

      const result = await dashboardEngine.generateReports(summary, targetsDetail);

      const jsonExists = await fs.access(result.jsonPath).then(() => true).catch(() => false);
      const htmlExists = await fs.access(result.htmlPath).then(() => true).catch(() => false);

      assert.strictEqual(jsonExists, true);
      assert.strictEqual(htmlExists, true);

      const jsonRaw = await fs.readFile(result.jsonPath, 'utf8');
      const data = JSON.parse(jsonRaw);
      assert.strictEqual(data.summary.successCount, 1);
      assert.strictEqual(data.targets[0].city, 'Austin');

      const htmlContent = await fs.readFile(result.htmlPath, 'utf8');
      assert.ok(htmlContent.includes('PSEO Engine Execution Report'));
      assert.ok(htmlContent.includes('Austin'));
    });
  });

  describe('CloudflareAdapter (Deploy & Rollback)', () => {
    it('should perform mock deployment and write to history log', async () => {
      const deployResult = await cloudflareAdapter.deploy('mock');

      assert.ok(deployResult.deployId);
      assert.strictEqual(deployResult.status, 'SUCCESS');
      assert.strictEqual(deployResult.isMock, true);

      const history = await cloudflareAdapter.getHistory();
      assert.ok(history.length > 0);
      assert.strictEqual(history[0].deployId, deployResult.deployId);

      // Verify backup exists
      const backupExists = await fs.access(deployResult.backupPath).then(() => true).catch(() => false);
      assert.strictEqual(backupExists, true);
    });

    it('should rollback to previous deployment files', async () => {
      const history = await cloudflareAdapter.getHistory();
      const targetDeploy = history[0];

      // Mutate current file to verify rollback replaces it
      await fs.writeFile(path.join(testPagesDir, 'dummy.html'), '<h1>Corrupted</h1>', 'utf8');

      const rollbackResult = await cloudflareAdapter.rollback(targetDeploy.deployId);
      assert.ok(rollbackResult.deployId);
      
      const fileContent = await fs.readFile(path.join(testPagesDir, 'dummy.html'), 'utf8');
      assert.strictEqual(fileContent, '<h1>Test</h1>'); // Restored
    });
  });
});
