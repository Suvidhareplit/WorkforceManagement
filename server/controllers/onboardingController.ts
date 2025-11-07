import { Request, Response } from 'express';
import { query } from '../config/db';

// Get all onboarding records
const getOnboardingRecords = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT o.*, ft.id as field_training_id
       FROM onboarding o
       JOIN field_training ft ON o.field_training_id = ft.id
       ORDER BY o.created_at DESC`
    );
    
    const rows = result.rows || [];
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('ETag', '');
    res.json({ data: rows });
  } catch (error) {
    console.error('Get onboarding records error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create onboarding record (auto-created from field training)
const createOnboarding = async (req: Request, res: Response) => {
  try {
    const { field_training_id: fieldTrainingId } = req.body;
    
    if (!fieldTrainingId) {
      return res.status(400).json({ message: "Field Training ID is required" });
    }
    
    // Get field training details with candidate info
    const ftResult = await query(
      `SELECT ft.*, it.name, it.mobile_number, it.city, it.cluster, it.role,
              it.date_of_joining, it.gross_salary, it.manager_name
       FROM field_training ft
       JOIN classroom_training ct ON ft.classroom_training_id = ct.id
       JOIN induction_training it ON ct.induction_id = it.id
       WHERE ft.id = ?`,
      [fieldTrainingId]
    );
    
    if (!ftResult.rows || ftResult.rows.length === 0) {
      return res.status(404).json({ message: "Field training record not found" });
    }
    
    const ft = ftResult.rows[0] as any;
    
    // Check if onboarding already exists
    const existingOnboarding = await query(
      'SELECT id FROM onboarding WHERE candidate_id = ?',
      [ft.candidate_id]
    );
    
    if (existingOnboarding.rows && existingOnboarding.rows.length > 0) {
      return res.status(400).json({ message: "Onboarding record already exists for this candidate" });
    }
    
    // Create onboarding record
    const result = await query(
      `INSERT INTO onboarding (
        field_training_id, candidate_id, name, mobile_number, 
        city, cluster, role, manager_name, date_of_joining, gross_salary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fieldTrainingId,
        ft.candidate_id,
        ft.name,
        ft.mobile_number,
        ft.city,
        ft.cluster,
        ft.role,
        ft.manager_name,
        ft.date_of_joining,
        ft.gross_salary
      ]
    );
    
    res.status(201).json({ 
      message: "Onboarding record created successfully", 
      id: (result as any).insertId 
    });
  } catch (error) {
    console.error('Create onboarding error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update onboarding record
const updateOnboarding = async (req: Request, res: Response) => {
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
      `UPDATE onboarding SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: "Onboarding record updated successfully" });
  } catch (error) {
    console.error('Update onboarding error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Bulk upload onboarding data
const bulkUploadOnboarding = async (req: Request, res: Response) => {
  try {
    const { records } = req.body;
    
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "Records array is required" });
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };
    
    for (const record of records) {
      try {
        // Find candidate by name and mobile
        const candidateResult = await query(
          'SELECT id FROM candidates WHERE name = ? AND phone = ?',
          [record.name, record.mobile_number]
        );
        
        if (!candidateResult.rows || candidateResult.rows.length === 0) {
          results.failed++;
          results.errors.push({
            name: record.name,
            error: 'Candidate not found'
          });
          continue;
        }
        
        const candidateId = (candidateResult.rows[0] as any).id;
        
        // Find field training record
        const ftResult = await query(
          'SELECT id FROM field_training WHERE candidate_id = ?',
          [candidateId]
        );
        
        if (!ftResult.rows || ftResult.rows.length === 0) {
          results.failed++;
          results.errors.push({
            name: record.name,
            error: 'Field training record not found'
          });
          continue;
        }
        
        const fieldTrainingId = (ftResult.rows[0] as any).id;
        
        // Check if onboarding already exists
        const existingOnboarding = await query(
          'SELECT id FROM onboarding WHERE candidate_id = ?',
          [candidateId]
        );
        
        if (existingOnboarding.rows && existingOnboarding.rows.length > 0) {
          // Update existing record
          await query(
            `UPDATE onboarding SET 
              email = ?, gender = ?, date_of_birth = ?, blood_group = ?,
              marital_status = ?, pan_number = ?, name_as_per_pan = ?,
              aadhar_number = ?, name_as_per_aadhar = ?, account_number = ?,
              ifsc_code = ?, name_as_per_bank = ?, present_address = ?,
              permanent_address = ?, emergency_contact_number = ?,
              emergency_contact_name = ?, emergency_contact_relation = ?
             WHERE candidate_id = ?`,
            [
              record.email, record.gender, record.date_of_birth, record.blood_group,
              record.marital_status, record.pan_number, record.name_as_per_pan,
              record.aadhar_number, record.name_as_per_aadhar, record.account_number,
              record.ifsc_code, record.name_as_per_bank, record.present_address,
              record.permanent_address, record.emergency_contact_number,
              record.emergency_contact_name, record.emergency_contact_relation,
              candidateId
            ]
          );
        } else {
          // Insert new record
          await query(
            `INSERT INTO onboarding (
              field_training_id, candidate_id, name, mobile_number,
              email, gender, date_of_birth, blood_group, marital_status,
              pan_number, name_as_per_pan, aadhar_number, name_as_per_aadhar,
              account_number, ifsc_code, name_as_per_bank, present_address,
              permanent_address, emergency_contact_number, emergency_contact_name,
              emergency_contact_relation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              fieldTrainingId, candidateId, record.name, record.mobile_number,
              record.email, record.gender, record.date_of_birth, record.blood_group,
              record.marital_status, record.pan_number, record.name_as_per_pan,
              record.aadhar_number, record.name_as_per_aadhar, record.account_number,
              record.ifsc_code, record.name_as_per_bank, record.present_address,
              record.permanent_address, record.emergency_contact_number,
              record.emergency_contact_name, record.emergency_contact_relation
            ]
          );
        }
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          name: record.name,
          error: (error as Error).message
        });
      }
    }
    
    res.json({
      message: "Bulk upload completed",
      results
    });
  } catch (error) {
    console.error('Bulk upload onboarding error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const onboardingController = {
  getOnboardingRecords,
  createOnboarding,
  updateOnboarding,
  bulkUploadOnboarding
};
