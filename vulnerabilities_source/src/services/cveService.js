/**
 * Service for fetching CVE data from the CVEProject GitHub repository
 */

// GitHub API endpoint for the CVEProject/cvelistV5 repository
const GITHUB_API_BASE = "https://api.github.com/repos/CVEProject/cvelistV5/contents"
const RAW_CONTENT_BASE = "https://raw.githubusercontent.com/CVEProject/cvelistV5/main"

/**
 * Parses a CVE ID to extract year and ID range
 * @param {string} cveId - CVE ID (e.g., CVE-2023-12345)
 * @returns {Array} - [year, idRange]
 */
function parseCVEId(cveId) {
  // Example: CVE-2023-12345 -> ['2023', '12xxx']
  const parts = cveId.split("-")
  if (parts.length !== 3) {
    throw new Error(`Invalid CVE ID format: ${cveId}`)
  }

  const year = parts[1]
  const number = parts[2]
  const idRange = number.substring(0, 2) + "xxx"
  return [year, idRange]
}

/**
 * Fetches a specific CVE by ID
 * @param {string} cveId - CVE ID (e.g., CVE-2023-12345)
 * @returns {Promise<Object>} - CVE data
 */
export async function fetchCVEById(cveId) {
  try {
    const [year, idRange] = parseCVEId(cveId)
    const url = `${RAW_CONTENT_BASE}/cves/${year}/${idRange}/${cveId}.json`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${cveId}: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching CVE data for ${cveId}:`, error)
    throw error
  }
}

/**
 * Fetches the latest CVEs from the GitHub repository
 * @param {number} limit - Maximum number of CVEs to fetch
 * @returns {Promise<Array>} - Array of CVE objects
 */
export async function fetchLatestCVEs(limit = 50) {
  try {
    // First, get the list of years
    const yearsResponse = await fetch(`${GITHUB_API_BASE}/cves`)
    if (!yearsResponse.ok) {
      throw new Error(`Failed to fetch years directory: ${yearsResponse.status} ${yearsResponse.statusText}`)
    }

    const years = await yearsResponse.json()

    // Sort years in descending order to get the most recent first
    const sortedYears = years
      .filter((item) => item.type === "dir" && /^\d{4}$/.test(item.name))
      .sort((a, b) => b.name - a.name)

    if (sortedYears.length === 0) {
      throw new Error("No year directories found")
    }

    // Get the most recent year
    const latestYear = sortedYears[0].name

    // Get the list of ID ranges for the latest year
    const idRangesResponse = await fetch(`${GITHUB_API_BASE}/cves/${latestYear}`)
    if (!idRangesResponse.ok) {
      throw new Error(
        `Failed to fetch ID ranges for year ${latestYear}: ${idRangesResponse.status} ${idRangesResponse.statusText}`,
      )
    }

    const idRanges = await idRangesResponse.json()

    // Sort ID ranges in descending order (most recent first)
    const sortedIdRanges = idRanges
      .filter((item) => item.type === "dir" && /^\d{2}xxx$/.test(item.name))
      .sort((a, b) => b.name.localeCompare(a.name))

    if (sortedIdRanges.length === 0) {
      throw new Error(`No ID ranges found for year ${latestYear}`)
    }

    // Get the most recent ID range
    const latestIdRange = sortedIdRanges[0].name

    // Get the list of CVE files for the latest ID range
    const cveFilesResponse = await fetch(`${GITHUB_API_BASE}/cves/${latestYear}/${latestIdRange}`)
    if (!cveFilesResponse.ok) {
      throw new Error(
        `Failed to fetch CVE files for ID range ${latestIdRange}: ${cveFilesResponse.status} ${cveFilesResponse.statusText}`,
      )
    }

    const cveFiles = await cveFilesResponse.json()

    // Filter for JSON files and sort in descending order
    const sortedCveFiles = cveFiles
      .filter((item) => item.type === "file" && item.name.endsWith(".json"))
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, limit)

    // Fetch each CVE's data
    const cvePromises = sortedCveFiles.map(async (file) => {
      try {
        const response = await fetch(file.download_url)

        if (!response.ok) {
          console.error(`Failed to fetch CVE data for ${file.name}: ${response.status} ${response.statusText}`)
          return null
        }

        return await response.json()
      } catch (error) {
        console.error(`Error fetching ${file.name}:`, error)
        return null
      }
    })

    const cveResults = await Promise.all(cvePromises)
    return cveResults.filter((cve) => cve !== null)
  } catch (error) {
    console.error("Error fetching latest CVEs from GitHub:", error)
    throw error
  }
}

/**
 * Fetches CVEs for a specific year and ID range
 * @param {string} year - Year (e.g., '2023')
 * @param {string} idRange - ID range (e.g., '12xxx')
 * @param {number} limit - Maximum number of CVEs to fetch
 * @returns {Promise<Array>} - Array of CVE objects
 */
export async function fetchCVEsByYearAndRange(year, idRange, limit = 50) {
  try {
    // Get the list of CVE files for the specified year and ID range
    const cveFilesResponse = await fetch(`${GITHUB_API_BASE}/cves/${year}/${idRange}`)
    if (!cveFilesResponse.ok) {
      throw new Error(
        `Failed to fetch CVE files for year ${year} and ID range ${idRange}: ${cveFilesResponse.status} ${cveFilesResponse.statusText}`,
      )
    }

    const cveFiles = await cveFilesResponse.json()

    // Filter for JSON files and sort in descending order
    const sortedCveFiles = cveFiles
      .filter((item) => item.type === "file" && item.name.endsWith(".json"))
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, limit)

    // Fetch each CVE's data
    const cvePromises = sortedCveFiles.map(async (file) => {
      try {
        const response = await fetch(file.download_url)

        if (!response.ok) {
          console.error(`Failed to fetch CVE data for ${file.name}: ${response.status} ${response.statusText}`)
          return null
        }

        return await response.json()
      } catch (error) {
        console.error(`Error fetching ${file.name}:`, error)
        return null
      }
    })

    const cveResults = await Promise.all(cvePromises)
    return cveResults.filter((cve) => cve !== null)
  } catch (error) {
    console.error(`Error fetching CVEs for year ${year} and ID range ${idRange}:`, error)
    throw error
  }
}

/**
 * Gets a list of available years in the CVE repository
 * @returns {Promise<Array>} - Array of year strings
 */
export async function getAvailableYears() {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/cves`)
    if (!response.ok) {
      throw new Error(`Failed to fetch years: ${response.status} ${response.statusText}`)
    }

    const years = await response.json()

    return years
      .filter((item) => item.type === "dir" && /^\d{4}$/.test(item.name))
      .map((item) => item.name)
      .sort((a, b) => b - a) // Sort in descending order
  } catch (error) {
    console.error("Error fetching available years:", error)
    throw error
  }
}

/**
 * Gets a list of available ID ranges for a specific year
 * @param {string} year - Year (e.g., '2023')
 * @returns {Promise<Array>} - Array of ID range strings
 */
export async function getAvailableIdRanges(year) {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/cves/${year}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ID ranges for year ${year}: ${response.status} ${response.statusText}`)
    }

    const idRanges = await response.json()

    return idRanges
      .filter((item) => item.type === "dir" && /^\d{2}xxx$/.test(item.name))
      .map((item) => item.name)
      .sort((a, b) => b.localeCompare(a)) // Sort in descending order
  } catch (error) {
    console.error(`Error fetching available ID ranges for year ${year}:`, error)
    throw error
  }
}
