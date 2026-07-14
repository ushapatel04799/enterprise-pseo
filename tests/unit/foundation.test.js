import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PseoError, ERROR_CODES } from '../../src/core/errors.js';
import { logger } from '../../src/core/logger.js';
import { cache } from '../../src/core/cache.js';
import { eventBus } from '../../src/core/event-bus.js';
import { slugify, isValidSlug, cleanObject, parsePopulation } from '../../src/core/utils.js';

describe('Foundational Layer tests', () => {
  describe('PseoError', () => {
    it('should create an error with unique traceId and structure', () => {
      const err = new PseoError(
        ERROR_CODES.CONFIG_INVALID,
        'Invalid configuration',
        'config',
        'ERROR',
        'Fix config fields.'
      );

      assert.strictEqual(err.code, 'ERR_CONFIG_INVALID');
      assert.strictEqual(err.moduleName, 'config');
      assert.strictEqual(err.severity, 'ERROR');
      assert.strictEqual(err.remediation, 'Fix config fields.');
      assert.ok(err.traceId);
      assert.ok(err.timestamp);

      const json = err.toJSON();
      assert.strictEqual(json.code, 'ERR_CONFIG_INVALID');
      assert.strictEqual(json.traceId, err.traceId);
    });
  });

  describe('Utilities', () => {
    it('should slugify text properly', () => {
      assert.strictEqual(slugify('Los Angeles'), 'los-angeles');
      assert.strictEqual(slugify('Pest & Termite Control'), 'pest-and-termite-control');
      assert.strictEqual(slugify('  New York  '), 'new-york');
    });

    it('should validate slugs', () => {
      assert.strictEqual(isValidSlug('los-angeles'), true);
      assert.strictEqual(isValidSlug('Los-Angeles'), false);
      assert.strictEqual(isValidSlug('los_angeles'), false);
      assert.strictEqual(isValidSlug('los-angeles-123'), true);
    });

    it('should clean objects recursively', () => {
      const dirty = {
        name: 'John',
        age: null,
        address: {
          city: 'Chicago',
          zip: undefined,
        },
      };
      const cleaned = cleanObject(dirty);
      assert.strictEqual(cleaned.name, 'John');
      assert.strictEqual(cleaned.age, undefined);
      assert.strictEqual(cleaned.address.city, 'Chicago');
      assert.strictEqual(cleaned.address.zip, undefined);
    });

    it('should parse populations safely', () => {
      assert.strictEqual(parsePopulation('123,456'), 123456);
      assert.strictEqual(parsePopulation(987.6), 987);
      assert.strictEqual(parsePopulation('approx 5,000 residents'), 5000);
      assert.strictEqual(parsePopulation(null), 0);
    });
  });

  describe('Event Bus', () => {
    it('should publish and subscribe to events', (t, done) => {
      eventBus.subscribe(eventBus.EVENTS.BUILD_COMPLETED, (payload) => {
        assert.strictEqual(payload.status, 'success');
        done();
      });

      eventBus.publish(eventBus.EVENTS.BUILD_COMPLETED, { status: 'success' });
    });
  });

  describe('Cache Manager', () => {
    const testKey = 'test-cache-key';
    const testVal = { data: 'test-value' };

    after(async () => {
      // Clean up cache file if created
      await cache.delete(testKey);
    });

    it('should get and set memory and disk cache', async () => {
      await cache.set(testKey, testVal, 1000, true);
      const val = await cache.get(testKey);
      assert.deepStrictEqual(val, testVal);

      // Verify fs file exists
      const filePath = cache.getFilePath(testKey);
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      assert.strictEqual(exists, true);
    });

    it('should expire cache based on TTL', async () => {
      const expiredKey = 'expired-key';
      // Cache with 1ms TTL
      await cache.set(expiredKey, 'expired', 1, false);
      
      // Wait 10ms
      await new Promise(resolve => setTimeout(resolve, 10));

      const val = await cache.get(expiredKey);
      assert.strictEqual(val, null);
    });
  });
});
