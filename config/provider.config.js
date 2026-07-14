/**
 * API & Service Providers Configuration
 */
export default {
  // AI Inference & Review configuration
  ai: {
    primaryModel: 'gemini-2.5-pro',
    secondaryModel: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_API_KEY || null,
    timeoutMs: 15000,
    maxRetries: 3,
  },

  // Third-Party data integration settings
  weather: {
    provider: 'mock', // Options: 'mock', 'open-weather'
    apiKey: process.env.WEATHER_API_KEY || null,
    enabled: true,
  },

  maps: {
    provider: 'mock', // Options: 'mock', 'google-maps'
    apiKey: process.env.MAPS_API_KEY || null,
    enabled: true,
  },

  // Target deployment configuration
  deployment: {
    platform: 'cloudflare-pages',
    projectName: 'apex-pest-pseo',
    apiToken: process.env.CLOUDFLARE_API_TOKEN || null,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || null,
  },
};
