"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import Script from "next/script"

// Hardcoded client ID
const GOOGLE_CLIENT_ID = "272176700958-gsj2t9dv6jt6c63rtg6nu5eu3c0dngdi.apps.googleusercontent.com"

export default function GoogleAuth() {
  const buttonRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  // Generate a simple nonce
  const generateNonce = () => {
    const randomBytes = new Uint8Array(16)
    window.crypto.getRandomValues(randomBytes)
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  const initializeGoogleAuth = () => {
    if (!window.google || !window.google.accounts) {
      console.error("Google API not available")
      setError("Google authentication API failed to load")
      return
    }

    try {
      const nonce = generateNonce()

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        nonce: nonce,
      })

      // Render the button if the ref exists
      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "signin_with",
          shape: "rectangular",
        })
      }

      // Also display One Tap prompt
      window.google.accounts.id.prompt()

      console.log("Google Auth initialized successfully")
    } catch (err) {
      console.error("Error initializing Google Auth:", err)
      setError("Failed to initialize Google authentication")
    }
  }

  const handleCredentialResponse = async (response: any) => {
    console.log("Google auth response received:", response)

    try {
      if (!response.credential) {
        throw new Error("No credential received from Google")
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      })

      if (error) {
        console.error("Supabase auth error:", error)
        throw error
      }

      console.log("Successfully signed in with Google:", data)
      router.push("/")
    } catch (err: any) {
      console.error("Error during Google sign-in:", err)
      setError(err.message || "Authentication failed")
    }
  }

  // Handle script load
  const handleScriptLoad = () => {
    console.log("Google script loaded")
    setScriptLoaded(true)
  }

  useEffect(() => {
    if (scriptLoaded) {
      // Small delay to ensure Google API is fully initialized
      const timer = setTimeout(() => {
        initializeGoogleAuth()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [scriptLoaded])

  return (
    <div className="flex flex-col items-center">
      <Script src="https://accounts.google.com/gsi/client" onLoad={handleScriptLoad} strategy="afterInteractive" />

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}

      <div ref={buttonRef} className="mt-4 min-h-[40px] min-w-[240px]"></div>

      <p className="text-sm text-gray-500 mt-2">Sign in with your Google account</p>
    </div>
  )
}
