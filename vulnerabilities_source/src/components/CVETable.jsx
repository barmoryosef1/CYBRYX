"use client"

import { useState, useEffect } from "react"
import { supabase } from "../services/supabaseClient"
import { AlertTriangle, AlertCircle, AlertOctagon, ExternalLink, Search, Filter, Bug, Download } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function CVETable({ onSelectCVE }) {
  const searchParams = useSearchParams()
  const urlSeverity = searchParams.get("severity") || ""

  const [cves, setCVEs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState(urlSeverity)
  const [yearFilter, setYearFilter] = useState("")
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState(null)
  const [debugMode, setDebugMode] = useState(false)
  const [advancedSearch, setAdvancedSearch] = useState(false)
  const pageSize = 10

  // Update severity filter when URL parameter changes
  useEffect(() => {
    if (urlSeverity !== severityFilter) {
      setSeverityFilter(urlSeverity)
      setPage(0) // Reset to first page when filter changes
    }
  }, [urlSeverity])

  useEffect(() => {
    loadCVEs()
  }, [page, severityFilter, yearFilter])

  async function loadCVEs() {
    setLoading(true)
    setError(null)

    try {
      if (debugMode) console.log("Building query...")

      // Build the query
      let query = supabase.from("cves").select("*", { count: "exact" })

      // Apply filters
      if (severityFilter) {
        query = query.eq("base_severity", severityFilter)
        if (debugMode) console.log(`Applied severity filter: ${severityFilter}`)
      }

      if (yearFilter) {
        query = query.ilike("cve_id", `CVE-${yearFilter}-%`)
        if (debugMode) console.log(`Applied year filter: ${yearFilter}`)
      }

      // Apply pagination
      query = query.order("published", { ascending: false }).range(page * pageSize, (page + 1) * pageSize - 1)
      if (debugMode) console.log(`Applied pagination: page ${page}, size ${pageSize}`)

      if (debugMode) console.log("Executing query...")
      const { data, error: queryError, count } = await query

      if (queryError) {
        console.error("Error loading CVEs:", queryError)
        setError(`Database query error: ${queryError.message}`)
        return
      }

      if (debugMode) console.log(`Query returned ${data?.length || 0} CVEs out of ${count || 0} total`)

      setCVEs(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error("Unexpected error loading CVEs:", err)
      setError(`Unexpected error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function searchCVEs() {
    setLoading(true)
    setError(null)

    try {
      if (debugMode) console.log(`Searching for: ${searchTerm}`)

      let query = supabase.from("cves").select("*", { count: "exact" })

      // Enhanced search functionality
      if (searchTerm) {
        // Check if search term is a CVE ID format
        if (/^CVE-\d{4}-\d+$/i.test(searchTerm)) {
          // Exact match for CVE ID
          query = query.ilike("cve_id", searchTerm)
        } else {
          // Full text search in description
          query = query.or(`description.ilike.%${searchTerm}%,cve_id.ilike.%${searchTerm}%`)
        }
      }

      // Apply other filters
      if (severityFilter) {
        query = query.eq("base_severity", severityFilter)
      }

      if (yearFilter) {
        query = query.ilike("cve_id", `CVE-${yearFilter}-%`)
      }

      query = query.order("published", { ascending: false }).range(0, pageSize - 1)

      const { data, error: searchError, count } = await query

      if (searchError) {
        console.error("Error searching CVEs:", searchError)
        setError(`Search error: ${searchError.message}`)
        return
      }

      if (debugMode) console.log(`Search returned ${data?.length || 0} CVEs out of ${count || 0} total`)

      setCVEs(data || [])
      setTotalCount(count || 0)
      setPage(0)
    } catch (err) {
      console.error("Unexpected error searching CVEs:", err)
      setError(`Unexpected error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  function getSeverityIcon(severity) {
    switch (severity?.toLowerCase()) {
      case "critical":
        return <AlertOctagon className="text-red-600" />
      case "high":
        return <AlertTriangle className="text-orange-500" />
      case "medium":
        return <AlertCircle className="text-yellow-500" />
      case "low":
        return <AlertCircle className="text-blue-500" />
      default:
        return <AlertCircle className="text-gray-500" />
    }
  }

  function getSeverityClass(severity) {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      searchCVEs()
    }
  }

  function exportToCSV() {
    // Create CSV content
    const headers = ["CVE ID", "Description", "Severity", "Score", "Published"]
    const csvRows = [headers]

    cves.forEach((cve) => {
      csvRows.push([
        cve.cve_id,
        cve.description?.replace(/"/g, '""') || "", // Escape quotes in description
        cve.base_severity || "",
        cve.base_score || "",
        cve.published ? new Date(cve.published).toISOString().split("T")[0] : "",
      ])
    })

    // Convert to CSV string
    const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `cve-export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  // Generate year options (up to 2025)
  const currentYear = new Date().getFullYear()
  const yearOptions = []
  for (let year = 2025; year >= currentYear - 10; year--) {
    yearOptions.push(year)
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search CVEs by ID or description..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={searchCVEs}
            >
              Search
            </button>

            <button
              className="px-2 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              onClick={() => setAdvancedSearch(!advancedSearch)}
              title={advancedSearch ? "Hide filters" : "Show filters"}
            >
              <Filter className="h-5 w-5" />
            </button>

            <button
              className="px-2 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
              onClick={exportToCSV}
              title="Export to CSV"
            >
              <Download className="h-5 w-5" />
            </button>

            <button
              className="px-2 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              onClick={() => setDebugMode(!debugMode)}
              title="Toggle debug mode"
            >
              <Bug className="h-5 w-5" />
            </button>
          </div>
        </div>

        {advancedSearch && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="severity-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <div className="relative">
                <select
                  id="severity-filter"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <div className="relative">
                <select
                  id="year-filter"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <option value="">All Years</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {debugMode && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Debug Info: </strong>
          <div className="text-sm mt-1">
            <p>Total CVEs: {totalCount}</p>
            <p>Current Page: {page}</p>
            <p>Page Size: {pageSize}</p>
            <p>Severity Filter: {severityFilter || "None"}</p>
            <p>Year Filter: {yearFilter || "None"}</p>
            <p>Search Term: {searchTerm || "None"}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    CVE ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Severity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Published
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cves.length > 0 ? (
                  cves.map((cve) => (
                    <tr
                      key={cve.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectCVE && onSelectCVE(cve.cve_id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <a
                          href={`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                          onClick={(e) => e.stopPropagation()} // Prevent row click when clicking the link
                        >
                          {cve.cve_id}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {cve.description?.length > 150
                          ? `${cve.description.substring(0, 150)}...`
                          : cve.description || "No description available"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityClass(cve.base_severity)}`}
                        >
                          {getSeverityIcon(cve.base_severity)}
                          <span className="ml-1">{cve.base_severity || "Unknown"}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(cve.published)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cve.base_score || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No CVEs found. Try adjusting your search or filters, or populate the database using the Backfill
                      button.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{cves.length > 0 ? page * pageSize + 1 : 0}</span> to{" "}
              <span className="font-medium">{Math.min((page + 1) * pageSize, totalCount)}</span> of{" "}
              <span className="font-medium">{totalCount}</span> results
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
