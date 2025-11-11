import { Request, Response } from 'express';
import { query } from '../config/db';

// Get all onboarding records with full pipeline data
const getOnboardingRecords = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT 
        o.*, 
        ft.ft_feedback
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
    console.log('=== BACKEND: Received bulk upload request ===');
    console.log('Request body keys:', Object.keys(req.body));
    
    const { records } = req.body;
    
    console.log('Number of records received:', records?.length || 0);
    if (records && records.length > 0) {
      console.log('First record sample:', JSON.stringify(records[0], null, 2));
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as { name: string; error: string }[]
    };
    
    for (const record of records) {
      try {
        console.log(`\n--- Processing record: ${record.name} ---`);
        // Find onboarding record by employee_id or name+phone
        let onboardingRecord: any = null;
        
        if (record.employee_id) {
          console.log(`Searching by employee_id: ${record.employee_id}`);
          const onboardingResult = await query(
            'SELECT id, candidate_id, field_training_id FROM onboarding WHERE employee_id = ?',
            [record.employee_id]
          );
          if (onboardingResult.rows && onboardingResult.rows.length > 0) {
            onboardingRecord = onboardingResult.rows[0];
            console.log(`Found by employee_id: ${onboardingRecord.id}`);
          }
        }
        
        if (!onboardingRecord) {
          console.log(`Searching by name and phone: ${record.name}, ${record.mobile_number}`);
          const onboardingResult = await query(
            'SELECT id, candidate_id, field_training_id FROM onboarding WHERE name = ? AND mobile_number = ?',
            [record.name, record.mobile_number]
          );
          if (onboardingResult.rows && onboardingResult.rows.length > 0) {
            onboardingRecord = onboardingResult.rows[0];
            console.log(`Found by name+phone: ${onboardingRecord.id}`);
          } else {
            console.log(`No match found with name: ${record.name}, phone: ${record.mobile_number}`);
          }
        }
        
        if (!onboardingRecord) {
          console.error(`❌ Onboarding record not found for: ${record.name}`);
          results.failed++;
          results.errors.push({
            name: record.name,
            error: 'Onboarding record not found'
          });
          continue;
        }
        
        // Update the existing onboarding record
        console.log(`Updating onboarding record for: ${record.name} (ID: ${onboardingRecord.id})`);
        console.log('Record data being saved:', JSON.stringify(record, null, 2));
        
        // Prepare update values with explicit logging
        const updateValues = [
          record.employee_id, record.user_id, record.email, record.gender, record.date_of_birth, record.blood_group,
          record.marital_status, record.pan_number, record.name_as_per_pan,
          record.aadhar_number, record.name_as_per_aadhar, record.account_number,
          record.ifsc_code, record.name_as_per_bank, record.bank_name, record.present_address,
          record.permanent_address, record.emergency_contact_number,
          record.emergency_contact_name, record.emergency_contact_relation,
          record.father_name, record.father_dob, record.mother_name, record.mother_dob,
          record.uan_number, record.esic_ip_number, record.wife_name, record.wife_dob,
          record.child1_name, record.child1_gender, record.child1_dob,
          record.child2_name, record.child2_gender, record.child2_dob,
          record.nominee_name, record.nominee_relation, record.legal_entity,
          onboardingRecord.id
        ];
        
        console.log('Update values array:', updateValues);
        
        const updateResult = await query(
          `UPDATE onboarding SET 
            employee_id = ?, user_id = ?, email = ?, gender = ?, date_of_birth = ?, blood_group = ?,
            marital_status = ?, pan_number = ?, name_as_per_pan = ?,
            aadhar_number = ?, name_as_per_aadhar = ?, account_number = ?,
            ifsc_code = ?, name_as_per_bank = ?, bank_name = ?, present_address = ?,
            permanent_address = ?, emergency_contact_number = ?,
            emergency_contact_name = ?, emergency_contact_relation = ?,
            father_name = ?, father_dob = ?, mother_name = ?, mother_dob = ?,
            uan_number = ?, esic_ip_number = ?, wife_name = ?, wife_dob = ?,
            child1_name = ?, child1_gender = ?, child1_dob = ?,
            child2_name = ?, child2_gender = ?, child2_dob = ?,
            nominee_name = ?, nominee_relation = ?, legal_entity = ?
           WHERE id = ?`,
          updateValues
        );
        
        console.log(`Update result:`, updateResult);
        
        if ((updateResult as any).affectedRows === 0) {
          console.error(`❌ No rows updated for record ID: ${onboardingRecord.id}`);
          throw new Error(`No rows updated for record ID: ${onboardingRecord.id}`);
        }
        
        // Verify what was actually saved
        const verifyResult = await query(
          'SELECT employee_id, user_id, bank_name, legal_entity, uan_number, father_name FROM onboarding WHERE id = ?',
          [onboardingRecord.id]
        );
        console.log('Verified saved data:', verifyResult.rows[0]);
        
        console.log(`✅ Successfully updated: ${record.name}`);
        results.success++;
      } catch (error) {
        console.error(`❌ Error processing ${record.name}:`, error);
        results.failed++;
        results.errors.push({
          name: record.name,
          error: (error as Error).message
        });
      }
    }
    
    console.log('\n=== BACKEND: Upload complete ===');
    console.log(`Success: ${results.success}, Failed: ${results.failed}`);
    if (results.errors.length > 0) {
      console.log('Errors:', results.errors);
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
