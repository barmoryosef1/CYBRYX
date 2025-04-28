"use client"

import { useState, useEffect } from "react"
import { supabase } from "../services/supabaseClient"
import { AlertTriangle, AlertCircle, AlertOctagon, TrendingUp, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CVEStats() {
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    recentCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter() // Moved useRouter here

  async function fetchStats() {
    setLoading(true)
    setError(null)

    try {
      // Simple connection test first
      const { error: connectionError } = await supabase.from("cves").select("id").limit(1)

      if (connectionError) {
        console.error("Database connection error:", connectionError)
        setError("Unable to connect to the database. Please check your configuration.")
        setLoading(false)
        return
      }

      // Get total count
      const { count: total, error: countError } = await supabase
        .from("cves")
        .select("*", { count: "exact", head: true })

      if (countError) {
        console.error("Error getting total count:", countError)
        setError("Error fetching statistics. Please try again later.")
        setLoading(false)
        return
      }

      // Get count by severity
      const severityCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      }

      // Get counts for each severity level individually to avoid RPC errors
      for (const severity of ["CRITICAL", "HIGH", "MEDIUM", "LOW"]) {
        const { count, error: severityError } = await supabase
          .from("cves")
          .select("*", { count: "exact", head: true })
          .eq("base_severity", severity)

        if (!severityError) {
          const key = severity.toLowerCase()
          severityCounts[key] = count || 0
        }
      }

      // Get count of CVEs from the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: recentCount, error: recentError } = await supabase
        .from("cves")
        .select("*", { count: "exact", head: true })
        .gte("published", thirtyDaysAgo.toISOString())

      if (recentError) {
        console.error("Error getting recent count:", recentError)
      }

      setStats({
        total: total || 0,
        ...severityCounts,
        recentCount: recentCount || 0,
      })
    } catch (err) {
      console.error("Error fetching CVE stats:", err)
      setError("An unexpected error occurred while fetching statistics.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Error Loading Statistics</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchStats}
            className="ml-2 p-1 rounded-full hover:bg-red-100"
            title="Retry loading statistics"
          >
            <RefreshCw className="h-5 w-5 text-red-500" />
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 animate-pulse h-24 rounded-lg"></div>
        ))}
      </div>
    )
  }

  const handleFilterBySeverity = (severity) => {
    if (severity === "all") {
      router.push("/?severity=")
    } else {
      router.push(`/?severity=${severity.toUpperCase()}`)
    }
  }

  const statCards = [
    {
      title: "Total CVEs",
      value: stats.total,
      icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-50 border-blue-200",
      onClick: () => handleFilterBySeverity("all"),
    },
    {
      title: "Critical",
      value: stats.critical,
      icon: <AlertOctagon className="h-6 w-6 text-red-500" />,
      color: "bg-red-50 border-red-200",
      onClick: () => handleFilterBySeverity("critical"),
    },
    {
      title: "High",
      value: stats.high,
      icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
      color: "bg-orange-50 border-orange-200",
      onClick: () => handleFilterBySeverity("high"),
    },
    {
      title: "Medium",
      value: stats.medium,
      icon: <AlertCircle className="h-6 w-6 text-yellow-500" />,
      color: "bg-yellow-50 border-yellow-200",
      onClick: () => handleFilterBySeverity("medium"),
    },
    {
      title: "Low",
      value: stats.low,
      icon: <AlertCircle className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-50 border-blue-200",
      onClick: () => handleFilterBySeverity("low"),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow duration-200`}
          onClick={() => card.onClick()}
        >
          <div>
            <p className="text-gray-500 text-sm">{card.title}</p>
            <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
          </div>
          <div className="rounded-full p-3 bg-white">{card.icon}</div>
        </div>
      ))}
    </div>
  )
}
