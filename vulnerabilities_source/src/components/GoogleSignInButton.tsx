"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

const GoogleSignInButton = () => {
  const buttonRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Hardcoded client ID as a fallback
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "272176700958-gsj2t9dv6jt6c63rtg6nu5eu3c0dngdi.apps.googleusercontent.com"

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  useEffect(() => {
    // Generate nonce for security
    const generateNonce = async (): Promise<string[]> => {
      const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
      const encoder = new TextEncoder()
      const encodedNonce = encoder.encode(nonce)
      const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
      return [nonce, hashedNonce]
    }

    const renderButton = async () => {
      if (!buttonRef.current || !window.google) return

      // Add debugging for client ID
      console.log("GoogleSignInButton - Using client ID:", clientId)

      const [nonce, hashedNonce] = await generateNonce()

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        context: "signin",
      })

      // Log the full configuration object for debugging
      const googleConfig = {
        client_id: clientId, // Use the hardcoded or env variable client ID
        callback: async (response) => {
          console.log("Google signin callback received")
          try {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
              nonce,
            })

            if (error) throw error

            console.log("Successfully logged in with Google")
            router.push("/")
          } catch (error) {
            console.error("Error logging in with Google", error)
          }
        },
        nonce: hashedNonce,
        use_fedcm_for_prompt: true,
      }

      console.log(
        "GoogleSignInButton - Config:",
        JSON.stringify(
          {
            ...googleConfig,
            client_id: googleConfig.client_id ? "DEFINED" : "UNDEFINED", // Don't log the actual client ID
          },
          null,
          2,
        ),
      )

      window.google.accounts.id.initialize(googleConfig)
    }

    if (window.google && window.google.accounts) {
      renderButton()
    } else {
      // If Google API is not loaded yet, wait for it
      console.log("Waiting for Google API to load...")
      const checkGoogleLoaded = setInterval(() => {
        console.log("Checking if Google API is loaded...")
        if (window.google && window.google.accounts) {
          console.log("Google API loaded successfully")
          clearInterval(checkGoogleLoaded)
          renderButton()
        }
      }, 100)

      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => {
        console.log("Timeout reached for Google API loading")
        clearInterval(checkGoogleLoaded)
      }, 10000)
    }
  }, [router, clientId])

  return (
    <div className="flex flex-col items-center">
      <div ref={buttonRef} className="mt-4"></div>
      <p className="text-sm text-gray-500 mt-2">Sign in with your Google account</p>
    </div>
  )
}

export default GoogleSignInButton
