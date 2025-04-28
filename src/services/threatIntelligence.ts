import { supabase } from "@/integrations/supabase/client";

export interface ThreatIntelligenceResult {
  source: string;
  malicious: boolean;
  detections?: number;
  totalVendors?: number;
  data: any;
  error?: string;
  stack?: string;
  scanDate?: string;
  permalink?: string;
  responseCode?: number;
  verboseMsg?: string;
  type?: string;
  formattedDetections?: string;
}

export type IocType = 'ip' | 'domain' | 'hash' | 'url' | 'unknown';

export interface ThreatIntelligenceSummary {
  iocType: IocType;
  riskScore: number;
  malicious: boolean;
  results: ThreatIntelligenceResult[];
}

// Add AbuseIPDB configuration
const ABUSEIPDB_API_KEY = import.meta.env.VITE_ABUSEIPDB_API_KEY;
const ABUSEIPDB_BASE_URL = 'https://api.abuseipdb.com/api/v2';

// Function to check IP in AbuseIPDB
async function checkAbuseIPDB(ip: string): Promise<ThreatIntelligenceResult> {
  console.log('Checking AbuseIPDB for IP:', ip);
  
  try {
    // First check if proxy is running
    try {
      const healthCheck = await fetch('http://localhost:3005/health');
      if (!healthCheck.ok) {
        throw new Error('Proxy server is not responding');
      }
    } catch (error) {
      throw new Error('Cannot connect to proxy server. Make sure to run npm run dev:all');
    }

    const response = await fetch(`http://localhost:3005/api/check-ip?ip=${ip}&maxAge=30`);
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format from server');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }

    if (!data.data) {
      throw new Error('Invalid response format from AbuseIPDB');
    }

    const abuseData = data.data;

    return {
      source: 'AbuseIPDB',
      malicious: abuseData.abuseConfidenceScore > 50,
      detections: abuseData.abuseConfidenceScore,
      totalVendors: 100,
      data: {
        ipAddress: abuseData.ipAddress,
        isPublic: abuseData.isPublic,
        ipVersion: abuseData.ipVersion,
        isWhitelisted: abuseData.isWhitelisted,
        abuseConfidenceScore: abuseData.abuseConfidenceScore,
        countryCode: abuseData.countryCode,
        countryName: abuseData.countryName,
        usageType: abuseData.usageType,
        isp: abuseData.isp,
        domain: abuseData.domain,
        hostnames: abuseData.hostnames,
        isTor: abuseData.isTor,
        totalReports: abuseData.totalReports,
        numDistinctUsers: abuseData.numDistinctUsers,
        lastReportedAt: abuseData.lastReportedAt,
        reports: abuseData.reports
      },
      scanDate: abuseData.lastReportedAt,
      formattedDetections: `${abuseData.abuseConfidenceScore}% confidence, ${abuseData.totalReports} reports`
    };
  } catch (error: any) {
    console.error('AbuseIPDB API Error:', error);
    return {
      source: 'AbuseIPDB',
      malicious: false,
      data: null,
      error: error.message || 'Failed to fetch data from AbuseIPDB',
    };
  }
}

export const analyzeThreatIntelligence = async (
  ioc: string,
  type?: IocType
): Promise<ThreatIntelligenceSummary> => {
  try {
    console.log(`Analyzing IOC: ${ioc}, Type: ${type || 'auto-detect'}`);
    const detectedType = type || detectIocType(ioc);
    console.log(`Detected type: ${detectedType}`);
    
    // Get results from Supabase function for other sources
    const { data: supabaseData, error: supabaseError } = await supabase.functions.invoke('analyze-ioc', {
      body: { ioc, type }
    });

    if (supabaseError) {
      console.error('Error from edge function:', supabaseError);
      throw supabaseError;
    }

    let results = Array.isArray(supabaseData) ? supabaseData : [];

    // Add AbuseIPDB check for IP addresses
    if (detectedType === 'ip') {
      const abuseIPDBResult = await checkAbuseIPDB(ioc);
      results.push(abuseIPDBResult);
    }

    // Calculate risk score based on all results
    const riskScore = calculateRiskScore(results);
    
    return {
      iocType: detectedType,
      riskScore,
      malicious: riskScore > 50,
      results
    };
  } catch (error: any) {
    console.error('Error analyzing IOC:', error);
    return {
      iocType: type || 'unknown',
      riskScore: 0,
      malicious: false,
      results: [{
        source: 'Error',
        malicious: false,
        error: error.message || 'Unknown error occurred during analysis',
        stack: error.stack,
        data: null
      }]
    };
  }
};

export const detectIocType = (ioc: string): IocType => {
  // IP address pattern
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ioc)) {
    return 'ip';
  } 
  // Domain pattern
  else if (/^[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+$/.test(ioc)) {
    return 'domain';
  } 
  // Hash pattern (MD5, SHA1, SHA256)
  else if (/^[a-fA-F0-9]{32,64}$/.test(ioc)) {
    return 'hash';
  } 
  // URL pattern
  else if (/^(http|https):\/\/[a-zA-Z0-9]/.test(ioc)) {
    return 'url';
  } 
  return 'unknown';
};

// Update the weights to include AbuseIPDB
const weights: Record<string, number> = {
  VirusTotal: 0.3,
  OTX: 0.2,
  ThreatFox: 0.15,
  URLhaus: 0.15,
  AbuseIPDB: 0.2,
};

// Calculate a normalized risk score (0-100) based on all results
const calculateRiskScore = (results: ThreatIntelligenceResult[]): number => {
  if (!results || results.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalAppliedWeight = 0;

  for (const result of results) {
    if (result.error) continue;

    const weight = weights[result.source] || 0;
    if (weight === 0) continue;

    let normalizedScore = 0;
    
    if (result.source === 'AbuseIPDB') {
      // AbuseIPDB already provides a score from 0-100
      normalizedScore = result.detections || 0;
    } else {
      // Extract detections and total from the data object
      const detections = result.data?.positives || result.detections || 0;
      const totalEngines = result.data?.total || result.totalVendors || 0;

      if (totalEngines > 0) {
        normalizedScore = (detections / totalEngines) * 100;
      } else if (result.malicious) {
        normalizedScore = 75;
      }
    }

    totalWeightedScore += normalizedScore * weight;
    totalAppliedWeight += weight;
  }

  return totalAppliedWeight === 0 ? 0 : Number((totalWeightedScore / totalAppliedWeight).toFixed(2));
};

