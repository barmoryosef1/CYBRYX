import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import bodyParser from 'body-parser';

const logger = new Logger();

// Body parser middleware with size limits
export const bodyParserMiddleware = [
  // Parse JSON bodies
  bodyParser.json({
    limit: '10mb', // Limit JSON body size to 10MB
    verify: (req: any, res, buf) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        throw new Error('Invalid JSON');
      }
    }
  }),

  // Parse URL-encoded bodies
  bodyParser.urlencoded({
    extended: true,
    limit: '10mb', // Limit URL-encoded body size to 10MB
    parameterLimit: 10000 // Limit number of parameters
  }),

  // Error handler for body parsing
  (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err) {
      logger.error('Body parsing error:', { error: err.message });
      return res.status(400).json({
        error: 'Invalid request body',
        message: err.message
      });
    }
    next();
  }
];

// Content type validation middleware
export const contentTypeValidation = (req: Request, res: Response, next: NextFunction) => {
  const contentType = req.headers['content-type'];

  // Skip validation for GET requests and requests without body
  if (req.method === 'GET' || !contentType) {
    return next();
  }

  // Validate content type
  if (!contentType.includes('application/json') && !contentType.includes('application/x-www-form-urlencoded')) {
    logger.warn('Invalid content type:', { contentType });
    return res.status(415).json({
      error: 'Unsupported Media Type',
      message: 'Only application/json and application/x-www-form-urlencoded are supported'
    });
  }

  next();
};

// Request size limit middleware
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.headers['content-length'];
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    
    // Limit request size to 10MB
    if (size > 10 * 1024 * 1024) {
      logger.warn('Request size limit exceeded:', { size });
      return res.status(413).json({
        error: 'Payload Too Large',
        message: 'Request body size exceeds the limit of 10MB'
      });
    }
  }

  next();
}; 