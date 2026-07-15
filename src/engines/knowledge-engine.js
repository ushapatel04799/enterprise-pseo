import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { datasetEngine } from './dataset-engine.js';
import { logger } from '../core/logger.js';
import { PseoError, ERROR_CODES } from '../core/errors.js';

const CACHE_PATH = path.resolve('data/derived/graph-cache.json');

/**
 * Knowledge Engine constructing an in-memory graph of locations,
 * services, and their relative mapping edges with derived disk caching.
 */
class KnowledgeEngine {
  constructor() {
    this.nodes = {
      states: new Map(),     // abbreviation -> StateNode
      cities: new Map(),     // slug -> CityNode
      counties: new Map(),   // stateAbbrev:countyName -> CountyNode
    };
    this.initialized = false;
  }

  /**
   * Calculates master checksum for loaded files registry.
   * @private
   */
  getMasterChecksum() {
    const registryArray = Array.from(datasetEngine.registry.entries());
    registryArray.sort((a, b) => a[0].localeCompare(b[0]));
    const hashes = registryArray.map(entry => entry[1].checksum).join('|');
    return crypto.createHash('md5').update(hashes).digest('hex');
  }

  /**
   * Attempts to load the Knowledge Graph from cache.
   * @private
   * @returns {Promise<boolean>}
   */
  async loadFromCache(masterChecksum) {
    try {
      const cacheRaw = await fs.readFile(CACHE_PATH, 'utf8');
      const cacheObject = JSON.parse(cacheRaw);

      if (cacheObject.checksum !== masterChecksum) {
        logger.info('knowledge-engine', 'Derived index cache expired. Rebuilding graph...');
        return false;
      }

      logger.info('knowledge-engine', 'Loading Knowledge Graph from cached derived index...');

      // 1. Restore Map instances
      const stateList = cacheObject.states;
      const cityList = cacheObject.cities;
      const countyList = cacheObject.counties;

      for (const s of stateList) {
        this.nodes.states.set(s.abbreviation.toUpperCase(), {
          ...s,
          cities: [],
        });
      }

      for (const co of countyList) {
        const key = `${co.state}:${co.name}`;
        this.nodes.counties.set(key, {
          ...co,
          cities: [],
        });
      }

      for (const c of cityList) {
        this.nodes.cities.set(c.slug, {
          ...c,
        });
      }

      // 2. Re-link Circular Parent-Child References
      for (const cityNode of this.nodes.cities.values()) {
        const stateNode = this.nodes.states.get(cityNode.state.toUpperCase());
        const countyNode = this.nodes.counties.get(`${cityNode.state.toUpperCase()}:${cityNode.county}`);

        if (stateNode) {
          cityNode.parentState = stateNode;
          stateNode.cities.push(cityNode);
        }

        if (countyNode) {
          cityNode.parentCounty = countyNode;
          countyNode.cities.push(cityNode);
        }
      }

      this.initialized = true;
      logger.info('knowledge-engine', `Graph restored: ${this.nodes.states.size} states, ${this.nodes.counties.size} counties, ${this.nodes.cities.size} cities.`);
      return true;
    } catch (err) {
      // Missing or corrupt cache is non-blocking
      return false;
    }
  }

