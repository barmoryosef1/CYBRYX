import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThreatIntelligenceSummary } from "@/services/threatIntelligence";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, HelpCircle, Database, FileText, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface ThreatSummaryProps {
  summary: ThreatIntelligenceSummary;
}

const ThreatSummary: React.FC<ThreatSummaryProps> = ({ summary }) => {
  const { iocType, results } = summary;
  
  const reliableSources = results.filter(r => !r.error).length;
  
  const handleExport = () => {
    // Basic CSV export implementation
    const csvContent = [
      ['Source', 'Status', 'Detections', 'Last Scan'],
      ...results.map(r => [
        r.source,
        r.error ? 'Error' : r.malicious ? 'Malicious' : 'Clean',
        r.formattedDetections || `${r.detections || 0}/${r.totalVendors || '?'}`,
        r.scanDate ? new Date(r.scanDate).toLocaleDateString() : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threat-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-cyber-accent" />
                <CardTitle className="text-lg font-medium">Threat Intelligence Summary</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-cyber-muted text-cyber-foreground">
                  {iocType}
                </Badge>
                <Badge variant="outline" className="bg-cyber-muted text-cyber-foreground">
                  {reliableSources} Sources
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Results Table */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-cyber-accent" />
                <CardTitle className="text-lg font-medium">Source Analysis Results</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detections</TableHead>
                  <TableHead>Last Scan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={`${result.source}-${idx}`}>
                    <TableCell className="font-medium">
                      <Tooltip>
                        <TooltipTrigger className="cursor-help">
                          <span className="border-b border-dotted border-cyber-muted-foreground">
                            {result.source}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getSourceDescription(result.source)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {result.error ? (
                        <Badge variant="outline" className="bg-gray-100 text-gray-700">
                          Error
                        </Badge>
                      ) : (
                        <Badge 
                          className={cn(
                            "px-3 py-1",
                            result.malicious ? "bg-red-500 text-white" : "bg-green-500 text-white"
                          )}
                        >
                          {result.malicious ? (
                            <span className="flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Malicious
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Clean
                            </span>
                          )}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {result.formattedDetections || (
                        result.detections !== undefined ? 
                          `${result.detections}/${result.totalVendors || '?'}` : 
                          'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {result.scanDate ? 
                        new Date(result.scanDate).toLocaleDateString() : 
                        'N/A'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

const getSourceDescription = (source: string): string => {
  switch (source) {
    case 'VirusTotal':
      return 'VirusTotal aggregates results from multiple antivirus engines and URL/domain scanners';
    case 'OTX':
      return 'AlienVault Open Threat Exchange - Community-driven threat intelligence';
    case 'ThreatFox':
      return 'ThreatFox database of IOCs maintained by abuse.ch';
    case 'URLhaus':
      return 'URLhaus tracks malicious URLs used for malware distribution';
    default:
      return 'Threat intelligence source';
  }
};

export default ThreatSummary;
