import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pluginEngine } from '../../src/engines/plugin-engine.js';
import { datasetEngine } from '../../src/engines/dataset-engine.js';
import { schemaEngine } from '../../src/engines/schema-engine.js';

describe('Multi-Niche Plugin Framework Tests', () => {
  const tempPluginDir = path.resolve('tests/fixtures/niches/test-law');
  const manifestPath = path.join(tempPluginDir, 'plugin.config.json');
  const servicesDir = path.join(tempPluginDir, 'services');

  before(async () => {
    // Setup temporary plugin directory structure
    await fs.mkdir(servicesDir, { recursive: true });

    const config = {
      id: 'test-law',
      version: '1.2.0',
      name: 'Legal Services',
      schemaType: 'LegalService',
      theme: {
        primaryColor: '#1e3a8a',
        secondaryColor: '#d97706'
      },
      prompts: {
        systemPrompt: 'You are a legal SEO expert representing {brandName}.'
      }
    };

    const service = {
      id: 'contract-review',
      slug: 'contract-review',
      name: 'Contract Review',
      description: 'Professional contract drafting and review services.',
      faqs: [
        { question: 'What is the pricing?', answer: 'Flat rate reviews are available.' }
      ]
    };

    await fs.writeFile(manifestPath, JSON.stringify(config, null, 2), 'utf8');
    await fs.writeFile(path.join(servicesDir, 'contract-review.json'), JSON.stringify([service], null, 2), 'utf8');
  });

  after(async () => {
    // Clean up temporary plugin files
    await fs.rm(tempPluginDir, { recursive: true, force: true }).catch(() => {});
    pluginEngine.clear();
    // Re-initialize to default data for other tests
    await datasetEngine.initialize('tests/fixtures/locations/usa', 'data/services');
  });

  it('should validate, load and register a niche plugin successfully', async () => {
    const manifest = await pluginEngine.loadPlugin(tempPluginDir);

    assert.strictEqual(manifest.id, 'test-law');
    assert.strictEqual(manifest.schemaType, 'LegalService');
    assert.strictEqual(manifest.servicesList.length, 1);
    assert.strictEqual(manifest.servicesList[0].id, 'contract-review');
  });

  it('should override dataset ingestion services when plugin is active', async () => {
    pluginEngine.setActivePlugin('test-law');
    
    // Re-initialize datasetEngine
    await datasetEngine.initialize('tests/fixtures/locations/usa', 'data/services');

    const services = datasetEngine.getAllServices();
    assert.strictEqual(services.length, 1);
    assert.strictEqual(services[0].id, 'contract-review');
  });

  it('should compile correct niche schema types from active plugin configurations', async () => {
    pluginEngine.setActivePlugin('test-law');
    
    const context = {
      business: {
        name: 'Apex Legal Inc',
        phone: '1-800-555-9999',
        address: { streetAddress: '200 Law Lane' },
        coordinates: { latitude: 30, longitude: -90 }
      },
      location: {
        city: 'Dallas',
        state: 'TX',
        zipCodes: ['75201']
      },
      service: {
        id: 'contract-review',
        name: 'Contract Review',
        description: 'Legal service',
        faqs: []
      },
      seo: {
        canonicalUrl: 'https://legal-pseo.pages.dev/tx/dallas-contract-review'
      }
    };

    const schemas = schemaEngine.generateSchemas(context);
    const localBizSchema = schemas.find(s => s['@type'] === 'LegalService');

    assert.ok(localBizSchema);
    assert.strictEqual(localBizSchema.name, 'Apex Legal Inc');
  });
});
