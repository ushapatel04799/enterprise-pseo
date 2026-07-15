import { configManager } from '../../core/config-manager.js';
import { logger } from '../../core/logger.js';
import { PseoError, ERROR_CODES } from '../../core/errors.js';

/**
 * Base provider interface for Maps integrations.
 */
export class MapsProvider {
  async getMapsData(cityNode, businessCoords) {
    throw new Error('MapsProvider.getMapsData must be implemented by child adapter.');
  }
}

/**
 * Mock Maps Adapter for development and testing.
 */
export class MockMapsAdapter extends MapsProvider {
  async getMapsData(cityNode, businessCoords) {
    const lat = cityNode.coordinates?.latitude || businessCoords.latitude;
    const lng = cityNode.coordinates?.longitude || businessCoords.longitude;
    const addressString = `${cityNode.city}, ${cityNode.state}`;
    
    return {
      enabled: true,
      provider: 'mock',
      data: {
        latitude: lat,
        longitude: lng,
        zoomLevel: 12,
        addressString,
        embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(addressString)}&t=&z=13&ie=UTF8&iwloc=&output=embed`,
        mocked: true,
      }
    };
  }
}

/**
 * Google Maps API Adapter for production.
 */
export class GoogleMapsAdapter extends MapsProvider {
  async getMapsData(cityNode, businessCoords) {
    const apiKey = process.env.MAPS_API_KEY;
    const addressString = `${cityNode.city}, ${cityNode.state}`;
    
    logger.info('maps-adapter', `Querying Google Maps API geolocation details for: "${addressString}"`);
    
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${apiKey}`);
      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }
      const data = await response.json();
      
      let lat = cityNode.coordinates?.latitude || businessCoords.latitude;
      let lng = cityNode.coordinates?.longitude || businessCoords.longitude;
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        lat = data.results[0].geometry.location.lat;
        lng = data.results[0].geometry.location.lng;
      } else {
        logger.warn('maps-adapter', `Google Maps Geocoding returned status: ${data.status}. Using fallback coordinates.`);
      }
      
      return {
        enabled: true,
        provider: 'google',
        data: {
          latitude: lat,
          longitude: lng,
          zoomLevel: 12,
          addressString,
          embedUrl: `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(addressString)}`,
          mocked: false,
        }
      };
    } catch (err) {
      throw new PseoError(
        ERROR_CODES.SYS_FAIL,
        `Maps API request failed: ${err.message}`,
        'maps-adapter',
        'ERROR',
        'Verify MAPS_API_KEY and network connection.',
        { error: err }
      );
    }
  }
}

/**
 * Registry for managing Maps API providers.
 */
class MapsRegistry {
  constructor() {
    this.providers = new Map();
    this.providers.set('mock', new MockMapsAdapter());
    this.providers.set('google', new GoogleMapsAdapter());
  }

  async getMapsData(cityNode, businessCoords) {
    const enabled = configManager.get('provider.maps.enabled', true);
    if (!enabled) {
      return { enabled: false };
    }

    const providerName = configManager.get('provider.maps.provider', 'mock');
    const apiKey = process.env.MAPS_API_KEY;
    
    const useMock = providerName === 'mock' || !apiKey;
    const activeProvider = useMock ? this.providers.get('mock') : this.providers.get(providerName);

    if (!activeProvider) {
       logger.warn('maps-adapter', `Provider "${providerName}" not registered, falling back to mock.`);
       return this.providers.get('mock').getMapsData(cityNode, businessCoords);
    }

    return activeProvider.getMapsData(cityNode, businessCoords);
  }
}

export const mapsAdapter = new MapsRegistry();
