"use client"

import { useState, useEffect } from "react"
import { supabase } from "../services/supabaseClient"
import { AlertTriangle, AlertCircle, AlertOctagon, ExternalLink, ArrowLeft } from "lucide-react"

export default function CVEDetail({ cveId, onBack }) {
  const [cve, setCVE] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCVE() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("cves").select("*").eq("cve_id", cveId).single()

        if (error) throw error

        setCVE(data)
      } catch (err) {
        console.error("Error fetching CVE details:", err)
        setError("Failed to load CVE details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (cveId) {
      fetchCVE()
    }
  }, [cveId])

  function getSeverityIcon(severity) {
    switch (severity?.toLowerCase()) {
      case "critical":
        return <AlertOctagon className="text-red-600 h-6 w-6" />
      case "high":
        return <AlertTriangle className="text-orange-500 h-6 w-6" />
      case "medium":
        return <AlertCircle className="text-yellow-500 h-6 w-6" />
      case "low":
        return <AlertCircle className="text-blue-500 h-6 w-6" />
      default:
        return <AlertCircle className="text-gray-500 h-6 w-6" />
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  if (!cve) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Not Found!</strong>
        <span className="block sm:inline"> The requested CVE could not be found.</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <button onClick={onBack} className="mb-4 flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to list
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{cve.cve_id}</h1>

          <div className="mt-2 md:mt-0 flex items-center">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityClass(cve.base_severity)}`}
            >
              {getSeverityIcon(cve.base_severity)}
              <span className="ml-1">{cve.base_severity || "Unknown"}</span>
            </span>

            {cve.base_score && (
              <span className="ml-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                Score: {cve.base_score}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Description</h2>
            <p className="text-gray-600">{cve.description || "No description available"}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Timeline</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Published:</span>
                <span className="text-gray-900">{formatDate(cve.published)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Modified:</span>
                <span className="text-gray-900">{formatDate(cve.last_modified)}</span>
              </div>
            </div>
          </div>
        </div>

        {cve.vector_string && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">CVSS Vector</h2>
            <code className="block bg-gray-100 p-3 rounded text-sm overflow-x-auto">{cve.vector_string}</code>
          </div>
        )}

        {cve.cwe_ids && cve.cwe_ids.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">CWE IDs</h2>
            <div className="flex flex-wrap gap-2">
              {cve.cwe_ids.map((cweId, index) => (
                <a
                  key={index}
                  href={`https://cwe.mitre.org/data/definitions/${cweId.replace("CWE-", "")}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 hover:bg-purple-200"
                >
                  {cweId}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        )}

        {cve.reference_urls && cve.reference_urls.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">References</h2>
            <ul className="space-y-2 list-disc list-inside">
              {cve.reference_urls.map((url, index) => (
                <li key={index}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-start"
                  >
                    <span className="inline-block">{url.length > 70 ? url.substring(0, 70) + "..." : url}</span>
                    <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0 mt-1" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
