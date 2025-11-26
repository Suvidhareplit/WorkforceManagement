-- Insert Sample Master Data
-- Date: 2025-11-27
-- Description: Insert sample data for testing designation functionality

-- Insert Functions
INSERT INTO functions (name, code, created_at) VALUES
('Technology', 'TECH', NOW()),
('Operations', 'OPS', NOW());

-- Insert Business Units
INSERT INTO business_units (name, code, created_at) VALUES
('Engineering', 'ENG', NOW()),
('Field Operations', 'FIELD_OPS', NOW());

-- Insert Departments
INSERT INTO departments (name, code, created_at) VALUES
('Software Development', 'SW_DEV', NOW()),
('Quality Assurance', 'QA', NOW()),
('Vehicle Operations', 'VEH_OPS', NOW());

-- Insert Sub Departments
INSERT INTO sub_departments (name, code, created_at) VALUES
('Backend Development', 'BACKEND', NOW()),
('Frontend Development', 'FRONTEND', NOW()),
('Manual Testing', 'MANUAL_QA', NOW()),
('Automation Testing', 'AUTO_QA', NOW()),
('Vehicle Maintenance', 'VEH_MAINT', NOW()),
('Fleet Management', 'FLEET_MGMT', NOW());

-- Insert Roles
INSERT INTO roles (name, code, created_at) VALUES
('Software Engineer', 'SWE', NOW()),
('Quality Analyst', 'QA_ANALYST', NOW()),
('DevOps Engineer', 'DEVOPS', NOW()),
('Product Manager', 'PM', NOW()),
('Technician', 'TECH', NOW()),
('Operations Manager', 'OPS_MGR', NOW());

-- Insert Clusters
INSERT INTO clusters (name, code, created_at) VALUES
('Bangalore Central', 'BLR_CENTRAL', NOW()),
('Bangalore North', 'BLR_NORTH', NOW()),
('Mumbai Central', 'MUM_CENTRAL', NOW()),
('Delhi NCR', 'DEL_NCR', NOW());

-- Insert Vendors
INSERT INTO vendors (name, code, delivery_lead_name, delivery_lead_email, delivery_lead_phone, created_at) VALUES
('TechCorp Solutions', 'TECHCORP', 'John Doe', 'john@techcorp.com', '9876543210', NOW());

-- Insert Recruiters
INSERT INTO recruiters (name, email, phone, vendor_id, created_at) VALUES
('Alice Johnson', 'alice@techcorp.com', '9876543211', 1, NOW());

-- Insert Trainers
INSERT INTO trainers (name, email, phone, created_at) VALUES
('Bob Smith', 'bob@training.com', '9876543212', NOW()),
('Carol Davis', 'carol@training.com', '9876543213', NOW());

-- Verification
SELECT 'Sample master data inserted successfully' as status;

SELECT 'Functions:' as info, COUNT(*) as count FROM functions
UNION ALL
SELECT 'Business Units:', COUNT(*) FROM business_units
UNION ALL
SELECT 'Departments:', COUNT(*) FROM departments
UNION ALL
SELECT 'Sub Departments:', COUNT(*) FROM sub_departments
UNION ALL
SELECT 'Roles:', COUNT(*) FROM roles
UNION ALL
SELECT 'Clusters:', COUNT(*) FROM clusters
UNION ALL
SELECT 'Vendors:', COUNT(*) FROM vendors
UNION ALL
SELECT 'Recruiters:', COUNT(*) FROM recruiters
UNION ALL
SELECT 'Trainers:', COUNT(*) FROM trainers;
