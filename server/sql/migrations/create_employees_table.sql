-- Create employees table for onboarded candidates who have completed profile creation
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Reference IDs
  candidate_id INT NOT NULL,
  onboarding_id INT NOT NULL,
  field_training_id INT,
  
  -- Employee Identification
  employee_id VARCHAR(50) UNIQUE,
  user_id INT,
  
  -- Basic Info (from onboarding)
  name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20),
  email VARCHAR(255),
  city VARCHAR(100),
  cluster VARCHAR(100),
  role VARCHAR(100),
  manager_name VARCHAR(255),
  date_of_joining DATE,
  gross_salary DECIMAL(10,2),
  
  -- Personal Details (from onboarding)
  gender ENUM('male', 'female', 'other'),
  date_of_birth DATE,
  blood_group VARCHAR(10),
  marital_status ENUM('single', 'married', 'divorced', 'widowed'),
  physically_handicapped BOOLEAN DEFAULT FALSE,
  nationality VARCHAR(100),
  international_worker BOOLEAN DEFAULT FALSE,
  
  -- KYC Documents (from onboarding)
  pan_number VARCHAR(20),
  name_as_per_pan VARCHAR(255),
  aadhar_number VARCHAR(20),
  name_as_per_aadhar VARCHAR(255),
  
  -- Bank Details (from onboarding)
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  name_as_per_bank VARCHAR(255),
  
  -- Address (from onboarding)
  present_address TEXT,
  permanent_address TEXT,
  
  -- Emergency Contact (from onboarding)
  emergency_contact_number VARCHAR(20),
  emergency_contact_name VARCHAR(255),
  emergency_contact_relation VARCHAR(50),
  
  -- Recruitment Source (from onboarding)
  resume_source VARCHAR(50),
  cost_centre VARCHAR(100),
  vendor_id INT,
  vendor_name VARCHAR(255),
  recruiter_id INT,
  recruiter_name VARCHAR(255),
  referral_name VARCHAR(255),
  
  -- NEW FIELDS - Additional Employee Information
  group_doj DATE,  -- Optional: Group Date of Joining
  assets TEXT,  -- Optional: Comma-separated list or JSON of assigned assets
  documents TEXT,  -- Optional: Comma-separated list or JSON of uploaded documents
  paygrade VARCHAR(50),  -- Optional: Pay grade level
  payband VARCHAR(50),  -- Optional: Pay band category
  
  -- Working Status and Exit Information
  working_status ENUM('active', 'inactive', 'terminated', 'resigned') DEFAULT 'active',
  date_of_exit DATE,
  exit_initiated_date DATE,
  lwd DATE,  -- Last Working Day
  profile_created_at TIMESTAMP,
  profile_created_by INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE RESTRICT,
  FOREIGN KEY (onboarding_id) REFERENCES onboarding(id) ON DELETE RESTRICT,
  FOREIGN KEY (field_training_id) REFERENCES field_training(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (profile_created_by) REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE KEY unique_candidate_employee (candidate_id),
  UNIQUE KEY unique_onboarding_employee (onboarding_id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_working_status (working_status),
  INDEX idx_city (city),
  INDEX idx_role (role)
);
