-- Alter candidates table to store names instead of IDs
-- This removes foreign key constraints and stores actual values

-- First, add new columns for names
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS role_name TEXT,
ADD COLUMN IF NOT EXISTS city_name TEXT,
ADD COLUMN IF NOT EXISTS cluster_name TEXT,
ADD COLUMN IF NOT EXISTS vendor_name TEXT,
ADD COLUMN IF NOT EXISTS recruiter_name TEXT;

-- Copy data from related tables
UPDATE candidates c
SET 
  role_name = r.name,
  city_name = ct.name,
  cluster_name = cl.name,
  vendor_name = v.name,
  recruiter_name = rc.name
FROM roles r, cities ct, clusters cl
LEFT JOIN vendors v ON c.vendor_id = v.id
LEFT JOIN recruiters rc ON c.recruiter_id = rc.id
WHERE c.role_id = r.id 
  AND c.city_id = ct.id 
  AND c.cluster_id = cl.id;

-- Drop the old ID columns
ALTER TABLE candidates 
DROP COLUMN IF EXISTS role_id CASCADE,
DROP COLUMN IF EXISTS city_id CASCADE,
DROP COLUMN IF EXISTS cluster_id CASCADE,
DROP COLUMN IF EXISTS vendor_id CASCADE,
DROP COLUMN IF EXISTS recruiter_id CASCADE;

-- Rename new columns to original names
ALTER TABLE candidates 
RENAME COLUMN role_name TO role,
RENAME COLUMN city_name TO city,
RENAME COLUMN cluster_name TO cluster,
RENAME COLUMN vendor_name TO vendor,
RENAME COLUMN recruiter_name TO recruiter;

-- Make required fields NOT NULL
ALTER TABLE candidates 
ALTER COLUMN role SET NOT NULL,
ALTER COLUMN city SET NOT NULL,
ALTER COLUMN cluster SET NOT NULL;