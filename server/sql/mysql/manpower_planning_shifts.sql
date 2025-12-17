-- New shift-based manpower planning schema
-- Replaces the old num_shifts/employees_per_shift model with individual shift records

-- Table to store shift definitions for each centre and designation
CREATE TABLE IF NOT EXISTS centre_manpower_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    centre_id INT NOT NULL,
    designation_id INT NOT NULL,
    shift_name VARCHAR(100) NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    required_manpower INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (centre_id) REFERENCES centres(id) ON DELETE CASCADE,
    FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_centre_designation (centre_id, designation_id),
    INDEX idx_shift_times (shift_start_time, shift_end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration note: The old centre_manpower_planning table will be kept for reference
-- but the new UI will use centre_manpower_shifts table
