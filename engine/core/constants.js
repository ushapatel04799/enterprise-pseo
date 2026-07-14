/**
 * Module: constants
 * Purpose: Surface shared constant values consumed across the Enterprise PSEO engine.
 * Responsibilities: Define countries, languages, timezones, image/output formats, cache keys,
 * build modes, and log levels as frozen canonical values.
 * Dependencies: None. This module imports nothing so it can be loaded from any entry point
 * without side effects or cycles.
 */

/**
 * Countries supported by the engine.
 *
 * @type {Readonly<string[]>}
 */
export const SUPPORTED_COUNTRIES = Object.freeze(['US']);

/**
 * Country selected when none is specified.
 *
 * @type {string}
 */
export const DEFAULT_COUNTRY = 'US';

/**
 * Language selected when none is specified.
 *
 * @type {string}
 */
export const DEFAULT_LANGUAGE = 'en';

/**
 * Timezone selected when none is specified.
 *
 * @type {string}
 */
export const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Image formats the engine can emit or consume.
 *
 * @type {Readonly<string[]>}
 */
export const SUPPORTED_IMAGE_FORMATS = Object.freeze(['webp', 'png', 'jpg', 'svg']);

/**
 * Image format selected when none is specified.
 *
 * @type {string}
 */
export const DEFAULT_IMAGE_FORMAT = 'webp';

/**
 * Output formats the engine can emit.
 *
 * @type {Readonly<string[]>}
 */
export const SUPPORTED_OUTPUT_FORMATS = Object.freeze(['html', 'json', 'xml']);

/**
 * Output format selected when none is specified.
 *
 * @type {string}
 */
export const DEFAULT_OUTPUT_FORMAT = 'html';

/**
 * Canonical cache key prefixes used to namespace cached entries across modules.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const CACHE_KEYS = Object.freeze({
  state: 'state:',
  city: 'cities:',
  county: 'counties:',
  business: 'business:',
  service: 'service:',
  template: 'template:',
});

/**
 * Build modes recognized by the engine.
 *
 * @type {Readonly<string[]>}
 */
export const BUILD_MODES = Object.freeze(['development', 'production', 'staging']);

/**
 * Recognized log severity levels, ordered from most to least verbose.
 *
 * @type {Readonly<string[]>}
 */
export const LOG_LEVELS = Object.freeze(['debug', 'info', 'warn', 'error']);
