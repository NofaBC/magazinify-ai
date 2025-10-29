/**
 * Data Formatting Utilities
 * Provides functions for formatting data for display.
 */

/**
 * Formats a number as a currency string.
 * @param {number} amount
 * @param {string} currency
 * @param {string} locale
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Formats a date string or Date object into a readable format.
 * @param {string | Date} dateInput
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export const formatDate = (dateInput, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
  const date = new Date(dateInput);
  if (isNaN(date)) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

/**
 * Formats a number with commas as a thousands separator.
 * @param {number} number
 * @returns {string}
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

/**
 * Truncates a string to a specified length and appends an ellipsis.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

/**
 * Converts a string to Title Case.
 * @param {string} str
 * @returns {string}
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
};
