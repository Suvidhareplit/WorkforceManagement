-- Add additional onboarding fields for family, documents, and organizational details

ALTER TABLE onboarding
-- Cost Centre (auto-generated from resume source)
ADD COLUMN cost_centre VARCHAR(255) AFTER resume_source,

-- Parent details
ADD COLUMN father_name VARCHAR(255) AFTER emergency_contact_relation,
ADD COLUMN mother_name VARCHAR(255) AFTER father_name,
ADD COLUMN mother_dob DATE AFTER mother_name,

-- Statutory details
ADD COLUMN uan_number VARCHAR(12) AFTER mother_dob,
ADD COLUMN esic_ip_number VARCHAR(20) AFTER uan_number,

-- Organizational hierarchy (prepopulated from role)
ADD COLUMN function_name VARCHAR(255) AFTER role,
ADD COLUMN business_unit_name VARCHAR(255) AFTER function_name,
ADD COLUMN department_name VARCHAR(255) AFTER business_unit_name,
ADD COLUMN sub_department_name VARCHAR(255) AFTER department_name,

-- Spouse details
ADD COLUMN wife_name VARCHAR(255) AFTER mother_dob,
ADD COLUMN wife_dob DATE AFTER wife_name,

-- Child 1 details
ADD COLUMN child1_name VARCHAR(255) AFTER wife_dob,
ADD COLUMN child1_gender ENUM('male', 'female') AFTER child1_name,
ADD COLUMN child1_dob DATE AFTER child1_gender,

-- Child 2 details
ADD COLUMN child2_name VARCHAR(255) AFTER child1_dob,
ADD COLUMN child2_gender ENUM('male', 'female') AFTER child2_name,
ADD COLUMN child2_dob DATE AFTER child2_gender,

-- Nominee details
ADD COLUMN nominee_name VARCHAR(255) AFTER child2_dob,
ADD COLUMN nominee_relation VARCHAR(100) AFTER nominee_name;
