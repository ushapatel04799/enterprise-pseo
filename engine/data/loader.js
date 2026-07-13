/**
 * Module: loader
 * Purpose: Load and validate Enterprise PSEO JSON datasets from disk.
 * Responsibilities: Resolve approved dataset paths, parse JSON, validate structure, and cache reads.
 * Dependencies: Node.js fs/path/url APIs, MemoryCache, and dataset validators.
 */

import { readFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { MemoryCache } from './cache.js';
import { DataValidationError, validateDataset } from './validator.js';

const DEFAULT_DATA_DIRECTORY = fileURLToPath(new URL('../../data/', import.meta.url));

const DEFAULT_DATASET_PATHS = Object.freeze({
  state: ['locations', 'usa', 'states'],
  city: ['locations', 'usa', 'cities'],
  county: ['locations', 'usa', 'counties'],
  business: ['business'],
  service: ['services'],
  template: ['templates'],
});

const DEFAULT_VALIDATION = Object.freeze({
  state: { expectedType: 'object', requiredFields: [] },
  city: {
    expectedType: 'array',
    requiredFields: ['city', 'slug', 'county', 'population', 'zip_codes', 'nearby_cities'],
  },
  county: { expectedType: 'array', requiredFields: ['name'] },
  business: {
    expectedType: 'object',
    requiredFields: ['businessName', 'phone', 'website', 'timezone', 'country', 'brand'],
  },
  service: {
    expectedType: 'object',
    requiredFields: [
      'serviceId',
      'serviceSlug',
      'serviceName',
      'category',
      'primaryKeyword',
      'description',
      'cta',
      'schemaType',
      'searchIntent',
    ],
  },
  template: { expectedType: 'object', requiredFields: [] },
});

/**
 * Error raised when a dataset cannot be read or parsed.
 */
export class DataLoadError extends Error {
  /**
   * @param {string} message Human-readable load failure description.
   * @param {{filePath?: string, cause?: Error}} [details]
   */
  constructor(message, details = {}) {
    super(message, { cause: details.cause });
    this.name = 'DataLoadError';
    this.filePath = details.filePath;
  }
}

/**
 * Loads validated JSON datasets from a configured data root.
 */
export class DataLoader {
  /**
   * @param {{dataDirectory?: string, cache?: MemoryCache, datasetPaths?: Partial<Record<keyof typeof DEFAULT_DATASET_PATHS, string[]>>}} [options]
   */
  constructor(options = {}) {
    this.dataDirectory = resolve(options.dataDirectory ?? DEFAULT_DATA_DIRECTORY);
    this.cache = options.cache ?? new MemoryCache();
    this.datasetPaths = { ...DEFAULT_DATASET_PATHS, ...options.datasetPaths };
  }

  /** @param {string} stateCode Lowercase state identifier. @param {DatasetLoadOptions} [options] @returns {Promise<Record<string, unknown>>} */
  loadState(stateCode, options) {
    return this.#loadNamedDataset('state', stateCode, options);
  }

  /** @param {string} stateCode Lowercase state identifier for its city dataset. @param {DatasetLoadOptions} [options] @returns {Promise<Record<string, unknown>[]>} */
  loadCity(stateCode, options) {
    return this.#loadNamedDataset('city', stateCode, options);
  }

  /** @param {string} stateCode Lowercase state identifier for its county dataset. @param {DatasetLoadOptions} [options] @returns {Promise<Record<string, unknown>[]>} */
  loadCounty(stateCode, options) {
    return this.#loadNamedDataset('county', stateCode, options);
  }

  /** @param {DatasetLoadOptions & {fileName?: string}} [options] @returns {Promise<Record<string, unknown>>} */
  loadBusiness(options = {}) {
    return this.#loadNamedDataset('business', options.fileName ?? 'business', options);
  }

  /** @param {string} serviceSlug Service identifier. @param {DatasetLoadOptions} [options] @returns {Promise<Record<string, unknown>>} */
  loadService(serviceSlug, options) {
    return this.#loadNamedDataset('service', serviceSlug, options);
  }

  /** @param {string} templateName Template identifier. @param {DatasetLoadOptions} [options] @returns {Promise<Record<string, unknown>>} */
  loadTemplate(templateName, options) {
    return this.#loadNamedDataset('template', templateName, options);
  }

  /**
   * Clears all loaded datasets or one dataset file.
   *
   * @param {string} [filePath] Absolute file path to invalidate.
   * @returns {number | boolean} Number of cleared entries or deletion result.
   */
  clearCache(filePath) {
    return filePath ? this.cache.delete(resolve(filePath)) : this.cache.clear();
  }

  /**
   * @param {keyof typeof DEFAULT_DATASET_PATHS} datasetType Dataset category.
   * @param {string} identifier Dataset file identifier without `.json`.
   * @param {DatasetLoadOptions} [options] Load and validation overrides.
   * @returns {Promise<Record<string, unknown> | Record<string, unknown>[]>} Validated immutable JSON.
   * @private
   */
  #loadNamedDataset(datasetType, identifier, options = {}) {
    const filePath = this.#resolveDatasetPath(datasetType, identifier);
    const defaults = DEFAULT_VALIDATION[datasetType];
    const validation = {
      expectedType: options.expectedType ?? defaults.expectedType,
      requiredFields: options.requiredFields ?? defaults.requiredFields,
    };

    return this.cache.getOrLoad(filePath, async () => {
      const data = await readJsonFile(filePath);

      try {
        validateDataset(data, {
          datasetName: `${datasetType} dataset (${filePath})`,
          ...validation,
        });
      } catch (error) {
        if (error instanceof DataValidationError) {
          throw error;
        }

        throw new DataValidationError(`Unable to validate ${datasetType} dataset at ${filePath}.`, {
          datasetName: datasetType,
          cause: error instanceof Error ? error : undefined,
        });
      }

      return deepFreeze(data);
    });
  }

  /**
   * @param {keyof typeof DEFAULT_DATASET_PATHS} datasetType Dataset category.
   * @param {string} identifier Dataset file identifier without `.json`.
   * @returns {string} Safe absolute dataset path.
   * @private
   */
  #resolveDatasetPath(datasetType, identifier) {
    if (!Object.hasOwn(DEFAULT_DATASET_PATHS, datasetType)) {
      throw new TypeError(`Unsupported dataset type: ${datasetType}.`);
    }

    const fileName = `${assertDatasetIdentifier(identifier)}.json`;
    const directorySegments = this.datasetPaths[datasetType];

    if (!Array.isArray(directorySegments) || !directorySegments.every(isSafePathSegment)) {
      throw new TypeError(`Invalid directory configuration for ${datasetType} datasets.`);
    }

    const filePath = resolve(this.dataDirectory, ...directorySegments, fileName);
    const pathFromRoot = relative(this.dataDirectory, filePath);

    if (pathFromRoot.startsWith(`..${sep}`) || pathFromRoot === '..') {
      throw new DataLoadError(`Resolved ${datasetType} path escapes the configured data directory.`, {
        filePath,
      });
    }

    return filePath;
  }
}

