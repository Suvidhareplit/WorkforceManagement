-- HRMS Database Schema

-- Enum types
CREATE TYPE priority AS ENUM ('P0', 'P1', 'P2', 'P3');
CREATE TYPE request_type AS ENUM ('replacement', 'fresh');
CREATE TYPE request_status AS ENUM ('open', 'closed', 'called_off');
CREATE TYPE candidate_status AS ENUM ('applied', 'prescreening', 'technical', 'selected', 'rejected', 'offered', 'joined');
CREATE TYPE training_type AS ENUM ('induction', 'classroom', 'field');
CREATE TYPE training_status AS ENUM ('assigned', 'in_progress', 'completed', 'dropped_out');
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'terminated', 'resigned');
CREATE TYPE exit_type AS ENUM ('voluntary', 'termination', 'absconding');
CREATE TYPE user_role AS ENUM ('admin', 'hr', 'recruiter', 'manager', 'trainer');

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clusters table
CREATE TABLE IF NOT EXISTS clusters (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    city_id INTEGER REFERENCES cities(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    job_description_file TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone VARCHAR(10),
    contact_person TEXT,
    commercial_terms TEXT,
    management_fees TEXT,
    sourcing_fee TEXT,
    replacement_days INTEGER,
    delivery_lead_name TEXT,
    delivery_lead_email TEXT,
    delivery_lead_phone VARCHAR(10),
    business_head_name TEXT,
    business_head_email TEXT,
    business_head_phone VARCHAR(10),
    payroll_spoc_name TEXT,
    payroll_spoc_email TEXT,
    payroll_spoc_phone VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor city contacts table
CREATE TABLE IF NOT EXISTS vendor_city_contacts (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id),
    city_id INTEGER REFERENCES cities(id),
    recruitment_spoc_name TEXT NOT NULL,
    recruitment_spoc_email TEXT NOT NULL,
    recruitment_spoc_phone VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendor_id, city_id)
);

