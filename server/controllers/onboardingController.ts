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
      LEFT JOIN field_training ft ON o.field_training_id = ft.id
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
    
    // Get the current onboarding record to access candidate_id
    const currentRecord = await query(
      'SELECT candidate_id, onboarding_status FROM onboarding WHERE id = ?',
      [id]
    );
    
    if (!currentRecord.rows || currentRecord.rows.length === 0) {
      return res.status(404).json({ message: "Onboarding record not found" });
    }
    
    const candidateId = (currentRecord.rows[0] as any).candidate_id;
    
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
    
    // IMPORTANT: If onboarding_status is changed to 'onboarded', update candidate status to 'onboarded'
    if (updateData.onboarding_status === 'onboarded' && candidateId) {
      console.log(`✅ Updating candidate ${candidateId} status to 'onboarded' (from onboarding completion)`);
      await query(
        'UPDATE candidates SET status = ? WHERE id = ?',
        ['onboarded', candidateId]
      );
    }
    
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
        
        // Calculate employment type based on resume source
        const employmentType = onboardingRecord.resume_source === 'vendor' ? 'Contract' : 'Permanent';
        
        // Prepare update values with explicit logging
        const updateValues = [
          record.employee_id, record.user_id, record.email, record.gender, record.date_of_birth, record.blood_group,
          record.marital_status,
          record.physically_handicapped, record.nationality || 'Indian', record.international_worker,
          record.pan_number, record.name_as_per_pan,
          record.aadhar_number, record.name_as_per_aadhar, record.account_number,
          record.ifsc_code, record.name_as_per_bank, record.bank_name, record.present_address,
          record.permanent_address, record.emergency_contact_number,
          record.emergency_contact_name, record.emergency_contact_relation,
          record.father_name, record.father_dob, record.mother_name, record.mother_dob,
          record.uan_number, record.esic_ip_number, record.wife_name, record.wife_dob,
          record.child1_name, record.child1_gender, record.child1_dob,
          record.child2_name, record.child2_gender, record.child2_dob,
          record.nominee_name, record.nominee_relation, record.legal_entity,
          employmentType,
          onboardingRecord.id
        ];
        
        console.log('Update values array:', updateValues);
        
        const updateResult = await query(
          `UPDATE onboarding SET 
            employee_id = ?, user_id = ?, email = ?, gender = ?, date_of_birth = ?, blood_group = ?,
            marital_status = ?,
            physically_handicapped = ?, nationality = ?, international_worker = ?,
            pan_number = ?, name_as_per_pan = ?,
            aadhar_number = ?, name_as_per_aadhar = ?, account_number = ?,
            ifsc_code = ?, name_as_per_bank = ?, bank_name = ?, present_address = ?,
            permanent_address = ?, emergency_contact_number = ?,
            emergency_contact_name = ?, emergency_contact_relation = ?,
            father_name = ?, father_dob = ?, mother_name = ?, mother_dob = ?,
            uan_number = ?, esic_ip_number = ?, wife_name = ?, wife_dob = ?,
            child1_name = ?, child1_gender = ?, child1_dob = ?,
            child2_name = ?, child2_gender = ?, child2_dob = ?,
            nominee_name = ?, nominee_relation = ?, legal_entity = ?,
            employment_type = ?, migrated_data = 'NO'
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

// Migration bulk upload - Creates complete candidate journey for existing employees
const bulkUploadMigration = async (req: Request, res: Response) => {
  try {
    console.log('=== BACKEND: Received MIGRATION bulk upload request ===');
    const { records } = req.body;
    
    console.log('Number of migration records:', records?.length || 0);
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as { name: string; error: string }[]
    };
    
    for (const record of records) {
      try {
        console.log(`\n--- Processing migration for: ${record.name} ---`);
        
        // VALIDATION: Skip rejected candidates during migration
        if (record.status === 'rejected' || record.technical_result === 'rejected') {
          console.log(`⚠️ Skipping rejected candidate: ${record.name} (Status: ${record.status}, Technical: ${record.technical_result})`);
          results.failed++;
          results.errors.push({ 
            name: record.name, 
            error: `Skipped - Candidate was rejected (Status: ${record.status}, Technical: ${record.technical_result})` 
          });
          continue;
        }

        // For migration: Insert ONLY into onboarding table (no candidates, classroom, field training)
        const employmentType = record.employment_type || 'Permanent';
        
        // VALIDATION: Validate against master data
        const validationErrors: string[] = [];
        
        // Validate City
        if (record.city) {
          const cityResult = await query("SELECT id FROM cities WHERE name = ?", [record.city]);
          if (!cityResult.rows || cityResult.rows.length === 0) {
            validationErrors.push(`Invalid city: "${record.city}"`);
          }
        }
        
        // Validate Cluster
        if (record.cluster) {
          const clusterResult = await query("SELECT id FROM clusters WHERE name = ?", [record.cluster]);
          if (!clusterResult.rows || clusterResult.rows.length === 0) {
            validationErrors.push(`Invalid cluster: "${record.cluster}"`);
          }
        }
        
        // Validate Department
        if (record.department_name) {
          const deptResult = await query("SELECT id FROM departments WHERE name = ?", [record.department_name]);
          if (!deptResult.rows || deptResult.rows.length === 0) {
            validationErrors.push(`Invalid department: "${record.department_name}"`);
          }
        }
        
        // Validate Sub-Department
        if (record.sub_department_name) {
          const subDeptResult = await query("SELECT id FROM sub_departments WHERE name = ?", [record.sub_department_name]);
          if (!subDeptResult.rows || subDeptResult.rows.length === 0) {
            validationErrors.push(`Invalid sub-department: "${record.sub_department_name}"`);
          }
        }
        
        // Validate Role
        if (record.role) {
          const roleResult = await query("SELECT id FROM roles WHERE name = ?", [record.role]);
          if (!roleResult.rows || roleResult.rows.length === 0) {
            validationErrors.push(`Invalid role: "${record.role}"`);
          }
        }
        
        // Validate Designation
        if (record.designation) {
          const designationResult = await query("SELECT id FROM designations WHERE name = ?", [record.designation]);
          if (!designationResult.rows || designationResult.rows.length === 0) {
            validationErrors.push(`Invalid designation: "${record.designation}"`);
          }
        }
        
        // If validation errors, skip this record
        if (validationErrors.length > 0) {
          console.log(`⚠️ Validation failed for ${record.name}: ${validationErrors.join(', ')}`);
          results.failed++;
          results.errors.push({ 
            name: record.name, 
            error: validationErrors.join('; ') 
          });
          continue;
        }
        
        const onboardingResult = await query(
          `INSERT INTO onboarding (
            name, mobile_number, email, employee_id, user_id,
            gender, date_of_birth, blood_group, marital_status,
            physically_handicapped, nationality, international_worker,
            name_as_per_aadhar, aadhar_number,
            father_name, father_dob, mother_name, mother_dob, wife_name, wife_dob,
            child1_name, child1_gender, child1_dob, child2_name, child2_gender, child2_dob,
            nominee_name, nominee_relation, present_address, permanent_address,
            emergency_contact_name, emergency_contact_number, emergency_contact_relation,
            pan_number, name_as_per_pan, account_number, ifsc_code, name_as_per_bank, bank_name,
            uan_number, esic_ip_number, legal_entity, employment_type,
            city, cluster, role, designation, manager_name, date_of_joining, gross_salary,
            business_unit_name, department_name, sub_department_name,
            resume_source, cost_centre,
            group_doj, group_doj_reason, group_doj_vendor_name,
            onboarding_status, migrated_data, is_locked, locked_at,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'onboarded', 'YES', 1, NOW(), NOW(), NOW())`,
          [
            record.name, record.mobile_number, record.email,
            record.employee_id, record.user_id, record.gender, record.date_of_birth, record.blood_group,
            record.marital_status,
            record.physically_handicapped, record.nationality || 'Indian', record.international_worker,
            record.name_as_per_aadhar, record.aadhar_number,
            record.father_name, record.father_dob, record.mother_name, record.mother_dob,
            record.wife_name, record.wife_dob, record.child1_name, record.child1_gender, record.child1_dob,
            record.child2_name, record.child2_gender, record.child2_dob,
            record.nominee_name, record.nominee_relation, record.present_address, record.permanent_address,
            record.emergency_contact_name, record.emergency_contact_number, record.emergency_contact_relation,
            record.pan_number, record.name_as_per_pan, record.account_number, record.ifsc_code,
            record.name_as_per_bank, record.bank_name, record.uan_number, record.esic_ip_number, record.legal_entity,
            employmentType,
            record.city, record.cluster, record.role, record.designation, record.manager_name,
            record.date_of_joining, record.gross_salary,
            record.business_unit_name, record.department_name, record.sub_department_name,
            record.resume_source_type, record.cost_centre,
            record.group_doj, record.group_doj_reason, record.group_doj_vendor_name
          ]
        );
        
        console.log(`✅ Migration successful for: ${record.name} (Onboarding ID: ${(onboardingResult as any).insertId})`);
        results.success++;
        
      } catch (error) {
        console.error(`❌ Migration failed for ${record.name}:`, error);
        results.failed++;
        results.errors.push({
          name: record.name,
          error: (error as Error).message
        });
      }
    }
    
    console.log('\n=== BACKEND: Migration upload complete ===');
    console.log(`Success: ${results.success}, Failed: ${results.failed}`);
    
    res.json({
      message: "Migration upload completed",
      results
    });
  } catch (error) {
    console.error('Migration upload error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Bulk onboard submission - marks records as onboarded and locks them
const bulkOnboardSubmission = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    const userId = (req as any).user?.id; // Get user ID from auth middleware

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request: ids array is required" });
    }

    const results = {
      success: 0,
      failed: 0,
      locked: 0,
      alreadyOnboarded: 0,
      errors: [] as any[]
    };

    for (const id of ids) {
      try {
        // Check if record exists and is not already locked
        const checkResult = await query(
          'SELECT id, onboarding_status, is_locked FROM onboarding WHERE id = ?',
          [id]
        );

        if (!checkResult.rows || checkResult.rows.length === 0) {
          results.failed++;
          results.errors.push({
            id,
            error: 'Record not found'
          });
          continue;
        }

        const record = checkResult.rows[0] as any;

        // Check if already locked
        if (record.is_locked) {
          results.locked++;
          results.errors.push({
            id,
            error: 'Record is already locked'
          });
          continue;
        }

        // Check if already onboarded
        if (record.onboarding_status === 'onboarded') {
          results.alreadyOnboarded++;
          continue;
        }

        // Update status to onboarded and lock the record
        await query(
          `UPDATE onboarding 
           SET onboarding_status = 'onboarded',
               is_locked = TRUE,
               locked_at = NOW(),
               locked_by = ?
           WHERE id = ?`,
          [userId || null, id]
        );

        results.success++;
      } catch (error) {
        console.error(`Failed to onboard record ${id}:`, error);
        results.failed++;
        results.errors.push({
          id,
          error: (error as Error).message
        });
      }
    }

    res.json({
      message: `Onboarding submission complete`,
      successCount: results.success,
      results
    });
  } catch (error) {
    console.error('Bulk onboard submission error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const onboardingController = {
  getOnboardingRecords,
  createOnboarding,
  updateOnboarding,
  bulkUploadOnboarding,
  bulkUploadMigration,
  bulkOnboardSubmission
};
