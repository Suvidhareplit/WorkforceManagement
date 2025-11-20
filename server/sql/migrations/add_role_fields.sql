-- Migration to add paygroup, business_unit, and department columns to roles table
-- Run this script to update existing database

ALTER TABLE roles 
ADD COLUMN paygroup TEXT AFTER job_description_file,
ADD COLUMN business_unit TEXT AFTER paygroup,
ADD COLUMN department TEXT AFTER business_unit;
