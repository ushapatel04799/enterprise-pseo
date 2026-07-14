import appConfig from '../../config/app.config.js';
import siteConfig from '../../config/site.config.js';
import seoConfig from '../../config/seo.config.js';
import providerConfig from '../../config/provider.config.js';
import { PseoError, ERROR_CODES } from './errors.js';

/**
 * Consolidated configuration manager.
 * Provides immutable validation and single accessor patterns.
 */
class ConfigManager {
  constructor() {
    this.app = { ...appConfig };
    this.site = { ...siteConfig };
    this.seo = { ...seoConfig };
    this.provider = { ...providerConfig };
  }

  /**
   * Safe getter to fetch nested configuration keys.
   * Supports dot-notation paths (e.g. 'site.business.name').
   * @param {string} keyPath
   * @param {any} [defaultValue]
   * @returns {any}
   */
  get(keyPath, defaultValue = undefined) {
    const parts = keyPath.split('.');
    let current = this;

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[part];
    }

    return current === undefined ? defaultValue : current;
  }

  /**
   * Validates the configuration contents.
   * Ensures required variables (e.g., business phone, canonical domain) are set.
   * @throws {PseoError} If configuration fails basic assertions.
   */
  validate() {
    // Check primary business fields
    if (!this.site.business || !this.site.business.name || !this.site.business.phone) {
      throw new PseoError(
        ERROR_CODES.CONFIG_INVALID,
        'Business name and phone are required in site.config.js',
        'config',
        'FATAL',
        'Update config/site.config.js with valid business metadata.'
      );
    }

    // Check SEO domain
    if (!this.seo.canonicalDomain || !this.seo.canonicalDomain.startsWith('http')) {
      throw new PseoError(
        ERROR_CODES.CONFIG_INVALID,
        'Canonical domain is invalid in seo.config.js',
        'config',
        'FATAL',
        'Update config/seo.config.js with a valid absolute URL domain.'
      );
    }

    // Check AI Model
    if (!this.provider.ai || !this.provider.ai.primaryModel) {
      throw new PseoError(
        ERROR_CODES.CONFIG_INVALID,
        'Primary AI model is not configured in provider.config.js',
        'config',
        'FATAL',
        'Specify a primary model name in config/provider.config.js.'
      );
    }

    return true;
  }
}

export const configManager = new ConfigManager();
