import { AlertTriangle, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThreatIntelligenceResult } from "@/services/threatIntelligence";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SecurityVendorTableProps {
  results: ThreatIntelligenceResult[];
}

const SecurityVendorTable = ({ results }: SecurityVendorTableProps) => {
  if (!results.length) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  const getDetectionInfo = (result: ThreatIntelligenceResult) => {
    if (!result) return "No data";
    
    if (result.error) return "No data";
    
    // If we have a pre-formatted detection string from the backend, use it
    if (result.formattedDetections) {
      return result.formattedDetections;
    }
    
    switch (result.source) {
      case 'AbuseIPDB':
        return `${result.data?.abuseConfidenceScore || 0}% confidence`;
      
      case 'VirusTotal':
        // For VirusTotal IP/domain lookups
        if (result.type === 'ip' || result.type === 'domain') {
          const detectedUrls = result.data?.detected_urls || [];
          const detectedDownloadedSamples = result.data?.detected_downloaded_samples || [];
          const detectedCommunicatingSamples = result.data?.detected_communicating_samples || [];
          const detectedReferrerSamples = result.data?.detected_referrer_samples || [];
          
          let detectionInfo = [];
          
          if (detectedUrls.length > 0) {
            const maliciousUrls = detectedUrls.filter((url: any) => url.positives > 0).length;
            detectionInfo.push(`${maliciousUrls}/${detectedUrls.length} URLs`);
          }
          
          const totalSamples = [
            ...detectedDownloadedSamples, 
            ...detectedCommunicatingSamples, 
            ...detectedReferrerSamples
          ];
          
          if (totalSamples.length > 0) {
            const maliciousSamples = totalSamples.filter((sample: any) => sample.positives > 0).length;
            detectionInfo.push(`${maliciousSamples}/${totalSamples.length} samples`);
          }
          
          return detectionInfo.length > 0 ? detectionInfo.join(', ') : '0 detections';
        } else {
          // Standard scan results (files/URLs)
          if (result.data?.positives !== undefined && result.data?.total !== undefined) {
            return `${result.data.positives}/${result.data.total}`;
          } else if (result.detections !== undefined && result.totalVendors !== undefined) {
            return `${result.detections}/${result.totalVendors}`;
          }
        }
        return '0/0';
        
      case 'OTX':
        return `${result.data?.pulse_info?.count || 0} reports`;
        
      case 'ThreatFox':
        return result.data?.data?.length 
          ? `${result.data.data.length} matches` 
          : `${result.detections || 0} detections`;
          
      case 'URLhaus':
        if (result.data?.urls) return `${result.data.urls.length} URLs`;
        return result.malicious ? 'Malicious' : 'Clean';
        
      default:
        return `${result.detections || 0} detections`;
    }
  };

  const getDetailInfo = (result: ThreatIntelligenceResult) => {
    if (result.error) {
      return result.error;
    }

    switch (result.source) {
      case 'AbuseIPDB':
        if (result.data?.totalReports) {
          return `${result.data.totalReports} reports, Last seen: ${formatDate(result.data.lastReportedAt)}`;
        }
        return 'No reports';
      
      case 'VirusTotal':
        if (result.type === 'ip' || result.type === 'domain') {
          // For IP addresses or domains, show owner/country info
          return `${result.data?.as_owner || ''} ${result.data?.country ? `(${result.data.country})` : ''}`;
        } else if (result.data?.scan_date) {
          return `Scanned on ${formatDate(result.data.scan_date)}`;
        }
        return 'No scan date available';
        
      case 'OTX':
        return result.data?.modified
          ? `Last updated ${formatDate(result.data.modified)}`
          : 'No update date available';
          
      case 'ThreatFox':
        return result.data?.data?.[0]?.first_seen
          ? `First seen ${formatDate(result.data.data[0].first_seen)}`
          : 'No first seen date available';
          
      case 'URLhaus':
        return result.data?.date_added || result.data?.firstseen
          ? `Added on ${formatDate(result.data.date_added || result.data.firstseen)}`
          : result.data?.query_status === 'no_results' 
            ? 'Not found in database'
            : 'No date information';
            
      default:
        return 'No details available';
    }
  };

  const getExternalLink = (result: ThreatIntelligenceResult) => {
    if (result.error) return null;
    
    switch (result.source) {
      case 'AbuseIPDB':
        if (result.data?.ipAddress) {
          return `https://www.abuseipdb.com/check/${result.data.ipAddress}`;
        }
        return null;
      
      case 'VirusTotal':
        if (result.data?.permalink) {
          return result.data.permalink;
        }
        // For IP/domain without permalink
        if (result.type === 'ip' || result.data?.type === 'ip') {
          const resource = result.data?.ip || result.data?.resource;
          if (resource) return `https://www.virustotal.com/gui/ip-address/${resource}`;
        }
        if (result.type === 'domain' || result.data?.type === 'domain') {
          const domain = result.data?.domain || result.data?.resource;
          if (domain) return `https://www.virustotal.com/gui/domain/${domain}`;
        }
        if (result.type === 'url') {
          const url = result.data?.resource || result.data?.url;
          if (url) return `https://www.virustotal.com/gui/url/${encodeURIComponent(url)}`;
        }
        if (result.type === 'hash') {
          const hash = result.data?.resource || result.data?.md5 || result.data?.sha256;
          if (hash) return `https://www.virustotal.com/gui/file/${hash}`;
        }
        return null;
        
      case 'OTX':
        if (result.data?.indicator) {
          // Construct OTX web link based on indicator type
          const baseUrl = 'https://otx.alienvault.com/indicator';
          const type = result.data?.type;
          const value = encodeURIComponent(result.data.indicator);
          return `${baseUrl}/${type}/${value}`;
        }
        return null;
        
      case 'ThreatFox':
        if (result.data?.data?.[0]?.id) {
          return `https://threatfox.abuse.ch/browse/ioc/${result.data.data[0].id}/`;
        }
        return null;
        
      case 'URLhaus':
        if (result.data?.id) {
          return `https://urlhaus.abuse.ch/url/${result.data.id}/`;
        }
        if (result.data?.urls?.[0]?.id) {
          return `https://urlhaus.abuse.ch/url/${result.data.urls[0].id}/`;
        }
        return null;
        
      default:
        return null;
    }
  };

  return (
    <div className="mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Detections</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{result.source}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {result.malicious ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-cyber-destructive mr-1" />
                      <span className="text-cyber-destructive">Malicious</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 text-cyber-clean mr-1" />
                      <span className="text-cyber-clean">Clean</span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>{getDetectionInfo(result)}</TableCell>
              <TableCell>
                <div className="flex items-center justify-between">
                  <span className="text-cyber-muted-foreground mr-2">
                    {getDetailInfo(result)}
                  </span>
                  {getExternalLink(result) && (
                    <a 
                      href={getExternalLink(result) || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-cyber-accent hover:text-cyber-accent/80"
                      title="View on original source"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SecurityVendorTable;
