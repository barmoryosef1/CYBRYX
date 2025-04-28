"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import CVETable from "../components/CVETable"
import CVEDetail from "../components/CVEDetail"
import CVEStats from "../components/CVEStats"
import { AlertTriangle, LogIn, LogOut } from "lucide-react"
import Link from "next/link"
import { supabase } from "../services/supabaseClient"

export default function Dashboard() {
  const searchParams = useSearchParams()
  const [selectedCVE, setSelectedCVE] = useState(null)
  const [databaseError, setDatabaseError] = useState(null)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Check for environment variables and user authentication on component mount
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setDatabaseError("Missing Supabase environment variables. Please check your configuration.")
    }

    // Check if user is logged in
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          console.error("Error checking user:", error)
        }
        setUser(data?.user || null)
      } catch (err) {
        console.error("Unexpected error checking auth:", err)
      } finally {
        setAuthChecked(true)
      }
    }

    checkUser()

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event)
      setUser(session?.user || null)
    })

    return () => {
      if (authListener && authListener.subscription && authListener.subscription.unsubscribe) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Cybersecurity CVEs Dashboard</h1>
        <div className="flex space-x-4">
          {authChecked && !user ? (
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogIn className="-ml-1 mr-2 h-4 w-4" />
              Sign In
            </Link>
          ) : user ? (
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <LogOut className="-ml-1 mr-2 h-4 w-4" />
              Sign Out
            </button>
          ) : null}
        </div>
      </div>

      {/* Global Database Error */}
      {databaseError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Database Configuration Error</h3>
              <p className="text-sm text-red-700 mt-1">{databaseError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <CVEStats />
      </div>

      {selectedCVE ? (
        <CVEDetail cveId={selectedCVE} onBack={() => setSelectedCVE(null)} />
      ) : (
        <div>
          <CVETable onSelectCVE={setSelectedCVE} />
        </div>
      )}
    </div>
  )
}
