-- Migration: Create Training Tables for Induction, CRT, and FT
-- Date: 2025-11-07

-- Create Induction Training table
CREATE TABLE IF NOT EXISTS induction_training (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    city VARCHAR(100),
    cluster VARCHAR(100),
    role VARCHAR(100),
    date_of_joining DATE,
    gross_salary DECIMAL(10,2),
    joining_status ENUM('joined', 'not_joined', 'pending') DEFAULT 'pending',
    manager_name VARCHAR(255),
    induction_done_by INT,
    onboarding_form_filled ENUM('yes', 'ytb', 'no') DEFAULT 'ytb',
    uan_number_generated ENUM('yes', 'ytb', 'no') DEFAULT 'ytb',
    induction_status ENUM('completed', 'ytb_completed', 'in_progress') DEFAULT 'in_progress',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (induction_done_by) REFERENCES trainers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Classroom Training (CRT) table
CREATE TABLE IF NOT EXISTS classroom_training (
    id INT PRIMARY KEY AUTO_INCREMENT,
    induction_id INT NOT NULL,
    candidate_id INT NOT NULL,
    training_start_date DATE,
    training_completion_date DATE,
    trainer_id INT,
    crt_feedback ENUM('fit', 'not_fit_crt_rejection', 'early_exit', 'fit_need_observation') DEFAULT NULL,
    remarks TEXT,
    last_working_day DATE,
    exit_date DATE,
    exit_reason ENUM('crt_absconding') DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (induction_id) REFERENCES induction_training(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Field Training (FT) table
CREATE TABLE IF NOT EXISTS field_training (
    id INT PRIMARY KEY AUTO_INCREMENT,
    classroom_training_id INT NOT NULL,
    candidate_id INT NOT NULL,
    buddy_aligned ENUM('yes', 'no') DEFAULT 'no',
    buddy_name VARCHAR(255),
    buddy_phone_number VARCHAR(20),
    manager_feedback TEXT,
    ft_feedback ENUM('fit', 'not_fit_ft_rejection') DEFAULT NULL,
    rejection_reason TEXT,
    absconding ENUM('yes', 'no') DEFAULT 'no',
    last_reporting_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classroom_training_id) REFERENCES classroom_training(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
