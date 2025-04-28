import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log environment variable status (without exposing values)
console.log(`Supabase URL defined: ${!!supabaseUrl}`)
console.log(`Supabase Anon Key defined: ${!!supabaseAnonKey}`)

// Create client with error handling
let supabase

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log("Supabase client initialized successfully")
} catch (error) {
  console.error("Error initializing Supabase client:", error)
  // Create a mock client that logs errors instead of throwing them
  // This prevents the app from crashing completely
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized properly") }),
      insert: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized properly") }),
      upsert: () => Promise.resolve({ data: null, error: new Error("Supabase client not initialized properly") }),
    }),
  }
}

export { supabase }
