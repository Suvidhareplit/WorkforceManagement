-- Migration: Update Employee Exit Management
-- Date: 2025-11-20
-- Description: 
--   1. Change working_status to 'working' or 'relieved' based on exit_date
--   2. Add exit_type column (voluntary, involuntary, absconding)
--   3. Add exit_reason column for specific exit reason

-- Step 1: Add new columns for exit management
ALTER TABLE employees 
ADD COLUMN exit_type ENUM('voluntary', 'involuntary', 'absconding') NULL AFTER date_of_exit;

ALTER TABLE employees 
ADD COLUMN exit_reason TEXT NULL AFTER exit_type;

-- Step 2: Modify working_status enum to only have 'working' and 'relieved'
-- First, update existing values to map to new values
UPDATE employees 
SET working_status = CASE 
    WHEN date_of_exit IS NULL OR date_of_exit = '' THEN 'active'
    ELSE 'inactive'
END;

-- Step 3: Change the column definition
-- Note: MySQL doesn't support computed columns for ENUM directly, so we'll use a workaround
-- We'll change the ENUM to just 'working' and 'relieved'
ALTER TABLE employees 
MODIFY COLUMN working_status ENUM('working', 'relieved') DEFAULT 'working';

-- Step 4: Update the data to new values
UPDATE employees 
SET working_status = CASE 
    WHEN date_of_exit IS NULL OR date_of_exit = '' THEN 'working'
    ELSE 'relieved'
END;

-- Step 5: Add index for better query performance
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
