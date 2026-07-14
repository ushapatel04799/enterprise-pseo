/**
 * Module: countyLoader
 * Purpose: Load and expose U.S. county datasets for the Location Engine.
 * Responsibilities: Resolve county datasets per state, load raw county data from the Data tier, and normalize it for downstream consumers.
 * Dependencies: DataLoader (engine/data/loader.js), the stateLoader module, and the slugResolver module.
 *
 * Note: county records are sourced from each state's dataset (the `{ "<Name> County": { description, population } }`
 * map), which the Data tier exposes via `DataLoader.loadState`. A separate `counties/` dataset is not present
 * in the current data layout, so this loader derives counties from the state record rather than calling
 * `DataLoader.loadCounty`.
 */

import { DataLoadError } from '../data/loader.js';
import { MemoryCache } from '../data/cache.js';
import { loadState } from './stateLoader.js';

/**
 * @typedef {Object} CountyRecord
 * @property {string} name County display name (for example, `Los Angeles County`).
 * @property {string} slug Canonical county slug (for example, `los-angeles-county-ca`).
 * @property {string} stateCode Lowercase state code this county belongs to.
 * @property {string} description County description.
 * @property {string} population County population as stored (string).
 */

/**
 * Loads the county dataset for a single state, derived from its state record.
 *
 * Missing or unreadable states resolve to `undefined` rather than throwing.
 *
 * @param {import('../data/loader.js').DataLoader} dataLoader Configured dataset loader.
 * @param {string} stateCode Lowercase state identifier (for example, `fl`).
 * @param {{cache?: MemoryCache}} [options] Optional cache for normalized county arrays.
 * @returns {Promise<CountyRecord[] | undefined>} Normalized array of county records, or undefined when the state is missing from the data tier.
 */
export async function loadCountiesByState(dataLoader, stateCode, options = {}) {
  const cache = options.cache;
  const code = normalizeStateCode(stateCode);
  const cacheKey = `counties:${code}`;

  if (cache) {
    const cached = cache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }
  }

  const state = await loadState(dataLoader, code, options);

  if (!state) {
    return undefined;
  }

  const counties = Object.entries(state.counties).map(([name, value]) => normalizeCounty(code, name, value));
  Object.freeze(counties);

  if (cache) {
    cache.set(cacheKey, counties);
  }

  return counties;
}

/**
 * Loads a single county within a state by its slug or name.
 *
 * @param {import('../data/loader.js').DataLoader} dataLoader Configured dataset loader.
 * @param {string} stateCode Lowercase state identifier.
 * @param {string} countySlug County slug (for example, `los-angeles-county-ca`) or display name.
 * @param {{cache?: MemoryCache}} [options] Optional cache for normalized county arrays.
 * @returns {Promise<CountyRecord | undefined>} Matching county record, or undefined when absent or when the state is missing.
 */
export async function loadCountyBySlug(dataLoader, stateCode, countySlug, options = {}) {
  const counties = await loadCountiesByState(dataLoader, stateCode, options);

  if (!counties) {
    return undefined;
  }

  const code = normalizeStateCode(stateCode);
  const target = normalizeCountySlug(countySlug);
  const targetName = String(countySlug).trim().toLowerCase();

  return counties.find(
    (entry) =>
      entry.slug === target ||
      entry.slug === `${target}-${code}` ||
      entry.name.toLowerCase() === targetName,
  );
}

/**
 * Clears the cached normalized county array for a single state code.
 *
 * @param {{cache?: MemoryCache}} options Options carrying the shared cache.
 * @param {string} stateCode Lowercase state identifier to invalidate.
 * @returns {boolean} Whether a cached entry was removed.
 */
export function clearCountyCache(options, stateCode) {
  const cache = options?.cache;

  if (!cache) {
    return false;
  }

  return cache.delete(`counties:${normalizeStateCode(stateCode)}`);
}

/**
 * Normalizes one county map entry into a Location Engine county record.
 *
 * @param {string} stateCode Lowercase state code the county belongs to.
 * @param {string} name County display name (the map key).
 * @param {{description?: unknown, population?: unknown}} value County map value.
 * @returns {CountyRecord} Normalized county record.
 * @private
 */
function normalizeCounty(stateCode, name, value) {
  return {
    name,
    slug: `${slugify(name)}-${stateCode}`,
    stateCode,
    description: String(value?.description ?? ''),
    population: String(value?.population ?? ''),
  };
}

/**
 * Converts a display name into a slug-compatible token.
 *
 * @param {string} value Display name.
 * @returns {string} Slug token.
 * @private
 */
function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes a state code to its canonical lowercase form.
 *
 * @param {string} stateCode Raw state identifier.
 * @returns {string} Canonical lowercase state code.
 * @private
 */
function normalizeStateCode(stateCode) {
  if (typeof stateCode !== 'string' || stateCode.trim() === '') {
    throw new TypeError('stateCode must be a non-empty string.');
  }

  return stateCode.trim().toLowerCase();
}

/**
 * Normalizes a county slug to a comparable lowercase form.
 *
 * @param {string} countySlug Raw county slug or name.
 * @returns {string} Normalized county slug.
 * @private
 */
function normalizeCountySlug(countySlug) {
  if (typeof countySlug !== 'string' || countySlug.trim() === '') {
    throw new TypeError('countySlug must be a non-empty string.');
  }

  return countySlug.trim().toLowerCase();
}
