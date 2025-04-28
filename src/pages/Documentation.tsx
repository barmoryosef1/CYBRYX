import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Documentation = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-cyber-foreground mb-2">System Documentation</h1>
      <p className="text-cyber-muted-foreground mb-8">Understanding the Threat Horizon Guardian Eye system</p>

      <div className="grid gap-8">
        {/* System Overview */}
        <Card className="border-cyber-accent/20 bg-cyber-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-cyber-accent">System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-cyber-foreground/90">
              Threat Horizon Guardian Eye is an advanced threat intelligence platform that analyzes various types of Indicators of Compromise (IOCs) using multiple trusted sources. The system provides comprehensive analysis and risk assessment for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-cyber-foreground/80">
              <li>IP Addresses</li>
              <li>Domain Names</li>
              <li>File Hashes</li>
              <li>URLs</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card className="border-cyber-accent/20 bg-cyber-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-cyber-accent">Data Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold mb-2 text-cyber-accent">VirusTotal</h3>
                <p className="text-cyber-muted-foreground">
                  Aggregates results from multiple antivirus engines and URL/domain scanners.
                  Weight in scoring: 40%
                </p>
              </div>
              <Separator className="bg-cyber-accent/20" />
              <div>
                <h3 className="font-semibold mb-2 text-cyber-accent">AlienVault OTX</h3>
                <p className="text-cyber-muted-foreground">
                  Open Threat Exchange - Community-driven threat intelligence platform.
                  Weight in scoring: 20%
                </p>
              </div>
              <Separator className="bg-cyber-accent/20" />
              <div>
                <h3 className="font-semibold mb-2 text-cyber-accent">ThreatFox</h3>
                <p className="text-cyber-muted-foreground">
                  Database of IOCs maintained by abuse.ch.
                  Weight in scoring: 20%
                </p>
              </div>
              <Separator className="bg-cyber-accent/20" />
              <div>
                <h3 className="font-semibold mb-2 text-cyber-accent">URLhaus</h3>
                <p className="text-cyber-muted-foreground">
                  Tracks malicious URLs used for malware distribution.
                  Weight in scoring: 20%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Score Calculation */}
        <Card className="border-cyber-accent/20 bg-cyber-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-cyber-accent">Risk Score Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-cyber-foreground/90">
              The risk score is calculated on a scale of 0-1000, providing detailed threat assessment:
            </p>
            <div className="grid gap-6">
              <div>
                <h3 className="font-semibold mb-4 text-lg text-cyber-accent">Score Ranges</h3>
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-green-500"></span>
                      <span className="text-green-400 font-semibold">0-250: Safe</span>
                    </div>
                    <p className="mt-2 text-cyber-muted-foreground ml-7">No significant threats detected, all sources indicate clean status</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
                      <span className="text-yellow-400 font-semibold">251-500: Suspicious</span>
                    </div>
                    <p className="mt-2 text-cyber-muted-foreground ml-7">Some sources have detected potential issues, requires investigation</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-orange-500"></span>
                      <span className="text-orange-400 font-semibold">501-750: High Risk</span>
                    </div>
                    <p className="mt-2 text-cyber-muted-foreground ml-7">Strong indicators of malicious activity from multiple sources</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-red-800/10 to-red-800/5 border border-red-800/20">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-red-800"></span>
                      <span className="text-red-400 font-semibold">751-1000: Critical</span>
                    </div>
                    <p className="mt-2 text-cyber-muted-foreground ml-7">Widespread agreement on severe threat - immediate action required</p>
                  </div>
                </div>
              </div>
              <Separator className="bg-cyber-accent/20" />
              <div>
                <h3 className="font-semibold mb-2 text-lg text-cyber-accent">Calculation Method</h3>
                <p className="text-cyber-muted-foreground">
                  Each source's score is normalized to a 0-1000 scale using the formula:
                  <code className="ml-2 px-2 py-1 rounded bg-cyber-accent/10 text-cyber-accent">
                    (detections / total_engines) * 1000
                  </code>
                </p>
                <p className="mt-2 text-cyber-muted-foreground">
                  The final score is a weighted average of all source scores, using the weights specified in the Data Sources section.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter System */}
        <Card className="border-cyber-accent/20 bg-cyber-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-cyber-accent">Filter System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-cyber-foreground/90">
              The system includes a comprehensive filtering system that allows you to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-cyber-foreground/80">
              <li>Filter by risk score ranges</li>
              <li>Show/hide clean results</li>
              <li>Show/hide malicious detections</li>
              <li>Filter by data source</li>
              <li>Show/hide error states</li>
            </ul>
            <p className="text-cyber-muted-foreground mt-4">
              Filters can be applied in real-time and help focus on specific aspects of the analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documentation; 