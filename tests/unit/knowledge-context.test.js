import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { datasetEngine } from '../../src/engines/dataset-engine.js';
import { knowledgeEngine } from '../../src/engines/knowledge-engine.js';
import { nearbyEngine } from '../../src/engines/nearby-engine.js';
import { contextEngine } from '../../src/engines/context-engine.js';
import { promptBuilder } from '../../src/engines/prompt-builder.js';
import { PseoError } from '../../src/core/errors.js';

describe('Knowledge & Context Layer Tests', () => {
  before(async () => {
    // Make sure dataset engine is loaded with fixtures
    await datasetEngine.initialize('tests/fixtures/locations/usa', 'data/services');
    knowledgeEngine.clear();
    knowledgeEngine.initialize();
  });

  describe('KnowledgeEngine', () => {
    it('should build and query state, city, and county nodes', () => {
      const stateNode = knowledgeEngine.getState('TX');
      assert.ok(stateNode);
      assert.strictEqual(stateNode.name, 'Texas');
      assert.ok(stateNode.cities.length > 0);

      const cityNode = knowledgeEngine.getCity('austin');
      assert.ok(cityNode);
      assert.strictEqual(cityNode.city, 'Austin');
      assert.strictEqual(cityNode.parentState.name, 'Texas');

      const countyNode = knowledgeEngine.getCounty('TX', 'Travis County');
      assert.ok(countyNode);
      assert.ok(countyNode.cities.some(c => c.slug === 'austin'));
    });
  });

  describe('NearbyEngine', () => {
    it('should resolve nearby cities relative to the knowledge graph', () => {
      const nearby = nearbyEngine.getNearbyCities('austin', 2);
      assert.ok(Array.isArray(nearby));
      assert.strictEqual(nearby.length, 1);
      assert.strictEqual(nearby[0].city, 'Dallas');
      assert.strictEqual(nearby[0].slug, 'dallas');
    });
  });

  describe('ContextEngine', () => {
    it('should compile a frozen Context Packet', () => {
      const packet = contextEngine.buildContextPacket('TX', 'austin', 'termite-control');

      assert.ok(packet);
      assert.strictEqual(packet.projectId, 'enterprise-pseo');
      assert.strictEqual(packet.location.city, 'Austin');
      assert.strictEqual(packet.service.id, 'termite-control');
      assert.strictEqual(packet.service.name, 'Termite Control');
      assert.ok(Array.isArray(packet.nearby));
      assert.strictEqual(packet.nearby[0].city, 'Dallas');

      // Verify SEO formulations
      assert.strictEqual(packet.seo.primaryKeyword, 'Termite Control in Austin, TX');
      assert.ok(packet.seo.canonicalUrl.endsWith('/tx/austin-termite-control'));

      // Verify widgets
      assert.ok(packet.widgets.weather.enabled);
      assert.ok(packet.widgets.maps.enabled);

      // Verify immutability
      assert.throws(() => {
        packet.projectId = 'changed';
      });
    });

    it('should throw Context Errors for invalid targeting', () => {
      // Invalid state abbreviation
      assert.throws(
        () => contextEngine.buildContextPacket('XX', 'austin', 'termite-control'),
        (err) => err instanceof PseoError && err.code === 'ERR_CONTEXT_INVALID'
      );

      // Invalid city slug
      assert.throws(
        () => contextEngine.buildContextPacket('TX', 'nonexistent-city', 'termite-control'),
        (err) => err instanceof PseoError && err.code === 'ERR_CONTEXT_INVALID'
      );

      // State and City mismatch (if we had another state)
      // Invalid service ID
      assert.throws(
        () => contextEngine.buildContextPacket('TX', 'austin', 'invalid-service-id'),
        (err) => err instanceof PseoError && err.code === 'ERR_CONTEXT_INVALID'
      );
    });
  });

  describe('PromptBuilder', () => {
    it('should construct system and user prompts with estimated tokens', () => {
      const packet = contextEngine.buildContextPacket('TX', 'austin', 'termite-control');
      const prompts = promptBuilder.buildWritePrompt(packet);

      assert.ok(prompts.systemPrompt);
      assert.ok(prompts.userPrompt);
      assert.ok(prompts.estimatedTokens > 0);
      assert.ok(prompts.systemPrompt.includes('Apex Pest Control'));
      assert.ok(prompts.userPrompt.includes('Termite Control'));
      assert.ok(prompts.userPrompt.includes('Austin, TX'));
    });
  });
});
