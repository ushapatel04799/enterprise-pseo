import fs from 'node:fs/promises';
import path from 'node:path';
import { datasetEngine } from '../src/engines/dataset-engine.js';
import { validationEngine } from '../src/engines/validation-engine.js';
import { knowledgeEngine } from '../src/engines/knowledge-engine.js';
import { configManager } from '../src/core/config-manager.js';
import { logger } from '../src/core/logger.js';

const REPORTS_DIR = path.resolve('reports');

/**
 * Script executing complete repository validation and outputting reports to /reports/.
 */
async function main() {
  logger.info('validate-data', 'Initiating comprehensive repository validation sweeps...');

  const errors = [];
  const warnings = [];

  // 1. Validate Configurations
  try {
    configManager.validate();
    logger.info('validate-data', 'Configuration validation PASSED.');
  } catch (err) {
    logger.error('validate-data', 'Configuration validation FAILED.', err);
    errors.push({
      type: 'CONFIG_ERROR',
      message: err.message,
      remediation: 'Check app.config.js, site.config.js, seo.config.js, and provider.config.js.',
    });
  }

  // 2. Load Datasets
  try {
    await datasetEngine.initialize();
    logger.info('validate-data', 'Source datasets parsed successfully.');
  } catch (err) {
    logger.error('validate-data', 'Source datasets ingestion FAILED.', err);
    errors.push({
      type: 'INGESTION_ERROR',
      message: err.message,
      remediation: 'Check JSON syntax and schema mappings.',
    });
  }

  // 3. Run Validation Engine Check gates (Slugs, ZIPs, County Mappings)
  let integrityReport = { status: 'UNKNOWN', errors: [], warnings: [] };
  try {
    integrityReport = validationEngine.validateAll();
    if (integrityReport.status === 'FAIL') {
      logger.error('validate-data', 'Geographic dataset integrity validation FAILED.');
    } else {
      logger.info('validate-data', 'Geographic dataset integrity validation PASSED.');
    }
  } catch (err) {
    logger.error('validate-data', 'Geographic validation execution encountered an exception.', err);
    errors.push({
      type: 'VALIDATION_EXCEPTION',
      message: err.message,
    });
  }

  // Merge validation report results
  if (integrityReport.errors && integrityReport.errors.length > 0) {
    integrityReport.errors.forEach(e => {
      errors.push({
        type: 'DATASET_ERROR',
        message: e.message,
        path: e.path,
      });
    });
  }

  if (integrityReport.warnings && integrityReport.warnings.length > 0) {
    integrityReport.warnings.forEach(w => {
      warnings.push({
        type: 'DATASET_WARNING',
        message: w.message,
        path: w.path,
      });
    });
  }

  // 4. Validate Templates & Structure
  const layoutPath = path.resolve('src/_layouts/main.njk');
  const hasLayout = await fs.access(layoutPath).then(() => true).catch(() => false);
  if (!hasLayout) {
    errors.push({
      type: 'TEMPLATE_ERROR',
      message: 'Base page layout "main.njk" is missing under src/_layouts/.',
      remediation: 'Restore src/_layouts/main.njk.',
    });
  } else {
    logger.info('validate-data', 'Layout structure template validation PASSED.');
  }

  // Compile final report JSON
  const finalReport = {
    projectId: 'enterprise-pseo',
    timestamp: new Date().toISOString(),
    status: errors.length === 0 ? 'PASS' : 'FAIL',
    summary: {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      datasets: {
        totalStates: datasetEngine.getAllStates().length,
        totalCities: datasetEngine.getAllCities().length,
        totalServices: datasetEngine.getAllServices().length,
      }
    },
    errors,
    warnings,
  };

  // Write reports under /reports
  await fs.mkdir(REPORTS_DIR, { recursive: true });
  
  const reportJsonPath = path.join(REPORTS_DIR, 'validation-report.json');
  await fs.writeFile(reportJsonPath, JSON.stringify(finalReport, null, 2), 'utf8');
  
  const reportMdPath = path.join(REPORTS_DIR, 'validation-report.md');
  const mdContent = buildMarkdownReport(finalReport);
  await fs.writeFile(reportMdPath, mdContent, 'utf8');

  logger.info('validate-data', `Validation reports compiled successfully in: ${REPORTS_DIR}`);

  if (finalReport.status === 'FAIL') {
    process.exit(1);
  }
}

/**
 * Builds Markdown representation of the validation report.
 */
function buildMarkdownReport(report) {
  return `# Data & Structural Validation Report

**Status:** ${report.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}  
**Date:** ${new Date(report.timestamp).toLocaleString()}  

## Summary
- **Errors Found:** ${report.summary.totalErrors}
- **Warnings Found:** ${report.summary.totalWarnings}
- **States Loaded:** ${report.summary.datasets.totalStates}
- **Cities Loaded:** ${report.summary.datasets.totalCities}
- **Services Loaded:** ${report.summary.datasets.totalServices}

${report.errors.length > 0 ? `## Errors\n${report.errors.map(e => `- **[${e.type}]** ${e.message} ${e.path ? `(Path: \`${e.path}\`)` : ''}`).join('\n')}` : ''}

${report.warnings.length > 0 ? `## Warnings (Filtered)\n- Count: ${report.warnings.length} (listed in details inside JSON file)` : ''}
`;
}

main().catch(err => {
  console.error('Fatal validation sweep failure:', err);
  process.exit(1);
});