-- Recruiters table
CREATE TABLE IF NOT EXISTS recruiters (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone VARCHAR(10),
    city_id INTEGER REFERENCES cities(id),
    vendor_id INTEGER REFERENCES vendors(id),
    management_fee TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone VARCHAR(10),
    user_id INTEGER NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role user_role NOT NULL,
    manager_id INTEGER REFERENCES users(id),
    city_id INTEGER REFERENCES cities(id),
    cluster_id INTEGER REFERENCES clusters(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User audit trail table
CREATE TABLE IF NOT EXISTS user_audit_trail (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    changed_by INTEGER NOT NULL,
    change_type TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    old_values JSON,
    new_values JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hiring requests table
CREATE TABLE IF NOT EXISTS hiring_requests (
    id SERIAL PRIMARY KEY,
    request_id TEXT NOT NULL UNIQUE,
    city_id INTEGER REFERENCES cities(id) NOT NULL,
    cluster_id INTEGER REFERENCES clusters(id) NOT NULL,
    role_id INTEGER REFERENCES roles(id) NOT NULL,
    number_of_positions INTEGER NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    priority priority NOT NULL,
    request_type request_type NOT NULL,
    replacement_reason TEXT,
    status request_status DEFAULT 'open',
    notes TEXT,
    created_by INTEGER REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    application_id TEXT NOT NULL UNIQUE,
    hiring_request_id INTEGER REFERENCES hiring_requests(id) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone VARCHAR(10) NOT NULL,
    city_id INTEGER REFERENCES cities(id) NOT NULL,
    cluster_id INTEGER REFERENCES clusters(id) NOT NULL,
    role_id INTEGER REFERENCES roles(id) NOT NULL,
    vendor_id INTEGER REFERENCES vendors(id),
    recruiter_id INTEGER REFERENCES recruiters(id),
    sourcing_channel TEXT,
    qualification TEXT,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status candidate_status DEFAULT 'applied',
    prescreening_date TIMESTAMP,
    prescreening_status TEXT,
    prescreening_notes TEXT,
    technical_round1_date TIMESTAMP,
    technical_round1_status TEXT,
    technical_round1_notes TEXT,
    technical_round2_date TIMESTAMP,
    technical_round2_status TEXT,
    technical_round2_notes TEXT,
    offer_date TIMESTAMP,
    offer_salary DECIMAL,
    join_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
    id SERIAL PRIMARY KEY,
    training_type training_type NOT NULL,
    candidate_id INTEGER REFERENCES candidates(id) NOT NULL,
    trainer_id INTEGER REFERENCES users(id) NOT NULL,
    status training_status DEFAULT 'assigned',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    duration INTEGER,
    attendance_marked BOOLEAN DEFAULT false,
    fit_status TEXT,
    comments TEXT,
    dropout_reason TEXT,
    fte_confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training attendance table
CREATE TABLE IF NOT EXISTS training_attendance (
    id SERIAL PRIMARY KEY,
    training_session_id INTEGER REFERENCES training_sessions(id) NOT NULL,
    date DATE NOT NULL,
    is_present BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id),
    employee_id TEXT NOT NULL UNIQUE,
    personal_details JSON,
    contact_details JSON,
    employment_details JSON,
    govt_ids JSON,
    bank_details JSON,
    documents JSON,
    status employee_status DEFAULT 'active',
    join_date TIMESTAMP,
    exit_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee actions table
CREATE TABLE IF NOT EXISTS employee_actions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) NOT NULL,
    action_type TEXT NOT NULL,
    description TEXT,
    requested_by INTEGER REFERENCES users(id) NOT NULL,
    approved_by INTEGER REFERENCES users(id),
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exit records table
CREATE TABLE IF NOT EXISTS exit_records (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) NOT NULL,
    exit_type exit_type NOT NULL,
    exit_date TIMESTAMP NOT NULL,
    reason TEXT,
    exit_interview JSON,
    final_settlement JSON,
    handover_completed BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor invoices table
CREATE TABLE IF NOT EXISTS vendor_invoices (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(id) NOT NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_date TIMESTAMP NOT NULL,
    amount DECIMAL NOT NULL,
    candidates_billed JSON,
    payment_status TEXT DEFAULT 'pending',
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recruiter incentives table
CREATE TABLE IF NOT EXISTS recruiter_incentives (
    id SERIAL PRIMARY KEY,
    recruiter_id INTEGER REFERENCES recruiters(id) NOT NULL,
    candidate_id INTEGER REFERENCES candidates(id) NOT NULL,
    incentive_amount DECIMAL NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_clusters_city_id ON clusters(city_id);
CREATE INDEX idx_vendor_city_contacts_vendor_id ON vendor_city_contacts(vendor_id);
CREATE INDEX idx_vendor_city_contacts_city_id ON vendor_city_contacts(city_id);
CREATE INDEX idx_recruiters_vendor_id ON recruiters(vendor_id);
CREATE INDEX idx_recruiters_city_id ON recruiters(city_id);
CREATE INDEX idx_users_manager_id ON users(manager_id);
CREATE INDEX idx_users_city_id ON users(city_id);
CREATE INDEX idx_users_cluster_id ON users(cluster_id);
CREATE INDEX idx_hiring_requests_city_id ON hiring_requests(city_id);
CREATE INDEX idx_hiring_requests_cluster_id ON hiring_requests(cluster_id);
CREATE INDEX idx_hiring_requests_role_id ON hiring_requests(role_id);
CREATE INDEX idx_hiring_requests_created_by ON hiring_requests(created_by);
CREATE INDEX idx_candidates_hiring_request_id ON candidates(hiring_request_id);
CREATE INDEX idx_candidates_city_id ON candidates(city_id);
CREATE INDEX idx_candidates_cluster_id ON candidates(cluster_id);
CREATE INDEX idx_candidates_role_id ON candidates(role_id);
CREATE INDEX idx_candidates_vendor_id ON candidates(vendor_id);
CREATE INDEX idx_candidates_recruiter_id ON candidates(recruiter_id);
CREATE INDEX idx_training_sessions_candidate_id ON training_sessions(candidate_id);
CREATE INDEX idx_training_sessions_trainer_id ON training_sessions(trainer_id);
CREATE INDEX idx_employees_candidate_id ON employees(candidate_id);
CREATE INDEX idx_employee_actions_employee_id ON employee_actions(employee_id);
CREATE INDEX idx_exit_records_employee_id ON exit_records(employee_id);