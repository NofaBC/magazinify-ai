/**
 * Form Validation Utilities
 * Provides functions for common client-side form validation.
 */

/**
 * Checks if a value is not empty.
 * @param {string} value
 * @returns {boolean}
 */
export const isRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  return value !== null && value !== undefined;
};

/**
 * Checks if a value is a valid email format.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!isRequired(email)) return false;
  // Simple regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Checks if a password meets minimum complexity requirements.
 * @param {string} password
 * @param {number} minLength
 * @returns {boolean}
 */
export const isStrongPassword = (password, minLength = 8) => {
  if (!isRequired(password) || password.length < minLength) return false;
  // Requires at least one uppercase, one lowercase, and one number
  const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])');
  return strongRegex.test(password);
};

/**
 * Checks if a string is a valid URL format.
 * @param {string} url
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
  if (!isRequired(url)) return false;
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Validates a form object against a set of rules.
 * @param {object} formData - The form data object.
 * @param {object} rules - An object where keys are field names and values are validation functions or arrays of functions.
 * @returns {object} An object containing error messages, or an empty object if valid.
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  for (const field in rules) {
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    for (const rule of fieldRules) {
      const result = rule(formData[field], formData);
      if (typeof result === 'string') {
        errors[field] = result;
        break; // Stop checking further rules for this field
      }
    }
  }
  return errors;
};
