-- Cleanup Script: Remove Rejected Candidates from Training Tables
-- Date: 2025-11-26
-- Description: Remove any rejected candidates that somehow got into training tables

-- First, let's see what we're dealing with
SELECT 'AUDIT: Rejected candidates currently in induction_training:' as info;
SELECT it.id, it.candidate_id, it.name, c.status, c.technical_result
FROM induction_training it
LEFT JOIN candidates c ON it.candidate_id = c.id
WHERE c.status = 'rejected' OR c.technical_result = 'rejected';

SELECT 'AUDIT: Rejected candidates currently in classroom_training:' as info;
SELECT ct.id, ct.candidate_id, c.name, c.status, c.technical_result
FROM classroom_training ct
LEFT JOIN candidates c ON ct.candidate_id = c.id
WHERE c.status = 'rejected' OR c.technical_result = 'rejected';

-- Remove rejected candidates from classroom_training
DELETE ct FROM classroom_training ct
LEFT JOIN candidates c ON ct.candidate_id = c.id
WHERE c.status = 'rejected' OR c.technical_result = 'rejected';

-- Remove rejected candidates from induction_training
DELETE it FROM induction_training it
LEFT JOIN candidates c ON it.candidate_id = c.id
WHERE c.status = 'rejected' OR c.technical_result = 'rejected';

-- Verify cleanup
SELECT 'VERIFICATION: Rejected candidates remaining in induction_training (should be 0):' as info;
SELECT COUNT(*) as count
FROM induction_training it
LEFT JOIN candidates c ON it.candidate_id = c.id
WHERE c.status = 'rejected' OR c.technical_result = 'rejected';

SELECT 'VERIFICATION: Rejected candidates remaining in classroom_training (should be 0):' as info;
SELECT COUNT(*) as count
FROM classroom_training ct
LEFT JOIN candidates c ON ct.candidate_id = c.id
WHERE c.status = 'rejected' OR c.technical_result = 'rejected';

-- Show summary of what was cleaned up
SELECT 'CLEANUP SUMMARY:' as info;
SELECT 
  'Total candidates' as type,
  COUNT(*) as count
FROM candidates
UNION ALL
SELECT 
  'Rejected candidates' as type,
  COUNT(*) as count
FROM candidates 
WHERE status = 'rejected' OR technical_result = 'rejected'
UNION ALL
SELECT 
  'Candidates in induction training' as type,
  COUNT(*) as count
FROM induction_training
UNION ALL
SELECT 
  'Candidates in classroom training' as type,
  COUNT(*) as count
FROM classroom_training;
