"use client"

import Script from "next/script"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Define the CredentialResponse type since we don't have the google-one-tap package
interface CredentialResponse {
  credential: string
  select_by: string
  clientId: string
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback?: (notification: any) => void) => void
          renderButton: (parent: HTMLElement, options: any) => void
        }
      }
    }
  }
}

const OneTapComponent = () => {
  // Hardcoded client ID as a fallback
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "272176700958-gsj2t9dv6jt6c63rtg6nu5eu3c0dngdi.apps.googleusercontent.com"

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )
  const router = useRouter()

  // Generate nonce to use for google id token sign-in
  const generateNonce = async (): Promise<string[]> => {
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
    const encoder = new TextEncoder()
    const encodedNonce = encoder.encode(nonce)
    const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return [nonce, hashedNonce]
  }

  useEffect(() => {
    const initializeGoogleOneTap = () => {
      // Add debugging for client ID
      console.log("OneTapComponent - Using client ID:", clientId)

      console.log("Initializing Google One Tap")
      window.addEventListener("load", async () => {
        const [nonce, hashedNonce] = await generateNonce()
        console.log("Nonce: ", nonce, hashedNonce)

        // Check if there's already an existing session before initializing the one-tap UI
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session", error)
        }

        if (data.session) {
          router.push("/")
          return
        }

        if (window.google && window.google.accounts) {
          // Log the full configuration object for debugging
          const googleConfig = {
            client_id: clientId, // Use the hardcoded or env variable client ID
            callback: async (response: CredentialResponse) => {
              console.log("Google callback received")
              try {
                // Send id token returned in response.credential to supabase
                const { data, error } = await supabase.auth.signInWithIdToken({
                  provider: "google",
                  token: response.credential,
                  nonce,
                })

                if (error) throw error

                console.log("Session data: ", data)
                console.log("Successfully logged in with Google One Tap")

                // Redirect to protected page
                router.push("/")
              } catch (error) {
                console.error("Error logging in with Google One Tap", error)
              }
            },
            nonce: hashedNonce,
            use_fedcm_for_prompt: true,
          }

          console.log(
            "Google initialization config:",
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

          window.google.accounts.id.prompt((notification) => {
            console.log("Google prompt notification:", notification)
          })
        } else {
          console.error("Google accounts API not available")
        }
      })
    }

    initializeGoogleOneTap()

    return () => window.removeEventListener("load", initializeGoogleOneTap)
  }, [router, clientId])

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <div id="oneTap" className="fixed top-4 right-4 z-[100]" />
    </>
  )
}

export default OneTapComponent
