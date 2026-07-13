/**
 * Module: cache
 * Purpose: Provide a small, promise-aware in-memory cache for deterministic data reads.
 * Responsibilities: Reuse completed and in-flight values, and remove failed loads.
 * Dependencies: None.
 */

/**
 * Stores deterministic values and in-flight loads in memory.
 *
 * Values are retained until explicitly invalidated or cleared. Callers should cache only
 * validated, non-sensitive data whose lifecycle is bounded by the owning process.
 */
export class MemoryCache {
  #entries = new Map();

  /**
   * Returns a cached value for a key.
   *
   * @template T
   * @param {string} key Cache key.
   * @returns {T | undefined} The cached value, if present.
   */
  get(key) {
    return this.#entries.get(this.#assertKey(key));
  }

  /**
   * Stores a value for a key.
   *
   * @template T
   * @param {string} key Cache key.
   * @param {T} value Value to cache.
   * @returns {T} The stored value.
   */
  set(key, value) {
    this.#entries.set(this.#assertKey(key), value);
    return value;
  }

  /**
   * Returns whether a key is cached.
   *
   * @param {string} key Cache key.
   * @returns {boolean} Whether the cache contains the key.
   */
  has(key) {
    return this.#entries.has(this.#assertKey(key));
  }

  /**
   * Loads a value once for a key, sharing the same in-flight promise with concurrent callers.
   * Failed loads are removed so that a later request can retry.
   *
   * @template T
   * @param {string} key Cache key.
   * @param {() => Promise<T>} load Function that produces the value on a cache miss.
   * @returns {Promise<T>} Cached or newly loaded value.
   */
  getOrLoad(key, load) {
    const normalizedKey = this.#assertKey(key);
    const existing = this.#entries.get(normalizedKey);

    if (existing !== undefined) {
      return Promise.resolve(existing);
    }

    if (typeof load !== 'function') {
      throw new TypeError('MemoryCache load must be a function.');
    }

    const pending = Promise.resolve().then(load);
    this.#entries.set(normalizedKey, pending);

    return pending.catch((error) => {
      if (this.#entries.get(normalizedKey) === pending) {
        this.#entries.delete(normalizedKey);
      }

      throw error;
    });
  }

  /**
   * Removes one cached value.
   *
   * @param {string} key Cache key.
   * @returns {boolean} Whether an entry was removed.
   */
  delete(key) {
    return this.#entries.delete(this.#assertKey(key));
  }

  /**
   * Clears all cached values.
   *
   * @returns {number} Number of entries removed.
   */
  clear() {
    const size = this.#entries.size;
    this.#entries.clear();
    return size;
  }

  /**
   * Validates cache keys to avoid accidental shared or empty entries.
   *
   * @param {string} key Cache key.
   * @returns {string} Validated key.
   * @private
   */
  #assertKey(key) {
    if (typeof key !== 'string' || key.trim().length === 0) {
      throw new TypeError('MemoryCache keys must be non-empty strings.');
    }

    return key;
  }
}
