-- Add resume source fields to onboarding table
ALTER TABLE onboarding 
ADD COLUMN resume_source ENUM('vendor', 'field_recruiter', 'referral', 'direct', 'other') AFTER gross_salary,
ADD COLUMN vendor_id INT AFTER resume_source,
ADD COLUMN vendor_name VARCHAR(255) AFTER vendor_id,
ADD COLUMN recruiter_id INT AFTER vendor_name,
ADD COLUMN recruiter_name VARCHAR(255) AFTER recruiter_id,
ADD COLUMN referral_name VARCHAR(255) AFTER recruiter_name,
ADD COLUMN referral_contact VARCHAR(20) AFTER referral_name,
ADD COLUMN referral_relation VARCHAR(100) AFTER referral_contact,
ADD COLUMN direct_source VARCHAR(100) AFTER referral_relation;

-- Add foreign key constraints
ALTER TABLE onboarding
ADD CONSTRAINT fk_onboarding_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_onboarding_recruiter FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE SET NULL;