/**
 * Creates a DataLoader with the supplied configuration.
 *
 * @param {ConstructorParameters<typeof DataLoader>[0]} [options] Loader configuration.
 * @returns {DataLoader} Configured loader.
 */
export function createDataLoader(options) {
  return new DataLoader(options);
}

/**
 * @typedef {{expectedType?: 'object' | 'array', requiredFields?: readonly string[]}} DatasetLoadOptions
 */

/**
 * Reads and parses one UTF-8 JSON file.
 *
 * @param {string} filePath Absolute JSON file path.
 * @returns {Promise<unknown>} Parsed JSON value.
 * @private
 */
async function readJsonFile(filePath) {
  let source;

  try {
    source = await readFile(filePath, 'utf8');
  } catch (error) {
    throw new DataLoadError(`Unable to read JSON dataset at ${filePath}.`, {
      filePath,
      cause: error instanceof Error ? error : undefined,
    });
  }

  if (source.trim() === '') {
    throw new DataLoadError(`JSON dataset at ${filePath} is empty.`, { filePath });
  }

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new DataLoadError(`Invalid JSON in dataset at ${filePath}.`, {
      filePath,
      cause: error instanceof Error ? error : undefined,
    });
  }
}

/**
 * @param {string} identifier Dataset identifier.
 * @returns {string} Valid identifier.
 * @private
 */
function assertDatasetIdentifier(identifier) {
  if (typeof identifier !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(identifier)) {
    throw new TypeError('Dataset identifiers must use lowercase letters, numbers, and hyphens only.');
  }

  return identifier;
}

/**
 * @param {unknown} segment Directory segment.
 * @returns {boolean} Whether the segment is safe.
 * @private
 */
function isSafePathSegment(segment) {
  return typeof segment === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(segment);
}

/**
 * Freezes a parsed JSON tree so cached raw data cannot be mutated by consumers.
 *
 * @template T
 * @param {T} value Parsed JSON value.
 * @returns {T} Frozen value.
 * @private
 */
function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }

  return value;
}
