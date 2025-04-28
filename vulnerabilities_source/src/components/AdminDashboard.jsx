"use client"

import { useState } from "react"
import { logout } from "../utils/auth"
import DatabaseCheck from "./DatabaseCheck"
import BackfillCVEButton from "./BackfillCVEButton"
import UpdateCVEButton from "./UpdateCVEButton"
import AdminStatistics from "./AdminStatistics"
import { LogOut, RefreshCw, Database, Trash2, Home } from "lucide-react"
import { supabase } from "../services/supabaseClient"
import Link from "next/link"

export default function AdminDashboard({ onLogout }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleLogout = () => {
    logout()
    onLogout()
  }

  const handleClearDatabase = async () => {
    if (!confirm("Are you sure you want to clear all CVE data? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const { error } = await supabase.from("cves").delete().neq("id", "placeholder")

      if (error) {
        throw error
      }

      setResult({
        success: true,
        message: "Database cleared successfully.",
      })
    } catch (error) {
      console.error("Error clearing database:", error)
      setResult({
        success: false,
        message: `Failed to clear database: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home className="-ml-1 mr-2 h-4 w-4" />
            Return to Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="-ml-1 mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <RefreshCw className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This is a restricted area. You can manage the CVE database from here.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>
          <DatabaseCheck />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Database Management</h2>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-medium mb-2">Update CVEs</h3>
              <UpdateCVEButton />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-2">Backfill CVEs</h3>
              <BackfillCVEButton />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-2">Clear Database</h3>
              <button
                onClick={handleClearDatabase}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Database className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="-ml-1 mr-2 h-4 w-4" />
                    Clear All CVE Data
                  </>
                )}
              </button>

              {result && (
                <div className={`mt-2 text-sm ${result.success ? "text-green-600" : "text-red-600"}`}>
                  {result.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mb-8">
        <AdminStatistics />
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Environment</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(
                  {
                    NODE_ENV: process.env.NODE_ENV,
                    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "[DEFINED]" : "[MISSING]",
                    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                      ? "[DEFINED]"
                      : "[MISSING]",
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Browser</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">User Agent:</div>
                <div className="truncate">{typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}</div>
                <div className="font-medium">Platform:</div>
                <div>{typeof navigator !== "undefined" ? navigator.platform : "N/A"}</div>
                <div className="font-medium">Language:</div>
                <div>{typeof navigator !== "undefined" ? navigator.language : "N/A"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
