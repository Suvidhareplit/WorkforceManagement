-- Migration to remove function_name column and ensure manager_name exists in onboarding table
-- Function column is being removed from the application

-- Remove function_name column from onboarding table (if exists)
ALTER TABLE onboarding DROP COLUMN IF EXISTS function_name;

-- Remove function_name column from employees table (if exists)
ALTER TABLE employees DROP COLUMN IF EXISTS function_name;

-- Remove function_name column from offers table (if exists)
ALTER TABLE offers DROP COLUMN IF EXISTS function_name;

-- Ensure manager_name column exists in onboarding table
-- (It should already exist, but adding for safety)
-- ALTER TABLE onboarding ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255) NULL;

-- Note: Run these commands manually if your MySQL version doesn't support IF EXISTS:
-- ALTER TABLE onboarding DROP COLUMN function_name;
-- ALTER TABLE employees DROP COLUMN function_name;
-- ALTER TABLE offers DROP COLUMN function_name;
