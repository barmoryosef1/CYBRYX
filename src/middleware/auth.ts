import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';
import { Logger } from '../utils/logger';

const logger = new Logger();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    logger.error('Authentication failed:', { error });
    next(new ApiError(401, 'Invalid token'));
  }
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, 'Insufficient permissions');
      }

      next();
    } catch (error) {
      logger.error('Authorization failed:', { error });
      next(error);
    }
  };
};

// API key authentication middleware
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.header('X-API-Key');

    if (!apiKey) {
      throw new ApiError(401, 'API key required');
    }

    // Validate API key (implement your own validation logic)
    if (apiKey !== process.env.API_KEY) {
      throw new ApiError(401, 'Invalid API key');
    }

    next();
  } catch (error) {
    logger.error('API key authentication failed:', { error });
    next(error);
  }
}; 