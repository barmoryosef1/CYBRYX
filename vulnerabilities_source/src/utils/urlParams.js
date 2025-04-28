/**
 * Utility functions for handling URL parameters
 */

/**
 * Updates a URL parameter without refreshing the page
 * @param {string} key - The parameter key
 * @param {string} value - The parameter value
 */
export function updateUrlParam(key, value) {
  const url = new URL(window.location.href)

  if (value) {
    url.searchParams.set(key, value)
  } else {
    url.searchParams.delete(key)
  }

  window.history.pushState({}, "", url)
}

/**
 * Gets a URL parameter value
 * @param {string} key - The parameter key
 * @returns {string|null} - The parameter value or null if not found
 */
export function getUrlParam(key) {
  const url = new URL(window.location.href)
  return url.searchParams.get(key)
}
