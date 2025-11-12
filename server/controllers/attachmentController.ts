import { Request, Response } from 'express';
import { pool as db } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import s3Service from '../services/s3Service';

class AttachmentController {
  /**
   * Upload file to S3 and save metadata to database
   */
  public async uploadAttachment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // Check if S3 is configured
      if (!s3Service.isReady()) {
        res.status(503).json({ 
          error: 'S3 service not configured',
          message: 'File uploads are currently disabled. Please configure AWS S3 credentials.'
        });
        return;
      }

      const { employee_id, attachment_type = 'SUPPORTING_DOCUMENT', description = '' } = req.body;
      const uploaded_by = (req as any).user?.id || employee_id;

      if (!employee_id) {
        res.status(400).json({ error: 'employee_id is required' });
        return;
      }

      // Upload to S3
      const uploadResult = await s3Service.uploadFile(
        req.file.buffer,
        req.file.originalname,
        {
          folder: 'leave-attachments',
          contentType: req.file.mimetype,
          metadata: {
            employeeId: employee_id.toString(),
            attachmentType: attachment_type,
            uploadedAt: new Date().toISOString(),
          }
        }
      );

      // Save metadata to database
      const [result] = await db.execute<ResultSetHeader>(
        `INSERT INTO leave_attachments 
        (employee_id, file_name, file_key, file_url, file_size, file_type, 
         attachment_type, description, s3_bucket, s3_region, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee_id,
          req.file.originalname,
          uploadResult.fileKey,
          uploadResult.fileUrl,
          uploadResult.fileSize,
          uploadResult.contentType,
          attachment_type,
          description,
          uploadResult.bucket,
          s3Service['region'],
          uploaded_by,
        ]
      );

      // Fetch the created attachment
      const [attachments] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM leave_attachments WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        message: 'File uploaded successfully',
        attachment: attachments[0],
        s3: uploadResult,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: 'Upload failed', 
        message: error.message 
      });
    }
  }

  /**
   * Get presigned URL for secure file download
   */
  public async getPresignedUrl(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const expiresIn = parseInt(req.query.expiresIn as string) || 3600;

      if (!s3Service.isReady()) {
        res.status(503).json({ 
          error: 'S3 service not configured' 
        });
        return;
      }

      // Get attachment from database
      const [attachments] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM leave_attachments WHERE id = ? AND is_active = TRUE',
        [id]
      );

      if (attachments.length === 0) {
        res.status(404).json({ error: 'Attachment not found' });
        return;
      }

      const attachment = attachments[0];

      // Generate presigned URL
      const presignedUrl = await s3Service.getPresignedUrl(
        attachment.file_key,
        expiresIn
      );

      res.json({
        presignedUrl,
        expiresIn,
        fileName: attachment.file_name,
        fileType: attachment.file_type,
        fileSize: attachment.file_size,
      });
    } catch (error: any) {
      console.error('Presigned URL error:', error);
      res.status(500).json({ 
        error: 'Failed to generate download URL', 
        message: error.message 
      });
    }
  }

  /**
   * Get all attachments for an employee
   */
  public async getEmployeeAttachments(req: Request, res: Response): Promise<void> {
    try {
      const { employee_id } = req.params;

      const [attachments] = await db.execute<RowDataPacket[]>(
        `SELECT id, employee_id, file_name, file_size, file_type, 
                attachment_type, description, is_verified, verified_at, 
                created_at, updated_at
         FROM leave_attachments 
         WHERE employee_id = ? AND is_active = TRUE
         ORDER BY created_at DESC`,
        [employee_id]
      );

      res.json({ attachments });
    } catch (error: any) {
      console.error('Get attachments error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch attachments', 
        message: error.message 
      });
    }
  }

  /**
   * Delete attachment (soft delete + S3 deletion)
   */
  public async deleteAttachment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted_by = (req as any).user?.id;

      // Get attachment info
      const [attachments] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM leave_attachments WHERE id = ? AND is_active = TRUE',
        [id]
      );

      if (attachments.length === 0) {
        res.status(404).json({ error: 'Attachment not found' });
        return;
      }

      const attachment = attachments[0];

      // Delete from S3 if configured
      if (s3Service.isReady()) {
        try {
          await s3Service.deleteFile(attachment.file_key);
        } catch (error) {
          console.error('S3 delete error (continuing with DB delete):', error);
        }
      }

      // Soft delete in database
      await db.execute(
        `UPDATE leave_attachments 
         SET is_active = FALSE, deleted_at = NOW(), updated_by = ?
         WHERE id = ?`,
        [deleted_by, id]
      );

      res.json({ 
        message: 'Attachment deleted successfully',
        attachment_id: id 
      });
    } catch (error: any) {
      console.error('Delete attachment error:', error);
      res.status(500).json({ 
        error: 'Failed to delete attachment', 
        message: error.message 
      });
    }
  }

  /**
   * Verify attachment (admin only)
   */
  public async verifyAttachment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const verified_by = (req as any).user?.id;

      await db.execute(
        `UPDATE leave_attachments 
         SET is_verified = TRUE, verified_by = ?, verified_at = NOW()
         WHERE id = ?`,
        [verified_by, id]
      );

      res.json({ 
        message: 'Attachment verified successfully',
        attachment_id: id 
      });
    } catch (error: any) {
      console.error('Verify attachment error:', error);
      res.status(500).json({ 
        error: 'Failed to verify attachment', 
        message: error.message 
      });
    }
  }

  /**
   * Get S3 service status
   */
  public async getS3Status(req: Request, res: Response): Promise<void> {
    try {
      const isConfigured = s3Service.isReady();
      
      res.json({
        configured: isConfigured,
        message: isConfigured 
          ? 'S3 service is ready for file uploads' 
          : 'S3 service is not configured. Please set AWS credentials.',
        bucket: isConfigured ? s3Service['bucket'] : null,
        region: isConfigured ? s3Service['region'] : null,
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Failed to check S3 status', 
        message: error.message 
      });
    }
  }
}

export default new AttachmentController();
