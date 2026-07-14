/**
 * Module: locationService
 * Purpose: Facade exposing a single entry point for all Location Engine queries.
 * Responsibilities: Compose state, city, and county loaders into higher-level lookups and own error handling for missing states.
 * Dependencies: stateLoader, cityLoader, countyLoader, and slugResolver modules.
 */

/**
 * Loads a state together with its city and county datasets in one call.
 *
 * @param {import('../data/loader.js').DataLoader} dataLoader Configured dataset loader.
 * @param {string} stateCode Lowercase state identifier.
 * @returns {Promise<{state: Record<string, unknown>, cities: Record<string, unknown>[], counties: Record<string, unknown>[]}>} Aggregated location bundle.
 */
export async function loadStateBundle(dataLoader, stateCode) {}

/**
 * Resolves a full location record from a state code and city slug, including its county relationship.
 *
 * @param {import('../data/loader.js').DataLoader} dataLoader Configured dataset loader.
 * @param {string} stateCode Lowercase state identifier.
 * @param {string} citySlug City slug.
 * @returns {Promise<{city: Record<string, unknown>, county: Record<string, unknown> | undefined, state: Record<string, unknown>} | undefined>} Resolved location tuple, or undefined when any member is missing.
 */
export async function resolveLocation(dataLoader, stateCode, citySlug) {}

/**
 * Returns a consistent error or sentinel when a requested state is missing from the data tier.
 *
 * @param {string} stateCode Lowercase state identifier that was requested.
 * @returns {{stateCode: string, reason: string}} Missing-state descriptor.
 */
export function getMissingStateError(stateCode) {}
