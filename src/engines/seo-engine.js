import { schemaEngine } from './schema-engine.js';
import { internalLinkEngine } from './internal-link-engine.js';
import { logger } from '../core/logger.js';

/**
 * SEO Engine organizing metadata headers, schema structured data, and linking networks.
 */
class SeoEngine {
  /**
   * Compiles the SEO and schema models for a generated page target.
   * @param {Record<string, any>} contentModel - Generated AI content model.
   * @param {Record<string, any>} context - Target Context Packet.
   * @returns {Record<string, any>} Unified SEO Model payload.
   */
  compileSeoModel(contentModel, context) {
    logger.info('seo-engine', `Compiling SEO configurations for page: "${context.seo.primaryKeyword}"...`);

    // Generate JSON-LD schema blocks
    const schemas = schemaEngine.generateSchemas(context);

    // Generate context-aware internal linking structures
    const links = internalLinkEngine.generateNearbyLinks(context);

    const seoModel = {
      meta: {
        title: contentModel.title || `${context.service.name} in ${context.location.city}, ${context.location.state}`,
        description: contentModel.description || ` Apex Pest Control provides local ${context.service.name.toLowerCase()} in ${context.location.city}.`,
        canonicalUrl: context.seo.canonicalUrl,
      },
      schemas,
      links,
    };

    logger.info('seo-engine', `SEO compilation completed. Generated ${schemas.length} schemas and ${links.length} inter-links.`);
    return seoModel;
  }
}

export const seoEngine = new SeoEngine();
