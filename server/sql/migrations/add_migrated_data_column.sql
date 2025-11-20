-- Add migrated_data column to onboarding table
-- This column tracks whether the candidate was added via migration upload (YES) or regular upload (NO)

-- Check if column exists before adding
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'hrms_db' 
                   AND TABLE_NAME = 'onboarding' 
                   AND COLUMN_NAME = 'migrated_data');

SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE onboarding ADD COLUMN migrated_data ENUM(''YES'', ''NO'') DEFAULT ''NO'' COMMENT ''YES for migration uploads, NO for regular uploads''',
              'SELECT ''Column already exists'' AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create index for efficient filtering
CREATE INDEX idx_migrated_data ON onboarding(migrated_data);

-- Update existing records to NO (they are all regular uploads)
UPDATE onboarding SET migrated_data = 'NO' WHERE migrated_data IS NULL;
