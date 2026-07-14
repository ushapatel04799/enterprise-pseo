/**
 * Common helper utilities for the Enterprise PSEO Engine.
 */

/**
 * Converts a string into a URL-friendly kebab-case slug.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars (except -)
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Validates whether a slug conforms to strict lowercase kebab-case.
 * @param {string} slug
 * @returns {boolean}
 */
export function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Recursively cleans an object, removing keys with null or undefined values.
 * Useful for normalizing data structures non-destructively.
 * @param {Record<string, any>} obj
 * @returns {Record<string, any>}
 */
export function cleanObject(obj) {
  if (obj === null || obj === undefined) return {};
  if (Array.isArray(obj)) {
    return obj.map(item => (typeof item === 'object' ? cleanObject(item) : item));
  }
  return Object.keys(obj).reduce((acc, key) => {
    const val = obj[key];
    if (val !== null && val !== undefined) {
      acc[key] = typeof val === 'object' ? cleanObject(val) : val;
    }
    return acc;
  }, {});
}

/**
 * Safely parses population strings with commas or text into an integer.
 * @param {any} input
 * @returns {number}
 */
export function parsePopulation(input) {
  if (typeof input === 'number') return Math.floor(input);
  if (typeof input !== 'string') return 0;
  const cleaned = input.replace(/[^\d]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a number with comma separators.
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString('en-US');
}
