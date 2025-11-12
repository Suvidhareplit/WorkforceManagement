import multer from 'multer';
import { Request } from 'express';

// File filter to allow only specific file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  // Allowed file types for leave attachments
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error(`File type not allowed: ${file.mimetype}. Allowed types: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, XLS, XLSX`));
  }
};

// Configure multer for memory storage (we'll upload to S3 from memory)
const storage = multer.memoryStorage();

// Create multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Middleware for single file upload
export const uploadSingle = upload.single('file');

// Middleware for multiple file uploads (up to 5 files)
export const uploadMultiple = upload.array('files', 5);

// Error handling middleware for multer errors
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 10MB',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 5 files allowed',
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: error.message,
    });
  }
  
  if (error) {
    return res.status(400).json({
      error: 'Upload error',
      message: error.message,
    });
  }
  
  next();
};
