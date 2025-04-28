"use client"

import { useState, useEffect } from "react"
import { isAuthenticated } from "../utils/auth"
import AdminLogin from "../components/AdminLogin"
import AdminDashboard from "../components/AdminDashboard"

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication status
    setAuthenticated(isAuthenticated())
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return authenticated ? (
    <AdminDashboard onLogout={() => setAuthenticated(false)} />
  ) : (
    <AdminLogin onLogin={() => setAuthenticated(true)} />
  )
}
