import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from './logger.js';
import { PseoError, ERROR_CODES } from './errors.js';

/**
 * Cache manager supporting memory and file-system cache targets with TTL validation.
 */
class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    // Default cache directory inside derived data path
    this.cacheDir = path.resolve('data/derived/cache');
    this.initialized = false;
  }

  /**
   * Initializes the cache directories.
   * @private
   */
  async ensureCacheDir() {
    if (this.initialized) return;
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      this.initialized = true;
    } catch (err) {
      throw new PseoError(
        ERROR_CODES.SYS_FAIL,
        `Failed to create cache directory: ${err.message}`,
        'cache',
        'FATAL',
        'Check filesystem permissions on data/derived/cache',
        { error: err }
      );
    }
  }

  /**
   * Generates filesystem safe path for key.
   * @private
   */
  getFilePath(key) {
    const safeKey = encodeURIComponent(key).replace(/[*]/g, '_');
    return path.join(this.cacheDir, `${safeKey}.json`);
  }

  /**
   * Sets cache value in memory and optionally on disk.
   * @param {string} key - Cache key.
   * @param {any} value - Cache value.
   * @param {number} ttlMs - Time to live in milliseconds (default: 1 hour).
   * @param {boolean} persistToDisk - Write cache payload to filesystem.
   */
  async set(key, value, ttlMs = 3600000, persistToDisk = false) {
    const expiresAt = Date.now() + ttlMs;
    const cacheObject = { value, expiresAt };

    // Update memory
    this.memoryCache.set(key, cacheObject);

    if (persistToDisk) {
      await this.ensureCacheDir();
      const filePath = this.getFilePath(key);
      try {
        await fs.writeFile(filePath, JSON.stringify(cacheObject, null, 2), 'utf8');
      } catch (err) {
        logger.warn('cache', `Failed to persist cache key "${key}" to disk`, { error: err });
      }
    }
  }

  /**
   * Gets cache value from memory or disk. Returns null if expired or missing.
   * @param {string} key - Cache key.
   * @returns {Promise<any|null>}
   */
  async get(key) {
    // 1. Try memory
    if (this.memoryCache.has(key)) {
      const cacheObject = this.memoryCache.get(key);
      if (cacheObject.expiresAt > Date.now()) {
        return cacheObject.value;
      }
      // Expired in memory
      this.memoryCache.delete(key);
    }

    // 2. Try disk
    const filePath = this.getFilePath(key);
    try {
      const fileData = await fs.readFile(filePath, 'utf8');
      const cacheObject = JSON.parse(fileData);

      if (cacheObject.expiresAt > Date.now()) {
        // Cache hit from disk; populate memory cache
        this.memoryCache.set(key, cacheObject);
        return cacheObject.value;
      }

      // Expired on disk; clean up
      await fs.unlink(filePath).catch(() => {});
    } catch (err) {
      // File not found is common/expected for cache miss, do not throw
      if (err.code !== 'ENOENT') {
        logger.warn('cache', `Failed to read cache key "${key}" from disk`, { error: err });
      }
    }

    return null;
  }

  /**
   * Deletes a cache entry from memory and disk.
   * @param {string} key
   */
  async delete(key) {
    this.memoryCache.delete(key);
    const filePath = this.getFilePath(key);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logger.warn('cache', `Failed to remove cache key file "${key}"`, { error: err });
      }
    }
  }

  /**
   * Resolves a key. If missing/expired, executes factory function and caches result.
   */
  async getOrSet(key, factoryFn, ttlMs = 3600000, persistToDisk = false) {
    const cached = await this.get(key);
    if (cached !== null) return cached;

    const freshValue = await factoryFn();
    await this.set(key, freshValue, ttlMs, persistToDisk);
    return freshValue;
  }

  /**
   * Clears all items in memory cache.
   */
  clearMemory() {
    this.memoryCache.clear();
  }
}

export const cache = new CacheManager();
