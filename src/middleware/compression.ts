import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

// Compression options
const compressionOptions = {
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
};

// Create and export the compression middleware
export const compressionMiddleware = compression(compressionOptions);

// Content-Encoding header middleware
export const contentEncodingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set Content-Encoding header for compressed responses
  res.setHeader('Vary', 'Accept-Encoding');
  next();
}; 