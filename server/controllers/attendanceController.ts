import { Request, Response } from "express";
import { query } from '../config/db';
import nodemailer from 'nodemailer';

// Get active/working employees list for download
const getWorkingEmployees = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT 
        user_id,
        name,
        city,
        cluster
      FROM employees 
      WHERE working_status = 'working'
      ORDER BY name`,
      []
    );
    
    console.log('Working employees count:', result.rows?.length || 0);
    res.json({ data: result.rows || [] });
  } catch (error) {
    console.error('Error fetching working employees:', error);
    res.status(500).json({ message: "Failed to fetch working employees" });
  }
};

// Bulk upload attendance
const bulkUploadAttendance = async (req: Request, res: Response) => {
  try {
    const { records } = req.body;
    
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "No attendance records provided" });
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const errorRecords: any[] = [];
    
    for (const record of records) {
      const { userId, name, city, cluster, date, status } = record;
      
      if (!userId || !date || !status) {
        errorCount++;
        const errorMsg = `Missing required fields`;
        errors.push(`${errorMsg} for user ${userId || 'unknown'}`);
        errorRecords.push({ userId, name, city, cluster, date, status, error: errorMsg });
        continue;
      }
      
      // Validate status
      const validStatuses = ['present', 'absent', 'lop', 'sl', 'el', 'cl', 'ul'];
      if (!validStatuses.includes(status.toLowerCase())) {
        errorCount++;
        const errorMsg = `Invalid status '${status}'`;
        errors.push(`${errorMsg} for user ${userId}`);
        errorRecords.push({ userId, name, city, cluster, date, status, error: errorMsg });
        continue;
      }
      
      // Check if employee exists
      const employeeResult = await query(
        'SELECT id, employee_id, name, email, city, cluster, manager_name FROM employees WHERE user_id = ?',
        [userId]
      );
      
      if (!employeeResult.rows || employeeResult.rows.length === 0) {
        errorCount++;
        const errorMsg = `Employee not found`;
        errors.push(`${errorMsg} - User ID ${userId}`);
        errorRecords.push({ userId, name, city, cluster, date, status, error: errorMsg });
        continue;
      }
      
      const employee = employeeResult.rows[0] as any;
      
      // Check if attendance already exists for this date
      const existingResult = await query(
        'SELECT id FROM attendance WHERE user_id = ? AND attendance_date = ?',
        [userId, date]
      );
      
      if (existingResult.rows && existingResult.rows.length > 0) {
        // Update existing record
        await query(
          'UPDATE attendance SET status = ?, updated_at = NOW() WHERE user_id = ? AND attendance_date = ?',
          [status.toLowerCase(), userId, date]
        );
      } else {
        // Insert new record - use employee_id (YG0955 format) not id
        await query(
          `INSERT INTO attendance (user_id, employee_id, name, email, city, cluster, attendance_date, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [userId, employee.employee_id, employee.name, employee.email, employee.city, employee.cluster, date, status.toLowerCase()]
        );
      }
      
      successCount++;
    }
    
    // After upload, check for absconding cases
    await checkAbscondingCases();
    
    res.json({
      message: `Uploaded ${successCount} records successfully. ${errorCount} errors.`,
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // Return first 10 errors for display
      errorRecords // Return all error records with full details for CSV download
    });
  } catch (error) {
    console.error('Error uploading attendance:', error);
    res.status(500).json({ message: "Failed to upload attendance records" });
  }
};

