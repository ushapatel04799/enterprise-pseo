import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildCache } from '../../src/engines/build-cache.js';
import { datasetEngine } from '../../src/engines/dataset-engine.js';
import { buildOrchestrator } from '../../src/engines/build-orchestrator.js';

describe('Incremental Caching & Concurrency Tests', () => {
  const cachePath = path.resolve('data/derived/build-cache.json');
  const dummyOutputPath = path.resolve('src/pages/tx/dummy-test.html');

  before(async () => {
    // Load dataset engine fixtures
    await datasetEngine.initialize('tests/fixtures/locations/usa', 'data/services');
    await fs.mkdir(path.dirname(dummyOutputPath), { recursive: true });
    await fs.writeFile(dummyOutputPath, '<h1>Test</h1>', 'utf8');
  });

  after(async () => {
    // Cleanup cache registry and dummy pages
    await fs.unlink(cachePath).catch(() => {});
    await fs.unlink(dummyOutputPath).catch(() => {});
    await fs.rmdir(path.dirname(dummyOutputPath)).catch(() => {});
    await fs.rmdir(path.resolve('src/pages')).catch(() => {});
  });

  describe('BuildCache', () => {
    it('should calculate target MD5 checksums and check cache validity', async () => {
      const key = 'TX:austin:termite-control';
      const checksum = buildCache.getTargetChecksum('TX', 'austin', 'termite-control');

      assert.ok(checksum);
      assert.strictEqual(typeof checksum, 'string');

      // Not cached initially
      const invalid = await buildCache.isValid(key, checksum);
      assert.strictEqual(invalid, false);

      // Register target cache
      buildCache.set(key, checksum, dummyOutputPath);
      await buildCache.save();

      // Check cache validity now
      const valid = await buildCache.isValid(key, checksum);
      assert.strictEqual(valid, true);
    });
  });

  describe('Concurrency Pool Executor', () => {
    it('should run asynchronous tasks with strict concurrency limit', async () => {
      const activeWorkers = [];
      const executionLogs = [];
      let maxConcurrency = 0;

      const tasks = [1, 2, 3, 4, 5];
      const concurrencyLimit = 2;

      await buildOrchestrator.runConcurrentPool(concurrencyLimit, tasks, async (task) => {
        activeWorkers.push(task);
        maxConcurrency = Math.max(maxConcurrency, activeWorkers.length);
        executionLogs.push(`START:${task}`);

        // Simulate async delay
        await new Promise(res => setTimeout(res, 50));

        activeWorkers.splice(activeWorkers.indexOf(task), 1);
        executionLogs.push(`END:${task}`);
      });

      assert.strictEqual(maxConcurrency, concurrencyLimit);
      assert.strictEqual(executionLogs.length, 10);
    });
  });
});
