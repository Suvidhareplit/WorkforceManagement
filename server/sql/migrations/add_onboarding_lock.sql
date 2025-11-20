-- ============================================================================
-- ADD LOCKING MECHANISM TO ONBOARDING TABLE
-- ============================================================================

-- Add is_locked field to prevent editing of onboarded records
ALTER TABLE onboarding 
ADD COLUMN is_locked BOOLEAN DEFAULT FALSE AFTER onboarding_status,
ADD COLUMN locked_at TIMESTAMP NULL AFTER is_locked,
ADD COLUMN locked_by INT NULL AFTER locked_at,
ADD CONSTRAINT fk_onboarding_locked_by 
    FOREIGN KEY (locked_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_onboarding_locked ON onboarding(is_locked);
CREATE INDEX idx_onboarding_status_locked ON onboarding(onboarding_status, is_locked);

-- Add comment
ALTER TABLE onboarding 
MODIFY COLUMN is_locked BOOLEAN DEFAULT FALSE COMMENT 'Locks the record once onboarded - prevents further editing';

-- ============================================================================
-- VERIFY NEW COLUMNS
-- ============================================================================
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'onboarding' 
    AND TABLE_SCHEMA = DATABASE()
    AND COLUMN_NAME IN ('is_locked', 'locked_at', 'locked_by')
ORDER BY ORDINAL_POSITION;
