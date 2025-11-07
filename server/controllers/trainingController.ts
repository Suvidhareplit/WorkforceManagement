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
    
    const result = await query(
      'SELECT * FROM induction_training ORDER BY created_at DESC'
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
    if (updateData.induction_status === 'completed') {
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
              it.date_of_joining, it.gross_salary, it.manager_name
       FROM classroom_training ct
       JOIN induction_training it ON ct.induction_id = it.id
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
    
    // If CRT feedback is 'fit' or 'fit_need_observation', move to FT
    if (updateData.crt_feedback === 'fit' || updateData.crt_feedback === 'fit_need_observation') {
      const crtResult = await query(
        'SELECT * FROM classroom_training WHERE id = ?',
        [id]
      );
      
      if (crtResult.rows && crtResult.rows.length > 0) {
        const crt = crtResult.rows[0] as any;
        
        // Check if FT record already exists
        const existingFT = await query(
          'SELECT id FROM field_training WHERE classroom_training_id = ?',
          [crt.id]
        );
        
        if (!existingFT.rows || existingFT.rows.length === 0) {
          // Create field training record
          await query(
            `INSERT INTO field_training (classroom_training_id, candidate_id)
             VALUES (?, ?)`,
            [crt.id, crt.candidate_id]
          );
        }
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
