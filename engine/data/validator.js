/**
 * Module: validator
 * Purpose: Validate parsed JSON dataset shape and required fields.
 * Responsibilities: Produce descriptive, dataset-aware validation failures.
 * Dependencies: None.
 */

/**
 * Error raised when a dataset does not satisfy its structural contract.
 */
export class DataValidationError extends Error {
  /**
   * @param {string} message Human-readable failure description.
   * @param {{datasetName?: string, field?: string, recordIndex?: number, cause?: Error}} [details]
   */
  constructor(message, details = {}) {
    super(message, { cause: details.cause });
    this.name = 'DataValidationError';
    this.datasetName = details.datasetName;
    this.field = details.field;
    this.recordIndex = details.recordIndex;
  }
}

/**
 * Ensures a parsed JSON value has the required top-level type.
 *
 * @param {unknown} value Parsed JSON value.
 * @param {{datasetName: string, expectedType?: 'object' | 'array'}} options Validation context.
 * @returns {void}
 * @throws {DataValidationError} When the value has the wrong type.
 */
export function validateJsonStructure(value, { datasetName, expectedType = 'object' }) {
  const actualType = Array.isArray(value) ? 'array' : typeof value;
  const isExpectedObject = expectedType === 'object' && isPlainObject(value);
  const isExpectedArray = expectedType === 'array' && Array.isArray(value);

  if (!isExpectedObject && !isExpectedArray) {
    throw new DataValidationError(
      `${datasetName} must contain a JSON ${expectedType}; received ${actualType}.`,
      { datasetName },
    );
  }
}

/**
 * Ensures a record contains all required fields with non-empty values.
 *
 * @param {unknown} record JSON object to inspect.
 * @param {readonly string[]} requiredFields Required field names.
 * @param {{datasetName: string, recordIndex?: number}} options Validation context.
 * @returns {void}
 * @throws {DataValidationError} When a field is missing or empty.
 */
export function validateRequiredFields(record, requiredFields, { datasetName, recordIndex } = {}) {
  if (!isPlainObject(record)) {
    throw new DataValidationError(
      `${describeRecord(datasetName, recordIndex)} must be a JSON object.`,
      { datasetName, recordIndex },
    );
  }

  if (!Array.isArray(requiredFields)) {
    throw new TypeError('requiredFields must be an array of field names.');
  }

  for (const field of requiredFields) {
    if (typeof field !== 'string' || field.trim().length === 0) {
      throw new TypeError('requiredFields must contain only non-empty strings.');
    }

    if (!Object.hasOwn(record, field) || isEmptyValue(record[field])) {
      throw new DataValidationError(
        `${describeRecord(datasetName, recordIndex)} is missing required field "${field}".`,
        { datasetName, field, recordIndex },
      );
    }
  }
}

/**
 * Validates a dataset and, when applicable, every record in an array.
 *
 * @param {unknown} value Parsed JSON value.
 * @param {{datasetName: string, expectedType?: 'object' | 'array', requiredFields?: readonly string[]}} options
 * @returns {void}
 * @throws {DataValidationError} When the dataset violates its contract.
 */
export function validateDataset(value, options) {
  const { datasetName, expectedType = 'object', requiredFields = [] } = options;
  validateJsonStructure(value, { datasetName, expectedType });

  if (expectedType === 'array') {
    value.forEach((record, recordIndex) => {
      validateRequiredFields(record, requiredFields, { datasetName, recordIndex });
    });
    return;
  }

  validateRequiredFields(value, requiredFields, { datasetName });
}

/**
 * @param {unknown} value Value to inspect.
 * @returns {value is Record<string, unknown>} Whether the value is a JSON object.
 * @private
 */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * @param {unknown} value Value to inspect.
 * @returns {boolean} Whether the value is absent or a blank string.
 * @private
 */
function isEmptyValue(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}

/**
 * @param {string | undefined} datasetName Dataset name.
 * @param {number | undefined} recordIndex Array record index.
 * @returns {string} Readable record description.
 * @private
 */
function describeRecord(datasetName = 'Dataset', recordIndex) {
  return Number.isInteger(recordIndex) ? `${datasetName} record at index ${recordIndex}` : datasetName;
}
