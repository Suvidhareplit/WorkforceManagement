-- Migration: Reorder Exit and Timestamp Columns
-- Date: 2025-11-21
-- Description: Move all exit columns together and profile/timestamp columns to the end

-- Move all exit-related columns to be together after lwd
-- Current order issue: exit columns are split, and timestamps are in the middle

-- Move discussion_with_employee after lwd
ALTER TABLE employees MODIFY COLUMN discussion_with_employee ENUM('yes','no') NULL 
COMMENT 'Whether discussion was held with employee' AFTER lwd;

-- Move discussion_summary after discussion_with_employee  
ALTER TABLE employees MODIFY COLUMN discussion_summary TEXT NULL 
COMMENT 'Summary of discussion with employee' AFTER discussion_with_employee;

-- Move termination_notice_date after discussion_summary
ALTER TABLE employees MODIFY COLUMN termination_notice_date DATE NULL 
COMMENT 'Notice date for termination/resignation' AFTER discussion_summary;

-- Move notice_period_served after termination_notice_date
ALTER TABLE employees MODIFY COLUMN notice_period_served ENUM('yes','no') NULL 
COMMENT 'Whether employee served notice period (yes=original, no=other)' AFTER termination_notice_date;

-- Move okay_to_rehire after notice_period_served
ALTER TABLE employees MODIFY COLUMN okay_to_rehire ENUM('yes','no') NULL 
COMMENT 'Whether employee is okay to rehire' AFTER notice_period_served;

-- Move absconding_letter_sent after okay_to_rehire
ALTER TABLE employees MODIFY COLUMN absconding_letter_sent ENUM('yes','no') NULL 
COMMENT 'For absconding cases - whether letter was sent' AFTER okay_to_rehire;

-- Move exit_additional_comments after absconding_letter_sent
ALTER TABLE employees MODIFY COLUMN exit_additional_comments TEXT NULL 
COMMENT 'Additional comments during exit initiation' AFTER absconding_letter_sent;

-- Now move all timestamp/profile columns to the VERY END
-- Move profile_created_at to after exit_additional_comments
ALTER TABLE employees MODIFY COLUMN profile_created_at TIMESTAMP NULL 
AFTER exit_additional_comments;

-- Move profile_created_by after profile_created_at
ALTER TABLE employees MODIFY COLUMN profile_created_by INT NULL 
AFTER profile_created_at;

-- Move created_at after profile_created_by
ALTER TABLE employees MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
AFTER profile_created_by;

-- Move updated_at to the very last column
ALTER TABLE employees MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
AFTER created_at;

-- Add index on lwd if not exists
CREATE INDEX idx_lwd ON employees(lwd);
