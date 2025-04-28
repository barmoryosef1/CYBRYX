/**
 * This file contains the scheduler logic for periodically updating CVEs.
 * In a production environment, this would be a separate service or cron job.
 * For this example, we'll use a simple setInterval approach.
 */

import { fetchAndStoreCVEs } from "./fetchAndStoreCVEs"

// Update interval in milliseconds (e.g., every 6 hours)
const UPDATE_INTERVAL = 6 * 60 * 60 * 1000

// Flag to prevent multiple updates running simultaneously
let isUpdating = false

/**
 * Starts the CVE update scheduler
 */
export function startCVEUpdateScheduler() {
  console.log("Starting CVE update scheduler...")

  // Initial update
  updateCVEs()

  // Schedule regular updates
  setInterval(updateCVEs, UPDATE_INTERVAL)
}

/**
 * Updates CVEs if not already updating
 */
async function updateCVEs() {
  if (isUpdating) {
    console.log("Update already in progress, skipping...")
    return
  }

  isUpdating = true
  console.log("Scheduled update: Fetching latest CVEs...")

  try {
    const count = await fetchAndStoreCVEs(100)
    console.log(`Scheduled update: Successfully fetched and stored ${count} CVEs.`)
  } catch (error) {
    console.error("Scheduled update: Error updating CVEs:", error)
  } finally {
    isUpdating = false
  }
}
