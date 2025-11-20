-- Migration: Fix Duplicate LWD Column and Reorder Columns
-- Date: 2025-11-21
-- Description: 
--   1. Drop duplicate last_working_day column (use existing lwd instead)
--   2. Reorder columns so profile_created*, created_at, updated_at are at the end

-- Step 1: Drop the duplicate last_working_day column
ALTER TABLE employees DROP COLUMN last_working_day;

-- Step 2: Drop the index that was created on last_working_day (ignore error if not exists)
DROP INDEX idx_last_working_day ON employees;

-- Step 3: Add index on the original lwd column instead
CREATE INDEX idx_lwd ON employees(lwd);

-- Step 4: Reorder columns - Move exit columns before profile/timestamp columns
-- First, we need to recreate the columns in the correct order
-- MySQL doesn't have a direct "reorder" command, but we can use MODIFY with AFTER

-- Move discussion_with_employee after exit_initiated_date
ALTER TABLE employees MODIFY COLUMN discussion_with_employee ENUM('yes','no') NULL AFTER exit_initiated_date;

-- Move discussion_summary after discussion_with_employee
ALTER TABLE employees MODIFY COLUMN discussion_summary TEXT NULL AFTER discussion_with_employee;

-- Move termination_notice_date after discussion_summary
ALTER TABLE employees MODIFY COLUMN termination_notice_date DATE NULL AFTER discussion_summary;

-- lwd is already in good position, ensure it's after exit_initiated_date
ALTER TABLE employees MODIFY COLUMN lwd DATE NULL COMMENT 'Last Working Day (LWD)' AFTER termination_notice_date;

-- Move notice_period_served after lwd
ALTER TABLE employees MODIFY COLUMN notice_period_served ENUM('yes','no') NULL AFTER lwd;

-- Move okay_to_rehire after notice_period_served
ALTER TABLE employees MODIFY COLUMN okay_to_rehire ENUM('yes','no') NULL AFTER notice_period_served;

-- Move absconding_letter_sent after okay_to_rehire
ALTER TABLE employees MODIFY COLUMN absconding_letter_sent ENUM('yes','no') NULL AFTER okay_to_rehire;

-- Move exit_additional_comments after absconding_letter_sent
ALTER TABLE employees MODIFY COLUMN exit_additional_comments TEXT NULL AFTER absconding_letter_sent;

-- Now move profile_created_at, profile_created_by, created_at, updated_at to the very end
ALTER TABLE employees MODIFY COLUMN profile_created_at TIMESTAMP NULL AFTER exit_additional_comments;
ALTER TABLE employees MODIFY COLUMN profile_created_by INT NULL AFTER profile_created_at;
ALTER TABLE employees MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER profile_created_by;
ALTER TABLE employees MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
