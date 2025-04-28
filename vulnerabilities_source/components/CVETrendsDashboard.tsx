"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MonthlyTrendsChart from "./charts/MonthlyTrendsChart"
import SeverityDistributionChart from "./charts/SeverityDistributionChart"
import TopVendorsChart from "./charts/TopVendorsChart"
import VulnTypeChart from "./charts/VulnTypeChart"

export default function CVETrendsDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">CVE Trends & Analytics</h2>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="types">Vulnerability Types</TabsTrigger>
          <TabsTrigger value="severity">Severity Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MonthlyTrendsChart />
            <SeverityDistributionChart />
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4 mt-4">
          <TopVendorsChart />
        </TabsContent>

        <TabsContent value="types" className="space-y-4 mt-4">
          <VulnTypeChart />
        </TabsContent>

        <TabsContent value="severity" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SeverityDistributionChart />
            <MonthlyTrendsChart />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
