-- Migration: Add request_date column to hiring_requests table
-- This adds a datetime column to capture when the hiring request was made

ALTER TABLE hiring_requests 
ADD COLUMN request_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have request_date same as created_at
UPDATE hiring_requests 
SET request_date = created_at 
WHERE request_date IS NULL OR request_date = '0000-00-00 00:00:00';