  /**
   * Saves the constructed graph to disk.
   * @private
   */
  async saveToCache(masterChecksum) {
    try {
      const states = Array.from(this.nodes.states.values()).map(s => ({
        name: s.name,
        abbreviation: s.abbreviation,
        slug: s.slug,
        capital: s.capital,
        population: s.population,
        counties: s.counties,
      }));

      const counties = Array.from(this.nodes.counties.values()).map(co => ({
        name: co.name,
        state: co.state,
      }));

      const cities = Array.from(this.nodes.cities.values()).map(c => ({
        city: c.city,
        state: c.state,
        county: c.county,
        slug: c.slug,
        population: c.population,
        zip_codes: c.zip_codes,
        landmarks: c.landmarks,
        nearby_cities: c.nearby_cities,
        city_type: c.city_type,
        climate_zone: c.climate_zone,
        terrain: c.terrain,
        economy_type: c.economy_type,
        housing_profile: c.housing_profile,
        growth_pattern: c.growth_pattern,
        service_environment: c.service_environment,
        property_mix: c.property_mix,
      }));

      const cachePayload = {
        checksum: masterChecksum,
        states,
        counties,
        cities,
      };

      await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
      await fs.writeFile(CACHE_PATH, JSON.stringify(cachePayload, null, 2), 'utf8');
      logger.info('knowledge-engine', 'Knowledge Graph saved to derived disk cache.');
    } catch (err) {
      logger.warn('knowledge-engine', 'Failed to save graph derived index to cache.', { error: err });
    }
  }

  /**
   * Builds the Knowledge Graph from parsed datasetEngine values.
   */
  async initialize() {
    if (this.initialized) return;

    const masterChecksum = this.getMasterChecksum();
    const cacheLoaded = await this.loadFromCache(masterChecksum);
    if (cacheLoaded) return;

    logger.info('knowledge-engine', 'Building Knowledge Graph index...');

    const states = datasetEngine.getAllStates();
    const cities = datasetEngine.getAllCities();

    // 1. Build State Nodes
    for (const state of states) {
      this.nodes.states.set(state.abbreviation.toUpperCase(), {
        ...state,
        cities: [],
        counties: new Set(),
      });
    }

    // 2. Build County & City Nodes
    for (const city of cities) {
      const stateAbbrev = city.state.toUpperCase();
      const stateNode = this.nodes.states.get(stateAbbrev);

      if (!stateNode) {
        logger.warn('knowledge-engine', `City "${city.city}" (${city.slug}) references unregistered state "${stateAbbrev}"`);
        continue;
      }

      // Resolve County Node
      const countyKey = `${stateAbbrev}:${city.county}`;
      let countyNode = this.nodes.counties.get(countyKey);
      if (!countyNode) {
        countyNode = {
          name: city.county,
          state: stateAbbrev,
          cities: [],
        };
        this.nodes.counties.set(countyKey, countyNode);
      }

      // Construct City Node
      const cityNode = {
        ...city,
        parentState: stateNode,
        parentCounty: countyNode,
      };

      this.nodes.cities.set(city.slug, cityNode);

      // Append relationships to state & county
      stateNode.cities.push(cityNode);
      stateNode.counties.add(city.county);
      countyNode.cities.push(cityNode);
    }

    // Convert Set of counties on State Node to Array for serialization ease
    for (const stateNode of this.nodes.states.values()) {
      stateNode.counties = Array.from(stateNode.counties);
    }

    this.initialized = true;
    logger.info('knowledge-engine', `Graph constructed: ${this.nodes.states.size} states, ${this.nodes.counties.size} counties, ${this.nodes.cities.size} cities.`);

    // Persist to cache
    await this.saveToCache(masterChecksum);
  }

  /**
   * Gets a state node by abbreviation.
   */
  async getState(abbrev) {
    await this.initialize();
    return this.nodes.states.get(abbrev.toUpperCase());
  }

  /**
   * Gets a city node by slug.
   */
  async getCity(slug) {
    await this.initialize();
    return this.nodes.cities.get(slug.toLowerCase());
  }

  /**
   * Gets a county node by state and name.
   */
  async getCounty(stateAbbrev, countyName) {
    await this.initialize();
    const key = `${stateAbbrev.toUpperCase()}:${countyName}`;
    return this.nodes.counties.get(key);
  }

  /**
   * Clears the graph index.
   */
  clear() {
    this.nodes.states.clear();
    this.nodes.cities.clear();
    this.nodes.counties.clear();
    this.initialized = false;
  }
}

export const knowledgeEngine = new KnowledgeEngine();
