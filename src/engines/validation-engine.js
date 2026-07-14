import { datasetEngine } from './dataset-engine.js';
import { logger } from '../core/logger.js';
import { PseoError, ERROR_CODES } from '../core/errors.js';

/**
 * Validation Engine executing Level 3 (geographic relationships) and Level 4 (integrity/uniqueness rules).
 */
class ValidationEngine {
  /**
   * Performs validation across loaded datasets.
   * @returns {Record<string, any>} Validation report.
   */
  validateAll() {
    logger.info('validation-engine', 'Executing comprehensive validation suite...');
    const errors = [];
    const warnings = [];

    const states = datasetEngine.getAllStates();
    const cities = datasetEngine.getAllCities();

    // Map to track unique slug usage
    const citySlugs = new Map(); // slug -> filePath/info
    // Map to track ZIP code usage
    const zipCodeMap = new Map(); // zipCode -> city info

    // 1. Validate State relationships
    for (const state of states) {
      // capital check
      const capitalFound = cities.some(c => c.name === state.capital && c.state === state.abbreviation);
      if (!capitalFound) {
        warnings.push({
          message: `State capital "${state.capital}" not found in city records for state "${state.abbreviation}".`,
          path: `state:${state.abbreviation}.capital`,
        });
      }
    }

    // 2. Validate City integrity and uniqueness
    for (const city of cities) {
      const cityPath = `city:${city.slug}`;

      // A. Verify parent state exists
      const stateExists = datasetEngine.getState(city.state);
      if (!stateExists) {
        errors.push({
          message: `City "${city.city}" references unregistered parent state: "${city.state}".`,
          path: `${cityPath}.state`,
        });
      }

      // B. Check for duplicate slug (Level 4 validation)
      if (citySlugs.has(city.slug)) {
        const original = citySlugs.get(city.slug);
        errors.push({
          message: `Duplicate city slug detected: "${city.slug}" (First seen in: ${original.city}, State: ${original.state}).`,
          path: `${cityPath}.slug`,
        });
      } else {
        citySlugs.set(city.slug, { city: city.city, state: city.state });
      }

      // C. Check for duplicate ZIP code usage (Level 4 validation)
      for (const zip of city.zip_codes) {
        if (zipCodeMap.has(zip)) {
          const originalCity = zipCodeMap.get(zip);
          // If zip code is shared between two different cities in different locations
          if (originalCity.slug !== city.slug) {
            warnings.push({
              message: `ZIP code "${zip}" is shared between multiple cities: "${city.city}" and "${originalCity.city}".`,
              path: `${cityPath}.zip_codes`,
            });
          }
        } else {
          zipCodeMap.set(zip, { city: city.city, slug: city.slug });
        }
      }

      // D. Verify nearby cities relationship consistency (Level 3 validation)
      if (city.nearby_cities) {
        for (const nearby of city.nearby_cities) {
          const targetCity = datasetEngine.getCity(nearby.slug);
          if (!targetCity) {
            warnings.push({
              message: `City "${city.city}" lists unregistered city "${nearby.name}" (${nearby.slug}) as nearby.`,
              path: `${cityPath}.nearby_cities`,
            });
          }
        }
      }
    }

    const status = errors.length === 0 ? 'PASS' : 'FAIL';
    
    const report = {
      status,
      timestamp: new Date().toISOString(),
      summary: {
        totalStates: states.length,
        totalCities: cities.length,
        errorsCount: errors.length,
        warningsCount: warnings.length,
      },
      errors,
      warnings,
    };

    if (status === 'FAIL') {
      logger.error('validation-engine', `Dataset validation FAILED with ${errors.length} errors.`, { report });
    } else {
      logger.info('validation-engine', `Dataset validation PASSED with ${warnings.length} warnings.`);
    }

    return report;
  }
}

export const validationEngine = new ValidationEngine();
