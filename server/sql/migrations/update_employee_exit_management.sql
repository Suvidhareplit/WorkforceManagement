-- Migration: Update Employee Exit Management
-- Date: 2025-11-20
-- Description: 
--   1. Change working_status to 'working' or 'relieved' based on exit_date
--   2. Add exit_type column (voluntary, involuntary, absconding)
--   3. Add exit_reason column for specific exit reason

-- Step 1: Add new columns for exit management (skip if already exists)
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'hrms_db' AND TABLE_NAME = 'employees' AND COLUMN_NAME = 'exit_type');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE employees ADD COLUMN exit_type ENUM(''voluntary'', ''involuntary'', ''absconding'') NULL AFTER date_of_exit',
    'SELECT ''Column exit_type already exists'' AS msg');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'hrms_db' AND TABLE_NAME = 'employees' AND COLUMN_NAME = 'exit_reason');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE employees ADD COLUMN exit_reason TEXT NULL AFTER exit_type',
    'SELECT ''Column exit_reason already exists'' AS msg');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

-- Step 2: Temporarily expand the enum to include both old and new values
ALTER TABLE employees 
MODIFY COLUMN working_status ENUM('active', 'inactive', 'terminated', 'resigned', 'working', 'relieved') DEFAULT 'active';

-- Step 3: Update all records to use new values
UPDATE employees 
SET working_status = CASE 
    WHEN date_of_exit IS NULL THEN 'working'
    ELSE 'relieved'
END;

-- Step 4: Now change the enum to only have the new values
ALTER TABLE employees 
MODIFY COLUMN working_status ENUM('working', 'relieved') DEFAULT 'working';

-- Step 5: Add index for better query performance (ignore errors if already exists)
CREATE INDEX idx_exit_type ON employees(exit_type);
CREATE INDEX idx_date_of_exit ON employees(date_of_exit);

-- Step 6: Add comments to document the columns
ALTER TABLE employees 
MODIFY COLUMN working_status ENUM('working', 'relieved') DEFAULT 'working' 
COMMENT 'working: employee is active (no exit_date), relieved: employee has left (has exit_date)';

ALTER TABLE employees 
MODIFY COLUMN exit_type ENUM('voluntary', 'involuntary', 'absconding') NULL 
COMMENT 'Type of employee exit: voluntary, involuntary, or absconding';

ALTER TABLE employees 
MODIFY COLUMN exit_reason TEXT NULL 
COMMENT 'Specific reason for exit from predefined dropdown list';
