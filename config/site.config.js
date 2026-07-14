/**
 * Site & Business Configuration
 * Defines target niche, metadata, and business identity.
 */
export default {
  // Target Niche & Geography
  niche: 'pest-control',
  region: 'usa',

  // Business Identity
  business: {
    name: 'Apex Pest Control',
    legalName: 'Apex Pest Control Services LLC',
    phone: '1-800-555-0199', // Canonical phone number
    email: 'info@apexpestcontrol.example.com',
    hours: 'Mo-Su 08:00-20:00',
    licenseNumber: 'PC-98765432-A',
    privacyPolicyUrl: 'https://apexpestcontrol.example.com/privacy-policy',
    termsUrl: 'https://apexpestcontrol.example.com/terms',
    
    // Main headquarters details (if applicable)
    address: {
      streetAddress: '100 Main St, Suite 200',
      addressLocality: 'Austin',
      addressRegion: 'TX',
      postalCode: '78701',
      addressCountry: 'US',
    },
    coordinates: {
      latitude: 30.2672,
      longitude: -97.7431,
    },
  },

  // Brand Styling tokens
  theme: {
    primaryColor: '#0c4a6e', // Deep Ocean Blue
    secondaryColor: '#f59e0b', // Warm Amber
    fontFamily: 'Outfit, sans-serif',
  },
};
