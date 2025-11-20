-- ============================================================================
-- Leave Management System - Database Schema
-- Created: 2025-11-12
-- Description: Complete schema for leave configuration, policies, holidays,
--              audit trail, and employee assignments
-- ============================================================================

-- ============================================================================
-- 1. LEAVE CONFIG TABLE
-- Stores leave type configurations (EL, SL, CL, Paternity, Bereavement, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS leave_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leave_type VARCHAR(50) NOT NULL UNIQUE COMMENT 'EL, SL, CL, Paternity, Bereavement, RH, Govt',
    display_name VARCHAR(100) NOT NULL COMMENT 'Earned Leave, Sick Leave, etc.',
    allocation_type ENUM('ANNUAL', 'MONTHLY_ACCRUAL', 'ONE_TIME') NOT NULL DEFAULT 'ANNUAL',
    annual_quota DECIMAL(5,2) NULL COMMENT 'Annual total (e.g., 18 for EL)',
    monthly_accrual DECIMAL(5,2) NULL COMMENT 'Monthly accrual rate (e.g., 1.5 for EL)',
    prorate_enabled BOOLEAN DEFAULT TRUE COMMENT 'Whether to prorate based on DOJ',
    carry_forward_enabled BOOLEAN DEFAULT FALSE,
    max_carry_forward DECIMAL(5,2) NULL,
    encashment_enabled BOOLEAN DEFAULT FALSE,
    max_encashment DECIMAL(5,2) NULL,
    eligibility_months INT DEFAULT 0 COMMENT 'Months before employee can avail (3 for EL)',
    max_consecutive_days INT NULL COMMENT 'Max consecutive days allowed',
    min_notice_days INT NULL COMMENT 'Minimum notice days required',
    doc_required_days INT NULL COMMENT 'Days after which documentation is required',
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT NULL,
    rules JSON NULL COMMENT 'Complex rules as JSON',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    INDEX idx_leave_type (leave_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Leave type configuration and rules';

-- ============================================================================
-- 2. LEAVE POLICY MASTER TABLE
-- Stores policy definitions (combinations of leave types with specific rules)
-- ============================================================================
CREATE TABLE IF NOT EXISTS leave_policy_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_name VARCHAR(100) NOT NULL UNIQUE,
    policy_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE NULL,
    is_default BOOLEAN DEFAULT FALSE COMMENT 'Default policy for new employees',
    is_active BOOLEAN DEFAULT TRUE,
    version INT DEFAULT 1 COMMENT 'Policy version number',
    parent_policy_id INT NULL COMMENT 'Reference to previous version',
    city VARCHAR(50) NULL COMMENT 'City-specific policy (if applicable)',
    department VARCHAR(100) NULL COMMENT 'Department-specific policy (if applicable)',
    business_unit VARCHAR(100) NULL COMMENT 'Business unit-specific policy',
    employee_type ENUM('FULL_TIME', 'CONTRACT', 'INTERN', 'ALL') DEFAULT 'ALL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    FOREIGN KEY (parent_policy_id) REFERENCES leave_policy_master(id) ON DELETE SET NULL,
    INDEX idx_policy_code (policy_code),
    INDEX idx_is_active (is_active),
    INDEX idx_effective_dates (effective_from, effective_to),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Leave policy master definitions';

-- ============================================================================
-- 3. LEAVE POLICY MAPPING TABLE
-- Maps leave types to policies with specific configurations
-- ============================================================================
CREATE TABLE IF NOT EXISTS leave_policy_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    allocation_override DECIMAL(5,2) NULL COMMENT 'Override annual quota for this policy',
    accrual_override DECIMAL(5,2) NULL COMMENT 'Override monthly accrual',
    eligibility_override INT NULL COMMENT 'Override eligibility months',
    notice_days_override INT NULL COMMENT 'Override notice period',
    doc_required_override INT NULL COMMENT 'Override doc requirement',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT 'Whether this leave type is enabled in this policy',
    custom_rules JSON NULL COMMENT 'Policy-specific custom rules',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES leave_policy_master(id) ON DELETE CASCADE,
    UNIQUE KEY unique_policy_leave (policy_id, leave_type),
    INDEX idx_policy_id (policy_id),
    INDEX idx_leave_type (leave_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Mapping of leave types to policies with overrides';

-- ============================================================================
-- 4. LEAVE HOLIDAYS TABLE
-- Stores government holidays and restricted holidays (year-wise, city-wise)
-- ============================================================================
CREATE TABLE IF NOT EXISTS leave_holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    holiday_date DATE NOT NULL,
    holiday_name VARCHAR(200) NOT NULL,
    holiday_type ENUM('GOVERNMENT', 'RESTRICTED') NOT NULL,
    city VARCHAR(50) NULL COMMENT 'Applicable city for restricted holidays',
    state VARCHAR(50) NULL COMMENT 'State for government holidays',
    is_optional BOOLEAN DEFAULT FALSE,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    UNIQUE KEY unique_holiday (year, holiday_date, holiday_type, city),
    INDEX idx_year (year),
    INDEX idx_holiday_date (holiday_date),
    INDEX idx_holiday_type (holiday_type),
    INDEX idx_city (city),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Government and restricted holidays by year and city';

-- ============================================================================
-- 5. LEAVE AUDIT TRAIL TABLE
-- Tracks all changes to configs, policies, holidays, and assignments
-- ============================================================================
CREATE TABLE IF NOT EXISTS leave_audit_trail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type ENUM('CONFIG', 'POLICY', 'HOLIDAY', 'EMPLOYEE_ASSIGN', 'POLICY_MAPPING') NOT NULL,
    entity_id INT NOT NULL COMMENT 'ID of the entity being changed',
    entity_name VARCHAR(200) NULL COMMENT 'Name/identifier of the entity',
    action_type ENUM('CREATE', 'EDIT', 'DELETE', 'ACTIVATE', 'DEACTIVATE') NOT NULL,
    old_value JSON NULL COMMENT 'Previous state (full record)',
    new_value JSON NULL COMMENT 'New state (full record)',
    summary TEXT NULL COMMENT 'Human-readable summary of changes',
    change_reason TEXT NOT NULL COMMENT 'Mandatory reason for change (min 10 chars)',
    changed_by INT NOT NULL COMMENT 'User ID who made the change',
    changed_by_name VARCHAR(100) NULL COMMENT 'User name for display',
    changed_by_role VARCHAR(50) NULL COMMENT 'User role at time of change',
    ip_address VARCHAR(45) NULL COMMENT 'IP address of user',
    user_agent TEXT NULL COMMENT 'Browser/client information',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id),
    INDEX idx_action_type (action_type),
    INDEX idx_changed_by (changed_by),
    INDEX idx_created_at (created_at),
    INDEX idx_entity_search (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit trail for all leave management changes';

-- ============================================================================
-- 6. EMPLOYEE LEAVE POLICY TABLE (PLACEHOLDER)
-- Maps employees to leave policies - FK constraints will be added when
-- employee profile creation is implemented
-- ============================================================================
CREATE TABLE IF NOT EXISTS employee_leave_policy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL COMMENT 'UUID or employee ID (placeholder until profile exists)',
    employee_name VARCHAR(200) NULL COMMENT 'Employee name for display',
    policy_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE NULL,
    doj DATE NULL COMMENT 'Date of joining for proration',
    city VARCHAR(50) NULL COMMENT 'Employee city for RH allocation',
    is_active BOOLEAN DEFAULT TRUE,
    assigned_by INT NULL,
    reason TEXT NULL COMMENT 'Reason for policy assignment/change',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- FUTURE: Add FK to employee table when profile feature is ready
    -- FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (policy_id) REFERENCES leave_policy_master(id) ON DELETE RESTRICT,
    INDEX idx_employee_id (employee_id),
    INDEX idx_policy_id (policy_id),
    INDEX idx_is_active (is_active),
    INDEX idx_effective_dates (effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Employee to policy mapping (placeholder - FK to employee table pending)';

-- ============================================================================
-- 7. RH ALLOCATION TABLE
-- Stores restricted holiday allocations per city per year
-- Based on uploaded images: BH=5, Mum/Del/TN=6
-- ============================================================================
CREATE TABLE IF NOT EXISTS leave_rh_allocation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    city VARCHAR(50) NOT NULL,
    total_rh INT NOT NULL COMMENT 'Total RH allocation for city (5 or 6)',
    month_allocation JSON NOT NULL COMMENT 'Monthly distribution {Jan:6, Feb:6, Mar:5, ...}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    UNIQUE KEY unique_year_city (year, city),
    INDEX idx_year (year),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Restricted holiday allocation per city per year';

-- ============================================================================
-- SEED DATA: Default Leave Configurations
-- ============================================================================

-- Earned Leave (EL)
INSERT INTO leave_config (leave_type, display_name, allocation_type, annual_quota, monthly_accrual, prorate_enabled, carry_forward_enabled, max_carry_forward, encashment_enabled, eligibility_months, description, rules)
VALUES ('EL', 'Earned Leave', 'MONTHLY_ACCRUAL', 18.00, 1.50, TRUE, TRUE, 12.00, TRUE, 3, 'Earned leave accrues at 1.5 days per month. Cannot be availed in first 3 months but accrues. Prorated based on DOJ.', 
JSON_OBJECT(
    'notice_periods', JSON_OBJECT('1-2_days', 1, '3-7_days', 15, '8-20_days', 30),
    'doc_required', 'none',
    'max_consecutive', 20
))
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

-- Sick Leave / Casual Leave (SL/CL) - COMBINED
INSERT INTO leave_config (leave_type, display_name, allocation_type, annual_quota, monthly_accrual, prorate_enabled, carry_forward_enabled, doc_required_days, description, rules)
VALUES ('SL_CL', 'Sick Leave / Casual Leave (SL/CL)', 'MONTHLY_ACCRUAL', 12.00, 1.00, TRUE, FALSE, 3, 'Combined SL and CL accrues at 1 day per month (12 days total per year). Prorated based on DOJ. Medical document required for 3+ days. Can be used for both sickness and casual purposes.',
JSON_OBJECT(
    'combined_sl_cl', true,
    'total_per_year', 12,
    'monthly_accrual', 1,
    'doc_rules', JSON_OBJECT('1-2_days', 'not_required', '3+_days', 'medical_certificate_required'),
    'notice_period', 'same_day_or_1_day_prior',
    'usage', 'Can be used for sickness or casual/personal reasons'
))
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

-- Paternity Leave
INSERT INTO leave_config (leave_type, display_name, allocation_type, annual_quota, prorate_enabled, carry_forward_enabled, eligibility_months, min_notice_days, description, rules)
VALUES ('PATERNITY', 'Paternity Leave', 'ANNUAL', 15.00, FALSE, FALSE, 6, 30, 'Paternity leave of 15 days per year. Eligible after 6 months of service. 1 month prior notice required.',
JSON_OBJECT(
    'eligibility', '6_months_service',
    'notice_period', '30_days_prior',
    'doc_required', 'birth_certificate_or_adoption_papers'
))
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

-- Bereavement Leave
INSERT INTO leave_config (leave_type, display_name, allocation_type, annual_quota, prorate_enabled, carry_forward_enabled, eligibility_months, doc_required_days, description, rules)
VALUES ('BEREAVEMENT', 'Bereavement Leave', 'ANNUAL', 3.00, FALSE, FALSE, 0, NULL, 'Bereavement leave of 3 days per year. No proration. No documentation required. Immediate family only.',
JSON_OBJECT(
    'prorate', 'no',
    'doc_required', 'no',
    'eligible_relations', JSON_ARRAY('parent', 'spouse', 'child', 'sibling', 'grandparent'),
    'notice_period', 'emergency_basis'
))
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

-- Restricted Holiday (RH)
INSERT INTO leave_config (leave_type, display_name, allocation_type, prorate_enabled, carry_forward_enabled, description, rules)
VALUES ('RH', 'Restricted Holiday', 'ANNUAL', TRUE, FALSE, 'Restricted holidays allocated per city. Bangalore/Hyderabad: 5 per year. Mumbai/Delhi/TN: 6 per year. Prorated based on DOJ.',
JSON_OBJECT(
    'city_allocations', JSON_OBJECT(
        'Bangalore', 5,
        'Hyderabad', 5,
        'Mumbai', 6,
        'Delhi', 6,
        'Chennai', 6,
        'Tamil Nadu', 6
    ),
    'selection_required', TRUE,
    'advance_notice', 7
))
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

-- Government Holiday (Not selectable, informational)
INSERT INTO leave_config (leave_type, display_name, allocation_type, prorate_enabled, carry_forward_enabled, description, rules)
VALUES ('GOVT', 'Government Holiday', 'ANNUAL', FALSE, FALSE, 'Government holidays are predefined per state/city. Not selectable by employees.',
JSON_OBJECT(
    'type', 'informational',
    'maintained_by', 'HR',
    'year_wise', TRUE
))
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

-- ============================================================================
-- SEED DATA: RH Allocations for 2025 (Based on uploaded images)
-- ============================================================================

-- Bangalore/Hyderabad (Total: 5 RH)
INSERT INTO leave_rh_allocation (year, city, total_rh, month_allocation)
VALUES 
(2025, 'Bangalore', 5, JSON_OBJECT('Jan', 5, 'Feb', 5, 'Mar', 4, 'Apr', 4, 'May', 3, 'Jun', 3, 'Jul', 2, 'Aug', 2, 'Sep', 1, 'Oct', 1, 'Nov', 1, 'Dec', 1)),
(2025, 'Hyderabad', 5, JSON_OBJECT('Jan', 5, 'Feb', 5, 'Mar', 4, 'Apr', 4, 'May', 3, 'Jun', 3, 'Jul', 2, 'Aug', 2, 'Sep', 1, 'Oct', 1, 'Nov', 1, 'Dec', 1))
ON DUPLICATE KEY UPDATE month_allocation = VALUES(month_allocation);

-- Mumbai/Delhi/Tamil Nadu (Total: 6 RH)
INSERT INTO leave_rh_allocation (year, city, total_rh, month_allocation)
VALUES 
(2025, 'Mumbai', 6, JSON_OBJECT('Jan', 6, 'Feb', 6, 'Mar', 5, 'Apr', 5, 'May', 4, 'Jun', 4, 'Jul', 3, 'Aug', 3, 'Sep', 2, 'Oct', 2, 'Nov', 1, 'Dec', 1)),
(2025, 'Delhi', 6, JSON_OBJECT('Jan', 6, 'Feb', 6, 'Mar', 5, 'Apr', 5, 'May', 4, 'Jun', 4, 'Jul', 3, 'Aug', 3, 'Sep', 2, 'Oct', 2, 'Nov', 1, 'Dec', 1)),
(2025, 'Chennai', 6, JSON_OBJECT('Jan', 6, 'Feb', 6, 'Mar', 5, 'Apr', 5, 'May', 4, 'Jun', 4, 'Jul', 3, 'Aug', 3, 'Sep', 2, 'Oct', 2, 'Nov', 1, 'Dec', 1)),
(2025, 'Tamil Nadu', 6, JSON_OBJECT('Jan', 6, 'Feb', 6, 'Mar', 5, 'Apr', 5, 'May', 4, 'Jun', 4, 'Jul', 3, 'Aug', 3, 'Sep', 2, 'Oct', 2, 'Nov', 1, 'Dec', 1))
ON DUPLICATE KEY UPDATE month_allocation = VALUES(month_allocation);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'Leave Management System tables created successfully!' AS status,
       'Tables: leave_config, leave_policy_master, leave_policy_mapping, leave_holidays, leave_audit_trail, employee_leave_policy, leave_rh_allocation' AS tables_created,
       'Seed data inserted for default leave types and RH allocations' AS seed_data;
