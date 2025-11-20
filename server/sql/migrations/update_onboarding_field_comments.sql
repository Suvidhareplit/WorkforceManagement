-- ============================================================================
-- UPDATE ONBOARDING FIELD COMMENTS
-- Add column comments for validation rules
-- ============================================================================

-- Update physically_handicapped to specify Yes/No only
ALTER TABLE onboarding 
MODIFY COLUMN physically_handicapped VARCHAR(50) COMMENT 'Yes or No only';

-- Update international_worker to specify Yes/No only
ALTER TABLE onboarding 
MODIFY COLUMN international_worker VARCHAR(50) COMMENT 'Yes or No only';

-- ============================================================================
-- VERIFY COMMENTS
-- ============================================================================
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'onboarding' 
    AND TABLE_SCHEMA = DATABASE()
    AND COLUMN_NAME IN (
        'physically_handicapped',
        'international_worker'
    )
ORDER BY ORDINAL_POSITION;
