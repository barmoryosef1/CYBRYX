import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

const logger = new Logger();

// Request timeout middleware
export const timeoutMiddleware = (timeout: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Set timeout
    const timeoutId = setTimeout(() => {
      logger.warn('Request timeout:', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
      });

      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request Timeout',
          message: 'The request took too long to process'
        });
      }
    }, timeout);

    // Clear timeout when request completes
    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    next();
  };
};

// Slow request monitoring middleware
export const slowRequestMonitor = (threshold: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

      if (duration > threshold) {
        logger.warn('Slow request detected:', {
          method: req.method,
          url: req.originalUrl,
          duration: `${duration.toFixed(2)}ms`,
          threshold: `${threshold}ms`
        });
      }
    });

    next();
  };
};

// Request timeout error handler
export const timeoutErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'TimeoutError') {
    logger.error('Request timeout error:', {
      error: err.message,
      method: req.method,
      url: req.originalUrl
    });

    return res.status(408).json({
      error: 'Request Timeout',
      message: 'The request took too long to process'
    });
  }

  next(err);
}; 