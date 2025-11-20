-- Migration: Add Exit Process Columns
-- Date: 2025-11-21
-- Description: Add columns to support comprehensive exit initiation process

-- Add new columns for exit management (ignore errors if columns already exist)
ALTER TABLE employees ADD COLUMN exit_initiated_date DATE NULL COMMENT 'Date when exit was initiated (DD-MMM-YYYY format)';
ALTER TABLE employees ADD COLUMN discussion_with_employee ENUM('yes', 'no') NULL COMMENT 'Whether discussion was held with employee';
ALTER TABLE employees ADD COLUMN discussion_summary TEXT NULL COMMENT 'Summary of discussion with employee';
ALTER TABLE employees ADD COLUMN termination_notice_date DATE NULL COMMENT 'Notice date for termination/resignation';
ALTER TABLE employees ADD COLUMN last_working_day DATE NULL COMMENT 'Employee last working day';
ALTER TABLE employees ADD COLUMN notice_period_served ENUM('yes', 'no') NULL COMMENT 'Whether employee served notice period (yes=original, no=other)';
ALTER TABLE employees ADD COLUMN okay_to_rehire ENUM('yes', 'no') NULL COMMENT 'Whether employee is okay to rehire';
ALTER TABLE employees ADD COLUMN absconding_letter_sent ENUM('yes', 'no') NULL COMMENT 'For absconding cases - whether letter was sent';
ALTER TABLE employees ADD COLUMN exit_additional_comments TEXT NULL COMMENT 'Additional comments during exit initiation';

-- Add indexes for better query performance
CREATE INDEX idx_exit_initiated_date ON employees(exit_initiated_date);
CREATE INDEX idx_last_working_day ON employees(last_working_day);
CREATE INDEX idx_okay_to_rehire ON employees(okay_to_rehire);

-- Add comments to existing exit columns for clarity
ALTER TABLE employees 
MODIFY COLUMN exit_type ENUM('voluntary', 'involuntary', 'absconding') NULL 
COMMENT 'Type of employee exit: voluntary (employee resignation), involuntary (company termination), absconding';

ALTER TABLE employees 
MODIFY COLUMN exit_reason TEXT NULL 
COMMENT 'Specific reason for exit from predefined dropdown list';
