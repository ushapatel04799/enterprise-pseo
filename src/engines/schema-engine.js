import { configManager } from '../core/config-manager.js';
import { cleanObject } from '../core/utils.js';
import { pluginEngine } from './plugin-engine.js';

/**
 * Schema Engine generating Google-eligible JSON-LD structured data blocks.
 */
class SchemaEngine {
  /**
   * Generates a combined JSON-LD schema array.
   * @param {Record<string, any>} context - Validated Context Packet.
   * @returns {Array<Record<string, any>>} Array of structured data schemas.
   */
  generateSchemas(context) {
    const schemas = [];

    // 1. LocalBusiness Schema
    schemas.push(this.buildLocalBusiness(context));

    // 2. Service Schema
    schemas.push(this.buildService(context));

    // 3. BreadcrumbList Schema
    schemas.push(this.buildBreadcrumb(context));

    // 4. FAQPage Schema
    if (context.service.faqs && context.service.faqs.length > 0) {
      schemas.push(this.buildFAQ(context));
    }

    return cleanObject(schemas);
  }

  /**
   * Builds the LocalBusiness schema definition.
   * @private
   */
  buildLocalBusiness(context) {
    const { business, location } = context;
    const activePlugin = pluginEngine.getActivePlugin();
    const type = activePlugin ? activePlugin.schemaType : 'LocalBusiness';

    return {
      '@context': 'https://schema.org',
      '@type': type,
      'name': business.name,
      'legalName': business.legalName,
      'telephone': business.phone,
      'email': business.email,
      'priceRange': '$$',
      'image': `${context.seo.canonicalUrl}/logo.png`,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': business.address.streetAddress,
        'addressLocality': location.city,
        'addressRegion': location.state,
        'postalCode': location.zipCodes[0],
        'addressCountry': 'US',
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': business.coordinates.latitude,
        'longitude': business.coordinates.longitude,
      },
      'openingHoursSpecification': {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        'opens': '08:00',
        'closes': '20:00',
      },
    };
  }

  /**
   * Builds the Service schema definition.
   * @private
   */
  buildService(context) {
    const { service, location, business } = context;
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': `${service.name} in ${location.city}`,
      'serviceType': service.name,
      'description': service.description,
      'provider': {
        '@type': 'LocalBusiness',
        'name': business.name,
        'telephone': business.phone,
      },
      'areaServed': {
        '@type': 'AdministrativeArea',
        'name': `${location.city}, ${location.state}`,
      },
    };
  }

  /**
   * Builds the BreadcrumbList schema definition.
   * @private
   */
  buildBreadcrumb(context) {
    const { location, service, seo } = context;
    const items = [
      { name: 'Home', url: configValue('seo.canonicalDomain') },
      { name: location.state, url: `${configValue('seo.canonicalDomain')}/${location.state.toLowerCase()}` },
      { name: `${service.name} - ${location.city}`, url: seo.canonicalUrl },
    ];

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url,
      })),
    };
  }

  /**
   * Builds the FAQPage schema definition.
   * @private
   */
  buildFAQ(context) {
    const faqs = context.service.faqs || [];
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer,
        },
      })),
    };
  }
}

// Utility wrapper helper
function configValue(key) {
  return configManager.get(key, '');
}

export const schemaEngine = new SchemaEngine();
