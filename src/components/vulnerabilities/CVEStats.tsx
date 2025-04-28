import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, AlertCircle, AlertOctagon, TrendingUp, RefreshCw } from "lucide-react";

interface CVEStatsProps {
  severityFilter: string;
  setSeverityFilter: (severity: string) => void;
}

const CVEStats = ({ severityFilter, setSeverityFilter }: CVEStatsProps) => {
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    recentCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const { error: connectionError } = await supabase.from("cves").select("id").limit(1);
      if (connectionError) {
        setError("Unable to connect to the database. Please check your configuration.");
        setLoading(false);
        return;
      }
      const { count: total, error: countError } = await supabase
        .from("cves")
        .select("*", { count: "exact", head: true });
      if (countError) {
        setError("Error fetching statistics. Please try again later.");
        setLoading(false);
        return;
      }
      const severityCounts: any = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };
      for (const severity of ["CRITICAL", "HIGH", "MEDIUM", "LOW"]) {
        const { count, error: severityError } = await supabase
          .from("cves")
          .select("*", { count: "exact", head: true })
          .eq("base_severity", severity);
        if (!severityError) {
          const key = severity.toLowerCase();
          severityCounts[key] = count || 0;
        }
      }
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: recentCount } = await supabase
        .from("cves")
        .select("*", { count: "exact", head: true })
        .gte("published", thirtyDaysAgo.toISOString());
      setStats({
        total: total || 0,
        ...severityCounts,
        recentCount: recentCount || 0,
      });
    } catch (err: any) {
      setError("An unexpected error occurred while fetching statistics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

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
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-cyber-muted/30 animate-pulse h-24 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total CVEs",
      value: stats.total,
      icon: <TrendingUp className="h-6 w-6 text-cyber-accent" />,
      color: "bg-cyber-card/50 border-cyber-accent/20",
      textColor: "text-white",
      active: severityFilter === "" || severityFilter === "all",
      onClick: () => setSeverityFilter("")
    },
    {
      title: "Critical",
      value: stats.critical,
      icon: <AlertOctagon className="h-6 w-6 text-red-500" />,
      color: "bg-red-50 border-red-200",
      textColor: "text-red-800",
      active: severityFilter === "CRITICAL",
      onClick: () => setSeverityFilter("CRITICAL")
    },
    {
      title: "High",
      value: stats.high,
      icon: <AlertTriangle className="h-6 w-6 text-orange-500" />,
      color: "bg-orange-50 border-orange-200",
      textColor: "text-orange-800",
      active: severityFilter === "HIGH",
      onClick: () => setSeverityFilter("HIGH")
    },
    {
      title: "Medium",
      value: stats.medium,
      icon: <AlertCircle className="h-6 w-6 text-yellow-500" />,
      color: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-900",
      active: severityFilter === "MEDIUM",
      onClick: () => setSeverityFilter("MEDIUM")
    },
    {
      title: "Low",
      value: stats.low,
      icon: <AlertCircle className="h-6 w-6 text-cyber-accent" />,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-900",
      active: severityFilter === "LOW",
      onClick: () => setSeverityFilter("LOW")
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} border rounded-xl p-5 flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow duration-200 backdrop-blur-md bg-cyber-card/60 font-sans ring-1 ring-cyber-accent/10 ${card.active ? "ring-2 ring-cyber-accent bg-cyber-accent/10" : ""}`}
          style={{ minHeight: 110 }}
          onClick={card.onClick}
        >
          <div>
            <p className="text-cyber-muted-foreground text-sm font-medium mb-1">{card.title}</p>
            <p className={`text-4xl font-extrabold leading-tight ${card.textColor}`}>{card.value.toLocaleString()}</p>
          </div>
          <div className="rounded-full p-4 bg-white/80 shadow-inner flex items-center justify-center">{card.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default CVEStats; 