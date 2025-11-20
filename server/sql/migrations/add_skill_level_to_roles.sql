-- Migration: Add skill_level column to roles table
-- Created: 2025-11-12
-- Description: Adds skill_level field to roles table for tracking role complexity/expertise level

-- Check if column exists before adding
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'roles'
  AND COLUMN_NAME = 'skill_level';

-- Add column if it doesn't exist
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE roles ADD COLUMN skill_level VARCHAR(50) NULL AFTER sub_department_id',
    'SELECT "Column skill_level already exists in roles table" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create index for better query performance
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'roles'
  AND INDEX_NAME = 'idx_skill_level';

SET @sql_index = IF(@index_exists = 0,
    'CREATE INDEX idx_skill_level ON roles(skill_level)',
    'SELECT "Index idx_skill_level already exists" AS message'
);

PREPARE stmt_index FROM @sql_index;
EXECUTE stmt_index;
DEALLOCATE PREPARE stmt_index;

-- Display success message
SELECT 'Migration completed: skill_level column added to roles table' AS status;
