/**
 * General Helper Utilities
 * Provides miscellaneous functions for common tasks.
 */

/**
 * Delays execution for a specified number of milliseconds.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>}
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Safely parses a JSON string, returning null on error.
 * @param {string} str - The JSON string to parse.
 * @returns {object | null}
 */
export const safeJsonParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('Error parsing JSON string:', e);
    return null;
  }
};

/**
 * Generates a simple unique ID string.
 * @returns {string}
 */
export const generateUniqueId = () => {
  return 'id-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

/**
 * Debounces a function call, ensuring it's only executed once after a period of inactivity.
 * @param {function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {function} The debounced function.
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};
