import { datasetEngine } from './dataset-engine.js';
import { logger } from '../core/logger.js';
import { PseoError, ERROR_CODES } from '../core/errors.js';

/**
 * Knowledge Engine constructing an in-memory graph of locations,
 * services, and their relative mapping edges.
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
   * Builds the Knowledge Graph from parsed datasetEngine values.
   */
  initialize() {
    if (this.initialized) return;

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
  }

  /**
   * Gets a state node by abbreviation.
   */
  getState(abbrev) {
    this.initialize();
    return this.nodes.states.get(abbrev.toUpperCase());
  }

  /**
   * Gets a city node by slug.
   */
  getCity(slug) {
    this.initialize();
    return this.nodes.cities.get(slug.toLowerCase());
  }

  /**
   * Gets a county node by state and name.
   */
  getCounty(stateAbbrev, countyName) {
    this.initialize();
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
