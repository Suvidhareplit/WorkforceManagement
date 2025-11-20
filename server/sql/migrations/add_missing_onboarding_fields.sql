-- Add missing onboarding fields that are being updated but don't exist in schema
-- Note: If columns already exist, you'll get errors - that's okay, just ignore them

-- Employee and User IDs
ALTER TABLE onboarding ADD COLUMN employee_id VARCHAR(20) AFTER id;
ALTER TABLE onboarding ADD COLUMN user_id VARCHAR(20) AFTER employee_id;

-- Parent DOB (father_dob is missing, only father_name exists)
ALTER TABLE onboarding ADD COLUMN father_dob DATE AFTER father_name;

-- Bank details (bank_name is missing)
ALTER TABLE onboarding ADD COLUMN bank_name VARCHAR(255) AFTER name_as_per_bank;

-- Legal entity
ALTER TABLE onboarding ADD COLUMN legal_entity VARCHAR(255) AFTER nominee_relation;
