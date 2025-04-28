import { useState, useEffect } from "react";
import CVETable from "./CVETable";
import CVEDetail from "./CVEDetail";
import CVEStats from "./CVEStats";
import { AlertTriangle, LogIn, LogOut } from "lucide-react";

const VulnerabilitiesDashboard = () => {
  const [selectedCVE, setSelectedCVE] = useState(null);
  const [databaseError, setDatabaseError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("");
  // Auth logic omitted for now (public page)

  useEffect(() => {
    // Placeholder for any setup logic
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-cyber-foreground mb-4 md:mb-0">Cybersecurity CVEs Dashboard</h1>
      </div>

      {/* Global Database Error */}
      {databaseError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="text-red-500 mr-2 h-5 w-5 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Database Configuration Error</h3>
              <p className="text-sm text-red-700 mt-1">{databaseError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <CVEStats severityFilter={severityFilter} setSeverityFilter={setSeverityFilter} />
      </div>

      {selectedCVE ? (
        <CVEDetail cveId={selectedCVE} onBack={() => setSelectedCVE(null)} />
      ) : (
        <div>
          <CVETable onSelectCVE={setSelectedCVE} severityFilter={severityFilter} setSeverityFilter={setSeverityFilter} />
        </div>
      )}
    </div>
  );
};

export default VulnerabilitiesDashboard; 