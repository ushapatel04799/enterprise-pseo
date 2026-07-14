import { configManager } from '../core/config-manager.js';
import { logger } from '../core/logger.js';

/**
 * Reviewer Engine auditing generated AI text models against factual contexts and constraints.
 */
class ReviewerEngine {
  /**
   * Reviews page content model.
   * @param {Record<string, any>} contentModel - Generated AI content model.
   * @param {Record<string, any>} context - Original target Context Packet.
   * @returns {Record<string, any>} Quality audit report.
   */
  reviewPageContent(contentModel, context) {
    const errors = [];
    const warnings = [];
    let score = 100;

    const { business, location, seo } = context;
    const jsonText = JSON.stringify(contentModel);

    // 1. Validate Meta title & description lengths
    const titleLen = contentModel.title?.length || 0;
    const minTitle = configManager.get('seo.meta.title.min', 30);
    const maxTitle = configManager.get('seo.meta.title.max', 60);

    if (titleLen < minTitle || titleLen > maxTitle) {
      score -= 10;
      warnings.push({
        message: `Title length (${titleLen} chars) is outside optimal range (${minTitle}-${maxTitle} chars).`,
        path: 'title',
      });
    }

    const descLen = contentModel.description?.length || 0;
    const minDesc = configManager.get('seo.meta.description.min', 120);
    const maxDesc = configManager.get('seo.meta.description.max', 160);

    if (descLen < minDesc || descLen > maxDesc) {
      score -= 10;
      warnings.push({
        message: `Meta description length (${descLen} chars) is outside optimal range (${minDesc}-${maxDesc} chars).`,
        path: 'description',
      });
    }

    // 2. Validate Contact Phone match
    if (!jsonText.includes(business.phone)) {
      score -= 20;
      errors.push({
        message: `Generated page content does not display the business contact phone: "${business.phone}".`,
        path: 'content',
      });
    }

    // 3. Validate Local Relevance (City name & State inclusion)
    const cityRegex = new RegExp(`\\b${location.city}\\b`, 'i');
    const stateRegex = new RegExp(`\\b${location.state}\\b`, 'i');

    if (!cityRegex.test(contentModel.title) || !cityRegex.test(jsonText)) {
      score -= 20;
      errors.push({
        message: `Local relevance check failed: City name "${location.city}" is missing from title or body content.`,
        path: 'content',
      });
    }

    if (!stateRegex.test(jsonText)) {
      score -= 10;
      warnings.push({
        message: `Local relevance warning: State code "${location.state}" is missing from body content.`,
        path: 'content',
      });
    }

    // 4. Hallucination Checks (Check if unapproved zip codes are mentioned)
    const zipMatches = jsonText.match(/\b\d{5}\b/g) || [];
    const validZips = new Set(location.zipCodes);

    for (const zip of zipMatches) {
      // Expose error if city page mentions an unregistered ZIP code
      if (!validZips.has(zip) && zip !== business.address.postalCode) {
        score -= 20;
        errors.push({
          message: `Factual integrity failure: Generated page references unapproved ZIP code "${zip}".`,
          path: 'content',
        });
      }
    }

    const passed = errors.length === 0 && score >= 80;

    const auditReport = {
      passed,
      score: Math.max(0, score),
      timestamp: new Date().toISOString(),
      errors,
      warnings,
    };

    if (passed) {
      logger.info('reviewer-engine', `Quality audit PASSED with score: ${score}/100.`);
    } else {
      logger.warn('reviewer-engine', `Quality audit FAILED or flagged with score: ${score}/100. Errors: ${errors.length}, Warnings: ${warnings.length}`);
    }

    return auditReport;
  }
}

export const reviewerEngine = new ReviewerEngine();
