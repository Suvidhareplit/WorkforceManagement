-- New candidates table structure based on frontend requirements
-- Analyzed from CandidateApplication.tsx, Prescreening.tsx, TechnicalRound.tsx, OfferManagement.tsx and types/index.ts

CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Basic Information
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    
    -- Location & Role (using IDs for referential integrity)
    role_id INT NOT NULL,
    role_name VARCHAR(255) NULL,
    city_id INT NOT NULL,
    city_name VARCHAR(255) NULL,
    cluster_id INT NOT NULL,
    cluster_name VARCHAR(255) NULL,
    
    -- Additional Details
    qualification ENUM('8th-10th', '11th-12th', 'Graduation', 'B.Tech', 'Diploma', 'ITI'),
    
    -- Source Information
    vendor_id INT NULL,
    vendor_name VARCHAR(255) NULL,
    recruiter_id INT NULL,
    recruiter_name VARCHAR(255) NULL,
    referral_name VARCHAR(255) NULL,
    
    -- Application Status
    status ENUM('applied', 'prescreening', 'technical', 'selected', 'rejected', 'offered', 'joined') DEFAULT 'applied',
    
    -- Prescreening Fields
    prescreening_approved BOOLEAN NULL,
    prescreening_notes TEXT NULL,
    screening_score DECIMAL(3,1) NULL, -- For marks out of 10
    benchmark_met BOOLEAN NULL,
    
    -- Technical Round Fields
    technical_status ENUM('selected', 'rejected') NULL,
    technical_notes TEXT NULL,
    
    -- Offer Management Fields
    date_of_joining DATE NULL,
    gross_salary DECIMAL(10,2) NULL,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE RESTRICT,
    FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE RESTRICT,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_candidates_status (status),
    INDEX idx_candidates_role_id (role_id),
    INDEX idx_candidates_city_id (city_id),
    INDEX idx_candidates_cluster_id (cluster_id),
    INDEX idx_candidates_vendor_id (vendor_id),
    INDEX idx_candidates_recruiter_id (recruiter_id),
    INDEX idx_candidates_created_at (created_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Check constraints on foreign key columns are not supported in MySQL
-- Data integrity will be enforced at application level
