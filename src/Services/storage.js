/**
 * Storage Service
 * Provides safe wrapper around localStorage with error handling
 * Prevents crashes and makes it easier to migrate to other storage solutions
 */

class StorageService {
  /**
   * Get item from localStorage
   * @param {string} key - The key to retrieve
   * @returns {string|null} The value or null if not found/error
   */
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage
   * @param {string} key - The key to store
   * @param {string} value - The value to store
   * @returns {boolean} Success status
   */
  set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} Success status
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all items from localStorage
   * @returns {boolean} Success status
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Get and parse JSON from localStorage
   * @param {string} key - The key to retrieve
   * @returns {any|null} Parsed JSON or null
   */
  getJSON(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Storage getJSON error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Stringify and store JSON in localStorage
   * @param {string} key - The key to store
   * @param {any} value - The value to stringify and store
   * @returns {boolean} Success status
   */
  setJSON(key, value) {
    try {
      const jsonString = JSON.stringify(value);
      localStorage.setItem(key, jsonString);
      return true;
    } catch (error) {
      console.error(`Storage setJSON error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Check if key exists in localStorage
   * @param {string} key - The key to check
   * @returns {boolean} True if exists
   */
  has(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Storage has error for key "${key}":`, error);
      return false;
    }
  }
}

const storage = new StorageService();

export default storage;
