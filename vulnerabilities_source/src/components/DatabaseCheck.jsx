"use client"

import { useState, useEffect } from "react"
import { supabase } from "../services/supabaseClient"
import { AlertCircle, Database, RefreshCw } from "lucide-react"

export default function DatabaseCheck() {
  const [status, setStatus] = useState("Checking database...")
  const [count, setCount] = useState(null)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(null)
  const [envVarsStatus, setEnvVarsStatus] = useState({
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
  const [isChecking, setIsChecking] = useState(true)

  async function checkDatabase() {
    setIsChecking(true)
    setStatus("Checking database...")
    setError(null)

    try {
      console.log("Checking Supabase connection...")

      // First check if environment variables are defined
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setIsConnected(false)
        setError("Missing Supabase environment variables. Check your .env file or environment settings.")
        setStatus("Configuration error")
        return
      }

      // Simple ping test first
      try {
        const { data, error: pingError } = await supabase.from("cves").select("id").limit(1)

        if (pingError) {
          console.error("Ping test failed:", pingError)
          setIsConnected(false)
          setError(`Connection error: ${pingError.message || "Unknown error"}`)
          setStatus("Connection failed")
          return
        }

        setIsConnected(true)
      } catch (pingErr) {
        console.error("Unexpected error during ping test:", pingErr)
        setIsConnected(false)
        setError(`Unexpected error: ${pingErr.message || "Unknown error"}`)
        setStatus("Connection failed")
        return
      }

      // Now check if there are any CVEs
      try {
        const { count: cveCount, error: countError } = await supabase
          .from("cves")
          .select("*", { count: "exact", head: true })

        if (countError) {
          console.error("Error counting CVEs:", countError)
          setError(`Count error: ${countError.message || "Unknown error"}`)
          setStatus("Count failed")
          return
        }

        setCount(cveCount || 0)

        if (cveCount === 0) {
          setStatus("No CVEs found in the database.")
        } else {
          setStatus(`Found ${cveCount} CVEs in the database.`)
        }
      } catch (countErr) {
        console.error("Unexpected error counting CVEs:", countErr)
        setError(`Count error: ${countErr.message || "Unknown error"}`)
        setStatus("Count failed")
      }
    } catch (err) {
      console.error("Top-level error in checkDatabase:", err)
      setIsConnected(false)
      setError(`Unexpected error: ${err.message || "Unknown error"}`)
      setStatus("Check failed")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Database Status</h3>
        <button
          onClick={checkDatabase}
          disabled={isChecking}
          className="p-1 rounded-full hover:bg-gray-100"
          title="Refresh database status"
        >
          <RefreshCw className={`h-5 w-5 ${isChecking ? "animate-spin text-blue-500" : "text-gray-500"}`} />
        </button>
      </div>

      <div className="space-y-3">
        {/* Environment Variables Status */}
        <div className="p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium text-sm mb-2">Environment Variables</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full mr-2 ${envVarsStatus.url ? "bg-green-500" : "bg-red-500"}`}></span>
              <span>SUPABASE_URL:</span>
            </div>
            <div className={envVarsStatus.url ? "text-green-600" : "text-red-600"}>
              {envVarsStatus.url ? "Defined" : "Missing"}
            </div>

            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full mr-2 ${envVarsStatus.key ? "bg-green-500" : "bg-red-500"}`}></span>
              <span>SUPABASE_ANON_KEY:</span>
            </div>
            <div className={envVarsStatus.key ? "text-green-600" : "text-red-600"}>
              {envVarsStatus.key ? "Defined" : "Missing"}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center">
          <span className="font-medium mr-2">Connection:</span>
          {isChecking ? (
            <span className="text-gray-500">Checking...</span>
          ) : isConnected ? (
            <span className="text-green-600 flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              Connected
            </span>
          ) : (
            <span className="text-red-600 flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
              Failed
            </span>
          )}
        </div>

        {/* CVE Count */}
        <div className="flex items-center">
          <span className="font-medium mr-2">CVE Count:</span>
          {isChecking ? (
            <span className="text-gray-500">Checking...</span>
          ) : count === null ? (
            <span className="text-gray-500">Unknown</span>
          ) : (
            <span className={count > 0 ? "text-green-600" : "text-yellow-600"}>{count}</span>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">Error Details:</p>
                <p className="whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Troubleshooting Tips */}
        {!isConnected && !isChecking && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <h4 className="font-medium text-sm mb-2 text-blue-700">Troubleshooting Tips:</h4>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Check that your Supabase URL and anon key are correctly set in your environment variables</li>
              <li>Verify that your Supabase project is active and not in maintenance mode</li>
              <li>Ensure your IP address is not blocked by Supabase</li>
              <li>Check your browser console for additional error details</li>
            </ul>
          </div>
        )}

        {/* No CVEs Found */}
        {count === 0 && !error && (
          <div className="mt-4">
            <div className="flex items-center text-yellow-700 mb-2">
              <Database className="mr-2 h-5 w-5" />
              <p className="font-medium">No CVEs found in your database</p>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              You need to populate your database using the Backfill function.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
