-- Clear Master Data and Reset Auto-Increment IDs
-- Date: 2025-11-27
-- Description: Clear all master data tables and reset auto-increment counters

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all master data tables
TRUNCATE TABLE clusters;
TRUNCATE TABLE functions;
TRUNCATE TABLE business_units;
TRUNCATE TABLE departments;
TRUNCATE TABLE sub_departments;
TRUNCATE TABLE roles;
TRUNCATE TABLE vendors;
TRUNCATE TABLE recruiters;
TRUNCATE TABLE trainers;

-- Reset auto-increment counters to 1
ALTER TABLE clusters AUTO_INCREMENT = 1;
ALTER TABLE functions AUTO_INCREMENT = 1;
ALTER TABLE business_units AUTO_INCREMENT = 1;
ALTER TABLE departments AUTO_INCREMENT = 1;
ALTER TABLE sub_departments AUTO_INCREMENT = 1;
ALTER TABLE roles AUTO_INCREMENT = 1;
ALTER TABLE vendors AUTO_INCREMENT = 1;
ALTER TABLE recruiters AUTO_INCREMENT = 1;
ALTER TABLE trainers AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verification
SELECT 'Master data cleared. Current counts:' as status;
SELECT 'clusters' as table_name, COUNT(*) as count FROM clusters
UNION ALL
SELECT 'functions', COUNT(*) FROM functions  
UNION ALL
SELECT 'business_units', COUNT(*) FROM business_units
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'sub_departments', COUNT(*) FROM sub_departments
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'vendors', COUNT(*) FROM vendors
UNION ALL
SELECT 'recruiters', COUNT(*) FROM recruiters
UNION ALL
SELECT 'trainers', COUNT(*) FROM trainers;

SELECT 'Auto-increment values reset to 1' as status;
