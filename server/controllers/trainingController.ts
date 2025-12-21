import { Request, Response } from "express";
import { query } from '../config/db';

// ==================== INDUCTION TRAINING ====================

// Create induction record when candidate is assigned
const createInduction = async (req: Request, res: Response) => {
  try {
    const { candidate_id: candidateId } = req.body;
    
    console.log('🔍 Create Induction Request:', {
      body: req.body,
      candidate_id: req.body.candidate_id,
      candidateId: candidateId,
      type: typeof candidateId
    });
    
    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }
    
    // Get candidate details
    const candidateResult = await query(
      'SELECT * FROM candidates WHERE id = ?',
      [candidateId]
    );
    
    console.log('🔍 Candidate Query Result:', {
      candidateId,
      rowsFound: candidateResult.rows?.length || 0,
      rows: candidateResult.rows
    });
    
    if (!candidateResult.rows || candidateResult.rows.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    const candidate = candidateResult.rows[0] as any;
    
    // VALIDATION: Prevent rejected candidates from being assigned to induction
    if (candidate.status === 'rejected' || candidate.technical_result === 'rejected') {
      return res.status(400).json({ 
        message: `Cannot assign induction to rejected candidate. Technical Result: ${candidate.technical_result}, Status: ${candidate.status}` 
      });
    }
    
    // VALIDATION: Ensure candidate is in correct stage (selected or offered)
    if (!['selected', 'offered'].includes(candidate.status)) {
      return res.status(400).json({ 
        message: `Candidate must be 'selected' or 'offered' to assign induction. Current status: ${candidate.status}` 
      });
    }
    
    // Create induction record
    const result = await query(
      `INSERT INTO induction_training (
        candidate_id, name, mobile_number, city, cluster, role,
        date_of_joining, gross_salary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        candidate.id,
        candidate.name,
        candidate.phone,
        candidate.city_name,
        candidate.cluster_name,
        candidate.role_name,
        candidate.joining_date,
        candidate.offered_salary
      ]
    );
    
    // Update candidate status to assigned_induction
    await query(
      'UPDATE candidates SET status = ? WHERE id = ?',
      ['assigned_induction', candidateId]
    );
    
    res.status(201).json({ 
      message: "Induction record created successfully",
      data: { id: (result.rows as any).insertId || result.rowCount }
    });
  } catch (error) {
    console.error('Create induction error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all induction records
const getInductions = async (req: Request, res: Response) => {
  try {
    // Disable caching AND ETags for this endpoint
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.removeHeader('ETag');
    
    // IMPORTANT: Filter out candidates who were rejected in technical round
    // Keep onboarded candidates visible in induction training for record keeping
    const result = await query(
      `SELECT it.* 
       FROM induction_training it
       LEFT JOIN candidates c ON it.candidate_id = c.id
       WHERE (c.technical_result IS NULL OR c.technical_result != 'rejected')
         AND (c.status IS NULL OR c.status != 'rejected')
       ORDER BY it.created_at DESC`
    );
    const rows = result.rows || [];
    
    // Send response without ETag
    res.set('ETag', ''); // Explicitly disable ETag
    res.json({ data: rows });
  } catch (error) {
    console.error('Get inductions error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update induction record
const updateInduction = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    // First, get the current record to check combined state
    const currentRecordResult = await query(
      'SELECT * FROM induction_training WHERE id = ?',
      [id]
    );
    
    if (!currentRecordResult.rows || currentRecordResult.rows.length === 0) {
      return res.status(404).json({ message: "Induction record not found" });
    }
    
    const currentRecord = currentRecordResult.rows[0] as any;
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.keys(updateData).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    });
    
    values.push(id);
    
    await query(
      `UPDATE induction_training SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    // If induction_status is being updated to 'completed', create classroom training
    // BUT only if joining_status is NOT 'not_joined'
    const joiningStatus = updateData.joining_status || currentRecord.joining_status;
    if (updateData.induction_status === 'completed' && joiningStatus !== 'not_joined') {
      // Check if classroom training already exists
      const existingCRT = await query(
        'SELECT id FROM classroom_training WHERE induction_id = ?',
        [id]
      );
      
      if (!existingCRT.rows || existingCRT.rows.length === 0) {
        // Create classroom training record
        console.log('✅ Auto-creating classroom training for induction ID:', id, 'Candidate:', currentRecord.candidate_id);
        await query(
          `INSERT INTO classroom_training (induction_id, candidate_id)
           VALUES (?, ?)`,
          [id, currentRecord.candidate_id]
        );
        
        console.log('✅ Classroom training created successfully!');
      } else {
        console.log('ℹ️  Classroom training already exists for induction ID:', id);
      }
    } else if (joiningStatus === 'not_joined') {
      console.log('⚠️  Skipping classroom training creation - candidate marked as not_joined');
    }
    
    res.json({ message: "Induction updated successfully" });
  } catch (error) {
    console.error('Update induction error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==================== CLASSROOM TRAINING ====================

// Get all classroom training records
const getClassroomTrainings = async (req: Request, res: Response) => {
  try {
    // Disable caching AND ETags for this endpoint
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.removeHeader('ETag');
    
    const result = await query(
      `SELECT ct.*, it.name, it.mobile_number, it.city, it.cluster, it.role,
              it.date_of_joining, it.gross_salary, it.manager_name, it.joining_status
       FROM classroom_training ct
       JOIN induction_training it ON ct.induction_id = it.id
       WHERE it.joining_status != 'not_joined' OR it.joining_status IS NULL
       ORDER BY ct.created_at DESC`
    );
    const rows = result.rows || [];
    
    res.set('ETag', '');
    res.json({ data: rows });
  } catch (error) {
    console.error('Get classroom trainings error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update classroom training record
const updateClassroomTraining = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    // Get current record first
    const currentRecordResult = await query(
      'SELECT * FROM classroom_training WHERE id = ?',
      [id]
    );
    
    if (!currentRecordResult.rows || currentRecordResult.rows.length === 0) {
      return res.status(404).json({ message: "Classroom training record not found" });
    }
    
    const currentRecord = currentRecordResult.rows[0] as any;
    
    // Validation
    if (updateData.crt_feedback === 'not_fit_crt_rejection' && (!updateData.remarks || !updateData.last_working_day)) {
      return res.status(400).json({ 
        message: "Remarks and Last Working Day are mandatory for CRT Rejection" 
      });
    }
    
    if (updateData.crt_feedback === 'early_exit' && (!updateData.exit_date || !updateData.exit_reason)) {
      return res.status(400).json({ 
        message: "Exit Date and Reason are mandatory for Early Exit" 
      });
    }
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.keys(updateData).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    });
    
    values.push(id);
    
    await query(
      `UPDATE classroom_training SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    // Merge current record with update to get final state
    const finalState = { ...currentRecord, ...updateData };
    
    // If CRT feedback is 'fit' or 'fit_need_observation', auto-create Field Training
    if (finalState.crt_feedback === 'fit' || finalState.crt_feedback === 'fit_need_observation') {
      // Check if FT record already exists
      const existingFT = await query(
        'SELECT id FROM field_training WHERE classroom_training_id = ?',
        [id]
      );
      
      if (!existingFT.rows || existingFT.rows.length === 0) {
        // Create field training record
        console.log('✅ Auto-creating field training for classroom ID:', id, 'Candidate:', currentRecord.candidate_id);
        await query(
          `INSERT INTO field_training (classroom_training_id, candidate_id)
           VALUES (?, ?)`,
          [id, currentRecord.candidate_id]
        );
        
        console.log('✅ Field training created successfully!');
      } else {
        console.log('ℹ️  Field training already exists for classroom ID:', id);
      }
    }
    
    res.json({ message: "Classroom training updated successfully" });
  } catch (error) {
    console.error('Update classroom training error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==================== FIELD TRAINING ====================

// Get all field training records
const getFieldTrainings = async (req: Request, res: Response) => {
  try {
    // Disable caching AND ETags for this endpoint
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.removeHeader('ETag');
    
    const result = await query(
      `SELECT ft.*, it.name, it.mobile_number, it.city, it.cluster, it.role,
              it.date_of_joining, it.gross_salary, it.manager_name,
              ct.training_start_date, ct.training_completion_date
       FROM field_training ft
       JOIN classroom_training ct ON ft.classroom_training_id = ct.id
       JOIN induction_training it ON ct.induction_id = it.id
       ORDER BY ft.created_at DESC`
    );
    const rows = result.rows || [];
    
    res.set('ETag', '');
    res.json({ data: rows });
  } catch (error) {
    console.error('Get field trainings error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update field training record
const updateFieldTraining = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    // Get current record first
    const currentRecordResult = await query(
      'SELECT * FROM field_training WHERE id = ?',
      [id]
    );
    
    if (!currentRecordResult.rows || currentRecordResult.rows.length === 0) {
      return res.status(404).json({ message: "Field training record not found" });
    }
    
    const currentRecord = currentRecordResult.rows[0] as any;
    
    // Validation
    if (updateData.ft_feedback === 'not_fit_ft_rejection' && !updateData.rejection_reason) {
      return res.status(400).json({ 
        message: "Rejection Reason is mandatory for FT Rejection" 
      });
    }
    
    if (updateData.absconding === 'yes' && !updateData.last_reporting_date) {
      return res.status(400).json({ 
        message: "Last Reporting Date is mandatory for Absconding" 
      });
    }
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.keys(updateData).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    });
    
    values.push(id);
    
    await query(
      `UPDATE field_training SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    // Merge current record with update to get final state
    const finalState = { ...currentRecord, ...updateData };
    
    // If FT feedback is 'fit' or 'fit_need_refresher_training', auto-create Onboarding
    if (finalState.ft_feedback === 'fit' || finalState.ft_feedback === 'fit_need_refresher_training') {
      // Check if onboarding record already exists
      const existingOnboarding = await query(
        'SELECT id FROM onboarding WHERE candidate_id = ?',
        [currentRecord.candidate_id]
      );
      
      if (!existingOnboarding.rows || existingOnboarding.rows.length === 0) {
        // Get candidate details including resume source and role organizational details
        const candidateDetails = await query(
          `SELECT ft.*, it.name, it.mobile_number, it.city, it.cluster, it.role,
                  it.date_of_joining, it.gross_salary, it.manager_name,
                  c.id as candidate_id, c.email, c.resume_source, c.vendor_id, c.vendor_name,
                  c.recruiter_id, c.recruiter_name, c.referral_name,
                  c.role_id,
                  r.name as role_name,
                  bu.name as business_unit_name,
                  d.name as department_name,
                  sd.name as sub_department_name
           FROM field_training ft
           JOIN classroom_training ct ON ft.classroom_training_id = ct.id
           JOIN induction_training it ON ct.induction_id = it.id
           JOIN candidates c ON ft.candidate_id = c.id
           LEFT JOIN roles r ON c.role_id = r.id
           LEFT JOIN business_units bu ON r.business_unit_id = bu.id
           LEFT JOIN departments d ON r.department_id = d.id
           LEFT JOIN sub_departments sd ON r.sub_department_id = sd.id
           WHERE ft.id = ?`,
          [id]
        );
        
        if (candidateDetails.rows && candidateDetails.rows.length > 0) {
          const candidate = candidateDetails.rows[0] as any;
          
          // Calculate cost centre based on resume source type
          let costCentre = 'YGO'; // Default for non-vendor sources
          if (candidate.resume_source === 'vendor' && candidate.vendor_name) {
            costCentre = candidate.vendor_name;
          }
          
          console.log('✅ Auto-creating onboarding for field training ID:', id, 'Candidate:', candidate.candidate_id, 'Cost Centre:', costCentre);
          await query(
            `INSERT INTO onboarding (
              field_training_id, candidate_id, name, mobile_number, email,
              city, cluster, role, manager_name, date_of_joining, gross_salary,
              resume_source, cost_centre, vendor_id, vendor_name, recruiter_id, recruiter_name, referral_name,
              business_unit_name, department_name, sub_department_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              candidate.candidate_id,
              candidate.name,
              candidate.mobile_number,
              candidate.email,
              candidate.city,
              candidate.cluster,
              candidate.role,
              candidate.manager_name,
              candidate.date_of_joining,
              candidate.gross_salary,
              candidate.resume_source,
              costCentre,
              candidate.vendor_id,
              candidate.vendor_name,
              candidate.recruiter_id,
              candidate.recruiter_name,
              candidate.referral_name,
              candidate.business_unit_name,
              candidate.department_name,
              candidate.sub_department_name
            ]
          );
          
          console.log('✅ Onboarding record created successfully!');
        }
      } else {
        console.log('ℹ️  Onboarding already exists for candidate ID:', currentRecord.candidate_id);
      }
    }
    
    res.json({ message: "Field training updated successfully" });
  } catch (error) {
    console.error('Update field training error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const trainingController = {
  createInduction,
  getInductions,
  updateInduction,
  getClassroomTrainings,
  updateClassroomTraining,
  getFieldTrainings,
  updateFieldTraining
};
