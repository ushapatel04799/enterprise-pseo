/**
 * SEO & Linking Strategy Configuration
 */
export default {
  // Production Canonical Domain
  canonicalDomain: 'https://apexpestcontrol.example.com',

  // Path template pattern for generated routes
  // Supported variables: {state}, {city}, {service}
  routingPattern: '/{state}/{city}-{service}',

  // Metadata limits (aligned with Google guidelines)
  meta: {
    title: {
      min: 30,
      max: 60,
    },
    description: {
      min: 120,
      max: 160,
    },
  },

  // Internal Linking rules (to prevent doorway penalty)
  linking: {
    maxDepth: 3,             // Maximum click-depth from root
    maxLinksPerPage: 15,     // Hard limit on nearby/sibling link injection
    nearbyRadiusMiles: 25,   // Distance radius for nearby city linkage
    minAnchorTextLength: 3,  // Safety limit
  },

  // Target schema mappings
  schemas: {
    enabled: true,
    types: ['LocalBusiness', 'Service', 'BreadcrumbList', 'FAQPage'],
  },
};
