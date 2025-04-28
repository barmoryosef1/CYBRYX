import { Request, Response, NextFunction } from 'express';

interface SecurityHeaders {
  [key: string]: string;
}

export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  const securityHeaders: SecurityHeaders = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });

  // Check for suspicious query parameters
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /eval\(/i,
    /onload/i,
    /onerror/i,
    /alert\(/i,
    /document\./i,
    /window\./i
  ];

  const queryString = JSON.stringify(req.query);
  const hasSuspiciousQuery = suspiciousPatterns.some(pattern => pattern.test(queryString));

  if (hasSuspiciousQuery) {
    return res.status(403).json({
      error: 'Forbidden: Suspicious query parameters detected'
    });
  }

  // Validate Content-Type for POST requests
  if (req.method === 'POST' && req.headers['content-type'] !== 'application/json') {
    return res.status(415).json({
      error: 'Unsupported Media Type: Only application/json is accepted'
    });
  }

  // Add timestamp to request
  req.body = {
    ...req.body,
    timestamp: new Date().toISOString()
  };

  next();
}; 