import { Request, Response } from "express";
import { query } from '../config/db';
import { ExitAuditLogger } from '../utils/auditLogger';

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
    // For migration records, candidate_id and field_training_id can be null
    const values = [
      onboarding.candidate_id || null,
      onboarding.id,
      onboarding.field_training_id || null,
      onboarding.name,
      onboarding.mobile_number,
      onboarding.email,
      onboarding.city,
      onboarding.cluster,
      onboarding.role,
      onboarding.designation,
      onboarding.legal_entity,
      onboarding.business_unit_name,
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
      'working',
      userId
    ];
    
    const result = await query(
      `INSERT INTO employees (
        candidate_id, onboarding_id, field_training_id,
        name, mobile_number, email, city, cluster, role, designation,
        legal_entity, business_unit_name, department_name, sub_department_name, employment_type,
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
        working_status,
        profile_created_at, profile_created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
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
    // Join with employee_exits to get exit_status
    const result = await query(
      `SELECT e.*, ee.exit_status, ee.exit_type
       FROM employees e
       LEFT JOIN employee_exits ee ON e.employee_id = ee.employee_id AND ee.exit_status != 'cancelled'
       ORDER BY e.created_at DESC`
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
    
    // Get employee basic data
    const employeeResult = await query(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );
    
    if (!employeeResult.rows || employeeResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    const employee = employeeResult.rows[0] as any;
    
    // Get active exit data if exists
    const exitResult = await query(
      'SELECT * FROM employee_exits WHERE employee_id = ? AND exit_status != ? ORDER BY created_at DESC LIMIT 1',
      [employee.employee_id, 'cancelled']
    );
    
    // Merge exit data with employee data for backward compatibility
    if (exitResult.rows && exitResult.rows.length > 0) {
      const exitData = exitResult.rows[0] as any;
      employee.exit_type = exitData.exit_type;
      employee.exit_reason = exitData.exit_reason;
      employee.exit_initiated_date = exitData.exit_initiated_date;
      employee.lwd = exitData.last_working_day;
      employee.date_of_exit = exitData.date_of_exit;
      employee.discussion_with_employee = exitData.discussion_with_employee;
      employee.discussion_summary = exitData.discussion_summary;
      employee.termination_notice_date = exitData.termination_notice_date;
      employee.notice_period_served = exitData.notice_period_served;
      employee.okay_to_rehire = exitData.okay_to_rehire;
      employee.absconding_letter_sent = exitData.absconding_letter_sent;
      employee.exit_additional_comments = exitData.exit_additional_comments;
      employee.exit_status = exitData.exit_status;
    }
    
    res.json({ data: employee });
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

// Initiate employee exit
const initiateExit = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const {
      exitType,
      exitReason,
      discussionWithEmployee,
      discussionSummary,
      terminationNoticeDate,
      lastWorkingDay,
      noticePeriodServed,
      okayToRehire,
      abscondingLetterSent,
      additionalComments
    } = req.body;

    console.log('🚪 Initiate Exit Request:', {
      employeeId,
      exitType,
      exitReason,
      lastWorkingDay
    });

    // Validate required fields
    if (!exitType || !lastWorkingDay) {
      return res.status(400).json({ message: "Exit type and last working day are required" });
    }

    // Validate exit type
    if (!['voluntary', 'involuntary', 'absconding'].includes(exitType)) {
      return res.status(400).json({ message: "Invalid exit type" });
    }

    // Check if employee exists
    const employeeResult = await query(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employeeId]
    );

    if (!employeeResult.rows || employeeResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const employee = employeeResult.rows[0] as any;

    // Check if employee is already relieved
    if (employee.working_status === 'relieved') {
      return res.status(400).json({ message: "Employee is already relieved" });
    }

    // Get current date for exit_initiated_date (format: YYYY-MM-DD)
    const exitInitiatedDate = new Date().toISOString().split('T')[0];

    // Check if exit record already exists
    const existingExitResult = await query(
      'SELECT * FROM employee_exits WHERE employee_id = ? AND exit_status != ?',
      [employeeId, 'cancelled']
    );

    if (existingExitResult.rows && existingExitResult.rows.length > 0) {
      return res.status(400).json({ message: "Exit process already initiated for this employee" });
    }

    // Insert into employee_exits table
    const insertExitQuery = `
      INSERT INTO employee_exits (
        employee_id, 
        exit_type, 
        exit_reason, 
        discussion_with_employee,
        discussion_summary,
        termination_notice_date,
        last_working_day,
        notice_period_served,
        okay_to_rehire,
        absconding_letter_sent,
        exit_additional_comments,
        exit_initiated_date,
        exit_status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'initiated', NOW(), NOW())
    `;

    const exitParams = [
      employeeId,
      exitType,
      exitReason || null,
      discussionWithEmployee || null,
      discussionSummary || null,
      terminationNoticeDate || null,
      lastWorkingDay,
      noticePeriodServed || null,
      okayToRehire || null,
      abscondingLetterSent || null,
      additionalComments || null,
      exitInitiatedDate
    ];

    const exitResult = await query(insertExitQuery, exitParams);

    // NOTE: Do NOT update working_status here when exit is initiated
    // working_status should only change to 'relieved' when exit_status becomes 'completed'
    // The employee remains 'working' until the exit process is fully completed

    // Log audit trail
    await ExitAuditLogger.logExitInitiation(
      employeeId,
      {
        exitType,
        exitReason,
        discussionWithEmployee,
        discussionSummary,
        terminationNoticeDate,
        lastWorkingDay,
        noticePeriodServed,
        okayToRehire,
        abscondingLetterSent,
        additionalComments
      },
      req,
      'system', // TODO: Get from authenticated user
      'System User' // TODO: Get from authenticated user
    );

    console.log('✅ Exit initiated successfully for employee:', employeeId);

    res.json({ 
      message: "Exit initiated successfully",
      exitInitiatedDate,
      employeeId
    });
  } catch (error) {
    console.error('Initiate exit error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Revoke employee exit
const revokeExit = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    console.log('🔄 Revoke Exit Request for employee:', employeeId);

    // Check if employee exists
    const employeeResult = await query(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employeeId]
    );

    if (!employeeResult.rows || employeeResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const employee = employeeResult.rows[0] as any;

    // Check if employee has active exit record
    const exitResult = await query(
      'SELECT * FROM employee_exits WHERE employee_id = ? AND exit_status != ?',
      [employeeId, 'cancelled']
    );

    if (!exitResult.rows || exitResult.rows.length === 0) {
      return res.status(400).json({ message: "No active exit process found for this employee" });
    }

    const exitRecord = exitResult.rows[0] as any;

    // Check if employee is already relieved
    if (employee.working_status === 'relieved') {
      return res.status(400).json({ message: "Cannot revoke exit for relieved employee" });
    }

    // Store previous exit data for audit trail
    const previousExitData = {
      exit_type: exitRecord.exit_type,
      exit_reason: exitRecord.exit_reason,
      discussion_with_employee: exitRecord.discussion_with_employee,
      discussion_summary: exitRecord.discussion_summary,
      termination_notice_date: exitRecord.termination_notice_date,
      last_working_day: exitRecord.last_working_day,
      notice_period_served: exitRecord.notice_period_served,
      okay_to_rehire: exitRecord.okay_to_rehire,
      absconding_letter_sent: exitRecord.absconding_letter_sent,
      exit_additional_comments: exitRecord.exit_additional_comments,
      exit_initiated_date: exitRecord.exit_initiated_date,
      working_status: employee.working_status
    };

    // Cancel the exit record (don't delete, for audit purposes)
    await query(
      'UPDATE employee_exits SET exit_status = ?, updated_at = NOW() WHERE employee_id = ? AND exit_status != ?',
      ['cancelled', employeeId, 'cancelled']
    );

    // Reset working status to working
    await query(
      'UPDATE employees SET working_status = ? WHERE employee_id = ?',
      ['working', employeeId]
    );

    // Log audit trail
    await ExitAuditLogger.logExitRevocation(
      employeeId,
      previousExitData,
      req,
      'system', // TODO: Get from authenticated user
      'System User' // TODO: Get from authenticated user
    );

    console.log('✅ Exit revoked successfully for employee:', employeeId);

    res.json({ 
      message: "Exit revoked successfully",
      employeeId
    });
  } catch (error) {
    console.error('Revoke exit error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get exit process list - all exit records with employee details
const getExitProcessList = async (req: Request, res: Response) => {
  try {
    const { status, department, location, exitType, businessUnit, costCenter, legalEntity, search } = req.query;
    
    console.log('📋 Get Exit Process List Request:', { status, department, location, exitType, businessUnit, costCenter, legalEntity, search });

    let whereConditions = ['ee.exit_status != ?'];
    const params: any[] = ['cancelled'];

    // Filter by exit status - "initiated" goes to "under_review"
    if (status && status !== 'all') {
      if (status === 'under_review') {
        whereConditions.push("ee.exit_status = 'initiated'");
      } else if (status === 'in_progress') {
        whereConditions.push("ee.exit_status = 'in_progress'");
      } else if (status === 'exited') {
        whereConditions.push("ee.exit_status = 'completed'");
      }
    }

    // Filter by exit type
    if (exitType && exitType !== 'all') {
      whereConditions.push('ee.exit_type = ?');
      params.push(exitType);
    }

    // Filter by department
    if (department && department !== 'all') {
      whereConditions.push('e.department_name = ?');
      params.push(department);
    }

    // Filter by location
    if (location && location !== 'all') {
      whereConditions.push('e.city = ?');
      params.push(location);
    }

    // Filter by business unit
    if (businessUnit && businessUnit !== 'all') {
      whereConditions.push('e.business_unit_name = ?');
      params.push(businessUnit);
    }

    // Filter by cost center
    if (costCenter && costCenter !== 'all') {
      whereConditions.push('e.cost_centre = ?');
      params.push(costCenter);
    }

    // Filter by legal entity
    if (legalEntity && legalEntity !== 'all') {
      whereConditions.push('e.legal_entity = ?');
      params.push(legalEntity);
    }

    // Search by employee name or ID
    if (search) {
      whereConditions.push('(e.name LIKE ? OR e.employee_id LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const listQuery = `
      SELECT 
        ee.id,
        ee.employee_id,
        e.name as employee_name,
        e.role as designation,
        e.department_name,
        e.city as location,
        ee.exit_type,
        ee.exit_reason,
        ee.exit_initiated_date,
        ee.termination_notice_date as notice_date,
        ee.last_working_day,
        ee.exit_status,
        ee.discussion_with_employee,
        ee.okay_to_rehire,
        ee.initiated_by,
        ee.approved_by,
        ee.created_at
      FROM employee_exits ee
      LEFT JOIN employees e ON ee.employee_id = e.employee_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ee.created_at DESC
      LIMIT 100
    `;

    console.log('📋 Exit Process Query:', listQuery);

    const result = await query(listQuery, params);
    const rows = result.rows || [];

    // Count by status - 'initiated' = under_review, 'in_progress' = in_progress, 'completed' = exited
    const countQuery = `
      SELECT 
        SUM(CASE WHEN exit_status = 'initiated' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN exit_status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN exit_status = 'completed' THEN 1 ELSE 0 END) as exited
      FROM employee_exits
      WHERE exit_status != 'cancelled'
    `;
    const countResult = await query(countQuery);
    const counts: any = countResult.rows?.[0] || { under_review: 0, in_progress: 0, exited: 0 };

    console.log('✅ Exit process list retrieved:', { count: rows.length, counts });

    res.json({
      message: "Exit process list retrieved successfully",
      data: rows,
      counts: {
        underReview: parseInt(counts.under_review) || 0,
        inProgress: parseInt(counts.in_progress) || 0,
        exited: parseInt(counts.exited) || 0
      }
    });
  } catch (error: any) {
    console.error('Get exit process list error:', error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error?.message || 'Unknown error'
    });
  }
};

// Get exit summary for chart - grouped by month and exit type
const getExitSummary = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, viewType } = req.query;
    
    console.log('📊 Get Exit Summary Request:', { startDate, endDate, viewType });

    // Build date filter
    let dateCondition = '';
    const params: any[] = [];
    
    if (startDate && endDate) {
      dateCondition = `(ee.last_working_day BETWEEN ? AND ? OR ee.exit_initiated_date BETWEEN ? AND ?)`;
      params.push(startDate, endDate, startDate, endDate);
    } else {
      // Default to last 12 months
      dateCondition = `ee.exit_initiated_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)`;
    }

    // Query to get exit counts grouped by month and type
    const summaryQuery = `
      SELECT 
        DATE_FORMAT(COALESCE(ee.last_working_day, ee.exit_initiated_date), '%Y-%m') as period,
        DATE_FORMAT(COALESCE(ee.last_working_day, ee.exit_initiated_date), '%b-%Y') as period_label,
        ee.exit_type,
        COUNT(*) as count
      FROM employee_exits ee
      WHERE ${dateCondition}
        AND ee.exit_status != 'cancelled'
        AND ee.exit_type IS NOT NULL
      GROUP BY period, period_label, ee.exit_type
      ORDER BY period ASC
    `;

    console.log('📊 Exit Summary Query:', summaryQuery);
    console.log('📊 Query Params:', params);

    const result = await query(summaryQuery, params);
    const rows = result.rows || result || [];

    // Transform data for chart - group by period
    const periodMap: Record<string, { period: string, voluntary: number, involuntary: number, absconding: number }> = {};
    
    rows.forEach((row: any) => {
      if (!periodMap[row.period]) {
        periodMap[row.period] = {
          period: row.period_label,
          voluntary: 0,
          involuntary: 0,
          absconding: 0
        };
      }
      
      if (row.exit_type === 'voluntary') {
        periodMap[row.period].voluntary = parseInt(row.count);
      } else if (row.exit_type === 'involuntary') {
        periodMap[row.period].involuntary = parseInt(row.count);
      } else if (row.exit_type === 'absconding') {
        periodMap[row.period].absconding = parseInt(row.count);
      }
    });

    // Convert to array and sort by period
    const chartData = Object.entries(periodMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, data]) => data);

    // Calculate totals
    const totals = {
      voluntary: chartData.reduce((sum, d) => sum + d.voluntary, 0),
      involuntary: chartData.reduce((sum, d) => sum + d.involuntary, 0),
      absconding: chartData.reduce((sum, d) => sum + d.absconding, 0),
      total: 0
    };
    totals.total = totals.voluntary + totals.involuntary + totals.absconding;

    console.log('✅ Exit summary retrieved:', { periods: chartData.length, totals });

    res.json({
      message: "Exit summary retrieved successfully",
      data: chartData,
      totals
    });
  } catch (error: any) {
    console.error('Get exit summary error:', error);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error?.message || 'Unknown error'
    });
  }
};

// Get exit audit trail for an employee
const getExitAuditTrail = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    console.log('📋 Get Exit Audit Trail Request for employee:', employeeId);

    // Check if employee exists
    const employeeResult = await query(
      'SELECT employee_id, name FROM employees WHERE employee_id = ?',
      [employeeId]
    );

    if (!employeeResult.rows || employeeResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Get audit trail
    const auditTrail = await ExitAuditLogger.getEmployeeAuditTrail(employeeId, limit);

    console.log(`✅ Retrieved ${auditTrail.length} audit records for employee:`, employeeId);

    res.json({
      message: "Audit trail retrieved successfully",
      employeeId,
      auditTrail,
      totalRecords: auditTrail.length
    });
  } catch (error) {
    console.error('Get audit trail error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Review employee exit - changes status from 'initiated' to 'in_progress'
const reviewExit = async (req: Request, res: Response) => {
  try {
    const { exitId } = req.params;
    
    console.log('📋 Review Exit Request for exit ID:', exitId);

    // Check if exit record exists
    const exitResult = await query(
      'SELECT * FROM employee_exits WHERE id = ?',
      [exitId]
    );

    if (!exitResult.rows || exitResult.rows.length === 0) {
      return res.status(404).json({ message: "Exit record not found" });
    }

    const exitRecord = exitResult.rows[0] as any;

    if (exitRecord.exit_status !== 'initiated') {
      return res.status(400).json({ message: "Exit can only be reviewed when status is 'initiated'" });
    }

    // Update exit status to 'in_progress'
    await query(
      'UPDATE employee_exits SET exit_status = ?, updated_at = NOW() WHERE id = ?',
      ['in_progress', exitId]
    );

    console.log('✅ Exit reviewed successfully for exit ID:', exitId);

    res.json({ 
      message: "Exit reviewed successfully",
      exitId,
      newStatus: 'in_progress'
    });
  } catch (error) {
    console.error('Review exit error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Complete employee exit - changes status from 'in_progress' to 'completed' and updates working_status
const completeExit = async (req: Request, res: Response) => {
  try {
    const { exitId } = req.params;
    
    console.log('✅ Complete Exit Request for exit ID:', exitId);

    // Check if exit record exists
    const exitResult = await query(
      'SELECT * FROM employee_exits WHERE id = ?',
      [exitId]
    );

    if (!exitResult.rows || exitResult.rows.length === 0) {
      return res.status(404).json({ message: "Exit record not found" });
    }

    const exitRecord = exitResult.rows[0] as any;

    if (exitRecord.exit_status !== 'in_progress') {
      return res.status(400).json({ message: "Exit can only be completed when status is 'in_progress'" });
    }

    // Update exit status to 'completed'
    await query(
      'UPDATE employee_exits SET exit_status = ?, updated_at = NOW() WHERE id = ?',
      ['completed', exitId]
    );

    // Update employee working_status to 'relieved'
    await query(
      'UPDATE employees SET working_status = ? WHERE employee_id = ?',
      ['relieved', exitRecord.employee_id]
    );

    console.log('✅ Exit completed successfully for exit ID:', exitId, 'Employee:', exitRecord.employee_id);

    res.json({ 
      message: "Exit completed successfully. Employee status updated to relieved.",
      exitId,
      employeeId: exitRecord.employee_id,
      newStatus: 'completed'
    });
  } catch (error) {
    console.error('Complete exit error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get org hierarchy for dashboard
const getOrgHierarchy = async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const { city, cluster, employment_type, business_unit } = req.query;
    
    // Build WHERE clause
    let whereConditions = ["working_status = 'working'"];
    const params: any[] = [];
    
    if (city && city !== 'all') {
      whereConditions.push("city = ?");
      params.push(city);
    }
    if (cluster && cluster !== 'all') {
      whereConditions.push("cluster = ?");
      params.push(cluster);
    }
    if (employment_type && employment_type !== 'all') {
      whereConditions.push("employment_type = ?");
      params.push(employment_type);
    }
    if (business_unit && business_unit !== 'all') {
      whereConditions.push("business_unit_name = ?");
      params.push(business_unit);
    }
    
    const whereClause = whereConditions.join(" AND ");
    
    // Get hierarchical data from employees table
    const result = await query(
      `SELECT 
        department_name,
        sub_department_name,
        role,
        designation,
        COUNT(*) as count
      FROM employees
      WHERE ${whereClause}
      GROUP BY department_name, sub_department_name, role, designation
      ORDER BY department_name, sub_department_name, role, designation`,
      params
    );
    
    const rows = result.rows || [];
    
    // Build hierarchy structure
    const departmentMap = new Map();
    let totalCount = 0;
    
    rows.forEach((row: any) => {
      totalCount += parseInt(row.count);
      
      const deptName = row.department_name || 'Unassigned';
      const subDeptName = row.sub_department_name || 'Unassigned';
      const roleName = row.role || 'Unassigned';
      const designationName = row.designation || 'Unassigned';
      
      // EV - Ops Data Correction (Handle any legacy data that might have slipped through)
      const normalizedRoleName = (roleName === 'Ev-Ops' || roleName === 'EV-Ops') ? 'EV - Ops' : roleName;
      
      if (!departmentMap.has(deptName)) {
        departmentMap.set(deptName, { name: deptName, count: 0, children: new Map() });
      }
      const dept = departmentMap.get(deptName);
      dept.count += parseInt(row.count);
      
      if (!dept.children.has(subDeptName)) {
        dept.children.set(subDeptName, { name: subDeptName, count: 0, children: new Map() });
      }
      const subDept = dept.children.get(subDeptName);
      subDept.count += parseInt(row.count);
      
      if (!subDept.children.has(normalizedRoleName)) {
        subDept.children.set(normalizedRoleName, { name: normalizedRoleName, count: 0, children: new Map() });
      }
      const role = subDept.children.get(normalizedRoleName);
      role.count += parseInt(row.count);
      
      if (!role.children.has(designationName)) {
        role.children.set(designationName, { name: designationName, count: 0 });
      }
      const designation = role.children.get(designationName);
      designation.count += parseInt(row.count);
    });
    
    // Convert Maps to arrays
    const hierarchy = Array.from(departmentMap.values()).map((dept: any) => ({
      name: dept.name,
      count: dept.count,
      children: Array.from(dept.children.values()).map((subDept: any) => ({
        name: subDept.name,
        count: subDept.count,
        children: Array.from(subDept.children.values()).map((role: any) => ({
          name: role.name,
          count: role.count,
          children: Array.from(role.children.values())
        }))
      }))
    }));
    
    // Sort by count descending
    hierarchy.sort((a: any, b: any) => b.count - a.count);
    hierarchy.forEach((dept: any) => {
      dept.children.sort((a: any, b: any) => b.count - a.count);
      dept.children.forEach((subDept: any) => {
        subDept.children.sort((a: any, b: any) => b.count - a.count);
        subDept.children.forEach((role: any) => {
          role.children.sort((a: any, b: any) => b.count - a.count);
        });
      });
    });
    
    // Get unique counts from master data tables - FILTERED based on employees (except clusters which uses master data)
    const deptCountResult = await query(`SELECT COUNT(DISTINCT department_name) as count FROM employees WHERE ${whereClause}`, params);
    const subDeptCountResult = await query(`SELECT COUNT(DISTINCT sub_department_name) as count FROM employees WHERE ${whereClause}`, params);
    const roleCountResult = await query(`SELECT COUNT(DISTINCT role) as count FROM employees WHERE ${whereClause}`, params);
    const designationCountResult = await query(`SELECT COUNT(DISTINCT designation) as count FROM employees WHERE ${whereClause}`, params);
    const cityCountResult = await query(`SELECT COUNT(DISTINCT city) as count FROM employees WHERE ${whereClause}`, params);
    // Clusters count from master data table (not filtered)
    const clusterCountResult = await query("SELECT COUNT(DISTINCT name) as count FROM clusters");
    const costCentreCountResult = await query(`SELECT COUNT(DISTINCT cost_centre) as count FROM employees WHERE ${whereClause} AND cost_centre IS NOT NULL`, params);
    
    // Centres count - difficult to filter by BU directly as it's not on employees table usually, 
    // but we can filter by city/cluster if present in params.
    // For now, we'll keep it as total centres or filter by city/cluster if possible.
    // Let's rely on the centresList logic below which we can filter by city/cluster.
    
    // Get business units for filter (global list, not filtered)
    const businessUnitResult = await query("SELECT DISTINCT business_unit_name FROM employees WHERE working_status = 'working' AND business_unit_name IS NOT NULL ORDER BY business_unit_name");
    const businessUnits = (businessUnitResult.rows || []).map((row: any) => row.business_unit_name);
    
    // Get clusters with centre counts - Filter by City if selected
    let clustersWhere = "c.is_active = 1 OR c.is_active IS NULL";
    const clustersParams: any[] = [];
    if (city && city !== 'all') {
      clustersWhere += " AND ci.name = ?";
      clustersParams.push(city);
    }
    // Note: We can't easily filter clusters/cities/centres by Business Unit without a join, 
    // and the request specifically asked for Metric Cards and Headcounts to work.
    
    const clustersWithCentres = await query(`
      SELECT c.id, c.name, c.city_id, ci.name as city_name, CAST(COUNT(ce.id) AS SIGNED) as centre_count
      FROM clusters c
      LEFT JOIN centres ce ON ce.cluster_id = c.id
      LEFT JOIN cities ci ON c.city_id = ci.id
      WHERE ${clustersWhere}
      GROUP BY c.id, c.name, c.city_id, ci.name
      ORDER BY centre_count DESC, ci.name, c.name
    `, clustersParams);
    
    // Get cities with cluster counts
    const citiesWithClusters = await query(`
      SELECT ci.id, ci.name, CAST(COUNT(c.id) AS SIGNED) as cluster_count
      FROM cities ci
      LEFT JOIN clusters c ON c.city_id = ci.id
      WHERE ci.is_active = 1 OR ci.is_active IS NULL
      GROUP BY ci.id, ci.name
      ORDER BY ci.name
    `);
    
    // Get all centres with cluster and city info - Filter by City/Cluster
    let centresWhere = "1=1";
    const centresParams: any[] = [];
    if (city && city !== 'all') {
      centresWhere += " AND ci.name = ?";
      centresParams.push(city);
    }
    if (cluster && cluster !== 'all') {
      centresWhere += " AND c.name = ?";
      centresParams.push(cluster);
    }

    // Centres count - Hardcode to 0 for Yumove business unit, otherwise count from master data
    let centreCount = 0;
    if (business_unit && business_unit === 'Yumove') {
      centreCount = 0;
    } else {
      const centreCountResult = await query("SELECT COUNT(*) as count FROM centres");
      centreCount = parseInt((centreCountResult.rows?.[0] as any)?.count) || 0;
    }

    // Get all centres with cluster and city info - Filter by City/Cluster (kept for list view)
    const centresList = await query(`
      SELECT ce.id, ce.name, c.name as cluster_name, ci.name as city_name
      FROM centres ce
      LEFT JOIN clusters c ON ce.cluster_id = c.id
      LEFT JOIN cities ci ON c.city_id = ci.id
      WHERE ${centresWhere}
      ORDER BY ci.name, c.name, ce.name
    `, centresParams);
    
    // Get cost centres with employee counts - FILTERED
    const costCentresList = await query(`
      SELECT cost_centre as name, CAST(COUNT(*) AS SIGNED) as employee_count
      FROM employees
      WHERE ${whereClause} AND cost_centre IS NOT NULL
      GROUP BY cost_centre
      ORDER BY employee_count DESC
    `, params);
    
    // Get city-wise employee headcount - FILTERED
    const cityWiseHeadcount = await query(`
      SELECT city as name, CAST(COUNT(*) AS SIGNED) as employee_count
      FROM employees
      WHERE ${whereClause} AND city IS NOT NULL
      GROUP BY city
      ORDER BY city
    `, params);

    // Get cluster-wise employee headcount with city info - FILTERED
    const clusterWiseHeadcount = await query(`
      SELECT cluster as name, city, CAST(COUNT(*) AS SIGNED) as employee_count
      FROM employees
      WHERE ${whereClause} AND cluster IS NOT NULL
      GROUP BY cluster, city
      ORDER BY city, employee_count DESC
    `, params);

    // Get designation-wise headcount per cluster - FILTERED
    const clusterDesignationHeadcount = await query(`
      SELECT cluster, designation, CAST(COUNT(*) AS SIGNED) as count
      FROM employees
      WHERE ${whereClause} AND cluster IS NOT NULL AND designation IS NOT NULL
      GROUP BY cluster, designation
      ORDER BY cluster, count DESC
    `, params);

    // Get city-wise designation headcount - FILTERED
    const cityDesignationHeadcount = await query(`
      SELECT city, designation, CAST(COUNT(*) AS SIGNED) as count
      FROM employees
      WHERE ${whereClause} AND city IS NOT NULL AND designation IS NOT NULL
      GROUP BY city, designation
      ORDER BY city, count DESC
    `, params);
    
    const masterCounts = {
      departments: parseInt((deptCountResult.rows?.[0] as any)?.count) || 0,
      subDepartments: parseInt((subDeptCountResult.rows?.[0] as any)?.count) || 0,
      roles: parseInt((roleCountResult.rows?.[0] as any)?.count) || 0,
      designations: parseInt((designationCountResult.rows?.[0] as any)?.count) || 0,
      cities: parseInt((cityCountResult.rows?.[0] as any)?.count) || 0,
      clusters: parseInt((clusterCountResult.rows?.[0] as any)?.count) || 0,
      centres: centreCount,
      costCentres: parseInt((costCentreCountResult.rows?.[0] as any)?.count) || 0
    };
    
    // Explicitly map data to ensure correct types
    const clustersData = (clustersWithCentres.rows || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      city_id: c.city_id,
      city_name: c.city_name,
      centre_count: Number(c.centre_count) || 0
    }));

    const citiesData = (citiesWithClusters.rows || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      cluster_count: Number(c.cluster_count) || 0
    }));

    const costCentresData = (costCentresList.rows || []).map((c: any) => ({
      name: c.name,
      employee_count: Number(c.employee_count) || 0
    }));

    // Map centres with city info
    const centresData = (centresList.rows || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      cluster_name: c.cluster_name,
      city_name: c.city_name || 'Unknown'
    }));

    // Map city-wise headcount
    const cityWiseData = (cityWiseHeadcount.rows || []).map((c: any) => ({
      city: c.name,
      count: Number(c.employee_count) || 0
    }));

    const clusterWiseData = (clusterWiseHeadcount.rows || []).map((c: any) => ({
      name: c.name,
      city: c.city,
      employeeCount: Number(c.employee_count) || 0
    }));

    const clusterDesignationData = (clusterDesignationHeadcount.rows || []).map((c: any) => ({
      cluster: c.cluster,
      designation: c.designation,
      count: Number(c.count) || 0
    }));

    const cityDesignationData = (cityDesignationHeadcount.rows || []).map((c: any) => ({
      city: c.city,
      designation: c.designation,
      count: Number(c.count) || 0
    }));

    res.json({ 
      hierarchy, 
      totalCount, 
      masterCounts, 
      clustersWithCentres: clustersData, 
      citiesWithClusters: citiesData,
      centresList: centresList.rows || [],
      costCentresList: costCentresData,
      cityWiseHeadcount: cityWiseData,
      clusterWiseHeadcount: clusterWiseData,
      clusterDesignationHeadcount: clusterDesignationData,
      cityDesignationHeadcount: cityDesignationData,
      businessUnits // Include business units in response
    });
  } catch (error) {
    console.error('Get org hierarchy error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get filter options for org dashboard - from master data tables
const getFilterOptions = async (req: Request, res: Response) => {
  try {
    // Get cities from master data
    const citiesResult = await query(
      "SELECT name FROM cities WHERE is_active = 1 OR is_active IS NULL ORDER BY name"
    );
    // Get clusters from master data
    const clustersResult = await query(
      "SELECT name FROM clusters WHERE is_active = 1 OR is_active IS NULL ORDER BY name"
    );
    // Employment types are typically fixed values
    const employmentTypesResult = await query(
      "SELECT DISTINCT employment_type FROM employees WHERE working_status = 'working' AND employment_type IS NOT NULL ORDER BY employment_type"
    );
    
    res.json({
      cities: (citiesResult.rows || []).map((r: any) => r.name),
      clusters: (clustersResult.rows || []).map((r: any) => r.name),
      employmentTypes: (employmentTypesResult.rows || []).map((r: any) => r.employment_type)
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const employeeController = {
  createEmployeeProfile,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  initiateExit,
  revokeExit,
  getExitAuditTrail,
  getExitSummary,
  getExitProcessList,
  reviewExit,
  completeExit,
  getOrgHierarchy,
  getFilterOptions
};
