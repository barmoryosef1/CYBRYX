"use client"

import { useState } from "react"

export default function DebugInfo() {
  const [showDebug, setShowDebug] = useState(false)

  // Use the hardcoded client ID as a fallback
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "272176700958-gsj2t9dv6jt6c63rtg6nu5eu3c0dngdi.apps.googleusercontent.com"

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={() => setShowDebug(!showDebug)} className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">
        {showDebug ? "Hide Debug" : "Show Debug"}
      </button>

      {showDebug && (
        <div className="mt-2 p-4 bg-gray-800 text-white rounded-md text-sm max-w-md overflow-auto max-h-96">
          <h3 className="font-bold mb-2">Environment Variables:</h3>
          <div className="mb-4">
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_GOOGLE_CLIENT_ID:</span>
              <span className="ml-2 font-mono">
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
                  ? `${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.substring(0, 10)}...`
                  : "undefined (using fallback)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Using Client ID:</span>
              <span className="text-green-400">Yes (hardcoded fallback available)</span>
            </div>
            <div className="flex justify-between">
              <span>Client ID Value:</span>
              <span className="ml-2 font-mono">{clientId.substring(0, 10)}...</span>
            </div>
          </div>

          <h3 className="font-bold mb-2">Browser Info:</h3>
          <div className="mb-4">
            <div className="flex justify-between">
              <span>User Agent:</span>
              <span className="ml-2 font-mono truncate">{navigator.userAgent.substring(0, 30)}...</span>
            </div>
            <div className="flex justify-between">
              <span>Google API:</span>
              <span className={typeof window !== "undefined" && window.google ? "text-green-400" : "text-red-400"}>
                {typeof window !== "undefined" && window.google ? "Loaded" : "Not Loaded"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Google Accounts:</span>
              <span
                className={
                  typeof window !== "undefined" && window.google && window.google.accounts
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {typeof window !== "undefined" && window.google && window.google.accounts
                  ? "Available"
                  : "Not Available"}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              console.log("Using Client ID:", clientId)
              console.log("Window object:", window)
              console.log("Google object:", window.google)
              alert("Check browser console for detailed debug info")
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm w-full"
          >
            Log Debug Info to Console
          </button>
        </div>
      )}
    </div>
  )
}
