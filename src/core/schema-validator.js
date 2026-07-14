import { isValidSlug } from './utils.js';
import { PseoError, ERROR_CODES } from './errors.js';

/**
 * Dependency-free JSON validation engine.
 * Validates project configurations and geographic datasets against strict rules.
 */
export class SchemaValidator {
  /**
   * Helper to collect errors and throw on violation.
   * @private
   */
  static assert(condition, message, path, code = ERROR_CODES.DATA_INVALID) {
    if (!condition) {
      throw new PseoError(
        code,
        `Validation failed at [${path}]: ${message}`,
        'validation-engine',
        'ERROR',
        'Verify target JSON data matches the schemas outlined in JSON_SCHEMA.md.',
        { path }
      );
    }
  }

  /**
   * Validates a State Dataset object.
   * Schema matches rules in docs/JSON_SCHEMA.md.
   * @param {Record<string, any>} stateObj
   */
  static validateState(stateObj) {
    const path = `state:${stateObj?.abbreviation || 'unknown'}`;
    
    this.assert(stateObj && typeof stateObj === 'object', 'State must be an object', path);
    this.assert(typeof stateObj.name === 'string' && stateObj.name.length > 0, 'name is required and must be a string', `${path}.name`);
    this.assert(typeof stateObj.abbreviation === 'string' && /^[A-Z]{2}$/.test(stateObj.abbreviation), 'abbreviation must be a 2-character uppercase string', `${path}.abbreviation`);
    this.assert(isValidSlug(stateObj.slug), 'slug is invalid or not kebab-case', `${path}.slug`);
    this.assert(typeof stateObj.capital === 'string', 'capital must be a string', `${path}.capital`);
    this.assert(stateObj.population !== undefined, 'population is required', `${path}.population`);
  }

  /**
   * Validates a City Dataset object.
   * Schema matches rules in docs/JSON_SCHEMA.md.
   * @param {Record<string, any>} cityObj
   */
  static validateCity(cityObj) {
    const path = `city:${cityObj?.slug || 'unknown'}`;

    this.assert(cityObj && typeof cityObj === 'object', 'City must be an object', path);
    this.assert(typeof cityObj.city === 'string' && cityObj.city.length > 0, 'city is required', `${path}.city`);
    this.assert(typeof cityObj.state === 'string' && /^[A-Z]{2}$/.test(cityObj.state), 'state must be a 2-character uppercase abbreviation', `${path}.state`);
    this.assert(typeof cityObj.county === 'string' && cityObj.county.length > 0, 'county is required', `${path}.county`);
    this.assert(isValidSlug(cityObj.slug), 'slug is invalid or not kebab-case', `${path}.slug`);
    
    // Coordinates (optional)
    if (cityObj.coordinates !== undefined) {
      this.assert(cityObj.coordinates && typeof cityObj.coordinates === 'object', 'coordinates must be an object', `${path}.coordinates`);
      if (cityObj.coordinates.latitude !== undefined) {
        this.assert(typeof cityObj.coordinates.latitude === 'number', 'latitude must be a number', `${path}.coordinates.latitude`);
      }
      if (cityObj.coordinates.longitude !== undefined) {
        this.assert(typeof cityObj.coordinates.longitude === 'number', 'longitude must be a number', `${path}.coordinates.longitude`);
      }
    }

    // ZIP codes
    this.assert(Array.isArray(cityObj.zip_codes) && cityObj.zip_codes.length > 0, 'zip_codes must be a non-empty array', `${path}.zip_codes`);
    cityObj.zip_codes.forEach((zip, index) => {
      this.assert(typeof zip === 'string' && /^\d{5}$/.test(zip), `zip code at index ${index} must be a 5-digit numeric string`, `${path}.zip_codes[${index}]`);
    });

    // Nearby cities
    if (cityObj.nearby_cities !== undefined) {
      this.assert(Array.isArray(cityObj.nearby_cities), 'nearby_cities must be an array', `${path}.nearby_cities`);
      cityObj.nearby_cities.forEach((nearby, index) => {
        const itemPath = `${path}.nearby_cities[${index}]`;
        this.assert(typeof nearby.name === 'string' && nearby.name.length > 0, 'nearby city name is required', `${itemPath}.name`);
        if (nearby.distance_miles !== undefined) {
          this.assert(typeof nearby.distance_miles === 'number', 'nearby city distance_miles must be a number', `${itemPath}.distance_miles`);
        }
        this.assert(isValidSlug(nearby.slug), 'nearby city slug must be a valid kebab-case slug', `${itemPath}.slug`);
      });
    }
  }

  /**
   * Validates a Service metadata object.
   * @param {Record<string, any>} serviceObj
   */
  static validateService(serviceObj) {
    const path = `service:${serviceObj?.id || 'unknown'}`;
    this.assert(serviceObj && typeof serviceObj === 'object', 'Service must be an object', path);
    this.assert(typeof serviceObj.id === 'string' && serviceObj.id.length > 0, 'id is required', `${path}.id`);
    this.assert(typeof serviceObj.name === 'string' && serviceObj.name.length > 0, 'name is required', `${path}.name`);
    this.assert(isValidSlug(serviceObj.slug), 'slug must be a valid kebab-case slug', `${path}.slug`);
    this.assert(typeof serviceObj.description === 'string', 'description must be a string', `${path}.description`);
  }

  /**
   * Validates an FAQ object.
   * @param {Record<string, any>} faqObj
   */
  static validateFaq(faqObj) {
    const path = 'faq';
    this.assert(faqObj && typeof faqObj === 'object', 'FAQ must be an object', path);
    this.assert(typeof faqObj.question === 'string' && faqObj.question.length > 0, 'question is required', `${path}.question`);
    this.assert(typeof faqObj.answer === 'string' && faqObj.answer.length > 0, 'answer is required', `${path}.answer`);
  }
}
