/**
 * Module: paths
 * Purpose: Provide absolute filesystem paths for the Enterprise PSEO project layout.
 * Responsibilities: Resolve every key directory from the repository root using only Node.js
 * built-in modules, so no project file is imported and no drive letter is hardcoded.
 * Dependencies: node:path and node:url only.
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Absolute directory paths resolved relative to the repository root.
 *
 * `paths` is frozen so consumers cannot mutate the canonical layout. All values are absolute
 * and platform-normalized via `node:path`.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const paths = Object.freeze({
  /** Repository root. */
  ROOT: resolve(__dirname, '..', '..'),
  /** Engine source root. */
  ENGINE: resolve(__dirname, '..'),
  /** Data tier root. */
  DATA: resolve(__dirname, '..', '..', 'data'),
  /** Locations dataset root. */
  LOCATIONS: resolve(__dirname, '..', '..', 'data', 'locations'),
  /** Business dataset root. */
  BUSINESS: resolve(__dirname, '..', '..', 'data', 'business'),
  /** Services dataset root. */
  SERVICES: resolve(__dirname, '..', '..', 'data', 'services'),
  /** Niches dataset root. */
  NICHES: resolve(__dirname, '..', '..', 'data', 'niches'),
  /** Templates dataset root. */
  TEMPLATES: resolve(__dirname, '..', '..', 'data', 'templates'),
  /** FAQs dataset root. */
  FAQS: resolve(__dirname, '..', '..', 'data', 'faqs'),
  /** Generated output root. */
  OUTPUT: resolve(__dirname, '..', '..', 'dist'),
  /** Application source root. */
  SRC: resolve(__dirname, '..', '..', 'src'),
  /** Scripts root. */
  SCRIPTS: resolve(__dirname, '..', '..', 'scripts'),
  /** Tests root. */
  TESTS: resolve(__dirname, '..', '..', 'tests'),
  /** Documentation root. */
  DOCS: resolve(__dirname, '..', '..', 'docs'),
  /** AI directives root. */
  AI: resolve(__dirname, '..', '..', 'ai'),
});
