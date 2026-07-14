/**
 * Module: environment
 * Purpose: Detect and expose the active execution environment for the Enterprise PSEO engine.
 * Responsibilities: Resolve the current environment from `NODE_ENV` and process flags, expose
 * boolean predicates for each known environment, and detect continuous-integration runs.
 * Dependencies: node:process only. Imports no project files so it can be loaded from any entry point.
 */

import process from 'node:process';

/**
 * Recognized environment names.
 *
 * @type {Readonly<string[]>}
 */
const ENVIRONMENTS = Object.freeze(['development', 'production', 'test', 'preview']);

/**
 * The resolved environment name, normalized to lowercase.
 *
 * Resolution order:
 *   1. `NODE_ENV` when set to a recognized value.
 *   2. `'development'` as the default fallback.
 *
 * @type {string}
 */
export const environment = normalizeEnvironment(process.env.NODE_ENV);

/**
 * Whether the engine is running in the development environment.
 *
 * @returns {boolean} True when `environment === 'development'`.
 */
export function isDevelopment() {
  return environment === 'development';
}

/**
 * Whether the engine is running in the production environment.
 *
 * @returns {boolean} True when `environment === 'production'`.
 */
export function isProduction() {
  return environment === 'production';
}

/**
 * Whether the engine is running in the test environment.
 *
 * @returns {boolean} True when `environment === 'test'`.
 */
export function isTest() {
  return environment === 'test';
}

/**
 * Whether the engine is running in the preview environment.
 *
 * @returns {boolean} True when `environment === 'preview'`.
 */
export function isPreview() {
  return environment === 'preview';
}

/**
 * Whether the engine is running inside a continuous-integration provider.
 *
 * Detection relies on the conventional `CI` environment variable set by most CI providers.
 *
 * @returns {boolean} True when a truthy `CI` variable is present.
 */
export function isCI() {
  const value = process.env.CI;
  if (value === undefined) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized !== '' && normalized !== '0' && normalized !== 'false';
}

/**
 * Normalizes a raw environment value to a recognized environment name.
 *
 * Unrecognized or empty values fall back to `'development'`.
 *
 * @param {string | undefined} value Raw `NODE_ENV` value.
 * @returns {string} Canonical environment name.
 * @private
 */
function normalizeEnvironment(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return 'development';
  }

  const normalized = value.trim().toLowerCase();
  return ENVIRONMENTS.includes(normalized) ? normalized : 'development';
}
