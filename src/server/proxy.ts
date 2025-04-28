import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({
  path: join(__dirname, '../../.env')
});

const app = express();
const port = 3005;

// Enable CORS for all routes with more specific options
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Key'],
  credentials: true
}));

app.use(express.json());

interface AbuseReport {
  reportedAt: string;
  comment: string;
  categories: number[];
  reporterId: number;
  reporterCountryCode: string;
  reporterCountryName: string;
}

interface AbuseIPDBResponse {
  data: {
    ipAddress: string;
    isPublic: boolean;
    ipVersion: number;
    isWhitelisted: boolean;
    abuseConfidenceScore: number;
    countryCode: string;
    countryName: string;
    usageType: string;
    isp: string;
    domain: string;
    hostnames: string[];
    isTor: boolean;
    totalReports: number;
    numDistinctUsers: number;
    lastReportedAt: string;
    reports: AbuseReport[];
  };
  errors?: Array<{ detail: string }>;
}

const ABUSEIPDB_API_KEY = process.env.VITE_ABUSEIPDB_API_KEY;
const ABUSEIPDB_BASE_URL = 'https://api.abuseipdb.com/api/v2';

console.log('Starting proxy server with API key:', ABUSEIPDB_API_KEY ? 'Present' : 'Missing');

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test AbuseIPDB API connectivity
    const testResponse = await fetch(`${ABUSEIPDB_BASE_URL}/check?ipAddress=8.8.8.8&maxAgeInDays=30`, {
      headers: {
        'Key': ABUSEIPDB_API_KEY || '',
        'Accept': 'application/json',
      },
    });
    
    const apiStatus = testResponse.ok ? 'connected' : 'error';
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      api: {
        status: apiStatus,
        statusCode: testResponse.status
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      api: {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

app.get('/api/check-ip', async (req, res) => {
  try {
    const { ip, maxAge = 30 } = req.query;
    
    console.log('Received request to check IP:', {
      ip,
      maxAge,
      headers: req.headers
    });
    
    if (!ip || typeof ip !== 'string') {
      console.log('Invalid IP address provided');
      return res.status(400).json({ error: 'IP address is required' });
    }

    if (!ABUSEIPDB_API_KEY) {
      console.error('AbuseIPDB API key is missing');
      return res.status(500).json({ error: 'API key configuration error' });
    }

    // Validate maxAge
    const parsedMaxAge = Number(maxAge);
    if (isNaN(parsedMaxAge) || parsedMaxAge < 1 || parsedMaxAge > 365) {
      console.log('Invalid maxAge value:', maxAge);
      return res.status(400).json({ error: 'maxAge must be between 1 and 365' });
    }

    const url = `${ABUSEIPDB_BASE_URL}/check?ipAddress=${ip}&maxAgeInDays=${parsedMaxAge}&verbose`;
    console.log('Making request to AbuseIPDB:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Key': ABUSEIPDB_API_KEY,
        'Accept': 'application/json',
      },
    });

    console.log('AbuseIPDB Response Status:', response.status);
    
    const data = await response.json() as AbuseIPDBResponse;

    if (!response.ok) {
      console.error('AbuseIPDB API error:', data);
      throw new Error(data.errors?.[0]?.detail || `HTTP ${response.status}: Failed to fetch data from AbuseIPDB`);
    }

    console.log('Successfully retrieved data for IP:', ip);
    res.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
}); 