-- ============================================================================
-- GENERIC ATTACHMENTS TABLE - For ALL Modules
-- Replaces leave_attachments with a more flexible structure
-- ============================================================================

-- Drop old leave-specific table if exists
DROP TABLE IF EXISTS leave_attachments;

-- Create generic attachments table for entire project
CREATE TABLE IF NOT EXISTS attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Entity reference (flexible for any module)
    entity_type VARCHAR(50) NOT NULL COMMENT 'LEAVE_APPLICATION, EMPLOYEE, HIRING, ONBOARDING, TRAINING, VENDOR, etc.',
    entity_id VARCHAR(100) NOT NULL COMMENT 'ID of the related entity (can be INT or UUID as string)',
    
    -- Employee/User reference
    employee_id INT NULL COMMENT 'Employee who owns this attachment (nullable for system uploads)',
    user_id INT NULL COMMENT 'User who uploaded (can differ from employee_id)',
    
    -- File information
    file_name VARCHAR(255) NOT NULL COMMENT 'Original file name',
    file_key VARCHAR(500) NOT NULL COMMENT 'S3 file key/path',
    file_url VARCHAR(1000) NULL COMMENT 'Full S3 URL (optional, can be regenerated)',
    file_size INT NOT NULL COMMENT 'File size in bytes',
    file_type VARCHAR(100) NOT NULL COMMENT 'MIME type (e.g., application/pdf)',
    file_extension VARCHAR(20) NULL COMMENT 'File extension (.pdf, .jpg, etc.)',
    
    -- Attachment metadata
    attachment_category VARCHAR(50) NULL COMMENT 'DOCUMENT, CERTIFICATE, RESUME, PHOTO, OTHER',
    attachment_subcategory VARCHAR(100) NULL COMMENT 'Specific type: MEDICAL_CERT, OFFER_LETTER, AADHAR, PAN, etc.',
    title VARCHAR(255) NULL COMMENT 'Custom title for the attachment',
    description TEXT NULL COMMENT 'Optional description',
    
    -- Tags for flexible categorization
    tags JSON NULL COMMENT 'Array of tags: ["urgent", "verified", "confidential"]',
    
    -- S3 storage details
    s3_bucket VARCHAR(255) NULL COMMENT 'S3 bucket name',
    s3_region VARCHAR(50) NULL COMMENT 'S3 region',
    
    -- Status and verification
    status ENUM('PENDING', 'VERIFIED', 'REJECTED', 'ARCHIVED') DEFAULT 'PENDING',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Soft delete flag',
    is_verified BOOLEAN DEFAULT FALSE COMMENT 'Admin verified the document',
    verified_by INT NULL COMMENT 'User who verified',
    verified_at DATETIME NULL COMMENT 'Verification timestamp',
    rejection_reason TEXT NULL COMMENT 'Why document was rejected',
    
    -- Privacy and access control
    is_confidential BOOLEAN DEFAULT FALSE COMMENT 'Requires special permission to view',
    is_public BOOLEAN DEFAULT FALSE COMMENT 'Can be viewed by everyone',
    allowed_roles JSON NULL COMMENT 'Array of roles that can access: ["admin", "hr", "manager"]',
    
    -- Expiration (for temporary documents)
    expires_at DATETIME NULL COMMENT 'Document expiration date (e.g., certificates)',
    
    -- Audit fields
    uploaded_by INT NOT NULL COMMENT 'User who uploaded',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL COMMENT 'Soft delete timestamp',
    deleted_by INT NULL COMMENT 'User who deleted',
    
    -- Indexes for fast queries
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_employee (employee_id),
    INDEX idx_user (user_id),
    INDEX idx_category (attachment_category),
    INDEX idx_subcategory (attachment_subcategory),
    INDEX idx_status (status),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at),
    
    -- Composite index for common queries
    INDEX idx_entity_active (entity_type, entity_id, is_active),
    INDEX idx_employee_active (employee_id, is_active),
    
    -- Unique constraint on S3 key
    UNIQUE KEY unique_file_key (file_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Generic attachments table for all modules in the project';

-- ============================================================================
-- ATTACHMENT TEMPLATES (Optional)
-- Pre-defined attachment types for consistency
-- ============================================================================

CREATE TABLE IF NOT EXISTS attachment_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Template details
    entity_type VARCHAR(50) NOT NULL COMMENT 'Which module this template is for',
    template_name VARCHAR(100) NOT NULL COMMENT 'Display name: "Medical Certificate", "Resume", etc.',
    template_code VARCHAR(50) NOT NULL COMMENT 'Unique code: MEDICAL_CERT, RESUME, AADHAR, etc.',
    
    -- Template configuration
    category VARCHAR(50) NULL COMMENT 'Default category',
    subcategory VARCHAR(100) NULL COMMENT 'Default subcategory',
    is_required BOOLEAN DEFAULT FALSE COMMENT 'Is this attachment mandatory?',
    max_file_size_mb INT DEFAULT 10 COMMENT 'Maximum file size in MB',
    allowed_extensions JSON NULL COMMENT 'Allowed file types: [".pdf", ".jpg"]',
    
    -- Display configuration
    icon VARCHAR(50) NULL COMMENT 'Icon name for UI',
    color VARCHAR(50) NULL COMMENT 'Color code for UI',
    help_text TEXT NULL COMMENT 'Instructions for user',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_entity_type (entity_type),
    INDEX idx_is_active (is_active),
    UNIQUE KEY unique_template (entity_type, template_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Pre-defined attachment templates for consistent categorization';

-- ============================================================================
-- SEED DATA: Common Attachment Templates
-- ============================================================================

INSERT INTO attachment_templates 
(entity_type, template_name, template_code, category, subcategory, is_required, allowed_extensions, icon, color, help_text)
VALUES
-- Leave Management
('LEAVE_APPLICATION', 'Medical Certificate', 'MEDICAL_CERT', 'DOCUMENT', 'MEDICAL_CERTIFICATE', TRUE, JSON_ARRAY('.pdf', '.jpg', '.png'), 'FileHeart', 'red', 'Upload medical certificate for sick leave (PDF or image)'),
('LEAVE_APPLICATION', 'Supporting Document', 'SUPPORTING_DOC', 'DOCUMENT', 'SUPPORTING_DOCUMENT', FALSE, JSON_ARRAY('.pdf', '.doc', '.docx'), 'FileText', 'blue', 'Any additional supporting documents'),

-- Employee/Onboarding
('EMPLOYEE', 'Aadhar Card', 'AADHAR', 'CERTIFICATE', 'IDENTITY_PROOF', TRUE, JSON_ARRAY('.pdf', '.jpg', '.png'), 'CreditCard', 'orange', 'Upload Aadhar card (both sides)'),
('EMPLOYEE', 'PAN Card', 'PAN', 'CERTIFICATE', 'IDENTITY_PROOF', TRUE, JSON_ARRAY('.pdf', '.jpg', '.png'), 'CreditCard', 'purple', 'Upload PAN card'),
('EMPLOYEE', 'Passport Photo', 'PHOTO', 'PHOTO', 'PROFILE_PHOTO', TRUE, JSON_ARRAY('.jpg', '.jpeg', '.png'), 'User', 'blue', 'Upload passport-size photo (max 2MB)'),
('EMPLOYEE', 'Resume/CV', 'RESUME', 'DOCUMENT', 'RESUME', FALSE, JSON_ARRAY('.pdf', '.doc', '.docx'), 'FileText', 'green', 'Upload latest resume'),
('EMPLOYEE', 'Offer Letter', 'OFFER_LETTER', 'DOCUMENT', 'OFFER_LETTER', TRUE, JSON_ARRAY('.pdf'), 'FileSignature', 'indigo', 'Signed offer letter'),
('EMPLOYEE', 'Joining Letter', 'JOINING_LETTER', 'DOCUMENT', 'JOINING_LETTER', TRUE, JSON_ARRAY('.pdf'), 'FileCheck', 'green', 'Signed joining letter'),

-- Education Certificates
('EMPLOYEE', '10th Certificate', 'TENTH_CERT', 'CERTIFICATE', 'EDUCATION', FALSE, JSON_ARRAY('.pdf', '.jpg'), 'GraduationCap', 'blue', 'Upload 10th standard certificate'),
('EMPLOYEE', '12th Certificate', 'TWELFTH_CERT', 'CERTIFICATE', 'EDUCATION', FALSE, JSON_ARRAY('.pdf', '.jpg'), 'GraduationCap', 'blue', 'Upload 12th standard certificate'),
('EMPLOYEE', 'Degree Certificate', 'DEGREE_CERT', 'CERTIFICATE', 'EDUCATION', TRUE, JSON_ARRAY('.pdf', '.jpg'), 'GraduationCap', 'purple', 'Upload degree/diploma certificate'),

-- Experience
('EMPLOYEE', 'Experience Letter', 'EXPERIENCE_LETTER', 'DOCUMENT', 'EXPERIENCE', FALSE, JSON_ARRAY('.pdf'), 'Briefcase', 'teal', 'Previous company experience letter'),
('EMPLOYEE', 'Relieving Letter', 'RELIEVING_LETTER', 'DOCUMENT', 'EXPERIENCE', FALSE, JSON_ARRAY('.pdf'), 'FileX', 'gray', 'Previous company relieving letter'),
('EMPLOYEE', 'Payslip', 'PAYSLIP', 'DOCUMENT', 'SALARY', FALSE, JSON_ARRAY('.pdf'), 'DollarSign', 'green', 'Last 3 months payslips'),

-- Hiring
('HIRING', 'Resume', 'RESUME', 'DOCUMENT', 'RESUME', TRUE, JSON_ARRAY('.pdf', '.doc', '.docx'), 'FileText', 'blue', 'Candidate resume'),
('HIRING', 'Cover Letter', 'COVER_LETTER', 'DOCUMENT', 'COVER_LETTER', FALSE, JSON_ARRAY('.pdf', '.doc', '.docx'), 'Mail', 'purple', 'Cover letter from candidate'),

-- Training
('TRAINING', 'Certificate', 'TRAINING_CERT', 'CERTIFICATE', 'TRAINING_CERTIFICATE', FALSE, JSON_ARRAY('.pdf', '.jpg'), 'Award', 'yellow', 'Training completion certificate'),
('TRAINING', 'Course Material', 'COURSE_MATERIAL', 'DOCUMENT', 'TRAINING_MATERIAL', FALSE, JSON_ARRAY('.pdf', '.ppt', '.pptx'), 'BookOpen', 'blue', 'Training course materials'),

-- Vendor
('VENDOR', 'GST Certificate', 'GST_CERT', 'CERTIFICATE', 'GST', TRUE, JSON_ARRAY('.pdf'), 'FileSpreadsheet', 'green', 'GST registration certificate'),
('VENDOR', 'PAN Card', 'VENDOR_PAN', 'CERTIFICATE', 'PAN', TRUE, JSON_ARRAY('.pdf', '.jpg'), 'CreditCard', 'purple', 'Vendor PAN card'),
('VENDOR', 'Agreement', 'AGREEMENT', 'DOCUMENT', 'CONTRACT', FALSE, JSON_ARRAY('.pdf'), 'FileSignature', 'red', 'Vendor agreement/contract')

ON DUPLICATE KEY UPDATE 
    template_name = VALUES(template_name),
    help_text = VALUES(help_text);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'Generic attachments system created successfully!' AS status,
       'Tables: attachments, attachment_templates' AS tables_created,
       'Ready for ALL modules (Leave, Hiring, Onboarding, Training, etc.)' AS ready;
