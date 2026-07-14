import { PseoError } from './errors.js';

/**
 * Structured JSON Logger for the Enterprise PSEO Engine.
 */
class Logger {
  constructor(defaultContext = {}) {
    this.defaultContext = defaultContext;
  }

  /**
   * Internal format and output method.
   * @private
   */
  log(severity, moduleName, message, context = {}) {
    let traceId = context.traceId || this.defaultContext.traceId;
    let details = { ...context };

    // Handle incoming PseoError or generic Error objects
    if (message instanceof Error) {
      const err = message;
      message = err.message;
      details.stack = err.stack;
      if (err instanceof PseoError) {
        traceId = err.traceId;
        details.code = err.code;
        details.remediation = err.remediation;
        details.moduleName = err.moduleName;
        severity = err.severity; // Override to match error severity
        details.details = err.details;
      }
    }

    const payload = {
      timestamp: new Date().toISOString(),
      projectId: context.projectId || this.defaultContext.projectId || 'enterprise-pseo',
      module: moduleName || 'system',
      severity,
      message,
      traceId: traceId || 'N/A',
      details,
    };

    // Output formatted JSON to stdout
    if (severity === 'ERROR' || severity === 'FATAL') {
      console.error(JSON.stringify(payload));
    } else {
      console.log(JSON.stringify(payload));
    }
  }

  debug(moduleName, message, context) {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', moduleName, message, context);
    }
  }

  info(moduleName, message, context) {
    this.log('INFO', moduleName, message, context);
  }

  warn(moduleName, message, context) {
    this.log('WARNING', moduleName, message, context);
  }

  error(moduleName, message, context) {
    this.log('ERROR', moduleName, message, context);
  }

  fatal(moduleName, message, context) {
    this.log('FATAL', moduleName, message, context);
  }
}

export const logger = new Logger();
