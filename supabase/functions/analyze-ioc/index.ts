
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { ioc, type } = await req.json()
    console.log(`Analyzing IOC: ${ioc}, Type: ${type}`)

    const vtApiKey = Deno.env.get('VIRUSTOTAL_API_KEY')
    const otxApiKey = Deno.env.get('OTX_API_KEY')
    const threatfoxApiKey = Deno.env.get('THREATFOX_API_KEY')
    const urlhausApiKey = Deno.env.get('URLHAUS_API_KEY')
    
    // Debug API keys (safely)
    console.log(`VT Key Length: ${vtApiKey?.length || 0}`)
    console.log(`OTX Key Length: ${otxApiKey?.length || 0}`)
    console.log(`ThreatFox Key Length: ${threatfoxApiKey?.length || 0}`)
    console.log(`URLhaus Key Length: ${urlhausApiKey?.length || 0}`)
    
    const results: any[] = []
    
    // Improved test request to VirusTotal with more detailed logging
    try {
      const testDomain = "google.com"
      const testUrl = `https://www.virustotal.com/api/v3/domains/${testDomain}`
      console.log(`Testing VT API with URL: ${testUrl}`)
      
      const testRes = await fetch(testUrl, {
        headers: { 'x-apikey': vtApiKey! }
      })
      console.log("VT Test Status:", testRes.status)
      const testData = await testRes.json()
      console.log("VT Test Response:", JSON.stringify(testData.data?.attributes?.last_analysis_stats || {}, null, 2))
      console.log("VT Test Response Code:", testData.response_code || "Not available")
    } catch (testError) {
      console.error("VT Test Error:", testError.message)
      console.error("VT Test Error Stack:", testError.stack)
    }

    // VirusTotal
    try {
      let vtResponse, permalink;
      if (type === 'url') {
        // For URL type, we need to handle URL encoding properly
        console.log(`Processing URL: ${ioc}`)
        const encodedUrl = btoa(ioc).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
        console.log(`Encoded URL: ${encodedUrl}`)
        
        const vtUrl = `https://www.virustotal.com/api/v3/urls/${encodedUrl}`
        console.log(`Requesting: ${vtUrl}`)
        
        const res = await fetch(vtUrl, {
          headers: { 'x-apikey': vtApiKey! }
        });
        console.log(`URL lookup status: ${res.status}`)

        if (res.status === 404) {
          console.log("URL not found, submitting for analysis")
          const submitUrl = 'https://www.virustotal.com/api/v3/urls'
          const encodedParam = `url=${encodeURIComponent(ioc)}`
          console.log(`Submission param: ${encodedParam}`)
          
          const submitRes = await fetch(submitUrl, {
            method: 'POST',
            headers: {
              'x-apikey': vtApiKey!,
              'content-type': 'application/x-www-form-urlencoded'
            },
            body: encodedParam
          });
          console.log(`URL submit status: ${submitRes.status}`)
          
          if (!submitRes.ok) {
            const errorText = await submitRes.text()
            throw new Error(`URL submission failed with HTTP ${submitRes.status}: ${errorText}`)
          }
          
          const submitData = await submitRes.json();
          console.log("URL submit response:", JSON.stringify(submitData))
          const analysisId = submitData.data?.id;
          console.log(`Analysis ID: ${analysisId || 'undefined'}`)
          
          if (analysisId) {
            for (let i = 0; i < 10; i++) {
              console.log(`Polling analysis: attempt ${i+1}`)
              const analysisRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
                headers: { 'x-apikey': vtApiKey! }
              });
              console.log(`Analysis poll status: ${analysisRes.status}`)
              const analysisData = await analysisRes.json();
              console.log(`Analysis status: ${analysisData.data?.attributes?.status || 'unknown'}`)
              if (analysisData.data?.attributes?.status === 'completed') {
                console.log("Analysis completed")
                vtResponse = analysisData;
                break;
              }
              await new Promise(r => setTimeout(r, 2000));
            }
            permalink = `https://www.virustotal.com/gui/url/${analysisId.replace(/-/g, '')}`;
          }
        } else {
          if (!res.ok) {
            const errorText = await res.text()
            throw new Error(`URL lookup failed with HTTP ${res.status}: ${errorText}`)
          }
          vtResponse = await res.json();
          permalink = `https://www.virustotal.com/gui/url/${encodedUrl}`;
        }
      } else {
        // For non-URL types (ip, domain, hash)
        const endpoints: Record<string, string> = {
          ip: `https://www.virustotal.com/api/v3/ip_addresses/${ioc}`,
          domain: `https://www.virustotal.com/api/v3/domains/${ioc}`,
          hash: `https://www.virustotal.com/api/v3/files/${ioc}`
        };
        const endpoint = endpoints[type];
        console.log(`Requesting ${type} endpoint: ${endpoint}`);
        
        const res = await fetch(endpoint, {
          headers: { 'x-apikey': vtApiKey! }
        });
        console.log(`${type} lookup status: ${res.status}`);
        
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`${type} lookup failed with HTTP ${res.status}: ${errorText}`)
        }
        
        vtResponse = await res.json();
        console.log(`${type} response received:`, JSON.stringify(vtResponse?.data?.attributes?.last_analysis_stats || {}));
        permalink = `https://www.virustotal.com/gui/${type === 'hash' ? 'file' : type}/${ioc}`;
      }

      console.log("VT response received:", JSON.stringify(vtResponse?.data?.attributes?.last_analysis_stats || {}));
      
      const stats = vtResponse?.data?.attributes?.last_analysis_stats || {};
      const detections = (stats.malicious || 0) + (stats.suspicious || 0);
      const total = Object.values(stats).reduce((a: number, b: number) => a + b, 0);

      results.push({
        source: 'VirusTotal',
        malicious: detections > 0,
        detections,
        totalVendors: total,
        formattedDetections: `${detections}/${total}`,
        scanDate: vtResponse?.data?.attributes?.last_analysis_date ? new Date(vtResponse.data.attributes.last_analysis_date * 1000).toISOString() : new Date().toISOString(),
        permalink,
        data: vtResponse?.data || null
      });
    } catch (e) {
      console.error("VirusTotal Error:", e);
      console.error("VirusTotal Error Stack:", e.stack);
      results.push({ 
        source: 'VirusTotal', 
        malicious: false, 
        error: e.message || "Unknown error",
        stack: e.stack || null
      });
    }

    // OTX
    try {
      const endpoints: Record<string, string> = {
        ip: `https://otx.alienvault.com/api/v1/indicators/IPv4/${ioc}`,
        domain: `https://otx.alienvault.com/api/v1/indicators/domain/${ioc}`,
        hash: `https://otx.alienvault.com/api/v1/indicators/file/${ioc.length === 32 ? 'MD5' : ioc.length === 40 ? 'SHA1' : 'SHA256'}/${ioc}`,
        url: `https://otx.alienvault.com/api/v1/indicators/url/${encodeURIComponent(ioc)}`
      }
      console.log(`OTX endpoint: ${endpoints[type]}`)
      
      const res = await fetch(endpoints[type], {
        headers: { 'X-OTX-API-KEY': otxApiKey! }
      })
      console.log(`OTX status: ${res.status}`)
      
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`OTX request failed with HTTP ${res.status}: ${errorText}`)
      }
      
      const data = await res.json()
      const count = data.pulse_info?.count || 0

      results.push({
        source: 'OTX',
        malicious: count > 0,
        detections: count,
        totalVendors: 1,
        modified: data.modified || null,
        data
      })
    } catch (e) {
      console.error("OTX Error:", e)
      results.push({ source: 'OTX', malicious: false, error: e.message || "Unknown error" })
    }

    // ThreatFox
    try {
      console.log(`ThreatFox search for: ${ioc}`)
      const res = await fetch('https://threatfox-api.abuse.ch/api/v1/', {
        method: 'POST',
        headers: {
          'Auth-Key': threatfoxApiKey!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: 'search_ioc', search_term: ioc, exact_match: true })
      })
      console.log(`ThreatFox status: ${res.status}`)
      
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`ThreatFox request failed with HTTP ${res.status}: ${errorText}`)
      }
      
      const data = await res.json()
      const detections = data.data?.length || 0
      console.log(`ThreatFox detections: ${detections}`)

      results.push({
        source: 'ThreatFox',
        malicious: detections > 0,
        detections,
        totalVendors: 1,
        queryStatus: data.query_status,
        firstSeen: data.data?.[0]?.first_seen || null,
        data
      })
    } catch (e) {
      console.error("ThreatFox Error:", e)
      results.push({ source: 'ThreatFox', malicious: false, error: e.message || "Unknown error" })
    }

    // URLhaus
    try {
      const endpointMap = {
        url: 'https://urlhaus-api.abuse.ch/v1/url/',
        domain: 'https://urlhaus-api.abuse.ch/v1/host/',
        ip: 'https://urlhaus-api.abuse.ch/v1/host/',
        hash: 'https://urlhaus-api.abuse.ch/v1/payload/'
      }
      const paramKey = type === 'hash' ? 'sha256_hash' : type === 'url' ? 'url' : 'host'
      console.log(`URLhaus request to ${endpointMap[type]} with ${paramKey}=${ioc}`)
      
      const res = await fetch(endpointMap[type], {
        method: 'POST',
        headers: {
          'Auth-Key': urlhausApiKey!,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `${paramKey}=${encodeURIComponent(ioc)}`
      })
      console.log(`URLhaus status: ${res.status}`)
      
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`URLhaus request failed with HTTP ${res.status}: ${errorText}`)
      }
      
      const data = await res.json()
      console.log(`URLhaus response: ${data.query_status}`)
      
      let isMalicious = false
      let dateAdded = null
      let threat = null

      if (type === 'url') {
        isMalicious = data.url_status === 'online'
        dateAdded = data.date_added
        threat = data.threat
      } else if (data.urls) {
        isMalicious = data.urls.some((u: any) => u.url_status === 'online')
        dateAdded = data.firstseen || data.date_added
        threat = data.urls?.[0]?.threat || null
      }

      results.push({
        source: 'URLhaus',
        malicious: isMalicious,
        detections: isMalicious ? 1 : 0,
        totalVendors: 1,
        queryStatus: data.query_status,
        dateAdded,
        threat,
        data
      })
    } catch (e) {
      console.error("URLhaus Error:", e)
      results.push({ source: 'URLhaus', malicious: false, error: e.message || "Unknown error" })
    }

    console.log("All integrations completed, returning results")
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    console.error("Main function error:", e)
    console.error("Main function error stack:", e.stack)
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

