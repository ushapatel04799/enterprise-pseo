import { configManager } from '../../core/config-manager.js';
import { logger } from '../../core/logger.js';

import { PseoError, ERROR_CODES } from '../../core/errors.js';

/**
 * Base provider interface for Weather integrations.
 */
export class WeatherProvider {
  async getWeatherData(cityNode) {
    throw new Error('WeatherProvider.getWeatherData must be implemented by child adapter.');
  }
}

/**
 * Mock Weather Adapter for development and testing.
 */
export class MockWeatherAdapter extends WeatherProvider {
  async getWeatherData(cityNode) {
    const climateZone = cityNode.climate_zone || 'humid-continental';
    const zoneDetails = CLIMATE_ZONE_PROFILES[climateZone] || CLIMATE_ZONE_PROFILES['humid-continental'];

    return {
      enabled: true,
      provider: 'mock',
      data: {
        climateZone,
        typicalConditions: zoneDetails.conditions,
        averageHumidity: zoneDetails.humidity,
        seasonalNotes: zoneDetails.notes,
        mocked: true,
      }
    };
  }
}

/**
 * OpenWeatherMap API Adapter for production.
 */
export class OpenWeatherAdapter extends WeatherProvider {
  async getWeatherData(cityNode) {
    const apiKey = process.env.WEATHER_API_KEY;
    logger.info('weather-adapter', `Querying live weather data for city: "${cityNode.city}"`);
    
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityNode.city)},${encodeURIComponent(cityNode.state)},US&appid=${apiKey}&units=imperial`);
      if (!response.ok) {
         throw new Error(`OpenWeather API returned status: ${response.status}`);
      }
      const data = await response.json();
      
      const climateZone = cityNode.climate_zone || 'humid-continental';
      return {
        enabled: true,
        provider: 'openweathermap',
        data: {
          climateZone,
          typicalConditions: `${data.weather[0].main} - ${data.weather[0].description}`,
          averageHumidity: `${data.main.humidity}%`,
          seasonalNotes: `Current temp: ${data.main.temp}F`,
          mocked: false,
        }
      };
    } catch (err) {
      logger.error('weather-adapter', `Failed to fetch from Weather API: ${err.message}. Falling back to mock.`);
      // Fallback in case of failure so context packet generation does not completely fail
      return new MockWeatherAdapter().getWeatherData(cityNode);
    }
  }
}

/**
 * Registry for managing Weather API providers.
 */
class WeatherRegistry {
  constructor() {
    this.providers = new Map();
    this.providers.set('mock', new MockWeatherAdapter());
    this.providers.set('openweathermap', new OpenWeatherAdapter());
  }

  async getWeatherData(cityNode) {
    const enabled = configManager.get('provider.weather.enabled', true);
    if (!enabled) {
      return { enabled: false };
    }

    const providerName = configManager.get('provider.weather.provider', 'mock');
    const apiKey = process.env.WEATHER_API_KEY;
    const useMock = providerName === 'mock' || !apiKey;
    const activeProvider = useMock ? this.providers.get('mock') : this.providers.get(providerName);

    if (!activeProvider) {
       logger.warn('weather-adapter', `Provider "${providerName}" not registered, falling back to mock.`);
       return this.providers.get('mock').getWeatherData(cityNode);
    }

    return activeProvider.getWeatherData(cityNode);
  }
}

// Factual climate profile presets by zone
const CLIMATE_ZONE_PROFILES = {
  'humid-subtropical': {
    conditions: 'Hot, humid summers and mild winters.',
    humidity: '74%',
    notes: 'High mosquito and termite activity during warm humid periods.'
  },
  'subarctic': {
    conditions: 'Long, extremely cold winters and brief, cool summers.',
    humidity: '68%',
    notes: 'Seasonal insect blooms; rodents seek indoor heat early in autumn.'
  },
  'marine-west-coast': {
    conditions: 'Mild summers, cool winters, and steady rainfall.',
    humidity: '80%',
    notes: 'Persistent dampness drives moisture-loving pests and wood rot.'
  },
  'semiarid': {
    conditions: 'Hot, dry summers and cold, dry winters.',
    humidity: '42%',
    notes: 'Ants and spiders enter structures seeking water sources.'
  },
  'hot-desert': {
    conditions: 'Intense heat, abundant sunshine, and negligible rainfall.',
    humidity: '28%',
    notes: 'Scorpions and desert pests active during cooler night hours.'
  },
  'humid-continental': {
    conditions: 'Warm summers, cold winters, and moderate precipitation.',
    humidity: '65%',
    notes: 'Broad seasonal cycle drives indoor pest migrations in autumn.'
  }
};

export const weatherAdapter = new WeatherRegistry();
