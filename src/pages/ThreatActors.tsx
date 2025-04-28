
import { Users, Search, Globe, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const ThreatActors = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-cyber-foreground mb-2">Threat Actors</h1>
      <p className="text-cyber-muted-foreground mb-6">Track and analyze malicious groups and their tactics</p>
      
      <div className="flex space-x-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-cyber-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 bg-cyber/60 border border-cyber-accent/10 rounded-md text-cyber-foreground placeholder-cyber-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyber-accent/50"
            placeholder="Search threat actors..."
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-cyber-muted p-6 rounded-lg border border-cyber-accent/10">
          <div className="flex items-center text-cyber-accent mb-4">
            <Globe className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-medium">Geographic Distribution</h2>
          </div>
          <div className="h-64 flex items-center justify-center text-cyber-muted-foreground">
            <p className="flex flex-col items-center gap-2">
              <Globe className="h-8 w-8" />
              <span>Geographic map will appear here</span>
            </p>
          </div>
        </div>
        
        <div className="bg-cyber-muted p-6 rounded-lg border border-cyber-accent/10 lg:col-span-2">
          <div className="flex items-center text-cyber-accent mb-4">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-medium">Threat Actor Activity</h2>
          </div>
          <div className="h-64 flex items-center justify-center text-cyber-muted-foreground">
            <p className="flex flex-col items-center gap-2">
              <Activity className="h-8 w-8" />
              <span>Activity timeline will appear here</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-cyber-muted rounded-lg overflow-hidden border border-cyber-accent/10">
        <div className="px-4 py-3 border-b border-cyber-accent/10">
          <h2 className="text-lg font-medium text-cyber-foreground">Tracked Threat Actors</h2>
        </div>
        <div className="divide-y divide-cyber-accent/10">
          {[
            { 
              name: "APT29", 
              alias: "Cozy Bear", 
              origin: "Russia",
              target: "Government, Diplomatic",
              threat: "High"
            },
            { 
              name: "Lazarus Group", 
              alias: "Hidden Cobra", 
              origin: "North Korea",
              target: "Financial, Critical Infrastructure",
              threat: "High"
            },
            { 
              name: "APT41", 
              alias: "Double Dragon", 
              origin: "China",
              target: "Healthcare, Technology",
              threat: "Medium"
            },
            { 
              name: "FIN7", 
              alias: "Carbon Spider", 
              origin: "Unknown",
              target: "Retail, Hospitality",
              threat: "Medium"
            },
          ].map((actor) => (
            <div key={actor.name} className="p-4 hover:bg-cyber-accent/5">
              <div className="flex justify-between mb-1">
                <h3 className="font-medium text-cyber-foreground">
                  {actor.name} <span className="text-cyber-muted-foreground">({actor.alias})</span>
                </h3>
                <span className={cn(
                  "text-xs px-2 py-1 rounded",
                  actor.threat === "High" ? "bg-cyber-alert-high/20 text-cyber-alert-high" :
                  actor.threat === "Medium" ? "bg-cyber-alert-medium/20 text-cyber-alert-medium" :
                  "bg-cyber-alert-low/20 text-cyber-alert-low"
                )}>
                  {actor.threat} Threat
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cyber-muted-foreground">Origin: {actor.origin}</span>
                <span className="text-cyber-muted-foreground">Targets: {actor.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatActors;
