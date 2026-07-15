import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '../core/logger.js';
import { PseoError, ERROR_CODES } from '../core/errors.js';

/**
 * Plugin Engine managing hot-swappable local service niche configurations,
 * prompt overrides, structured data schemas, and version integrity checks.
 */
class PluginEngine {
  constructor() {
    this.registry = new Map();
    this.activePluginId = null;
  }

  /**
   * Loads a niche plugin from its directory.
   * @param {string} pluginDir - Absolute or relative path to the plugin folder.
   * @returns {Promise<Record<string, any>>} Validated plugin manifest.
   */
  async loadPlugin(pluginDir) {
    const manifestPath = path.resolve(pluginDir, 'plugin.config.json');
    logger.info('plugin-engine', `Loading niche plugin from: "${manifestPath}"`);

    try {
      const raw = await fs.readFile(manifestPath, 'utf8');
      const manifest = JSON.parse(raw);

      // Validate manifest format
      this.validatePlugin(manifest);

      const servicesDir = path.resolve(pluginDir, 'services');
      const serviceFiles = await fs.readdir(servicesDir).catch(() => []);
      const services = [];

      for (const file of serviceFiles) {
        if (file.endsWith('.json')) {
          const serviceRaw = await fs.readFile(path.join(servicesDir, file), 'utf8');
          const parsed = JSON.parse(serviceRaw);
          if (Array.isArray(parsed)) {
            services.push(...parsed);
          } else {
            services.push(parsed);
          }
        }
      }

      manifest.servicesList = services;
      this.registry.set(manifest.id, manifest);
      logger.info('plugin-engine', `Plugin "${manifest.name}" (v${manifest.version}) loaded successfully.`);
      return manifest;
    } catch (err) {
      throw new PseoError(
        ERROR_CODES.SYS_FAIL,
        `Plugin loading transaction failed: ${err.message}`,
        'plugin-engine',
        'FATAL',
        'Check plugin.config.json formatting and directory permissions.',
        { error: err }
      );
    }
  }

  /**
   * Sets the active niche plugin.
   * @param {string} pluginId - Identifier of loaded plugin.
   */
  setActivePlugin(pluginId) {
    const idLower = pluginId.toLowerCase();
    if (!this.registry.has(idLower)) {
      throw new PseoError(
        ERROR_CODES.SYS_FAIL,
        `Niche Plugin "${pluginId}" is not registered in system registry.`,
        'plugin-engine',
        'FATAL',
        'Load the plugin using pluginEngine.loadPlugin before activating it.'
      );
    }
    this.activePluginId = idLower;
    logger.info('plugin-engine', `Active niche plugin set to: "${idLower}"`);
  }

  /**
   * Gets the active plugin manifest configuration.
   * @returns {Record<string, any>|null} Active plugin or null.
   */
  getActivePlugin() {
    if (!this.activePluginId) return null;
    return this.registry.get(this.activePluginId);
  }

  /**
   * Validates niche manifest against configuration schema.
   * @private
   */
  validatePlugin(manifest) {
    const required = ['id', 'version', 'name', 'schemaType', 'prompts', 'theme'];
    for (const key of required) {
      if (!manifest[key]) {
        throw new PseoError(
          ERROR_CODES.DATA_INVALID,
          `Plugin Manifest Validation Failed: Missing required key "${key}".`,
          'plugin-engine',
          'ERROR',
          'Ensure the plugin manifest has correct properties.'
        );
      }
    }

    // Semantic version regex check
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!semverRegex.test(manifest.version)) {
      throw new PseoError(
        ERROR_CODES.DATA_INVALID,
        `Plugin "${manifest.id}" version "${manifest.version}" does not follow semantic versioning rules.`,
        'plugin-engine',
        'ERROR',
        'Format version as major.minor.patch (e.g. 1.0.0).'
      );
    }
  }

  /**
   * Clears the plugin registry.
   */
  clear() {
    this.registry.clear();
    this.activePluginId = null;
  }
}

export const pluginEngine = new PluginEngine();
