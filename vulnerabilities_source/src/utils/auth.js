// Simple authentication utility for admin access
// In a production environment, you should use a more secure authentication method

// Admin credentials - in a real app, these would be stored securely
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "secure_password" // Change this to a strong password

/**
 * Check if the user is authenticated as admin
 * @returns {boolean} Whether the user is authenticated
 */
export function isAuthenticated() {
  if (typeof window === "undefined") return false

  const token = localStorage.getItem("admin_token")
  return token === generateToken(ADMIN_USERNAME, ADMIN_PASSWORD)
}

/**
 * Authenticate with username and password
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {boolean} Whether authentication was successful
 */
export function authenticate(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = generateToken(username, password)
    localStorage.setItem("admin_token", token)
    return true
  }
  return false
}

/**
 * Log out the admin user
 */
export function logout() {
  localStorage.removeItem("admin_token")
}

/**
 * Generate a simple token
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {string} Generated token
 */
function generateToken(username, password) {
  // This is a very simple token generation method
  // In a real app, use a proper JWT or other secure token method
  return btoa(`${username}:${password}:${new Date().toISOString().split("T")[0]}`)
}