// Get attendance records with filters
const getAttendance = async (req: Request, res: Response) => {
  try {
    const { month, year, day, city, cluster } = req.query;
    
    let sql = `
      SELECT 
        a.id,
        a.user_id as userId,
        a.employee_id as employeeId,
        a.name,
        a.email,
        a.city,
        a.cluster,
        a.attendance_date as attendanceDate,
        a.status,
        a.created_at as createdAt,
        e.manager_name as managerName
      FROM attendance a
      LEFT JOIN employees e ON a.user_id = e.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (year) {
      sql += ' AND YEAR(a.attendance_date) = ?';
      params.push(parseInt(year as string));
    }
    
    if (month) {
      sql += ' AND MONTH(a.attendance_date) = ?';
      params.push(parseInt(month as string));
    }
    
    if (day) {
      sql += ' AND DAY(a.attendance_date) = ?';
      params.push(parseInt(day as string));
    }
    
    if (city) {
      sql += ' AND a.city = ?';
      params.push(city);
    }
    
    if (cluster) {
      sql += ' AND a.cluster = ?';
      params.push(cluster);
    }
    
    sql += ' ORDER BY a.attendance_date DESC, a.name';
    
    const result = await query(sql, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
};

// Check for absconding cases (3 consecutive days of Absent/UL/LOP)
const checkAbscondingCases = async () => {
  try {
    // Get all employees with recent attendance
    const employeesResult = await query(
      `SELECT DISTINCT user_id FROM attendance WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      []
    );
    
    const abscondingStatuses = ['absent', 'ul', 'lop'];
    
    for (const emp of employeesResult.rows as any[]) {
      const userId = emp.user_id;
      
      // Get last 7 days of attendance for this employee
      const attendanceResult = await query(
        `SELECT attendance_date, status 
         FROM attendance 
         WHERE user_id = ? 
         ORDER BY attendance_date DESC 
         LIMIT 7`,
        [userId]
      );
      
      const records = attendanceResult.rows as any[];
      
      // Check for 3 consecutive absconding statuses
      let consecutiveCount = 0;
      let startDate = null;
      
      for (const record of records) {
        if (abscondingStatuses.includes(record.status)) {
          consecutiveCount++;
          if (consecutiveCount === 1) {
            startDate = record.attendance_date;
          }
          if (consecutiveCount >= 3) {
            // Check if already in absconding table
            const existingResult = await query(
              'SELECT id FROM absconding_cases WHERE user_id = ? AND status != ?',
              [userId, 'resolved']
            );
            
            if (!existingResult.rows || existingResult.rows.length === 0) {
              // Get employee details
              const empResult = await query(
                'SELECT * FROM employees WHERE user_id = ?',
                [userId]
              );
              
              if (empResult.rows && empResult.rows.length > 0) {
                const employee = empResult.rows[0] as any;
                
                // Insert into absconding_cases
                await query(
                  `INSERT INTO absconding_cases 
                   (user_id, employee_id, name, email, city, cluster, manager_name, 
                    start_date, consecutive_days, status, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
                  [userId, employee.id, employee.name, employee.email, 
                   employee.city, employee.cluster, employee.manager_name,
                   startDate, consecutiveCount]
                );
              }
            }
            break;
          }
        } else {
          consecutiveCount = 0;
          startDate = null;
        }
      }
    }
  } catch (error) {
    console.error('Error checking absconding cases:', error);
  }
};

// Get absconding cases
const getAbscondingCases = async (req: Request, res: Response) => {
  try {
    const { month, year, city, cluster, status } = req.query;
    
    let sql = `
      SELECT 
        ac.id,
        ac.user_id as userId,
        ac.employee_id as employeeId,
        ac.name,
        ac.email,
        ac.city,
        ac.cluster,
        ac.manager_name as managerName,
        ac.start_date as startDate,
        ac.consecutive_days as consecutiveDays,
        ac.status,
        ac.manager_notified as managerNotified,
        ac.manager_aware as managerAware,
        ac.showcause_sent as showcauseSent,
        ac.letter_type as letterType,
        ac.letter_sent_at as letterSentAt,
        ac.created_at as createdAt
      FROM absconding_cases ac
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (year) {
      sql += ' AND YEAR(ac.start_date) = ?';
      params.push(parseInt(year as string));
    }
    
    if (month) {
      sql += ' AND MONTH(ac.start_date) = ?';
      params.push(parseInt(month as string));
    }
    
    if (city) {
      sql += ' AND ac.city = ?';
      params.push(city);
    }
    
    if (cluster) {
      sql += ' AND ac.cluster = ?';
      params.push(cluster);
    }
    
    if (status) {
      sql += ' AND ac.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY ac.created_at DESC';
    
    const result = await query(sql, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching absconding cases:', error);
    res.status(500).json({ message: "Failed to fetch absconding cases" });
  }
};

// Notify manager about absconding case
const notifyManager = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get absconding case details
    const caseResult = await query(
      'SELECT * FROM absconding_cases WHERE id = ?',
      [id]
    );
    
    if (!caseResult.rows || caseResult.rows.length === 0) {
      return res.status(404).json({ message: "Absconding case not found" });
    }
    
    const abscondingCase = caseResult.rows[0] as any;
    
    // Get manager email from employees table
    const empResult = await query(
      'SELECT manager_name FROM employees WHERE user_id = ?',
      [abscondingCase.user_id]
    );
    
    // Update case status
    await query(
      'UPDATE absconding_cases SET manager_notified = 1, status = ? WHERE id = ?',
      ['manager_notified', id]
    );
    
    // In production, send actual email here
    // For now, just mark as notified
    
    res.json({ 
      message: "Manager notification sent successfully",
      data: { ...abscondingCase, manager_notified: true }
    });
  } catch (error) {
    console.error('Error notifying manager:', error);
    res.status(500).json({ message: "Failed to notify manager" });
  }
};

// Manager response to absconding notification
const managerResponse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { aware, sendShowcause } = req.body;
    
    let status = 'manager_responded';
    if (aware && sendShowcause) {
      status = 'showcause_pending';
    } else if (aware) {
      status = 'manager_aware';
    }
    
    await query(
      'UPDATE absconding_cases SET manager_aware = ?, status = ? WHERE id = ?',
      [aware ? 1 : 0, status, id]
    );
    
    res.json({ 
      message: "Manager response recorded",
      status
    });
  } catch (error) {
    console.error('Error recording manager response:', error);
    res.status(500).json({ message: "Failed to record manager response" });
  }
};

// Send letter (Show Cause / Absconding Terminated)
const sendLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { letterType } = req.body;
    
    if (!letterType || !['show_cause', 'absconding_terminated'].includes(letterType)) {
      return res.status(400).json({ message: "Invalid letter type" });
    }
    
    // Get absconding case details
    const caseResult = await query(
      'SELECT * FROM absconding_cases WHERE id = ?',
      [id]
    );
    
    if (!caseResult.rows || caseResult.rows.length === 0) {
      return res.status(404).json({ message: "Absconding case not found" });
    }
    
    const abscondingCase = caseResult.rows[0] as any;
    
    // Get employee email
    const empResult = await query(
      'SELECT email FROM employees WHERE user_id = ?',
      [abscondingCase.user_id]
    );
    
    if (!empResult.rows || empResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    const employeeEmail = (empResult.rows[0] as any).email;
    
    // In production, send actual email with letter content
    // For now, just update the database
    
    const newStatus = letterType === 'show_cause' ? 'showcause_sent' : 'terminated';
    
    await query(
      `UPDATE absconding_cases 
       SET letter_type = ?, letter_sent_at = NOW(), showcause_sent = 1, status = ?
       WHERE id = ?`,
      [letterType, newStatus, id]
    );
    
    // If terminated, update employee working status
    if (letterType === 'absconding_terminated') {
      await query(
        'UPDATE employees SET working_status = ? WHERE user_id = ?',
        ['absconding_terminated', abscondingCase.user_id]
      );
    }
    
    res.json({ 
      message: `${letterType === 'show_cause' ? 'Show Cause Notice' : 'Termination Letter'} sent to ${employeeEmail}`,
      letterType,
      status: newStatus
    });
  } catch (error) {
    console.error('Error sending letter:', error);
    res.status(500).json({ message: "Failed to send letter" });
  }
};

// Resolve absconding case
const resolveCase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    
    await query(
      'UPDATE absconding_cases SET status = ?, resolution = ?, resolved_at = NOW() WHERE id = ?',
      ['resolved', resolution || 'Resolved', id]
    );
    
    res.json({ message: "Case resolved successfully" });
  } catch (error) {
    console.error('Error resolving case:', error);
    res.status(500).json({ message: "Failed to resolve case" });
  }
};

export {
  getWorkingEmployees,
  bulkUploadAttendance,
  getAttendance,
  getAbscondingCases,
  notifyManager,
  managerResponse,
  sendLetter,
  resolveCase
};
