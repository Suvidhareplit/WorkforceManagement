-- Migration: Remove technical_score column
-- Date: 2025-11-03
-- Reason: Not used in frontend, removing unused column

-- Remove technical_score column from candidates table
ALTER TABLE candidates DROP COLUMN technical_score;
