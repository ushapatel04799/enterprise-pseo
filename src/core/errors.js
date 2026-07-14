import crypto from 'node:crypto';

/**
 * Unified error class for the Enterprise Programmatic SEO Engine.
 * Follows strict modular standards defined in CODING_STANDARDS.md.
 */
export class PseoError extends Error {
  /**
   * @param {string} code - Predefined error code (e.g., ERR_CONFIG_INVALID).
   * @param {string} message - Human-readable error message.
   * @param {string} moduleName - Name of the module where the error occurred.
   * @param {string} severity - Severity level: INFO, WARNING, ERROR, FATAL.
   * @param {string} remediation - Actionable suggestion to resolve the error.
   * @param {Record<string, any>} [details] - Additional troubleshooting context.
   */
  constructor(code, message, moduleName, severity, remediation, details = {}) {
    super(message);
    this.name = 'PseoError';
    this.code = code;
    this.moduleName = moduleName;
    this.severity = severity || 'ERROR';
    this.remediation = remediation || 'Inspect system logs for details.';
    this.details = details;
    this.traceId = details.traceId || crypto.randomUUID();
    this.timestamp = new Date().toISOString();

    // Preserve stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes the error object to a clean JSON structure.
   * @returns {Record<string, any>}
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      moduleName: this.moduleName,
      severity: this.severity,
      remediation: this.remediation,
      traceId: this.traceId,
      timestamp: this.timestamp,
      details: this.details,
      stack: this.stack,
    };
  }
}

// Global PSEO Error Codes
export const ERROR_CODES = {
  CONFIG_INVALID: 'ERR_CONFIG_INVALID',
  DATA_INVALID: 'ERR_DATA_INVALID',
  KNOWLEDGE_INVALID: 'ERR_KNOWLEDGE_INVALID',
  CONTEXT_INVALID: 'ERR_CONTEXT_INVALID',
  AI_FAIL: 'ERR_AI_FAIL',
  SEO_INVALID: 'ERR_SEO_INVALID',
  GEN_FAIL: 'ERR_GEN_FAIL',
  SYS_FAIL: 'ERR_SYS_FAIL',
};
