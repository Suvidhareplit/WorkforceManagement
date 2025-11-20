-- ============================================================================
-- LEAVE ATTACHMENTS TABLE
-- Stores file attachments for leave applications (medical certificates, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS leave_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Reference to leave application (future enhancement)
    leave_application_id INT NULL COMMENT 'Reference to leave application',
    
    -- Reference to employee
    employee_id INT NOT NULL COMMENT 'Employee who uploaded the file',
    
    -- File information
    file_name VARCHAR(255) NOT NULL COMMENT 'Original file name',
    file_key VARCHAR(500) NOT NULL COMMENT 'S3 file key/path',
    file_url VARCHAR(1000) NULL COMMENT 'Full S3 URL (optional)',
    file_size INT NOT NULL COMMENT 'File size in bytes',
    file_type VARCHAR(100) NOT NULL COMMENT 'MIME type (e.g., application/pdf)',
    
    -- Attachment metadata
    attachment_type ENUM('MEDICAL_CERTIFICATE', 'SUPPORTING_DOCUMENT', 'OTHER') DEFAULT 'SUPPORTING_DOCUMENT',
    description TEXT NULL COMMENT 'Optional description of the attachment',
    
    -- S3 storage details
    s3_bucket VARCHAR(255) NULL COMMENT 'S3 bucket name',
    s3_region VARCHAR(50) NULL COMMENT 'S3 region',
    
    -- Status tracking
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Soft delete flag',
    is_verified BOOLEAN DEFAULT FALSE COMMENT 'Admin verified the document',
    verified_by INT NULL COMMENT 'Admin who verified',
    verified_at DATETIME NULL COMMENT 'Verification timestamp',
    
    -- Audit fields
    uploaded_by INT NOT NULL COMMENT 'User who uploaded (usually same as employee_id)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL COMMENT 'Soft delete timestamp',
    
    -- Indexes
    INDEX idx_leave_application (leave_application_id),
    INDEX idx_employee (employee_id),
    INDEX idx_attachment_type (attachment_type),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at),
    
    -- Unique constraint on S3 key
    UNIQUE KEY unique_file_key (file_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Leave application attachments stored in S3';

-- ============================================================================
-- LEAVE APPLICATIONS TABLE (Future Enhancement)
-- This table will store actual leave applications
-- ============================================================================

CREATE TABLE IF NOT EXISTS leave_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Employee and leave details
    employee_id INT NOT NULL,
    leave_type VARCHAR(50) NOT NULL COMMENT 'EL, SL_CL, PATERNITY, etc.',
    
    -- Leave dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,2) NOT NULL COMMENT 'Total leave days (can be 0.5 for half day)',
    
    -- Application details
    reason TEXT NOT NULL COMMENT 'Reason for leave',
    emergency_contact VARCHAR(100) NULL,
    emergency_phone VARCHAR(20) NULL,
    
    -- Status workflow
    status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'WITHDRAWN') DEFAULT 'PENDING',
    
    -- Approval chain
    applied_to INT NULL COMMENT 'Manager/approver employee_id',
    approved_by INT NULL COMMENT 'Final approver employee_id',
    approved_at DATETIME NULL,
    rejection_reason TEXT NULL,
    
    -- Document requirement tracking
    doc_required BOOLEAN DEFAULT FALSE COMMENT 'Is document required for this leave?',
    doc_submitted BOOLEAN DEFAULT FALSE COMMENT 'Has employee submitted documents?',
    doc_verified BOOLEAN DEFAULT FALSE COMMENT 'Has admin verified documents?',
    
    -- Audit trail
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    updated_by INT NULL,
    
    -- Indexes
    INDEX idx_employee (employee_id),
    INDEX idx_leave_type (leave_type),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Leave applications submitted by employees';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'Leave attachments table created successfully!' AS status,
       'Tables: leave_attachments, leave_applications' AS tables_created,
       'Ready for S3 integration' AS ready;
