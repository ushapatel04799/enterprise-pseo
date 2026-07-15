import { describe, it } from 'node:test';
import assert from 'node:assert';
import { seoIntelligenceEngine } from '../../src/engines/seo-intelligence-engine.js';
import { configManager } from '../../src/core/config-manager.js';

describe('SEO Intelligence Engine Tests', () => {
  const getContextAndSeo = () => {
    const canonicalDomain = configManager.get('seo.canonicalDomain', 'https://dev-preview.enterprise-pseo.pages.dev');
    const canonicalUrl = `${canonicalDomain}/tx/austin-termite-control`;

    const context = {
      business: {
        phone: '1-800-555-0199',
        licenseNumber: 'TX-12948',
      },
      location: {
        city: 'Austin',
        state: 'TX',
        zipCodes: ['78701'],
      },
      seo: {
        primaryKeyword: 'Termite Control in Austin, TX',
        canonicalUrl,
      }
    };

    const seoModel = {
      meta: {
        title: 'Termite Control in Austin, TX | Apex Pest Control',
        description: 'Apex Pest Control provides local Termite Control in Austin. Contact us!',
        canonicalUrl,
      }
    };

    return { context, seoModel };
  };

  it('should pass audit for high-quality content matching intent', () => {
    const { context, seoModel } = getContextAndSeo();
    const contentModel = {
      title: 'Termite Control in Austin, TX',
      description: 'Apex Pest Control provides local Termite Control in Austin. Contact us!',
      content: {
        hero: { title: 'Local Termite Control', subtitle: 'Protecting your Austin structure.' },
        localIntro: 'We are certified exterminators serving Travis County and downtown Austin neighborhood areas.',
        serviceDetails: [
          'Professional soil barriers.',
          'Complete inspections around the local properties.'
        ],
        faqs: [
          { question: 'Is the treatment safe?', answer: 'Yes, we use green barriers for safety.' }
        ]
      }
    };

    const report = seoIntelligenceEngine.analyze(contentModel, seoModel, context);

    assert.strictEqual(report.passed, true);
    assert.ok(report.score >= 80);
    assert.strictEqual(report.metrics.intentType, 'transactional');
  });

  it('should flag thin content error under 300 words', () => {
    const { context, seoModel } = getContextAndSeo();
    const contentModel = {
      title: 'Short title',
      description: 'Short desc',
      content: {}
    };

    const report = seoIntelligenceEngine.analyze(contentModel, seoModel, context);

    assert.strictEqual(report.checks.thinContent.passed, false);
    assert.ok(report.errors.some(e => e.includes('Thin Content')));
  });

  it('should flag keyword stuffing for excessive keyword density', () => {
    const { context, seoModel } = getContextAndSeo();
    const contentModel = {
      title: 'Termite Control in Austin, TX',
      description: 'Termite Control in Austin, TX Termite Control in Austin, TX Termite Control in Austin, TX',
      content: {
        hero: { title: 'Termite Control in Austin, TX', subtitle: 'Termite Control in Austin, TX' },
        localIntro: 'Termite Control in Austin, TX Termite Control in Austin, TX Termite Control in Austin, TX Termite Control in Austin, TX',
      }
    };

    const report = seoIntelligenceEngine.analyze(contentModel, seoModel, context);

    assert.strictEqual(report.checks.keywordStuffing.passed, false);
    assert.ok(report.errors.some(e => e.includes('Keyword Stuffing')));
  });
});
