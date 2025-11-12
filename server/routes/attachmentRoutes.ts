import { Router } from 'express';
import attachmentController from '../controllers/attachmentController';
import { uploadSingle, handleUploadError } from '../middleware/uploadMiddleware';

const router = Router();

/**
 * @route   POST /api/attachments/upload
 * @desc    Upload a file to S3
 * @access  Authenticated
 * @body    file (multipart), employee_id, attachment_type, description
 */
router.post(
  '/upload',
  uploadSingle,
  handleUploadError,
  attachmentController.uploadAttachment.bind(attachmentController)
);

/**
 * @route   GET /api/attachments/:id/download
 * @desc    Get presigned URL for secure file download
 * @access  Authenticated
 * @query   expiresIn (optional, default 3600 seconds)
 */
router.get(
  '/:id/download',
  attachmentController.getPresignedUrl.bind(attachmentController)
);

/**
 * @route   GET /api/attachments/employee/:employee_id
 * @desc    Get all attachments for an employee
 * @access  Authenticated
 */
router.get(
  '/employee/:employee_id',
  attachmentController.getEmployeeAttachments.bind(attachmentController)
);

/**
 * @route   DELETE /api/attachments/:id
 * @desc    Delete an attachment
 * @access  Authenticated
 */
router.delete(
  '/:id',
  attachmentController.deleteAttachment.bind(attachmentController)
);

/**
 * @route   POST /api/attachments/:id/verify
 * @desc    Verify an attachment (admin only)
 * @access  Admin
 */
router.post(
  '/:id/verify',
  attachmentController.verifyAttachment.bind(attachmentController)
);

/**
 * @route   GET /api/attachments/status
 * @desc    Check S3 service configuration status
 * @access  Public
 */
router.get(
  '/status',
  attachmentController.getS3Status.bind(attachmentController)
);

export default router;
