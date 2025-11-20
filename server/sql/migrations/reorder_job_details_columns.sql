-- ============================================================================
-- REORDER JOB DETAILS COLUMNS IN ONBOARDING TABLE
-- New order: Entity → Business Unit → Function → Department → Sub Department
-- ============================================================================

-- First, let's reorder the organizational hierarchy columns to come after role
-- Target order after role:
-- 1. legal_entity (Entity)
-- 2. business_unit_name
-- 3. function_name
-- 4. department_name
-- 5. sub_department_name
-- ...then other fields like cost_centre

ALTER TABLE onboarding 
MODIFY COLUMN legal_entity VARCHAR(255) AFTER role;

ALTER TABLE onboarding 
MODIFY COLUMN business_unit_name VARCHAR(255) AFTER legal_entity;

ALTER TABLE onboarding 
MODIFY COLUMN function_name VARCHAR(255) AFTER business_unit_name;

ALTER TABLE onboarding 
MODIFY COLUMN department_name VARCHAR(255) AFTER function_name;

ALTER TABLE onboarding 
MODIFY COLUMN sub_department_name VARCHAR(255) AFTER department_name;

-- ============================================================================
-- RESULT: Job Details column order is now:
-- ============================================================================
-- role
-- legal_entity          <- Entity (1st)
-- business_unit_name    <- Business Unit (2nd)
-- function_name         <- Function (3rd)
-- department_name       <- Department (4th)
-- sub_department_name   <- Sub Department (5th)
-- manager_name
-- date_of_joining
-- gross_salary
-- cost_centre
-- ...other fields

-- ============================================================================
-- VERIFY THE NEW COLUMN ORDER
-- ============================================================================
SELECT 
    COLUMN_NAME,
    ORDINAL_POSITION,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'onboarding' 
    AND TABLE_SCHEMA = DATABASE()
    AND COLUMN_NAME IN (
        'role', 
        'legal_entity', 
        'business_unit_name', 
        'function_name', 
        'department_name', 
        'sub_department_name',
        'manager_name',
        'cost_centre'
    )
ORDER BY ORDINAL_POSITION;
