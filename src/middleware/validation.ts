import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Common validation rules
export const commonValidationRules = [
  body('*').trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  body('username').isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_-]+$/),
  body('ip').isIP(),
  body('url').isURL(),
  body('timestamp').isISO8601(),
  body('limit').optional().isInt({ min: 1, max: 100 }),
  body('offset').optional().isInt({ min: 0 })
];

// Validation error handler
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

// Sanitize query parameters
export const sanitizeQuery = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  Object.keys(req.query).forEach(key => {
    if (typeof req.query[key] === 'string') {
      req.query[key] = (req.query[key] as string)
        .replace(/[<>]/g, '') // Remove < and >
        .trim();
    }
  });

  // Sanitize route parameters
  Object.keys(req.params).forEach(key => {
    if (typeof req.params[key] === 'string') {
      req.params[key] = (req.params[key] as string)
        .replace(/[<>]/g, '')
        .trim();
    }
  });

  next();
};

// Validate API key format
export const validateApiKey = [
  body('apiKey').matches(/^[a-zA-Z0-9]{32,}$/),
  validate
]; 