-- ============================================================================
-- DROP EMPLOYEE AND EMPLOYEE_ACTIONS TABLES
-- Removing Employee and Employee Actions features
-- ============================================================================

-- Drop employee_actions table first (has FK to employees)
DROP TABLE IF EXISTS employee_actions;

-- Drop employees table
DROP TABLE IF EXISTS employees;

-- Verification
SELECT 'Employee tables dropped successfully' as status;
