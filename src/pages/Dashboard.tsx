
import OverallScore from "@/components/dashboard/OverallScore";
import SecurityScore from "@/components/dashboard/SecurityScore";
import { Bell } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-cyber-foreground">Security Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OverallScore score={72} grade="C+" />
          
          <div className="space-y-4">
            <SecurityScore 
              category="Network Security" 
              score={78} 
              change={2} 
              color="bg-cyber-network" 
            />
            <SecurityScore 
              category="Endpoint Protection" 
              score={65} 
              change={-5} 
              color="bg-cyber-endpoint" 
            />
            <SecurityScore 
              category="Identity & Access" 
              score={82} 
              change={4} 
              color="bg-cyber-identity" 
            />
            <SecurityScore 
              category="Data Protection" 
              score={70} 
              color="bg-cyber-data" 
            />
            <SecurityScore 
              category="Cloud Security" 
              score={68} 
              change={-3} 
              color="bg-cyber-cloud" 
            />
            <SecurityScore 
              category="Application Security" 
              score={75} 
              change={5} 
              color="bg-cyber-application" 
            />
          </div>
        </div>
        
        <div className="bg-cyber-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-cyber-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-cyber-accent" />
              Real-Time Security Alerts
            </h2>
          </div>
          
          <div className="h-[calc(100%-3rem)] flex items-center justify-center text-cyber-muted-foreground">
            <p>No alerts at this time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
