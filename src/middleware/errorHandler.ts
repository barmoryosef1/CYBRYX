import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Logger } from '../utils/logger';
import { ApiError } from '../types/errors';

// Error handler middleware
export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const logger = new Logger();

  // Log the error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Handle API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid Token',
      message: 'The authentication token is invalid',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle token expiration
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token Expired',
      message: 'The authentication token has expired',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle unknown errors
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
  const logger = new Logger();
  
  logger.warn('Route not found:', {
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    error: 'Not Found',
    message: `The route ${req.path} does not exist`,
    timestamp: new Date().toISOString()
  });
}; 