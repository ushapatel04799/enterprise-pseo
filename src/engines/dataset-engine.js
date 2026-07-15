import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { logger } from '../core/logger.js';
import { PseoError, ERROR_CODES } from '../core/errors.js';
import { SchemaValidator } from '../core/schema-validator.js';
import { cleanObject } from '../core/utils.js';
import { pluginEngine } from './plugin-engine.js';

const STATE_METADATA = {
  AL: { name: 'Alabama', capital: 'Montgomery', population: 5024279 },
  AK: { name: 'Alaska', capital: 'Juneau', population: 733391 },
  AZ: { name: 'Arizona', capital: 'Phoenix', population: 7151502 },
  AR: { name: 'Arkansas', capital: 'Little Rock', population: 3011524 },
  CA: { name: 'California', capital: 'Sacramento', population: 39538223 },
  CO: { name: 'Colorado', capital: 'Denver', population: 5773714 },
  CT: { name: 'Connecticut', capital: 'Hartford', population: 3605944 },
  DE: { name: 'Delaware', capital: 'Dover', population: 989948 },
  FL: { name: 'Florida', capital: 'Tallahassee', population: 21538187 },
  GA: { name: 'Georgia', capital: 'Atlanta', population: 10711908 },
  HI: { name: 'Hawaii', capital: 'Honolulu', population: 1455271 },
  ID: { name: 'Idaho', capital: 'Boise', population: 1839106 },
  IL: { name: 'Illinois', capital: 'Springfield', population: 12812508 },
  IN: { name: 'Indiana', capital: 'Indianapolis', population: 6785528 },
  IA: { name: 'Iowa', capital: 'Des Moines', population: 3190369 },
  KS: { name: 'Kansas', capital: 'Topeka', population: 2937880 },
  KY: { name: 'Kentucky', capital: 'Frankfort', population: 4505836 },
  LA: { name: 'Louisiana', capital: 'Baton Rouge', population: 4657757 },
  ME: { name: 'Maine', capital: 'Augusta', population: 1362359 },
  MD: { name: 'Maryland', capital: 'Annapolis', population: 6177224 },
  MA: { name: 'Massachusetts', capital: 'Boston', population: 7029917 },
  MI: { name: 'Michigan', capital: 'Lansing', population: 10077331 },
  MN: { name: 'Minnesota', capital: 'St. Paul', population: 5706494 },
  MS: { name: 'Mississippi', capital: 'Jackson', population: 2961279 },
  MO: { name: 'Missouri', capital: 'Jefferson City', population: 6154913 },
  MT: { name: 'Montana', capital: 'Helena', population: 1084225 },
  NE: { name: 'Nebraska', capital: 'Lincoln', population: 1961504 },
  NV: { name: 'Nevada', capital: 'Carson City', population: 3104614 },
  NH: { name: 'New Hampshire', capital: 'Concord', population: 1377529 },
  NJ: { name: 'New Jersey', capital: 'Trenton', population: 9288994 },
  NM: { name: 'New Mexico', capital: 'Santa Fe', population: 2117522 },
  NY: { name: 'New York', capital: 'Albany', population: 20201249 },
  NC: { name: 'North Carolina', capital: 'Raleigh', population: 10439388 },
  ND: { name: 'North Dakota', capital: 'Bismarck', population: 779094 },
  OH: { name: 'Ohio', capital: 'Columbus', population: 11799448 },
  OK: { name: 'Oklahoma', capital: 'Oklahoma City', population: 3959353 },
  OR: { name: 'Oregon', capital: 'Salem', population: 4237256 },
  PA: { name: 'Pennsylvania', capital: 'Harrisburg', population: 13002700 },
  RI: { name: 'Rhode Island', capital: 'Providence', population: 1097379 },
  SC: { name: 'South Carolina', capital: 'Columbia', population: 5118425 },
  SD: { name: 'South Dakota', capital: 'Pierre', population: 886667 },
  TN: { name: 'Tennessee', capital: 'Nashville', population: 6910840 },
  TX: { name: 'Texas', capital: 'Austin', population: 29145505 },
  UT: { name: 'Utah', capital: 'Salt Lake City', population: 3271616 },
  VT: { name: 'Vermont', capital: 'Montpelier', population: 643077 },
  VA: { name: 'Virginia', capital: 'Richmond', population: 8631393 },
  WA: { name: 'Washington', capital: 'Olympia', population: 7705281 },
  WV: { name: 'West Virginia', capital: 'Charleston', population: 1793716 },
  WI: { name: 'Wisconsin', capital: 'Madison', population: 5893718 },
  WY: { name: 'Wyoming', capital: 'Cheyenne', population: 576851 }
};

/**
 * Dataset Engine responsible for discovering, registering, and loading raw source datasets.
 */
class DatasetEngine {
  constructor() {
    this.states = new Map();     // abbreviation -> stateData
    this.cities = new Map();     // slug -> cityData
    this.services = new Map();   // serviceId -> serviceData
    this.registry = new Map();   // filePath -> { checksum, size, loadedAt }
  }

  /**
   * Calculates MD5 checksum for file contents.
   * @private
   */
  calculateChecksum(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Scans a directory for JSON files.
   * @private
   */
  async scanDir(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
        .map(entry => path.join(dirPath, entry.name));
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw new PseoError(
        ERROR_CODES.SYS_FAIL,
        `Failed to scan directory: ${dirPath}`,
        'dataset-engine',
        'ERROR',
        'Verify target directory exists and has correct read permissions.',
        { error: err }
      );
    }
  }

