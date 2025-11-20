-- ============================================================================
-- ADD NEW FIELDS TO ONBOARDING TABLE
-- ============================================================================

-- 1. Add Employment Type (Contract/Permanent) - after sub_department_name
ALTER TABLE onboarding 
ADD COLUMN employment_type VARCHAR(50) AFTER sub_department_name;

-- 2. Add new Basic Details fields
-- physically_handicapped and international_worker should only accept 'Yes' or 'No'
ALTER TABLE onboarding
ADD COLUMN physically_handicapped VARCHAR(50) COMMENT 'Yes or No only' AFTER marital_status,
ADD COLUMN nationality VARCHAR(100) DEFAULT 'Indian' AFTER physically_handicapped,
ADD COLUMN international_worker VARCHAR(50) COMMENT 'Yes or No only' AFTER nationality;

-- ============================================================================
-- VERIFY NEW COLUMNS
-- ============================================================================
SELECT 
    COLUMN_NAME,
    ORDINAL_POSITION,
    COLUMN_TYPE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'onboarding' 
    AND TABLE_SCHEMA = DATABASE()
    AND COLUMN_NAME IN (
        'employment_type',
        'physically_handicapped',
        'nationality',
        'international_worker'
    )
ORDER BY ORDINAL_POSITION;

-- ============================================================================
-- UPDATE EMPLOYMENT TYPE FOR EXISTING RECORDS
-- Contract: If resume_source = 'vendor'
-- Permanent: All others
-- ============================================================================
UPDATE onboarding 
SET employment_type = CASE 
    WHEN resume_source = 'vendor' THEN 'Contract'
    ELSE 'Permanent'
END
WHERE employment_type IS NULL;

SELECT 
    resume_source,
    employment_type,
    COUNT(*) as count
FROM onboarding
GROUP BY resume_source, employment_type
ORDER BY resume_source;
