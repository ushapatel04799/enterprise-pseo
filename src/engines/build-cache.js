import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { datasetEngine } from './dataset-engine.js';
import { configManager } from '../core/config-manager.js';
import { logger } from '../core/logger.js';

const CACHE_PATH = path.resolve('data/derived/build-cache.json');

/**
 * Build Cache manager facilitating incremental programmatic SEO builds.
 */
class BuildCache {
  constructor() {
    this.entries = new Map();
    this.initialized = false;
  }

  /**
   * Loads the build cache entries from disk.
   */
  async load() {
    if (this.initialized) return;
    try {
      const raw = await fs.readFile(CACHE_PATH, 'utf8');
      const data = JSON.parse(raw);
      for (const [k, v] of Object.entries(data)) {
        this.entries.set(k, v);
      }
      this.initialized = true;
      logger.info('build-cache', `Loaded ${this.entries.size} incremental cache entries.`);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logger.warn('build-cache', 'Failed to load build cache. Proceeding with clean index.', { error: err });
      }
      this.initialized = true;
    }
  }

  /**
   * Saves the current build cache registry to disk.
   */
  async save() {
    try {
      const obj = Object.fromEntries(this.entries.entries());
      await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
      await fs.writeFile(CACHE_PATH, JSON.stringify(obj, null, 2), 'utf8');
      logger.info('build-cache', `Saved ${this.entries.size} incremental cache entries.`);
    } catch (err) {
      logger.warn('build-cache', 'Failed to save build cache registry.', { error: err });
    }
  }

  /**
   * Calculates a combined checksum for a target permutation.
   * @param {string} stateAbbrev - State code (e.g. 'TX').
   * @param {string} citySlug - City identifier.
   * @param {string} serviceId - Service identifier.
   * @returns {string} Combined target MD5 checksum.
   */
  getTargetChecksum(stateAbbrev, citySlug, serviceId) {
    const stateReg = datasetEngine.registry.get(`state:${stateAbbrev.toLowerCase()}`) || { checksum: 'state' };
    const cityReg = datasetEngine.registry.get(`city:${stateAbbrev.toLowerCase()}`) || { checksum: 'city' };
    const serviceReg = datasetEngine.registry.get(`service:${serviceId}`) || { checksum: 'service' };
    
    // Config values hash
    const configHash = crypto.createHash('md5').update(JSON.stringify(configManager.config || {})).digest('hex');

    const combined = [stateReg.checksum, cityReg.checksum, serviceReg.checksum, configHash].join('|');
    return crypto.createHash('md5').update(combined).digest('hex');
  }

  /**
   * Verifies if a build target is cached and its output exists.
   * @param {string} key - Unique key: "state:city:service".
   * @param {string} currentChecksum - Calculated target checksum.
   * @returns {Promise<boolean>} True if cached and valid.
   */
  async isValid(key, currentChecksum) {
    await this.load();
    const entry = this.entries.get(key);
    if (!entry || entry.checksum !== currentChecksum) {
      return false;
    }

    // Verify output file actually exists
    if (entry.outputPath) {
      const exists = await fs.access(path.resolve(entry.outputPath)).then(() => true).catch(() => false);
      return exists;
    }

    return false;
  }

  /**
   * Registers or updates a build target in cache.
   * @param {string} key - Unique key: "state:city:service".
   * @param {string} checksum - Current target checksum.
   * @param {string} outputPath - Output file path.
   */
  set(key, checksum, outputPath) {
    this.entries.set(key, {
      checksum,
      outputPath,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Clears the cache entries.
   */
  clear() {
    this.entries.clear();
  }
}

export const buildCache = new BuildCache();
