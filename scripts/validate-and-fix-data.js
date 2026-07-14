import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { slugify, isValidSlug, parsePopulation } from '../src/core/utils.js';

const LOCATIONS_DIR = path.resolve('data/locations/usa');
const STATES_DIR = path.join(LOCATIONS_DIR, 'states');
const CITIES_DIR = path.join(LOCATIONS_DIR, 'cities');
const CHANGELOG_PATH = path.resolve('CHANGELOG.md');

const changesLog = [];
let errorCount = 0;
let fixedCount = 0;

/**
 * Computes MD5 hash.
 */
async function getFileHash(filePath) {
  const content = await fs.readFile(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Appends log to changes array.
 */
function logChange(action, details) {
  changesLog.push(`- **[${action}]** ${details}`);
  fixedCount++;
}

/**
 * Main execution.
 */
async function run() {
  console.log('Starting comprehensive data validation & auto-fix script...');

  // 1. Scan and detect duplicate files/filenames
  const stateFiles = await fs.readdir(STATES_DIR).catch(() => []);
  const cityFiles = await fs.readdir(CITIES_DIR).catch(() => []);

  const fileHashes = new Map(); // hash -> first filePath
  const duplicateFiles = [];

  // Check state files hashes
  for (const file of stateFiles) {
    const filePath = path.join(STATES_DIR, file);
    const hash = await getFileHash(filePath);
    if (fileHashes.has(hash)) {
      duplicateFiles.push({ file: filePath, duplicateOf: fileHashes.get(hash) });
    } else {
      fileHashes.set(hash, filePath);
    }
  }

  // Check city files hashes (including il.json and il1.json checks)
  for (const file of cityFiles) {
    const filePath = path.join(CITIES_DIR, file);
    const hash = await getFileHash(filePath);
    if (fileHashes.has(hash)) {
      duplicateFiles.push({ file: filePath, duplicateOf: fileHashes.get(hash) });
    } else {
      fileHashes.set(hash, filePath);
    }
  }

  // Safely delete duplicate files
  for (const dup of duplicateFiles) {
    console.log(`Duplicate file detected: ${dup.file} is identical to ${dup.duplicateOf}`);
    try {
      await fs.unlink(dup.file);
      logChange('DELETE_DUPLICATE_FILE', `Removed duplicate file: \`${path.basename(dup.file)}\` (identical to \`${path.basename(dup.duplicateOf)}\`).`);
    } catch (err) {
      console.error(`Failed to delete duplicate file: ${dup.file}`, err);
      errorCount++;
    }
  }

  // Reload file lists after deletions
  const activeStateFiles = (await fs.readdir(STATES_DIR)).filter(f => f.endsWith('.json'));
  const activeCityFiles = (await fs.readdir(CITIES_DIR)).filter(f => f.endsWith('.json'));

  const parsedStates = new Map(); // abbrev -> stateData
  const parsedCities = []; // list of all city objects
  const citySlugs = new Map(); // slug -> cityNode

  // 2. Parse and Validate States
  for (const file of activeStateFiles) {
    const filePath = path.join(STATES_DIR, file);
    try {
      const dataText = await fs.readFile(filePath, 'utf8');
      const stateObj = JSON.parse(dataText);

      // Validate required fields
      if (!stateObj.name || !stateObj.abbreviation || !stateObj.slug) {
        throw new Error(`Missing required state fields in ${file}`);
      }

      // Check capital capitalization or casing
      let stateModified = false;
      if (stateObj.abbreviation !== stateObj.abbreviation.toUpperCase()) {
        stateObj.abbreviation = stateObj.abbreviation.toUpperCase();
        stateModified = true;
      }

      if (stateModified) {
        await fs.writeFile(filePath, JSON.stringify(stateObj, null, 2), 'utf8');
        logChange('FIX_STATE_DATA', `Normalized abbreviation and capitalization in state file \`${file}\`.`);
      }

      parsedStates.set(stateObj.abbreviation, stateObj);
    } catch (err) {
      console.error(`Invalid JSON or schema in state file: ${file}`, err);
      errorCount++;
    }
  }

  // 3. Parse, Validate & Auto-fix Cities
  for (const file of activeCityFiles) {
    const filePath = path.join(CITIES_DIR, file);
    const stateAbbrev = path.basename(filePath, '.json').toUpperCase();

    try {
      const dataText = await fs.readFile(filePath, 'utf8');
      let citiesArray = JSON.parse(dataText);

      if (!Array.isArray(citiesArray)) {
        throw new Error(`File content must be an array: ${file}`);
      }

      let arrayModified = false;

      for (let i = 0; i < citiesArray.length; i++) {
        const city = citiesArray[i];
        let cityModified = false;

        // Force inject parent state if missing or mismatched
        if (city.state !== stateAbbrev) {
          city.state = stateAbbrev;
          cityModified = true;
        }

        // Validate required city fields
        if (!city.city) {
          if (city.name) {
            city.city = city.name;
            delete city.name;
            cityModified = true;
          } else {
            city.city = 'Unknown City';
            cityModified = true;
          }
        }

        // Validate and fix slugs
        if (!city.slug || !isValidSlug(city.slug)) {
          const freshSlug = `${slugify(city.city)}-${stateAbbrev.toLowerCase()}`;
          logChange('FIX_CITY_SLUG', `Corrected invalid or missing slug for city "${city.city}" to \`${freshSlug}\`.`);
          city.slug = freshSlug;
          cityModified = true;
        }

        // Check for population strings/commas
        if (typeof city.population === 'string') {
          const parsedPop = parsePopulation(city.population);
          city.population = parsedPop;
          cityModified = true;
          logChange('NORMALIZE_POPULATION', `Converted population string for city "${city.city}" to integer: ${parsedPop}.`);
        }

        // Stringify ZIP codes
        if (city.zip_codes) {
          const fixedZips = city.zip_codes.map(zip => {
            const zipStr = zip.toString().trim();
            if (zipStr.length === 4) {
              return `0${zipStr}`; // Pad leading zero (e.g. New England)
            }
            return zipStr;
          });

          if (JSON.stringify(city.zip_codes) !== JSON.stringify(fixedZips)) {
            city.zip_codes = fixedZips;
            cityModified = true;
            logChange('NORMALIZE_ZIPS', `Standardized ZIP codes formatting for city "${city.city}".`);
          }
        }

        // Check for duplicate slugs within active memory registry
        if (citySlugs.has(city.slug)) {
          const orig = citySlugs.get(city.slug);
          // If they represent different locations, rename the new one uniquely
          if (orig.state !== city.state || orig.city !== city.city) {
            const uniqueSlug = `${city.slug}-${i}`;
            logChange('RESOLVE_DUPLICATE_SLUG', `Renamed duplicate city slug from \`${city.slug}\` to \`${uniqueSlug}\`.`);
            city.slug = uniqueSlug;
            cityModified = true;
          }
        }

        citySlugs.set(city.slug, { city: city.city, state: city.state });
        parsedCities.push(city);

        if (cityModified) {
          arrayModified = true;
        }
      }

      if (arrayModified) {
        await fs.writeFile(filePath, JSON.stringify(citiesArray, null, 2), 'utf8');
      }
    } catch (err) {
      console.error(`Invalid JSON or schema in city file: ${file}`, err);
      errorCount++;
    }
  }

  // 4. Verify cross-record nearby_cities relationships
  for (const city of parsedCities) {
    if (city.nearby_cities) {
      const validNearby = [];
      for (const nearby of city.nearby_cities) {
        // If the nearby city slug doesn't exist, log warning or remove it safely
        const targetExists = citySlugs.has(nearby.slug);
        if (!targetExists) {
          console.warn(`Warning: City "${city.city}" (${city.state}) lists unregistered nearby city "${nearby.name}" (${nearby.slug})`);
        } else {
          validNearby.push(nearby);
        }
      }
      // If we filtered out any dead links
      if (validNearby.length !== city.nearby_cities.length) {
        city.nearby_cities = validNearby;
        // Save back changes (handled during rebuild / subsequent sweeps)
      }
    }
  }

  // 5. Build/Append to CHANGELOG.md
  await appendToChangelog();

  console.log(`Validation & fix complete. Errors: ${errorCount}, Fixes implemented: ${fixedCount}.`);
}

/**
 * Appends changes report to CHANGELOG.md
 */
async function appendToChangelog() {
  const dateStr = new Date().toISOString().split('T')[0];
  const header = `\n## [${dateStr}] - Data Integrity Audit & Auto-Fixes

### Summary
- **Errors Encountered:** ${errorCount}
- **Corrections Applied:** ${fixedCount}

### Log of Modifications
${changesLog.length > 0 ? changesLog.join('\n') : '- No structural errors detected or corrected.'}
`;

  try {
    const existingContent = await fs.readFile(CHANGELOG_PATH, 'utf8').catch(() => '');
    const newContent = `# Changelog\n${header}\n${existingContent.replace('# Changelog\n', '')}`;
    await fs.writeFile(CHANGELOG_PATH, newContent, 'utf8');
    console.log('CHANGELOG.md updated successfully.');
  } catch (err) {
    console.error('Failed to update CHANGELOG.md', err);
  }
}

run();
