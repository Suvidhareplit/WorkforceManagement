// ============================================================================
// Leave Management System - TypeScript Interfaces
// ============================================================================

export interface LeaveConfig {
  id?: number;
  leave_type: string;
  display_name: string;
  allocation_type: 'ANNUAL' | 'MONTHLY_ACCRUAL' | 'ONE_TIME';
  annual_quota?: number;
  monthly_accrual?: number;
  prorate_enabled: boolean;
  carry_forward_enabled: boolean;
  max_carry_forward?: number;
  encashment_enabled: boolean;
  max_encashment?: number;
  eligibility_months: number;
  max_consecutive_days?: number;
  min_notice_days?: number;
  doc_required_days?: number;
  is_active: boolean;
  description?: string;
  rules?: any; // JSON object
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
}

export interface LeavePolicyMaster {
  id?: number;
  policy_name: string;
  policy_code: string;
  description?: string;
  effective_from: string | Date;
  effective_to?: string | Date;
  is_default: boolean;
  is_active: boolean;
  version: number;
  parent_policy_id?: number;
  city?: string;
  department?: string;
  business_unit?: string;
  employee_type: 'FULL_TIME' | 'CONTRACT' | 'INTERN' | 'ALL';
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
}

export interface LeavePolicyMapping {
  id?: number;
  policy_id: number;
  leave_type: string;
  allocation_override?: number;
  accrual_override?: number;
  eligibility_override?: number;
  notice_days_override?: number;
  doc_required_override?: number;
  is_enabled: boolean;
  custom_rules?: any;
  created_at?: Date;
  updated_at?: Date;
}

export interface LeaveHoliday {
  id?: number;
  year: number;
  holiday_date: string | Date;
  holiday_name: string;
  holiday_type: 'GOVERNMENT' | 'RESTRICTED';
  city?: string;
  state?: string;
  is_optional: boolean;
  description?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
}

export interface LeaveAuditTrail {
  id?: number;
  entity_type: 'CONFIG' | 'POLICY' | 'HOLIDAY' | 'EMPLOYEE_ASSIGN' | 'POLICY_MAPPING';
  entity_id: number;
  entity_name?: string;
  action_type: 'CREATE' | 'EDIT' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE';
  old_value?: any;
  new_value?: any;
  summary?: string;
  change_reason: string;
  changed_by: number;
  changed_by_name?: string;
  changed_by_role?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

export interface EmployeeLeavePolicy {
  id?: number;
  employee_id: string;
  employee_name?: string;
  policy_id: number;
  assigned_date: string | Date;
  effective_from: string | Date;
  effective_to?: string | Date;
  doj?: string | Date;
  city?: string;
  is_active: boolean;
  assigned_by?: number;
  reason?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface LeaveRHAllocation {
  id?: number;
  year: number;
  city: string;
  total_rh: number;
  month_allocation: any; // JSON object with month-wise allocation
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
}

// Request/Response types
export interface CreateLeaveConfigRequest {
  leave_type: string;
  display_name: string;
  allocation_type: string;
  annual_quota?: number;
  monthly_accrual?: number;
  prorate_enabled: boolean;
  carry_forward_enabled: boolean;
  max_carry_forward?: number;
  encashment_enabled: boolean;
  max_encashment?: number;
  eligibility_months: number;
  max_consecutive_days?: number;
  min_notice_days?: number;
  doc_required_days?: number;
  description?: string;
  rules?: any;
  change_reason: string; // For audit trail
}

export interface CreatePolicyRequest {
  policy_name: string;
  policy_code: string;
  description?: string;
  effective_from: string;
  effective_to?: string;
  is_default: boolean;
  city?: string;
  department?: string;
  business_unit?: string;
  employee_type: string;
  leave_mappings: Array<{
    leave_type: string;
    allocation_override?: number;
    accrual_override?: number;
    eligibility_override?: number;
    notice_days_override?: number;
    doc_required_override?: number;
    is_enabled: boolean;
    custom_rules?: any;
  }>;
  change_reason: string;
}

export interface CreateHolidayRequest {
  year: number;
  holiday_date: string;
  holiday_name: string;
  holiday_type: 'GOVERNMENT' | 'RESTRICTED';
  city?: string;
  state?: string;
  is_optional: boolean;
  description?: string;
  change_reason: string;
}

export interface AuditFilters {
  entity_type?: string;
  start_date?: string;
  end_date?: string;
  changed_by?: number;
  action_type?: string;
  page?: number;
  limit?: number;
}

export interface PolicyPreview {
  policy: LeavePolicyMaster;
  leave_types: Array<{
    leave_type: string;
    display_name: string;
    allocation: number;
    accrual?: number;
    eligibility_months: number;
    notice_days?: number;
    doc_required_days?: number;
    rules: any;
  }>;
}
