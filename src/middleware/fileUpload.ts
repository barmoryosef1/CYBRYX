import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { Logger } from '../utils/logger';

const logger = new Logger();

// Extend Express Request type to include files
declare global {
  namespace Express {
    interface Request {
      files?: Express.Multer.File[];
    }
  }
}

// Allowed file types
const allowedFileTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/json',
  'text/csv'
];

// File size limits (in bytes)
const fileSizeLimits = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  default: 2 * 1024 * 1024 // 2MB
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const sanitizedFilename = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();
    
    // Add timestamp to prevent filename collisions
    const timestamp = Date.now();
    cb(null, `${timestamp}-${sanitizedFilename}`);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!allowedFileTypes.includes(file.mimetype)) {
    logger.warn('Invalid file type attempted:', {
      filename: file.originalname,
      mimetype: file.mimetype
    });
    return cb(new Error('Invalid file type'));
  }
  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: fileSizeLimits.default,
    files: 5 // Maximum number of files
  }
});

// File upload middleware
export const fileUploadMiddleware = upload.array('files', 5);

// File validation middleware
export const fileValidation = (req: Request, res: Response, next: NextFunction) => {
  const files = (req.files as Express.Multer.File[]) || [];
  
  if (files.length === 0) {
    return res.status(400).json({
      error: 'No files uploaded',
      message: 'Please upload at least one file'
    });
  }

  // Validate each file
  for (const file of files) {
    // Check file size based on type
    const maxSize = file.mimetype.startsWith('image/')
      ? fileSizeLimits.image
      : fileSizeLimits.document;

    if (file.size > maxSize) {
      return res.status(413).json({
        error: 'File too large',
        message: `File ${file.originalname} exceeds the size limit of ${maxSize / (1024 * 1024)}MB`
      });
    }

    // Check for malicious file extensions
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    const maliciousExtensions = ['exe', 'bat', 'cmd', 'sh', 'php', 'js', 'html'];
    
    if (extension && maliciousExtensions.includes(extension)) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: `File type ${extension} is not allowed`
      });
    }
  }

  next();
};

// File cleanup middleware
export const fileCleanup = (req: Request, res: Response, next: NextFunction) => {
  // Clean up uploaded files if request fails
  res.on('finish', () => {
    if (res.statusCode >= 400 && req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach(file => {
        // Delete the file
        // Implement file deletion logic here
        logger.info('Cleaning up file:', { filename: file.filename });
      });
    }
  });

  next();
}; 