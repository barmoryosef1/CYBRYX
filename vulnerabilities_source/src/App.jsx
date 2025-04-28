"use client"

import { useEffect } from "react"
import Dashboard from "./pages/Dashboard"
import { supabase } from "./services/supabaseClient"

function App() {
  useEffect(() => {
    // Check if we have CVEs in the database, if not, fetch some
    async function checkAndFetchInitialCVEs() {
      try {
        const { count } = await supabase.from("cves").select("*", { count: "exact", head: true })

        // If we have less than 10 CVEs, fetch some
        if (count < 10) {
          console.log("Fetching initial CVEs...")
          const { fetchAndStoreCVEs } = await import("./utils/fetchAndStoreCVEs")
          await fetchAndStoreCVEs(50)
        }
      } catch (error) {
        console.error("Error checking or fetching initial CVEs:", error)
      }
    }

    checkAndFetchInitialCVEs()
  }, [])

  return (
    <div className="bg-gray-50 min-h-screen">
      <Dashboard />
    </div>
  )
}

export default App
