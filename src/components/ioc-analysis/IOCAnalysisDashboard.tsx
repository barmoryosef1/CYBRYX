import { useState } from "react";
import { Filter, Search, AlertTriangle, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeThreatIntelligence, ThreatIntelligenceResult, detectIocType, IocType, ThreatIntelligenceSummary } from "@/services/threatIntelligence";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { RiskScore } from "@/components/RiskScore";
import SecurityVendorTable from "./SecurityVendorTable";
import ThreatSummary from "./ThreatSummary";

const IOCAnalysisDashboard = () => {
  const [iocType, setIocType] = useState<IocType | string>("IP Address");
  const [riskScore, setRiskScore] = useState(0);
  const [results, setResults] = useState<ThreatIntelligenceResult[]>([]);
  const [summary, setSummary] = useState<ThreatIntelligenceSummary | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentIOC, setCurrentIOC] = useState<string>("");
  const [filters, setFilters] = useState({
    showClean: true,
    showMalicious: true,
    showErrors: true,
  });

  const handleAnalyze = async (searchQuery: string) => {
    setIsAnalyzing(true);
    setCurrentIOC(searchQuery);
    
    try {
      const type = detectIocType(searchQuery);
      setIocType(type);

      const threatSummary = await analyzeThreatIntelligence(searchQuery, type);
      setSummary(threatSummary);
      setResults(threatSummary.results);
      setRiskScore(threatSummary.riskScore);
      
      if (threatSummary.malicious) {
        toast.warning("Potential threat detected!", {
          description: "The analyzed IOC has been flagged as potentially malicious."
        });
      } else {
        toast.success("Analysis complete", {
          description: "No threats detected in the analyzed IOC."
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze IOC", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    if (input.value) {
      handleAnalyze(input.value);
    }
  };

  const filteredResults = results.filter(result => {
    if (result.error) return filters.showErrors;
    if (result.malicious) return filters.showMalicious;
    return filters.showClean;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>IOC Analysis</CardTitle>
          <CardDescription>
            Analyze IP addresses, domains, URLs, and file hashes for potential threats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter IP, domain, URL, or hash..."
                className="flex-1"
                disabled={isAnalyzing}
              />
              <Button type="submit" disabled={isAnalyzing}>
                <Search className="mr-2 h-4 w-4" />
                Analyze
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {currentIOC && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Analysis Results</CardTitle>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filter Results</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="showClean" 
                          checked={filters.showClean}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, showClean: !!checked }))
                          }
                        />
                        <Label htmlFor="showClean">Show Clean Results</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="showMalicious" 
                          checked={filters.showMalicious}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, showMalicious: !!checked }))
                          }
                        />
                        <Label htmlFor="showMalicious">Show Malicious Results</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="showErrors" 
                          checked={filters.showErrors}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, showErrors: !!checked }))
                          }
                        />
                        <Label htmlFor="showErrors">Show Errors</Label>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-48">
                    <RiskScore score={riskScore} />
                  </div>
                </div>

                <Separator />

                {summary ? (
                  <ThreatSummary summary={{...summary, results: filteredResults}} />
                ) : (
                  <SecurityVendorTable results={filteredResults} />
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredResults.map((result, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">
                          {result.source}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            {result.malicious ? (
                              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                            ) : (
                              <Shield className="h-4 w-4 text-green-500 mr-2" />
                            )}
                            <span className="text-sm">
                              {result.malicious ? "Malicious" : "Clean"}
                            </span>
                          </div>
                          {result.detections !== undefined && (
                            <div className="flex items-center">
                              <Activity className="h-4 w-4 text-blue-500 mr-2" />
                              <span className="text-sm">
                                {result.detections} detections
                              </span>
                            </div>
                          )}
                          {result.error && (
                            <div className="text-sm text-red-500">
                              Error: {result.error}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default IOCAnalysisDashboard; 