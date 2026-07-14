import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { datasetEngine } from '../../src/engines/dataset-engine.js';
import { validationEngine } from '../../src/engines/validation-engine.js';
import { normalizationEngine } from '../../src/engines/normalization-engine.js';
import { PseoError } from '../../src/core/errors.js';

describe('Dataset Layer Tests', () => {
  describe('DatasetEngine & Normalization', () => {
    it('should initialize and load mock state/city datasets successfully', async () => {
      // Use mock fixture directory
      await datasetEngine.initialize('tests/fixtures/locations/usa');

      const txState = datasetEngine.getState('TX');
      assert.ok(txState);
      assert.strictEqual(txState.name, 'Texas');

      const austinCity = datasetEngine.getCity('austin');
      assert.ok(austinCity);
      assert.strictEqual(austinCity.city, 'Austin');
      assert.strictEqual(austinCity.state, 'TX');
    });

    it('should normalize populations and state capitalization', () => {
      const dirtyState = {
        name: ' texas ',
        abbreviation: 'tx',
        population: '29,145,505',
        capital: 'austin',
      };
      
      const normalizedState = normalizationEngine.normalizeState(dirtyState);
      assert.strictEqual(normalizedState.abbreviation, 'TX');
      assert.strictEqual(normalizedState.name, 'texas');
      assert.strictEqual(normalizedState.population, 29145505);
      assert.strictEqual(normalizedState.capital, 'austin');

      const dirtyCity = {
        city: ' austin ',
        state: 'tx',
        population: ' 961,855 ',
        zip_codes: [78701, ' 78702 '],
        nearby_cities: [
          { name: 'Dallas', slug: ' DALLAS ', distance_miles: '195.4' }
        ]
      };

      const normalizedCity = normalizationEngine.normalizeCity(dirtyCity);
      assert.strictEqual(normalizedCity.state, 'TX');
      assert.strictEqual(normalizedCity.city, 'austin');
      assert.strictEqual(normalizedCity.population, 961855);
      assert.deepStrictEqual(normalizedCity.zip_codes, ['78701', '78702']);
      assert.strictEqual(normalizedCity.nearby_cities[0].slug, 'dallas');
      assert.strictEqual(normalizedCity.nearby_cities[0].distance_miles, 195.4);
    });
  });

  describe('ValidationEngine', () => {
    it('should return PASS status on clean mock data', async () => {
      await datasetEngine.initialize('tests/fixtures/locations/usa');
      const report = validationEngine.validateAll();
      
      assert.strictEqual(report.status, 'PASS');
      assert.strictEqual(report.summary.errorsCount, 0);
    });

    it('should return FAIL status and detect duplicate slugs', async () => {
      await datasetEngine.initialize('tests/fixtures/locations/usa');
      
      // Inject duplicate city slug directly into dataset memory map
      const duplicateCity = {
        city: 'Austin Duplicate',
        state: 'TX',
        slug: 'austin', // Duplicate slug
        coordinates: { latitude: 30.26, longitude: -97.74 },
        zip_codes: ['78703']
      };
      datasetEngine.cities.set('austin-dup', duplicateCity); // Trigger check via cities collection
      
      const report = validationEngine.validateAll();
      assert.strictEqual(report.status, 'FAIL');
      assert.ok(report.summary.errorsCount > 0);
      assert.ok(report.errors.some(e => e.message.includes('Duplicate city slug')));

      // Cleanup injection
      datasetEngine.cities.delete('austin-dup');
    });
  });
});
