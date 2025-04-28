"use client"

import { useState, useEffect } from "react"
import { supabase } from "../services/supabaseClient"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { RefreshCw } from "lucide-react"

export default function AdminStatistics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    severityCounts: [],
    yearCounts: [],
    monthlyTrends: [],
    totalCount: 0,
  })

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1"]
  const SEVERITY_COLORS = {
    CRITICAL: "#e53e3e", // red
    HIGH: "#ed8936", // orange
    MEDIUM: "#ecc94b", // yellow
    LOW: "#3182ce", // blue
    UNKNOWN: "#a0aec0", // gray
  }

  async function fetchStatistics() {
    setLoading(true)
    setError(null)

    try {
      // Get all CVEs in one query to process client-side
      const {
        data: allCVEs,
        error: fetchError,
        count: totalCount,
      } = await supabase.from("cves").select("*", { count: "exact" })

      if (fetchError) throw fetchError

      // Process severity counts
      const severityCounts = {}
      allCVEs.forEach((cve) => {
        const severity = cve.base_severity || "UNKNOWN"
        severityCounts[severity] = (severityCounts[severity] || 0) + 1
      })

      // Format severity data for chart
      const formattedSeverityCounts = Object.entries(severityCounts).map(([name, value]) => ({
        name,
        value,
      }))

      // Process year counts
      const yearCounts = {}
      allCVEs.forEach((cve) => {
        const match = cve.cve_id.match(/CVE-(\d{4})-/)
        if (match && match[1]) {
          const year = match[1]
          yearCounts[year] = (yearCounts[year] || 0) + 1
        }
      })

      // Format year data for chart
      const formattedYearCounts = Object.entries(yearCounts)
        .map(([year, count]) => ({
          year,
          count,
        }))
        .sort((a, b) => a.year.localeCompare(b.year))

      // Process monthly trends
      const monthCounts = {}
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      allCVEs.forEach((cve) => {
        if (cve.published) {
          const date = new Date(cve.published)
          if (date >= oneYearAgo) {
            const month = date.toISOString().substring(0, 7) // YYYY-MM format
            monthCounts[month] = (monthCounts[month] || 0) + 1
          }
        }
      })

      // Format monthly data for chart
      const formattedMonthCounts = Object.entries(monthCounts)
        .map(([month, count]) => ({
          month,
          count,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))

      // Update all stats at once
      setStats({
        severityCounts: formattedSeverityCounts,
        yearCounts: formattedYearCounts,
        monthlyTrends: formattedMonthCounts,
        totalCount: totalCount || allCVEs.length,
      })
    } catch (err) {
      console.error("Error fetching statistics:", err)
      setError(`Failed to load statistics: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <div className="flex">
          <div className="py-1">
            <svg
              className="fill-current h-6 w-6 text-red-500 mr-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchStatistics}
          className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">CVE Statistics</h2>
        <button
          onClick={fetchStatistics}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-1 px-3 rounded inline-flex items-center text-sm"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500">Total CVEs</div>
          <div className="text-3xl font-bold">{stats.totalCount.toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500">Critical Vulnerabilities</div>
          <div className="text-3xl font-bold text-red-600">
            {(stats.severityCounts.find((s) => s.name === "CRITICAL")?.value || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-500">High Vulnerabilities</div>
          <div className="text-3xl font-bold text-orange-500">
            {(stats.severityCounts.find((s) => s.name === "HIGH")?.value || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Severity Distribution</h3>
          {stats.severityCounts.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.severityCounts}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.severityCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">No data available</div>
          )}
        </div>

        {/* CVEs by Year */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium mb-4">CVEs by Year</h3>
          {stats.yearCounts.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.yearCounts} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Bar dataKey="count" fill="#3182ce" name="CVE Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">No data available</div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">Monthly Trends</h3>
          {stats.monthlyTrends.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Bar dataKey="count" fill="#82ca9d" name="CVE Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 text-gray-500">No data available</div>
          )}
        </div>
      </div>
    </div>
  )
}
