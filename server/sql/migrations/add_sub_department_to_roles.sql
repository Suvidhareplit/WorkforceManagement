-- Migration: Add sub_department column to roles table
-- Date: 2025-09-12

ALTER TABLE roles ADD COLUMN sub_department TEXT AFTER department;
