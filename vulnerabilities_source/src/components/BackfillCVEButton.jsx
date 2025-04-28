"use client"

import { useState } from "react"
import { backfillRecentCVEs } from "../utils/fetchAndStoreCVEs"
import { AlertTriangle, Database } from "lucide-react"

export default function BackfillCVEButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [years, setYears] = useState(1)
  const [limitPerRange, setLimitPerRange] = useState(20)

  async function handleBackfill() {
    setLoading(true)
    setResult(null)

    try {
      const count = await backfillRecentCVEs(years, limitPerRange)
      setResult({
        success: true,
        message: `Successfully backfilled ${count} CVEs from the last ${years} year(s).`,
      })
    } catch (error) {
      console.error("Error backfilling CVEs:", error)
      setResult({
        success: false,
        message: `Failed to backfill CVEs: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center mb-4">
        <AlertTriangle className="text-yellow-500 mr-2" />
        <h3 className="text-lg font-medium">No CVEs Visible?</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        If you don't see any CVEs in your dashboard, you need to populate your database first. Use this tool to fetch
        CVEs from the GitHub repository.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="years" className="block text-sm font-medium text-gray-700 mb-1">
            Years to backfill
          </label>
          <input
            type="number"
            id="years"
            min="1"
            max="5"
            value={years}
            onChange={(e) => setYears(Number.parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Number of recent years to backfill (1-5)</p>
        </div>

        <div>
          <label htmlFor="limitPerRange" className="block text-sm font-medium text-gray-700 mb-1">
            CVEs per ID range
          </label>
          <input
            type="number"
            id="limitPerRange"
            min="10"
            max="100"
            step="10"
            value={limitPerRange}
            onChange={(e) => setLimitPerRange(Number.parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Maximum CVEs to fetch per ID range (10-100)</p>
        </div>

        <button
          onClick={handleBackfill}
          disabled={loading}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Database className="animate-pulse -ml-1 mr-2 h-4 w-4" />
              Backfilling...
            </>
          ) : (
            <>
              <Database className="-ml-1 mr-2 h-4 w-4" />
              Populate Database
            </>
          )}
        </button>

        {result && (
          <div className={`mt-2 text-sm ${result.success ? "text-green-600" : "text-red-600"}`}>{result.message}</div>
        )}
      </div>
    </div>
  )
}
