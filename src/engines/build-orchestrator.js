import { datasetEngine } from './dataset-engine.js';
import { validationEngine } from './validation-engine.js';
import { knowledgeEngine } from './knowledge-engine.js';
import { contextEngine } from './context-engine.js';
import { writerEngine } from './writer-engine.js';
import { reviewerEngine } from './reviewer-engine.js';
import { seoEngine } from './seo-engine.js';
import { generatorEngine } from './generator-engine.js';
import { logger } from '../core/logger.js';
import { PseoError, ERROR_CODES } from '../core/errors.js';
import { configManager } from '../core/config-manager.js';

/**
 * Build Orchestrator managing pipeline workflows.
 */
class BuildOrchestrator {
  /**
   * Runs the programmatic compilation build.
   * @param {string} mode - 'validation-only' | 'preview' | 'full'
   * @param {string} [sourceLocs] - Custom locations folder.
   * @param {string} [sourceServices] - Custom services folder.
   */
  async run(mode = 'full', sourceLocs = 'data/locations/usa', sourceServices = 'data/services') {
    logger.info('build-orchestrator', `Starting build execution in mode: "${mode}"`);

    // 1. Validate Project Config
    configManager.validate();

    // 2. Initialize Data loaders
    await datasetEngine.initialize(sourceLocs, sourceServices);

    // 3. Execute Data Validation gate (M1 Gate)
    const valReport = validationEngine.validateAll();
    if (valReport.status === 'FAIL') {
      throw new PseoError(
        ERROR_CODES.DATA_INVALID,
        'Source dataset validation failed. Halting build.',
        'build-orchestrator',
        'FATAL',
        'Check validation error logs and correct raw datasets.',
        { valReport }
      );
    }

    if (mode === 'validation-only') {
      logger.info('build-orchestrator', 'Validation only mode complete. No pages generated.');
      return { status: 'success', report: valReport };
    }

    // 4. Initialize Knowledge Graph
    knowledgeEngine.clear();
    knowledgeEngine.initialize();

    // 5. Select Build Targets (States, Cities, Services)
    const states = datasetEngine.getAllStates();
    const services = datasetEngine.getAllServices();

    // Limit targets for preview mode to save cost/time
    let targets = [];
    if (mode === 'preview') {
      // Choose only 1 state, 1 city, 1 service target
      const previewState = states[0];
      const stateCities = knowledgeEngine.getState(previewState.abbreviation).cities;
      if (stateCities.length > 0 && services.length > 0) {
        targets.push({
          state: previewState.abbreviation,
          city: stateCities[0].slug,
          service: services[0].id,
        });
      }
      logger.info('build-orchestrator', `Preview mode configured. Selected ${targets.length} target(s).`);
    } else {
      // Compile ALL permutations
      for (const state of states) {
        const stateCities = knowledgeEngine.getState(state.abbreviation).cities;
        for (const city of stateCities) {
          for (const service of services) {
            targets.push({
              state: state.abbreviation,
              city: city.slug,
              service: service.id,
            });
          }
        }
      }
      logger.info('build-orchestrator', `Full mode configured. Compiled ${targets.length} total target permutations.`);
    }

    // 6. Generation Loop
    const generatedPages = [];
    const failedPages = [];

    for (const target of targets) {
      try {
        // A. Context Packets
        const context = contextEngine.buildContextPacket(target.state, target.city, target.service);

        // B. Content Generation
        const contentModel = await writerEngine.generatePageContent(context);

        // C. Quality Audit Gate
        const audit = reviewerEngine.reviewPageContent(contentModel, context);
        if (!audit.passed) {
          logger.warn(
            'build-orchestrator', 
            `Target page "${context.seo.primaryKeyword}" failed quality gate. Score: ${audit.score}. Skipping.`,
            { audit }
          );
          failedPages.push({ target, score: audit.score, reason: 'Failed quality gate audits.' });
          continue;
        }

        // D. SEO & Schema Compile
        const seoModel = seoEngine.compileSeoModel(contentModel, context);

        // E. Static Page Generation
        await generatorEngine.generatePage(contentModel, seoModel, context);
        generatedPages.push(target);
      } catch (err) {
        logger.error('build-orchestrator', `Exception encountered on target target state: ${target.state}, city: ${target.city}`, err);
        failedPages.push({ target, reason: err.message });
      }
    }

    // 7. Sitemap & crawl helpers
    if (generatedPages.length > 0) {
      await generatorEngine.generateRobots();
    }

    const summary = {
      mode,
      totalTargets: targets.length,
      successCount: generatedPages.length,
      failedCount: failedPages.length,
      failedPages,
    };

    logger.info('build-orchestrator', 'Build process finished.', summary);
    return summary;
  }
}

export const buildOrchestrator = new BuildOrchestrator();
