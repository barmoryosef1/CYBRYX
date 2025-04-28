import {
  fetchLatestCVEs,
  fetchCVEsByYearAndRange,
  getAvailableYears,
  getAvailableIdRanges,
} from "../services/cveService"
import { supabase } from "../services/supabaseClient"

/**
 * Processes a CVE object from GitHub and extracts relevant fields
 * @param {Object} cve - CVE object from GitHub
 * @returns {Object} - Processed CVE object for database storage
 */
function processCVE(cve) {
  try {
    // Extract the CVE ID
    const cveId = cve.cveMetadata?.cveId || ""

    // Extract description (English preferred)
    let description = ""
    if (cve.containers?.cna?.descriptions) {
      const englishDesc = cve.containers.cna.descriptions.find((desc) => desc.lang === "en" || desc.lang === "eng")
      description = englishDesc?.value || cve.containers.cna.descriptions[0]?.value || ""
    }

    // Extract published and modified dates
    const published = cve.cveMetadata?.datePublished || null
    const lastModified = cve.cveMetadata?.dateUpdated || null

    // Extract CVSS data
    let baseScore = null
    let baseSeverity = null
    let vectorString = null

    if (cve.containers?.cna?.metrics) {
      const cvssV3 = cve.containers.cna.metrics.find((metric) => metric.cvssV3_1 || metric.cvssV3_0)

      if (cvssV3) {
        const cvssData = cvssV3.cvssV3_1 || cvssV3.cvssV3_0
        baseScore = cvssData?.baseScore || null
        baseSeverity = cvssData?.baseSeverity || null
        vectorString = cvssData?.vectorString || null
      }
    }

    // Extract CWE IDs
    const cweIds = []
    if (cve.containers?.cna?.problemTypes) {
      cve.containers.cna.problemTypes.forEach((problemType) => {
        if (problemType.descriptions) {
          problemType.descriptions.forEach((desc) => {
            if (desc.cweId) {
              cweIds.push(desc.cweId)
            }
          })
        }
      })
    }

    // Extract references
    const referenceUrls = []
    if (cve.containers?.cna?.references) {
      cve.containers.cna.references.forEach((ref) => {
        if (ref.url) {
          referenceUrls.push(ref.url)
        }
      })
    }

    return {
      id: cveId, // Use CVE ID as the primary key
      cve_id: cveId,
      description,
      published,
      last_modified: lastModified,
      base_score: baseScore,
      base_severity: baseSeverity,
      vector_string: vectorString,
      cwe_ids: cweIds,
      reference_urls: referenceUrls,
    }
  } catch (error) {
    console.error("Error processing CVE:", error)
    return null
  }
}

/**
 * Fetches the latest CVEs from GitHub and stores them in Supabase
 * @param {number} limit - Maximum number of CVEs to fetch
 * @returns {Promise<number>} - Number of CVEs stored
 */
export async function fetchAndStoreCVEs(limit = 50) {
  try {
    console.log(`Fetching up to ${limit} latest CVEs from GitHub...`)
    const cves = await fetchLatestCVEs(limit)
    console.log(`Fetched ${cves.length} CVEs from GitHub`)

    let storedCount = 0

    for (const cve of cves) {
      const processedCVE = processCVE(cve)

      if (processedCVE) {
        const { error } = await supabase.from("cves").upsert(processedCVE, { onConflict: "id" })

        if (error) {
          console.error("Error storing CVE:", error)
        } else {
          storedCount++
        }
      }
    }

    console.log(`Successfully stored ${storedCount} CVEs in Supabase`)
    return storedCount
  } catch (error) {
    console.error("Error in fetchAndStoreCVEs:", error)
    throw error
  }
}

/**
 * Fetches CVEs for a specific year and ID range and stores them in Supabase
 * @param {string} year - Year (e.g., '2023')
 * @param {string} idRange - ID range (e.g., '12xxx')
 * @param {number} limit - Maximum number of CVEs to fetch
 * @returns {Promise<number>} - Number of CVEs stored
 */
export async function fetchAndStoreCVEsByYearAndRange(year, idRange, limit = 50) {
  try {
    console.log(`Fetching up to ${limit} CVEs for year ${year} and ID range ${idRange}...`)
    const cves = await fetchCVEsByYearAndRange(year, idRange, limit)
    console.log(`Fetched ${cves.length} CVEs from GitHub`)

    let storedCount = 0

    for (const cve of cves) {
      const processedCVE = processCVE(cve)

      if (processedCVE) {
        const { error } = await supabase.from("cves").upsert(processedCVE, { onConflict: "id" })

        if (error) {
          console.error("Error storing CVE:", error)
        } else {
          storedCount++
        }
      }
    }

    console.log(`Successfully stored ${storedCount} CVEs in Supabase`)
    return storedCount
  } catch (error) {
    console.error("Error in fetchAndStoreCVEsByYearAndRange:", error)
    throw error
  }
}

/**
 * Backfills CVEs for recent years
 * @param {number} yearsToBackfill - Number of recent years to backfill
 * @param {number} limitPerRange - Maximum number of CVEs to fetch per ID range
 * @returns {Promise<number>} - Total number of CVEs stored
 */
export async function backfillRecentCVEs(yearsToBackfill = 1, limitPerRange = 20) {
  try {
    console.log(`Starting backfill for the most recent ${yearsToBackfill} years...`)

    // Get available years
    const years = await getAvailableYears()
    const recentYears = years.slice(0, yearsToBackfill)

    let totalStored = 0

    // For each year
    for (const year of recentYears) {
      // Get available ID ranges for this year
      const idRanges = await getAvailableIdRanges(year)

      // For each ID range
      for (const idRange of idRanges) {
        // Fetch and store CVEs
        const storedCount = await fetchAndStoreCVEsByYearAndRange(year, idRange, limitPerRange)
        totalStored += storedCount

        console.log(`Stored ${storedCount} CVEs for year ${year} and ID range ${idRange}`)
      }
    }

    console.log(`Backfill complete. Total CVEs stored: ${totalStored}`)
    return totalStored
  } catch (error) {
    console.error("Error in backfillRecentCVEs:", error)
    throw error
  }
}

/**
 * Fetches and stores a specific CVE by ID
 * @param {string} cveId - CVE ID (e.g., CVE-2023-12345)
 * @returns {Promise<boolean>} - Whether the CVE was successfully stored
 */
export async function fetchAndStoreCVEById(cveId) {
  try {
    console.log(`Fetching CVE ${cveId}...`)

    const { fetchCVEById } = await import("../services/cveService")
    const cve = await fetchCVEById(cveId)

    if (!cve) {
      throw new Error(`Failed to fetch CVE ${cveId}`)
    }

    const processedCVE = processCVE(cve)

    if (!processedCVE) {
      throw new Error(`Failed to process CVE ${cveId}`)
    }

    const { error } = await supabase.from("cves").upsert(processedCVE, { onConflict: "id" })

    if (error) {
      throw error
    }

    console.log(`Successfully stored CVE ${cveId}`)
    return true
  } catch (error) {
    console.error(`Error fetching and storing CVE ${cveId}:`, error)
    return false
  }
}
