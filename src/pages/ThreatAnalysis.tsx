
import { BarChart2, Activity, AlertTriangle } from "lucide-react";

const ThreatAnalysis = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-cyber-foreground mb-2">Threat Analysis</h1>
      <p className="text-cyber-muted-foreground mb-6">Analyze and visualize threat data patterns</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-cyber-muted p-6 rounded-lg border border-cyber-accent/10">
          <div className="flex items-center text-cyber-accent mb-4">
            <BarChart2 className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-medium">Threat Distribution</h2>
          </div>
          <div className="h-64 flex items-center justify-center text-cyber-muted-foreground">
            <p className="flex flex-col items-center gap-2">
              <Activity className="h-8 w-8" />
              <span>Analytics visualization will appear here</span>
            </p>
          </div>
        </div>
        
        <div className="bg-cyber-muted p-6 rounded-lg border border-cyber-accent/10">
          <div className="flex items-center text-cyber-accent mb-4">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-medium">Recent Attacks</h2>
          </div>
          <div className="h-64 flex items-center justify-center text-cyber-muted-foreground">
            <p className="flex flex-col items-center gap-2">
              <Activity className="h-8 w-8" />
              <span>Attack data will appear here</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatAnalysis;
