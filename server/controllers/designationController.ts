import { Request, Response } from 'express';
import { query } from '../config/db';

// Get all designations with related data
const getDesignations = async (req: Request, res: Response) => {
  try {
    const { role_id, sub_department_id, level, is_active } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (role_id) {
      whereClause += ' AND d.role_id = ?';
      params.push(role_id);
    }
    
    if (sub_department_id) {
      whereClause += ' AND d.sub_department_id = ?';
      params.push(sub_department_id);
    }
    
    if (level) {
      whereClause += ' AND d.level = ?';
      params.push(level);
    }
    
    if (is_active !== undefined) {
      whereClause += ' AND d.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    
    const result = await query(`
      SELECT 
        d.*,
        r.name as role_name,
        sd.name as sub_department_name,
        sd.code as sub_department_code
      FROM designations d
      LEFT JOIN roles r ON d.role_id = r.id
      LEFT JOIN sub_departments sd ON d.sub_department_id = sd.id
      ${whereClause}
      ORDER BY d.name
    `, params);
    
    res.json({ 
      data: result.rows || [],
      count: result.rows?.length || 0
    });
  } catch (error) {
    console.error('Get designations error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get designation by ID
const getDesignationById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const result = await query(`
      SELECT 
        d.*,
        r.name as role_name,
        sd.name as sub_department_name,
        sd.code as sub_department_code
      FROM designations d
      LEFT JOIN roles r ON d.role_id = r.id
      LEFT JOIN sub_departments sd ON d.sub_department_id = sd.id
      WHERE d.id = ?
    `, [id]);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "Designation not found" });
    }
    
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Get designation error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create new designation
const createDesignation = async (req: Request, res: Response) => {
  try {
    const {
      name,
      code,
      role_id,
      sub_department_id,
      skill_level,
      level,
      is_active = true
    } = req.body;

    // Validate required fields
    if (!name || !code || !role_id || !sub_department_id) {
      return res.status(400).json({ 
        message: "Missing required fields: name, code, role_id, sub_department_id" 
      });
    }

    // Check if role and sub_department exist
    const roleCheck = await query('SELECT id FROM roles WHERE id = ?', [role_id]);
    if (!roleCheck.rows || roleCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid role_id" });
    }

    const subDeptCheck = await query('SELECT id FROM sub_departments WHERE id = ?', [sub_department_id]);
    if (!subDeptCheck.rows || subDeptCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid sub_department_id" });
    }

    // Check for duplicate code
    const codeCheck = await query('SELECT id FROM designations WHERE code = ?', [code]);
    if (codeCheck.rows && codeCheck.rows.length > 0) {
      return res.status(400).json({ message: "Designation code already exists" });
    }

    const result = await query(`
      INSERT INTO designations (
        name, code, role_id, sub_department_id, skill_level, level, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      name, code, role_id, sub_department_id, skill_level, level, is_active
    ]);

    const insertId = (result as any).insertId;
    res.status(201).json({ 
      message: "Designation created successfully",
      id: insertId,
      data: { id: insertId, name, code }
    });
  } catch (error: any) {
    console.error('Create designation error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: "Designation already exists for this role and sub-department" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Update designation
const updateDesignation = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    // Check if designation exists
    const existingResult = await query('SELECT * FROM designations WHERE id = ?', [id]);
    if (!existingResult.rows || existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Designation not found" });
    }

    const fields: string[] = [];
    const values: any[] = [];
    
    // Build dynamic update query
    const allowedFields = [
      'name', 'code', 'role_id', 'sub_department_id', 'skill_level', 'level', 'is_active', 'manpower_planning_required'
    ];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }
    
    values.push(id);
    
    await query(
      `UPDATE designations SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: "Designation updated successfully" });
  } catch (error: any) {
    console.error('Update designation error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete designation
const deleteDesignation = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if designation exists
    const existingResult = await query('SELECT * FROM designations WHERE id = ?', [id]);
    if (!existingResult.rows || existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Designation not found" });
    }

    // Check if designation is being used by employees
    const employeeCheck = await query(
      'SELECT COUNT(*) as count FROM employees WHERE designation_id = ?', 
      [id]
    );
    
    if (employeeCheck.rows && (employeeCheck.rows[0] as any).count > 0) {
      return res.status(400).json({ 
        message: "Cannot delete designation. It is currently assigned to employees." 
      });
    }

    await query('DELETE FROM designations WHERE id = ?', [id]);
    
    res.json({ message: "Designation deleted successfully" });
  } catch (error: any) {
    console.error('Delete designation error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get designations by role
const getDesignationsByRole = async (req: Request, res: Response) => {
  try {
    const role_id = parseInt(req.params.roleId);
    
    const result = await query(`
      SELECT d.*, sd.name as sub_department_name
      FROM designations d
      LEFT JOIN sub_departments sd ON d.sub_department_id = sd.id
      WHERE d.role_id = ? AND d.is_active = 1
      ORDER BY d.level, d.name
    `, [role_id]);
    
    res.json({ 
      data: result.rows || [],
      count: result.rows?.length || 0
    });
  } catch (error: any) {
    console.error('Get designations by role error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get designations by sub-department
const getDesignationsBySubDepartment = async (req: Request, res: Response) => {
  try {
    const sub_department_id = parseInt(req.params.subDeptId);
    
    const result = await query(`
      SELECT d.*, r.name as role_name
      FROM designations d
      LEFT JOIN roles r ON d.role_id = r.id
      WHERE d.sub_department_id = ? AND d.is_active = 1
      ORDER BY d.level, d.name
    `, [sub_department_id]);
    
    res.json({ 
      data: result.rows || [],
      count: result.rows?.length || 0
    });
  } catch (error: any) {
    console.error('Get designations by sub-department error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const designationController = {
  getDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  getDesignationsByRole,
  getDesignationsBySubDepartment
};