  /**
   * Discovers and registers all state, city, and service data files.
   * @param {string} sourceLocationsPath - Path to locations USA directory.
   * @param {string} sourceServicesPath - Path to services directory.
   */
  async initialize(sourceLocationsPath = 'data/locations/usa', sourceServicesPath = 'data/services') {
    const statesDir = path.resolve(sourceLocationsPath, 'states');
    const citiesDir = path.resolve(sourceLocationsPath, 'cities');
    const servicesDir = path.resolve(sourceServicesPath);

    logger.info('dataset-engine', 'Discovering source files...', { statesDir, citiesDir, servicesDir });

    const stateFiles = await this.scanDir(statesDir);
    const cityFiles = await this.scanDir(citiesDir);
    const serviceFiles = await this.scanDir(servicesDir);

    logger.info('dataset-engine', `Discovered ${stateFiles.length} states, ${cityFiles.length} cities, and ${serviceFiles.length} service files.`);

    // Clear maps
    this.states.clear();
    this.cities.clear();
    this.services.clear();
    this.registry.clear();

    // 1. Register State files
    for (const filePath of stateFiles) {
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const checksum = this.calculateChecksum(fileContent);
        const stats = await fs.stat(filePath);
        
        const abbrev = path.basename(filePath, '.json').toUpperCase();
        let stateData;
        const parsed = JSON.parse(fileContent);

        if (parsed.abbreviation && parsed.name) {
          stateData = parsed;
        } else {
          const meta = STATE_METADATA[abbrev];
          if (!meta) {
            throw new Error(`State metadata lookup failed for: ${abbrev}`);
          }
          stateData = {
            name: meta.name,
            abbreviation: abbrev,
            slug: meta.name.toLowerCase().replace(/\s+/g, '-'),
            capital: meta.capital,
            population: meta.population,
            counties: parsed
          };
        }

        // Schema validate on load
        SchemaValidator.validateState(stateData);

        this.states.set(abbrev, cleanObject(stateData));
        this.registry.set(filePath, { checksum, size: stats.size, type: 'state', key: abbrev });
      } catch (err) {
        logger.error('dataset-engine', `Failed to register state file: ${filePath}`, err);
        throw err;
      }
    }

    // 2. Register City files
    for (const filePath of cityFiles) {
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const checksum = this.calculateChecksum(fileContent);
        const stats = await fs.stat(filePath);

        const citiesArray = JSON.parse(fileContent);
        if (!Array.isArray(citiesArray)) {
          throw new PseoError(
            ERROR_CODES.DATA_INVALID,
            `City file must contain an array of cities: ${filePath}`,
            'dataset-engine',
            'ERROR',
            'Ensure the root element of the city JSON file is a JSON array.'
          );
        }

        const stateAbbrev = path.basename(filePath, '.json').toUpperCase();
        const cleanedCities = [];

        for (const city of citiesArray) {
          // Inject state property from filename context before validating
          city.state = stateAbbrev;
          SchemaValidator.validateCity(city);
          cleanedCities.push(cleanObject(city));
          this.cities.set(city.slug, city);
        }

        this.registry.set(filePath, { checksum, size: stats.size, type: 'cities', key: stateAbbrev });
      } catch (err) {
        logger.error('dataset-engine', `Failed to register cities file: ${filePath}`, err);
        throw err;
      }
    }

    // 3. Register Service files
    const activePlugin = pluginEngine.getActivePlugin();
    if (activePlugin) {
      logger.info('dataset-engine', `Plugin Mode Active: Ingesting services list from niche plugin "${activePlugin.name}"...`);
      for (const service of activePlugin.servicesList) {
        SchemaValidator.validateService(service);
        this.services.set(service.id, cleanObject(service));
      }
    } else {
      for (const filePath of serviceFiles) {
        try {
          const fileContent = await fs.readFile(filePath, 'utf8');
          const checksum = this.calculateChecksum(fileContent);
          const stats = await fs.stat(filePath);

          const servicesArray = JSON.parse(fileContent);
          if (!Array.isArray(servicesArray)) {
            throw new PseoError(
              ERROR_CODES.DATA_INVALID,
              `Service file must contain an array of services: ${filePath}`,
              'dataset-engine',
              'ERROR',
              'Ensure the root element of the service JSON file is a JSON array.'
            );
          }

          const serviceNicheName = path.basename(filePath, '.json');
          
          for (const service of servicesArray) {
            SchemaValidator.validateService(service);
            this.services.set(service.id, cleanObject(service));
          }

          this.registry.set(filePath, { checksum, size: stats.size, type: 'services', key: serviceNicheName });
        } catch (err) {
          logger.error('dataset-engine', `Failed to register services file: ${filePath}`, err);
          throw err;
        }
      }
    }

    logger.info(
      'dataset-engine', 
      `Initialization successful. Loaded ${this.states.size} states, ${this.cities.size} cities, and ${this.services.size} services.`
    );
  }

  getState(abbrev) {
    return this.states.get(abbrev.toUpperCase());
  }

  getCity(slug) {
    return this.cities.get(slug);
  }

  getService(id) {
    return this.services.get(id);
  }

  getAllStates() {
    return Array.from(this.states.values());
  }

  getAllCities() {
    return Array.from(this.cities.values());
  }

  getAllServices() {
    return Array.from(this.services.values());
  }
}

export const datasetEngine = new DatasetEngine();
