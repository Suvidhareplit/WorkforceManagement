-- Migration: Add assigned_induction status and drop training tables
-- Date: 2025-11-07
-- Changes:
-- 1. Add 'assigned_induction' to candidates status ENUM
-- 2. Drop training_attendance table
-- 3. Drop training_sessions table

-- Add assigned_induction to status ENUM
ALTER TABLE candidates 
MODIFY COLUMN status ENUM('applied', 'prescreening', 'technical', 'selected', 'rejected', 'offered', 'joined', 'assigned_induction') DEFAULT 'applied';

-- Drop training tables
DROP TABLE IF EXISTS training_attendance;
DROP TABLE IF EXISTS training_sessions;
