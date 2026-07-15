// Enterprise Provider Registry
import { configManager } from '../../core/config-manager.js';
import { logger } from '../../core/logger.js';
import { PseoError, ERROR_CODES } from '../../core/errors.js';

/**
 * Provider Registry for managing registered AI adapter classes.
 */
class ProviderRegistry {
  constructor() {
    this.providers = new Map();
    this.defaultName = 'gemini';
  }

  /**
   * Registers a provider instance.
   * @param {string} name - Registered name identifier (e.g. 'gemini').
   * @param {Record<string, any>} providerInstance - Provider subclass instance.
   */
  register(name, providerInstance) {
    this.providers.set(name.toLowerCase(), providerInstance);
    logger.info('provider-registry', `Registered AI provider: "${name}"`);
  }

  /**
   * Retrieves the active AI provider configured in site configurations.
   * @returns {Record<string, any>} Active provider instance.
   */
  getActiveProvider() {
    const configName = configManager.get('provider.ai.name', this.defaultName).toLowerCase();
    const provider = this.providers.get(configName);

    if (!provider) {
      throw new PseoError(
        ERROR_CODES.AI_FAIL,
        `AI Provider "${configName}" is not registered in the system registry.`,
        'provider-registry',
        'FATAL',
        `Register provider or check spelling in provider.config.js (Active options: ${Array.from(this.providers.keys()).join(', ')}).`
      );
    }

    return provider;
  }
}

export const providerRegistry = new ProviderRegistry();
