/**
 * Module: stateLoader
 * Purpose: Load and expose U.S. state datasets for the Location Engine.
 * Responsibilities: Resolve state codes, load raw state data from the Data tier, and normalize it for downstream consumers.
 * Dependencies: DataLoader (engine/data/loader.js) and the slugResolver module.
 */

import { DataLoadError } from '../data/loader.js';
import { MemoryCache } from '../data/cache.js';
import { normalizeSlug } from './slugResolver.js';

/**
 * Loads a single state dataset by its lowercase state code.
 *
 * The state files store county data as an object keyed by `"<Name> County"` with
 * `{ description, population }` values. The returned record surfaces that map as
 * `counties` plus a derived `countyCount`, while keeping the canonical `code`.
 *
 * A missing or unreadable state resolves to `undefined` rather than throwing, so
 * callers can treat absent states uniformly (see `getMissingStateError`).
 *
 * @param {import('../data/loader.js').DataLoader} dataLoader Configured dataset loader.
 * @param {string} stateCode Lowercase state identifier (for example, `ca`).
 * @param {{cache?: MemoryCache}} [options] Optional cache for normalized state records.
 * @returns {Promise<{code: string, counties: Record<string, {description: string, population: string}>, countyCount: number} | undefined>} Normalized state record, or undefined when the state is missing from the data tier.
 */
export async function loadState(dataLoader, stateCode, options = {}) {
  const cache = options.cache;
  const code = normalizeStateCode(stateCode);
  const cacheKey = `state:${code}`;

  if (cache) {
    const cached = cache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }
  }

  let raw;
  try {
    raw = await dataLoader.loadState(code);
  } catch (error) {
    if (error instanceof DataLoadError) {
      return undefined;
    }

    throw error;
  }

  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const counties = /** @type {Record<string, {description: string, population: string}>} */ (raw);
  const state = {
    code,
    counties,
    countyCount: Object.keys(counties).length,
  };

  if (cache) {
    cache.set(cacheKey, state);
  }

  return state;
}

/**
 * Resolves every available state dataset, returning a map keyed by state code.
 *
 * Missing states are silently omitted rather than rejected, so a single absent
 * state cannot fail the batch.
 *
 * @param {import('../data/loader.js').DataLoader} dataLoader Configured dataset loader.
 * @param {readonly string[]} stateCodes Lowercase state codes to load.
 * @param {{cache?: MemoryCache}} [options] Optional cache for normalized state records.
 * @returns {Promise<Record<string, {code: string, counties: Record<string, {description: string, population: string}>, countyCount: number}>>} Map of state code to state record.
 */
export async function loadAllStates(dataLoader, stateCodes, options = {}) {
  if (!Array.isArray(stateCodes)) {
    throw new TypeError('stateCodes must be an array of state identifiers.');
  }

  const settled = await Promise.all(
    stateCodes.map((code) => loadState(dataLoader, code, options).then((state) => (state ? [state.code, state] : undefined))),
  );

  return Object.fromEntries(/** @type {[string, unknown][]} */ (settled.filter(Boolean)));
}

/**
 * Clears the cached normalized state record for a single state code.
 *
 * @param {{cache?: MemoryCache}} options Options carrying the shared cache.
 * @param {string} stateCode Lowercase state identifier to invalidate.
 * @returns {boolean} Whether a cached entry was removed.
 */
export function clearStateCache(options, stateCode) {
  const cache = options?.cache;

  if (!cache) {
    return false;
  }

  return cache.delete(`state:${normalizeStateCode(stateCode)}`);
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

  // State codes are already two-letter tokens; normalizeSlug yields the same lowercase form.
  return normalizeSlug(stateCode);
}
