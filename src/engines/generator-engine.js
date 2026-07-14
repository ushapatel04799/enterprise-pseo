import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '../core/logger.js';
import { PseoError, ERROR_CODES } from '../core/errors.js';
import { slugify } from '../core/utils.js';

/**
 * Generator Engine compiling parsed page models into Nunjucks templates inside src/pages.
 */
class GeneratorEngine {
  /**
   * Generates a template file under src/pages/{state}/{city}-{service}.html.
   * @param {Record<string, any>} contentModel - Generated AI content.
   * @param {Record<string, any>} seoModel - Compiled SEO model details.
   * @param {Record<string, any>} context - Original Context Packet.
   */
  async generatePage(contentModel, seoModel, context) {
    const stateAbbrev = context.location.state.toLowerCase();
    const citySlug = slugify(context.location.city);
    const serviceSlug = slugify(context.service.name);

    const targetDir = path.resolve('src/pages', stateAbbrev);
    const targetPath = path.join(targetDir, `${citySlug}-${serviceSlug}.html`);

    logger.info('generator-engine', `Rendering page template: ${targetPath}`);

    // Construct Front Matter (YAML config parameters)
    const frontMatter = `---
layout: main.njk
title: "${seoModel.meta.title.replace(/"/g, '\\"')}"
description: "${seoModel.meta.description.replace(/"/g, '\\"')}"
canonicalUrl: "${seoModel.meta.canonicalUrl}"
business:
  name: "${context.business.name}"
  legalName: "${context.business.legalName}"
  phone: "${context.business.phone}"
  licenseNumber: "${context.business.licenseNumber}"
  email: "${context.business.email}"
  privacyPolicyUrl: "${context.business.privacyPolicyUrl}"
  termsUrl: "${context.business.termsUrl}"
  address:
    streetAddress: "${context.business.address.streetAddress}"
    addressLocality: "${context.business.address.addressLocality}"
    addressRegion: "${context.business.address.addressRegion}"
    postalCode: "${context.business.address.postalCode}"
theme:
  primaryColor: "${configValue('site.theme.primaryColor', '#0c4a6e')}"
  secondaryColor: "${configValue('site.theme.secondaryColor', '#f59e0b')}"
schemas: '${JSON.stringify(seoModel.schemas).replace(/'/g, "\\'")}'
copyrightYear: ${new Date().getFullYear()}
---`;

    // Construct Semantic HTML structures
    const htmlBody = `
<style>
  .hero-section {
    background: linear-gradient(135deg, var(--primary) 0%, #1e1e1e 100%);
    color: #ffffff;
    padding: 5rem 2rem;
    text-align: center;
    border-radius: 12px;
    margin-bottom: 3rem;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  }
  .hero-section h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    line-height: 1.2;
  }
  .hero-section p {
    font-size: 1.25rem;
    color: #d1d5db;
    max-width: 800px;
    margin: 0 auto 2rem auto;
  }
  .hero-cta {
    display: inline-block;
    background-color: var(--secondary);
    color: #ffffff;
    font-weight: 600;
    font-size: 1.125rem;
    padding: 0.75rem 2rem;
    border-radius: 9999px;
    text-decoration: none;
    transition: transform 0.2s ease;
  }
  .hero-cta:hover {
    transform: scale(1.05);
  }
  .section-card {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 2.5rem;
    margin-bottom: 2.5rem;
    border: 1px solid #e5e7eb;
  }
  .section-card h2 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--primary);
    margin-bottom: 1.5rem;
  }
  .intro-text {
    font-size: 1.125rem;
    line-height: 1.8;
  }
  .benefit-list {
    list-style: none;
  }
  .benefit-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1rem;
    font-size: 1.125rem;
  }
  .benefit-icon {
    color: var(--secondary);
    font-weight: 800;
    margin-right: 0.75rem;
  }
  .link-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
  }
  .link-item {
    background-color: var(--bg-light);
    border: 1px solid #e5e7eb;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
    transition: background-color 0.2s ease;
  }
  .link-item:hover {
    background-color: #f3f4f6;
  }
  .faq-accordion {
    margin-top: 1.5rem;
  }
  .faq-card {
    border-bottom: 1px solid #e5e7eb;
    padding: 1.5rem 0;
  }
  .faq-card h3 {
    font-size: 1.25rem;
    color: var(--text);
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  .faq-card p {
    color: #4b5563;
  }
</style>

<div class="hero-section">
  <h1>${contentModel.content.hero.title}</h1>
  <p>${contentModel.content.hero.subtitle}</p>
  <a href="tel:${context.business.phone}" class="hero-cta">${contentModel.content.hero.ctaText}</a>
</div>

<div class="section-card">
  <h2>Local Care & Inspections</h2>
  <p class="intro-text">${contentModel.content.localIntro}</p>
</div>

<div class="section-card">
  <h2>Key Service Advantages</h2>
  <ul class="benefit-list">
    ${contentModel.content.serviceDetails.map(detail => `
      <li class="benefit-item">
        <span class="benefit-icon">✓</span>
        <span>${detail}</span>
      </li>
    `).join('')}
  </ul>
</div>

<div class="section-card">
  <h2>Our Local Service Areas</h2>
  <p class="intro-text">${contentModel.content.nearbyExclusion}</p>
  <div class="link-grid">
    ${seoModel.links.map(link => `
      <a href="${link.url}" class="link-item">${link.text}</a>
    `).join('')}
  </div>
</div>

<div class="section-card">
  <h2>Frequently Asked Questions</h2>
  <div class="faq-accordion">
    ${contentModel.content.faqs.map(faq => `
      <div class="faq-card">
        <h3>${faq.question}</h3>
        <p>${faq.answer}</p>
      </div>
    `).join('')}
  </div>
</div>
`;

    const fullFileContent = `${frontMatter}\n${htmlBody}`;

    try {
      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(targetPath, fullFileContent, 'utf8');
      logger.info('generator-engine', `Page written successfully: ${targetPath}`);
    } catch (err) {
      throw new PseoError(
        ERROR_CODES.GEN_FAIL,
        `Failed to write static template file: ${err.message}`,
        'generator-engine',
        'ERROR',
        'Verify filesystem write permissions.',
        { error: err }
      );
    }
  }

  /**
   * Generates robots.txt rules under src/robots.txt.
   */
  async generateRobots() {
    const targetPath = path.resolve('src/robots.txt');
    const content = `User-agent: *
Allow: /

Sitemap: ${configValue('seo.canonicalDomain')}/sitemap.xml
`;
    await fs.writeFile(targetPath, content, 'utf8');
    logger.info('generator-engine', 'robots.txt file generated.');
  }
}

// Utility wrapper helper
import { configManager } from '../core/config-manager.js';
function configValue(key, fallback) {
  return configManager.get(key, fallback);
}

export const generatorEngine = new GeneratorEngine();
