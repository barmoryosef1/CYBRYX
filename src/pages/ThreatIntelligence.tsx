
import { Search, Globe, AlertTriangle, Shield, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const ThreatIntelligence = () => {
  const threatFeeds = [
    { 
      name: "APT Intelligence", 
      description: "Latest intelligence on advanced persistent threats", 
      source: "Internal Analysis",
      severity: "High",
      date: "2025-04-21"
    },
    { 
      name: "Ransomware Trends", 
      description: "Tracking evolving ransomware tactics and techniques", 
      source: "MITRE ATT&CK",
      severity: "Medium",
      date: "2025-04-20"
    },
    { 
      name: "Emerging Threat Vectors", 
      description: "New attack surfaces and exploitation techniques", 
      source: "Threat Intelligence Platform",
      severity: "Medium",
      date: "2025-04-19"
    },
    { 
      name: "IoT Vulnerabilities", 
      description: "Recently discovered vulnerabilities in IoT devices", 
      source: "CVE Database",
      severity: "Low",
      date: "2025-04-18"
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-cyber-foreground mb-2">Threat Intelligence</h1>
      <p className="text-cyber-muted-foreground mb-6">Monitor and analyze the latest cyber threat intelligence</p>
      
      <div className="flex space-x-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-cyber-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 bg-cyber/60 border border-cyber-accent/10 rounded-md text-cyber-foreground placeholder-cyber-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyber-accent/50"
            placeholder="Search threat intelligence..."
          />
        </div>
        
        <button className="px-4 py-2 bg-cyber-muted border border-cyber-accent/10 rounded-md flex items-center space-x-2 text-cyber-foreground hover:bg-cyber-accent/10">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-cyber-muted rounded-lg p-4 border border-cyber-accent/10">
          <div className="flex items-center text-cyber-accent mb-2">
            <Globe className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-medium">Global Threat Level</h2>
          </div>
          <div className="flex items-center justify-center py-6">
            <div className="w-32 h-32 rounded-full border-8 border-cyber-alert-medium flex items-center justify-center">
              <span className="text-4xl font-bold text-cyber-alert-medium">Medium</span>
            </div>
          </div>
          <p className="text-cyber-muted-foreground text-sm text-center">
            Current global threat level based on aggregated intelligence
          </p>
        </div>
        
        <div className="bg-cyber-muted rounded-lg p-4 border border-cyber-accent/10">
          <div className="flex items-center text-cyber-accent mb-2">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-medium">Active Campaigns</h2>
          </div>
          <div className="flex flex-col space-y-3 mt-2">
            <div className="flex justify-between items-center p-2 bg-cyber-alert-high/10 rounded">
              <span className="text-cyber-foreground font-medium">BlackCat Ransomware</span>
              <span className="text-cyber-alert-high text-xs px-2 py-1 bg-cyber-alert-high/20 rounded">Active</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-cyber-alert-medium/10 rounded">
              <span className="text-cyber-foreground font-medium">Emotet Botnet</span>
              <span className="text-cyber-alert-medium text-xs px-2 py-1 bg-cyber-alert-medium/20 rounded">Active</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-cyber-alert-medium/10 rounded">
              <span className="text-cyber-foreground font-medium">APT41 Operations</span>
              <span className="text-cyber-alert-medium text-xs px-2 py-1 bg-cyber-alert-medium/20 rounded">Active</span>
            </div>
          </div>
        </div>
        
        <div className="bg-cyber-muted rounded-lg p-4 border border-cyber-accent/10">
          <div className="flex items-center text-cyber-accent mb-2">
            <Shield className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-medium">Threat Statistics</h2>
          </div>
          <div className="space-y-4 mt-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-cyber-muted-foreground">Ransomware</span>
                <span className="text-sm text-cyber-foreground">38%</span>
              </div>
              <div className="w-full bg-cyber/60 rounded-full h-1.5">
                <div className="bg-cyber-alert-high h-1.5 rounded-full" style={{ width: "38%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-cyber-muted-foreground">Phishing</span>
                <span className="text-sm text-cyber-foreground">65%</span>
              </div>
              <div className="w-full bg-cyber/60 rounded-full h-1.5">
                <div className="bg-cyber-alert-medium h-1.5 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-cyber-muted-foreground">Supply Chain</span>
                <span className="text-sm text-cyber-foreground">27%</span>
              </div>
              <div className="w-full bg-cyber/60 rounded-full h-1.5">
                <div className="bg-cyber-alert-low h-1.5 rounded-full" style={{ width: "27%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-cyber-muted-foreground">Zero-Day</span>
                <span className="text-sm text-cyber-foreground">12%</span>
              </div>
              <div className="w-full bg-cyber/60 rounded-full h-1.5">
                <div className="bg-cyber-alert-info h-1.5 rounded-full" style={{ width: "12%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-cyber-muted rounded-lg overflow-hidden border border-cyber-accent/10">
        <div className="px-4 py-3 border-b border-cyber-accent/10">
          <h2 className="text-lg font-medium text-cyber-foreground">Latest Threat Intelligence</h2>
        </div>
        <div className="divide-y divide-cyber-accent/10">
          {threatFeeds.map((feed) => (
            <div key={feed.name} className="p-4 hover:bg-cyber-accent/5">
              <div className="flex justify-between mb-1">
                <h3 className="font-medium text-cyber-foreground">{feed.name}</h3>
                <span className={cn(
                  "text-xs px-2 py-1 rounded",
                  feed.severity === "High" ? "bg-cyber-alert-high/20 text-cyber-alert-high" :
                  feed.severity === "Medium" ? "bg-cyber-alert-medium/20 text-cyber-alert-medium" :
                  "bg-cyber-alert-low/20 text-cyber-alert-low"
                )}>
                  {feed.severity}
                </span>
              </div>
              <p className="text-cyber-muted-foreground text-sm mb-2">{feed.description}</p>
              <div className="flex justify-between text-xs">
                <span className="text-cyber-muted-foreground">Source: {feed.source}</span>
                <span className="text-cyber-muted-foreground">{feed.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatIntelligence;
