CREATE TABLE IF NOT EXISTS cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clusters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    city_id INT,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS paygroups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS business_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    business_unit_id INT,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sub_departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    department_id INT,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    job_description_file TEXT,
    paygroup_id INT,
    business_unit_id INT,
    department_id INT,
    sub_department_id INT,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paygroup_id) REFERENCES paygroups(id) ON DELETE SET NULL,
    FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (sub_department_id) REFERENCES sub_departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(50),
    -- Commercial Terms
    management_fees DECIMAL(5,2),
    sourcing_fee DECIMAL(10,2),
    replacement_days INT,
    -- Contact Details - Delivery Lead
    delivery_lead_name TEXT,
    delivery_lead_email TEXT,
    delivery_lead_phone VARCHAR(15),
    -- Contact Details - Business Head
    business_head_name TEXT,
    business_head_email TEXT,
    business_head_phone VARCHAR(15),
    -- Contact Details - Payroll SPOC
    payroll_spoc_name TEXT,
    payroll_spoc_email TEXT,
    payroll_spoc_phone VARCHAR(15),
    -- City SPOCs stored as JSON
    city_spocs JSON,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trainers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    city_id INT,
    email VARCHAR(255),
    phone VARCHAR(15),
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hiring_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(20) NOT NULL UNIQUE,
    city_id INT,
    cluster_id INT,
    role_id INT,
    position_title TEXT NOT NULL,
    no_of_openings INT NOT NULL,
    request_type ENUM('backfill', 'fresh', 'training_attrition') NOT NULL,
    priority ENUM('P0', 'P1', 'P2', 'P3') NOT NULL,
    status ENUM('open', 'closed', 'called_off') DEFAULT 'open',
    description TEXT,
    requirements TEXT,
    request_date DATETIME NOT NULL,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
    FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    aadhar_number VARCHAR(12) UNIQUE,
    role_id INT,
    role_name VARCHAR(255),
    city_id INT,
    city_name VARCHAR(255),
    cluster_id INT,
    cluster_name VARCHAR(255),
    qualification VARCHAR(50),
    current_company TEXT,
    experience_years DECIMAL(3,1),
    current_ctc DECIMAL(10,2),
    expected_ctc DECIMAL(10,2),
    resume_source ENUM('vendor', 'field_recruiter', 'referral'),
    vendor_id INT,
    vendor_name VARCHAR(255),
    recruiter_id INT,
    recruiter_name VARCHAR(255),
    referral_name VARCHAR(255),
    resume_url TEXT,
    status ENUM('applied', 'prescreening', 'technical', 'selected', 'rejected', 'offered', 'joined') DEFAULT 'applied',
    prescreening_score INT,
    prescreening_result ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
    prescreening_date DATETIME,
    prescreening_notes TEXT,
    interview_notes TEXT,
    interview_feedback TEXT,
    offered_salary DECIMAL(10,2),
    joining_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE INDEX idx_hiring_requests_city_id ON hiring_requests(city_id);
CREATE INDEX idx_hiring_requests_cluster_id ON hiring_requests(cluster_id);
CREATE INDEX idx_hiring_requests_role_id ON hiring_requests(role_id);
CREATE INDEX idx_hiring_requests_created_by ON hiring_requests(created_by);
CREATE INDEX idx_candidates_status ON candidates(status);


CREATE TABLE IF NOT EXISTS recruiters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone VARCHAR(10),
    city_id INT,
    vendor_id INT,
    management_fee TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_recruiter_email (email(255)),
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    phone VARCHAR(10),
    user_id INT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role ENUM('admin', 'hr', 'recruiter', 'manager', 'trainer') NOT NULL,
    manager_id INT,
    city_id INT,
    cluster_id INT,
    is_active BOOLEAN DEFAULT true,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_email (email(255)),
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
    FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS user_audit_trail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    changed_by INT NOT NULL,
    change_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id INT NOT NULL,
    old_values JSON,
    new_values JSON,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS training_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    training_type ENUM('induction', 'classroom', 'field') NOT NULL,
    candidate_id INT,
    trainer_id INT,
    status ENUM('assigned', 'in_progress', 'completed', 'dropped_out') DEFAULT 'assigned',
    start_date DATETIME,
    end_date DATETIME,
    duration INT,
    attendance_marked BOOLEAN DEFAULT false,
    fit_status TEXT,
    comments TEXT,
    dropout_reason TEXT,
    fte_confirmed BOOLEAN DEFAULT false,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS training_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    training_session_id INT,
    date DATE NOT NULL,
    is_present BOOLEAN DEFAULT false,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (training_session_id) REFERENCES training_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    candidate_id INT,
    user_id INT,
    date_of_joining DATE NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    city_id INT,
    cluster_id INT,
    role_id INT,
    vendor_id INT,
    recruiter_id INT,
    status ENUM('active', 'inactive', 'terminated', 'resigned') DEFAULT 'active',
    basic_salary DECIMAL(10,2),
    hra DECIMAL(10,2),
    lta DECIMAL(10,2),
    special_allowance DECIMAL(10,2),
    other_allowances DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
    FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS employee_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    action_type TEXT NOT NULL,
    action_date DATETIME NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS exit_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    exit_type ENUM('voluntary', 'termination', 'absconding') NOT NULL,
    exit_date DATETIME NOT NULL,
    reason TEXT,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS recruiter_incentives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id INT,
    month VARCHAR(20) NOT NULL,
    incentive_amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


