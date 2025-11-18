import { Request, Response } from "express";
import { query } from '../config/db';

// Helper function to convert string boolean to actual boolean
const convertToBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'yes' || lower === 'true' || lower === '1';
  }
  return false;
};

// Create employee profile from onboarding record
const createEmployeeProfile = async (req: Request, res: Response) => {
  try {
    const { onboarding_id, group_doj, assets, documents, paygrade, payband } = req.body;
    
    console.log('🔍 Create Employee Profile Request:', {
      onboarding_id,
      group_doj,
      assets,
      documents,
      paygrade,
      payband
    });
    
    if (!onboarding_id) {
      return res.status(400).json({ message: "Onboarding ID is required" });
    }
    
    // Get onboarding record with all details
    const onboardingResult = await query(
      'SELECT * FROM onboarding WHERE id = ?',
      [onboarding_id]
    );
    
    if (!onboardingResult.rows || onboardingResult.rows.length === 0) {
      return res.status(404).json({ message: "Onboarding record not found" });
    }
    
    const onboarding = onboardingResult.rows[0] as any;
    
    // VALIDATION: Check if onboarding status is 'onboarded'
    if (onboarding.onboarding_status !== 'onboarded') {
      return res.status(400).json({ 
        message: `Cannot create employee profile. Candidate must be onboarded first. Current status: ${onboarding.onboarding_status}` 
      });
    }
    
    // VALIDATION: Check if employee profile already exists
    const existingEmployee = await query(
      'SELECT id FROM employees WHERE onboarding_id = ?',
      [onboarding_id]
    );
    
    if (existingEmployee.rows && existingEmployee.rows.length > 0) {
      return res.status(400).json({ 
        message: "Employee profile already exists for this onboarding record" 
      });
    }
    
    // Get user ID from request (for profile_created_by)
    const userId = (req as any).user?.id || null;
    
    // Create employee record with ALL onboarding data + new fields
    const values = [
      onboarding.candidate_id,
      onboarding.id,
      onboarding.field_training_id,
      onboarding.name,
      onboarding.mobile_number,
      onboarding.email,
      onboarding.city,
      onboarding.cluster,
      onboarding.role,
      onboarding.legal_entity,
      onboarding.business_unit_name,
      onboarding.function_name,
      onboarding.department_name,
      onboarding.sub_department_name,
      onboarding.employment_type,
      onboarding.manager_name,
      onboarding.date_of_joining,
      onboarding.gross_salary,
      onboarding.resume_source,
      onboarding.cost_centre,
      onboarding.vendor_id,
      onboarding.vendor_name,
      onboarding.recruiter_id,
      onboarding.recruiter_name,
      onboarding.referral_name,
      onboarding.referral_contact,
      onboarding.referral_relation,
      onboarding.direct_source,
      onboarding.gender,
      onboarding.date_of_birth,
      onboarding.blood_group,
      onboarding.marital_status,
      onboarding.physically_handicapped,  // Keep as "Yes"/"No" string
      onboarding.nationality,
      onboarding.international_worker,  // Keep as "Yes"/"No" string
      onboarding.pan_number,
      onboarding.name_as_per_pan,
      onboarding.aadhar_number,
      onboarding.name_as_per_aadhar,
      onboarding.account_number,
      onboarding.ifsc_code,
      onboarding.bank_name,
      onboarding.present_address,
      onboarding.permanent_address,
      onboarding.emergency_contact_number,
      onboarding.emergency_contact_name,
      onboarding.emergency_contact_relation,
      onboarding.father_name,
      onboarding.user_id,
      onboarding.employee_id,
      onboarding.uan_number,
      onboarding.esic_ip_number,
      group_doj || null,
      assets || null,
      documents || null,
      paygrade || null,
      payband || null,
      'active',
      null,  // date_of_exit - optional, can be filled later
      null,  // exit_initiated_date - optional, can be filled later
      null,  // lwd - optional, can be filled later
      userId
    ];
    
    const result = await query(
      `INSERT INTO employees (
        candidate_id, onboarding_id, field_training_id,
        name, mobile_number, email, city, cluster, role,
        legal_entity, business_unit_name, function_name, department_name, sub_department_name, employment_type,
        manager_name, date_of_joining, gross_salary,
        resume_source, cost_centre, vendor_id, vendor_name, recruiter_id, recruiter_name, referral_name,
        referral_contact, referral_relation, direct_source,
        gender, date_of_birth, blood_group, marital_status,
        physically_handicapped, nationality, international_worker,
        pan_number, name_as_per_pan, aadhar_number, name_as_per_aadhar,
        account_number, ifsc_code, bank_name,
        present_address, permanent_address,
        emergency_contact_number, emergency_contact_name, emergency_contact_relation,
        father_name,
        user_id, employee_id, uan_number, esic_ip_number,
        group_doj, assets, documents, paygrade, payband,
        working_status, date_of_exit, exit_initiated_date, lwd,
        profile_created_at, profile_created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      values
    );
    
    const employeeId = (result as any).insertId || result.rowCount;
    
    // Update candidate status to 'employee_created'
    await query(
      'UPDATE candidates SET status = ? WHERE id = ?',
      ['employee_created', onboarding.candidate_id]
    );
    
    // Mark profile as created in onboarding table
    await query(
      'UPDATE onboarding SET profile_created = TRUE WHERE id = ?',
      [onboarding_id]
    );
    
    console.log('✅ Employee profile created successfully:', employeeId);
    
    res.status(201).json({ 
      message: "Employee profile created successfully",
      data: { 
        employee_id: employeeId,
        candidate_id: onboarding.candidate_id,
        name: onboarding.name
      }
    });
  } catch (error) {
    console.error('Create employee profile error:', error);
    res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get all employees
const getEmployees = async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM employees ORDER BY created_at DESC'
    );
    
    res.json({ data: result.rows || [] });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get employee by ID
const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const result = await query(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update employee
const updateEmployee = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.keys(updateData).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    });
    
    values.push(id);
    
    await query(
      `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const employeeController = {
  createEmployeeProfile,
  getEmployees,
  getEmployeeById,
  updateEmployee
};
