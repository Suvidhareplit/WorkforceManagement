-- Create onboarding table for candidates who completed field training
CREATE TABLE IF NOT EXISTS onboarding (
  id INT PRIMARY KEY AUTO_INCREMENT,
  field_training_id INT NOT NULL,
  candidate_id INT NOT NULL,
  
  -- Basic Info (from field training)
  name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20),
  email VARCHAR(255),
  city VARCHAR(100),
  cluster VARCHAR(100),
  role VARCHAR(100),
  manager_name VARCHAR(255),
  date_of_joining DATE,
  gross_salary DECIMAL(10,2),
  
  -- Personal Details
  gender ENUM('male', 'female', 'other'),
  date_of_birth DATE,
  blood_group VARCHAR(10),
  marital_status ENUM('single', 'married', 'divorced', 'widowed'),
  
  -- KYC Documents
  pan_number VARCHAR(20),
  name_as_per_pan VARCHAR(255),
  aadhar_number VARCHAR(20),
  name_as_per_aadhar VARCHAR(255),
  
  -- Bank Details
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  name_as_per_bank VARCHAR(255),
  
  -- Address
  present_address TEXT,
  permanent_address TEXT,
  
  -- Emergency Contact
  emergency_contact_number VARCHAR(20),
  emergency_contact_name VARCHAR(255),
  emergency_contact_relation VARCHAR(50),
  
  -- Status
  onboarding_status ENUM('yet_to_be_onboarded', 'onboarded') DEFAULT 'yet_to_be_onboarded',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (field_training_id) REFERENCES field_training(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  UNIQUE KEY unique_candidate_onboarding (candidate_id)
);
