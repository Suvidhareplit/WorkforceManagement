-- Script to reorganize candidates table with proper column order matching the application form

-- Create new table with better column ordering
CREATE TABLE candidates_new (
    -- Primary key
    id SERIAL PRIMARY KEY,
    
    -- Application details (in form order)
    application_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    city TEXT NOT NULL,
    cluster TEXT NOT NULL,
    qualification TEXT NOT NULL,
    
    -- Source information
    resume_source TEXT NOT NULL,
    vendor TEXT,
    recruiter TEXT,
    referral_name TEXT,
    
    -- Status and tracking
    status TEXT DEFAULT 'applied',
    hiring_request_id INTEGER,
    
    -- Prescreening details
    prescreening_approved BOOLEAN,
    prescreening_notes TEXT,
    
    -- Screening details
    screening_score DECIMAL,
    benchmark_met BOOLEAN,
    
    -- Technical interview details
    technical_status TEXT,
    technical_notes TEXT,
    
    -- Offer and joining details
    date_of_joining DATE,
    gross_salary DECIMAL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table
INSERT INTO candidates_new (
    id, application_id, name, phone, email, role, city, cluster, qualification,
    resume_source, vendor, recruiter, referral_name, status, hiring_request_id,
    prescreening_approved, prescreening_notes, screening_score, benchmark_met,
    technical_status, technical_notes, date_of_joining, gross_salary,
    created_at, updated_at
)
SELECT 
    id, application_id, name, phone, email, role, city, cluster, qualification,
    resume_source, vendor, recruiter, referral_name, status, hiring_request_id,
    prescreening_approved, prescreening_notes, screening_score, benchmark_met,
    technical_status, technical_notes, date_of_joining, gross_salary,
    created_at, updated_at
FROM candidates;

-- Drop the old table
DROP TABLE candidates;

-- Rename the new table
ALTER TABLE candidates_new RENAME TO candidates;

-- Reset the sequence for the id column
SELECT setval('candidates_id_seq', (SELECT MAX(id) FROM candidates));

-- Add index for performance
CREATE INDEX idx_candidates_application_id ON candidates(application_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_created_at ON candidates(created_at);