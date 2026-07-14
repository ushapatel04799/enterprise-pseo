/**
 * Module: settings
 * Purpose: Merge configuration, constants, and environment into one frozen settings object.
 * Responsibilities: Surface a single aggregated object consumed across the Enterprise PSEO engine.
 * Dependencies: ./config.js (config), ./constants.js (constants), ./environment.js (environment).
 */

import { config } from './config.js';
import * as constants from './constants.js';
import { environment } from './environment.js';

/**
 * Frozen settings object aggregating configuration, constants, and the active environment.
 *
 * @type {Readonly<Record<string, unknown>>}
 */
export const settings = Object.freeze({
  config,
  ...constants,
  environment,
});
