import { Request, Response } from 'express';
import { pool as db } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import s3Service from '../services/s3Service';

class AttachmentController {
  /**
   * Upload file to S3 and save metadata to database
   * Works with ANY module: LEAVE, EMPLOYEE, HIRING, TRAINING, VENDOR, etc.
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

      // Generic fields for ANY module
      const { 
        entity_type,      // LEAVE_APPLICATION, EMPLOYEE, HIRING, TRAINING, etc.
        entity_id,        // ID of the related entity
        employee_id = null,
        user_id = null,
        attachment_category = 'DOCUMENT',
        attachment_subcategory = null,
        title = null,
        description = '',
        tags = null,
        is_confidential = false,
        expires_at = null
      } = req.body;

      const uploaded_by = (req as any).user?.id || user_id || employee_id || 1;

      // Validation
      if (!entity_type || !entity_id) {
        res.status(400).json({ 
          error: 'entity_type and entity_id are required',
          example: { entity_type: 'EMPLOYEE', entity_id: '123' }
        });
        return;
      }

      // Determine S3 folder based on entity type
      const folderMap: Record<string, string> = {
        'LEAVE_APPLICATION': 'leave-attachments',
        'EMPLOYEE': 'employee-documents',
        'HIRING': 'hiring-resumes',
        'ONBOARDING': 'onboarding-docs',
        'TRAINING': 'training-certificates',
        'VENDOR': 'vendor-documents',
        'INTERVIEW': 'interview-feedback',
      };
      const folder = folderMap[entity_type] || 'general-attachments';

      // Upload to S3
      const uploadResult = await s3Service.uploadFile(
        req.file.buffer,
        req.file.originalname,
        {
          folder,
          contentType: req.file.mimetype,
          metadata: {
            entityType: entity_type,
            entityId: entity_id.toString(),
            employeeId: employee_id?.toString() || 'system',
            uploadedAt: new Date().toISOString(),
          }
        }
      );

      // Extract file extension
      const fileExtension = req.file.originalname.split('.').pop() || '';

      // Parse tags if string
      let tagsJson = tags;
      if (typeof tags === 'string') {
        try {
          tagsJson = JSON.parse(tags);
        } catch {
          tagsJson = null;
        }
      }

      // Save metadata to database
      const [result] = await db.execute<ResultSetHeader>(
        `INSERT INTO attachments 
        (entity_type, entity_id, employee_id, user_id, file_name, file_key, file_url, 
         file_size, file_type, file_extension, attachment_category, attachment_subcategory,
         title, description, tags, s3_bucket, s3_region, is_confidential, expires_at, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entity_type,
          entity_id.toString(),
          employee_id,
          user_id,
          req.file.originalname,
          uploadResult.fileKey,
          uploadResult.fileUrl,
          uploadResult.fileSize,
          uploadResult.contentType,
          fileExtension,
          attachment_category,
          attachment_subcategory,
          title || req.file.originalname,
          description,
          tagsJson ? JSON.stringify(tagsJson) : null,
          uploadResult.bucket,
          s3Service['region'],
          is_confidential ? 1 : 0,
          expires_at,
          uploaded_by,
        ]
      );

      // Fetch the created attachment
      const [attachments] = await db.execute<RowDataPacket[]>(
        'SELECT * FROM attachments WHERE id = ?',
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
        'SELECT * FROM attachments WHERE id = ? AND is_active = TRUE',
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
        `SELECT id, entity_type, entity_id, employee_id, file_name, file_size, file_type, 
                attachment_category, attachment_subcategory, title, description, 
                tags, is_verified, verified_at, created_at, updated_at
         FROM attachments 
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
   * Get all attachments for a specific entity (e.g., all files for a hiring application)
   */
  public async getEntityAttachments(req: Request, res: Response): Promise<void> {
    try {
      const { entity_type, entity_id } = req.params;

      const [attachments] = await db.execute<RowDataPacket[]>(
        `SELECT id, entity_type, entity_id, employee_id, file_name, file_size, file_type, 
                attachment_category, attachment_subcategory, title, description, 
                tags, is_verified, verified_at, status, created_at, updated_at
         FROM attachments 
         WHERE entity_type = ? AND entity_id = ? AND is_active = TRUE
         ORDER BY created_at DESC`,
        [entity_type, entity_id]
      );

      res.json({ attachments, count: attachments.length });
    } catch (error: any) {
      console.error('Get entity attachments error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch entity attachments', 
        message: error.message 
      });
    }
  }

  /**
   * Get attachment templates for a module
   */
  public async getAttachmentTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { entity_type } = req.params;

      const [templates] = await db.execute<RowDataPacket[]>(
        `SELECT * FROM attachment_templates 
         WHERE entity_type = ? AND is_active = TRUE
         ORDER BY display_order, template_name`,
        [entity_type]
      );

      res.json({ templates });
    } catch (error: any) {
      console.error('Get templates error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch templates', 
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
        'SELECT * FROM attachments WHERE id = ? AND is_active = TRUE',
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
        `UPDATE attachments 
         SET is_active = FALSE, deleted_at = NOW(), deleted_by = ?
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
        `UPDATE attachments 
         SET is_verified = TRUE, status = 'VERIFIED', verified_by = ?, verified_at = NOW()
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
