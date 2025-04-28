import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import xss from 'xss-clean';

const logger = new Logger();

// Sanitize middleware
export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize request body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize route parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Sanitization error:', { error });
    next(error);
  }
};

// Helper function to sanitize objects
const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeValue(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeValue);
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeValue(obj[key]);
    }
  }
  return sanitized;
};

// Helper function to sanitize values
const sanitizeValue = (value: any): any => {
  if (typeof value === 'string') {
    // Remove HTML tags
    value = value.replace(/<[^>]*>/g, '');
    
    // Remove potentially dangerous characters
    value = value.replace(/[<>"'&]/g, '');
    
    // Trim whitespace
    value = value.trim();
  }
  return value;
};

// XSS protection middleware
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  // Set XSS protection headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  next();
};

// SQL injection protection middleware
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /insert|update|delete|drop|truncate|alter/i
  ];

  const checkForInjection = (value: string) => {
    return sqlInjectionPatterns.some(pattern => pattern.test(value));
  };

  try {
    // Check request body
    if (req.body) {
      const bodyString = JSON.stringify(req.body);
      if (checkForInjection(bodyString)) {
        throw new Error('Potential SQL injection detected in request body');
      }
    }

    // Check query parameters
    if (req.query) {
      const queryString = JSON.stringify(req.query);
      if (checkForInjection(queryString)) {
        throw new Error('Potential SQL injection detected in query parameters');
      }
    }

    // Check route parameters
    if (req.params) {
      const paramsString = JSON.stringify(req.params);
      if (checkForInjection(paramsString)) {
        throw new Error('Potential SQL injection detected in route parameters');
      }
    }

    next();
  } catch (error) {
    logger.error('SQL injection protection error:', { error });
    res.status(400).json({
      error: 'Invalid request',
      message: 'Potential security threat detected'
    });
  }
}; 