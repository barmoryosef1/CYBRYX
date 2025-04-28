import React from 'react';
import { RiskScore } from '@/components/RiskScore';

const demoSources = [
  { name: "VirusTotal", detections: 18, total_engines: 94 },
  { name: "OTX", detections: 38, total_engines: 50 },
  { name: "ThreatFox", detections: 37, total_engines: 50 },
  { name: "URLhaus", detections: 0, total_engines: 50 },
];

export const RiskScoreDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Threat Risk Assessment</h1>
        <RiskScore sources={demoSources} />
      </div>
    </div>
  );
}; 