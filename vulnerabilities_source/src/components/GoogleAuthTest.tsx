"use client"

import { useState } from "react"
import Script from "next/script"

// Hardcoded client ID
const GOOGLE_CLIENT_ID = "272176700958-gsj2t9dv6jt6c63rtg6nu5eu3c0dngdi.apps.googleusercontent.com"

export default function GoogleAuthTest() {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScriptLoad = () => {
    console.log("Google script loaded in test component")
    setScriptLoaded(true)

    // Initialize Google Sign-In with a simple callback
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp) => {
            console.log("Test response:", resp)
            setResponse(resp)
          },
        })
      } catch (err) {
        console.error("Error in test initialization:", err)
        setError("Failed to initialize test")
      }
    }
  }

  const handleTestClick = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt((notification) => {
        console.log("Test prompt notification:", notification)
      })
    } else {
      setError("Google API not available")
    }
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <Script src="https://accounts.google.com/gsi/client" onLoad={handleScriptLoad} strategy="afterInteractive" />

      <h3 className="text-lg font-medium mb-2">Google Auth Test</h3>

      <div className="mb-4">
        <p>
          Script loaded:{" "}
          <span className={scriptLoaded ? "text-green-600" : "text-red-600"}>{scriptLoaded ? "Yes" : "No"}</span>
        </p>

        <p>
          Google API available:{" "}
          <span className={window?.google ? "text-green-600" : "text-red-600"}>{window?.google ? "Yes" : "No"}</span>
        </p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}

      <button onClick={handleTestClick} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Test Google Auth
      </button>

      {response && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
          <p>Authentication successful!</p>
          <p className="text-xs mt-2">
            Credential received (first 20 chars): {response.credential.substring(0, 20)}...
          </p>
        </div>
      )}
    </div>
  )
}
