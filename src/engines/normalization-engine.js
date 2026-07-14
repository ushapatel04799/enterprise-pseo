import { parsePopulation } from '../core/utils.js';

/**
 * Normalization Engine to format datasets non-destructively.
 */
class NormalizationEngine {
  /**
   * Normalizes a state object.
   * @param {Record<string, any>} state
   * @returns {Record<string, any>} Normalized state.
   */
  normalizeState(state) {
    const normalized = { ...state };
    if (normalized.abbreviation) {
      normalized.abbreviation = normalized.abbreviation.toUpperCase().trim();
    }
    if (normalized.population !== undefined) {
      normalized.population = parsePopulation(normalized.population);
    }
    if (normalized.name) {
      normalized.name = normalized.name.trim();
    }
    if (normalized.capital) {
      normalized.capital = normalized.capital.trim();
    }
    return normalized;
  }

  /**
   * Normalizes a city object.
   * @param {Record<string, any>} city
   * @returns {Record<string, any>} Normalized city.
   */
  normalizeCity(city) {
    const normalized = { ...city };
    if (normalized.state) {
      normalized.state = normalized.state.toUpperCase().trim();
    }
    if (normalized.city) {
      normalized.city = normalized.city.trim();
    }
    if (normalized.population !== undefined) {
      normalized.population = parsePopulation(normalized.population);
    }
    if (normalized.zip_codes) {
      normalized.zip_codes = normalized.zip_codes.map(zip => zip.toString().trim());
    }
    if (normalized.nearby_cities) {
      normalized.nearby_cities = normalized.nearby_cities.map(nearby => ({
        ...nearby,
        name: nearby.name.trim(),
        slug: nearby.slug.trim().toLowerCase(),
        distance_miles: parseFloat(nearby.distance_miles) || 0,
      }));
    }
    return normalized;
  }
}

export const normalizationEngine = new NormalizationEngine();
