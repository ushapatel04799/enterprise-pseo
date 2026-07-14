import { configManager } from '../core/config-manager.js';
import { slugify } from '../core/utils.js';

/**
 * Internal Link Engine creating crawl paths and anchor targets for nearby landing pages.
 */
class InternalLinkEngine {
  /**
   * Generates a list of link descriptors pointing to nearby pages for the active service.
   * @param {Record<string, any>} context - Validated Context Packet.
   * @returns {Array<Record<string, any>>} Array of link definitions (url, text).
   */
  generateNearbyLinks(context) {
    const { nearby, service } = context;
    const routingPattern = configManager.get('seo.routingPattern', '/{state}/{city}-{service}');
    const canonicalDomain = configManager.get('seo.canonicalDomain', '');

    return nearby.map(nearbyCity => {
      // Build destination path
      const linkPath = routingPattern
        .replace('{state}', nearbyCity.state ? nearbyCity.state.toLowerCase() : context.location.state.toLowerCase())
        .replace('{city}', slugify(nearbyCity.city))
        .replace('{service}', slugify(service.name));

      const url = `${canonicalDomain}${linkPath}`;
      const text = `${service.name} in ${nearbyCity.city}`;

      return {
        url,
        text,
        city: nearbyCity.city,
        slug: nearbyCity.slug,
      };
    });
  }
}

export const internalLinkEngine = new InternalLinkEngine();
