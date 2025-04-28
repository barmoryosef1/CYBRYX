
import { Code, Search, AlertTriangle } from "lucide-react";

const SandboxAnalysis = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-cyber-foreground mb-2">Sandbox Analysis</h1>
      <p className="text-cyber-muted-foreground mb-6">Safely analyze suspicious files and URLs in an isolated environment</p>
      
      <div className="bg-cyber-muted p-6 rounded-lg border border-cyber-accent/10 mb-6">
        <div className="flex items-center mb-4">
          <Code className="h-5 w-5 mr-2 text-cyber-accent" />
          <h2 className="text-xl font-semibold text-cyber-foreground">File Analysis</h2>
        </div>
        
        <div className="max-w-xl mx-auto text-center py-8">
          <div className="mb-4">
            <div className="rounded-full bg-cyber-accent/20 p-4 inline-flex">
              <Code className="h-8 w-8 text-cyber-accent" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-cyber-foreground mb-2">Upload a File for Analysis</h3>
          <p className="text-cyber-muted-foreground mb-6">
            Our sandbox will safely execute and analyze the file's behavior to detect potential threats
          </p>
          <div className="text-center">
            <label className="px-4 py-2 bg-cyber-accent text-cyber-accent-foreground rounded hover:bg-cyber-accent/80 cursor-pointer">
              Upload File
              <input type="file" className="hidden" />
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-cyber-muted p-6 rounded-lg border border-cyber-accent/10 mb-6">
        <div className="flex items-center mb-4">
          <Search className="h-5 w-5 mr-2 text-cyber-accent" />
          <h2 className="text-xl font-semibold text-cyber-foreground">URL Analysis</h2>
        </div>
        
        <div className="relative mb-6 max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-cyber-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2 bg-cyber/60 border border-cyber-accent/10 rounded-md text-cyber-foreground placeholder-cyber-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyber-accent/50"
            placeholder="Enter URL to analyze"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button className="px-4 py-2 bg-cyber-accent text-cyber-accent-foreground rounded-r-md hover:bg-cyber-accent/80 focus:outline-none">
              Analyze
            </button>
          </div>
        </div>
        
        <div className="text-center text-cyber-muted-foreground py-4">
          <p className="flex flex-col items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <span>URL analysis results will appear here</span>
          </p>
        </div>
      </div>
      
      <div className="bg-cyber-muted rounded-lg overflow-hidden border border-cyber-accent/10">
        <div className="px-4 py-3 border-b border-cyber-accent/10">
          <h2 className="text-lg font-medium text-cyber-foreground">Recent Analysis</h2>
        </div>
        <div className="p-6 flex items-center justify-center text-cyber-muted-foreground h-40">
          <p>No recent analysis found</p>
        </div>
      </div>
    </div>
  );
};

export default SandboxAnalysis;
