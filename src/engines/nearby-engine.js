import { knowledgeEngine } from './knowledge-engine.js';
import { logger } from '../core/logger.js';

/**
 * Nearby Engine responsible for filtering and resolving adjacent location links.
 */
class NearbyEngine {
  /**
   * Resolves the nearby city nodes for a given city.
   * @param {string} citySlug - Slug of the target city.
   * @param {number} [limit=5] - Maximum number of nearby cities to return.
   * @returns {Promise<Array<Record<string, any>>>} Array of resolved city nodes.
   */
  async getNearbyCities(citySlug, limit = 5) {
    const cityNode = await knowledgeEngine.getCity(citySlug);
    if (!cityNode) {
      logger.warn('nearby-engine', `Cannot resolve nearby cities: Target city "${citySlug}" not found in knowledge graph.`);
      return [];
    }

    if (!cityNode.nearby_cities || !Array.isArray(cityNode.nearby_cities)) {
      return [];
    }

    const resolved = [];

    for (const nearby of cityNode.nearby_cities) {
      if (resolved.length >= limit) break;

      const targetCity = await knowledgeEngine.getCity(nearby.slug);
      if (targetCity) {
        resolved.push({
          city: targetCity.city,
          slug: targetCity.slug,
          state: targetCity.state,
          county: targetCity.county,
          population: targetCity.population,
          distance_miles: nearby.distance_miles || null, // Preserve mock distances if set
        });
      } else {
        logger.debug('nearby-engine', `Nearby city "${nearby.name}" (${nearby.slug}) listed on "${cityNode.city}" is not registered in dataset.`);
      }
    }

    return resolved;
  }
}

export const nearbyEngine = new NearbyEngine();
