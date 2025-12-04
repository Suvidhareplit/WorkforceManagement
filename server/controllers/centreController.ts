import { Request, Response } from 'express';
import { query } from '../config/db';

// Get all centres with cluster information
const getCentres = async (req: Request, res: Response) => {
  try {
    const { cluster_id, is_active } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (cluster_id) {
      whereClause += ' AND c.cluster_id = ?';
      params.push(cluster_id);
    }
    
    if (is_active !== undefined) {
      whereClause += ' AND c.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    
    const result = await query(`
      SELECT 
        c.*,
        cl.name as cluster_name,
        cl.code as cluster_code,
        city.name as city_name
      FROM centres c
      LEFT JOIN clusters cl ON c.cluster_id = cl.id
      LEFT JOIN cities city ON cl.city_id = city.id
      ${whereClause}
      ORDER BY c.name
    `, params);
    
    res.json({ 
      data: result.rows || [],
      count: result.rows?.length || 0
    });
  } catch (error) {
    console.error('Get centres error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get centre by ID
const getCentreById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const result = await query(`
      SELECT 
        c.*,
        cl.name as cluster_name,
        cl.code as cluster_code,
        city.name as city_name
      FROM centres c
      LEFT JOIN clusters cl ON c.cluster_id = cl.id
      LEFT JOIN cities city ON cl.city_id = city.id
      WHERE c.id = ?
    `, [id]);
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "Centre not found" });
    }
    
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Get centre error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create new centre
const createCentre = async (req: Request, res: Response) => {
  try {
    const { name, cluster_id, address } = req.body;

    // Validate required fields
    if (!name || !cluster_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, cluster_id"
      });
    }

    // Check if cluster exists
    const cluster = await query('SELECT id FROM clusters WHERE id = ?', [cluster_id]);
    if (!cluster.rows || cluster.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cluster not found"
      });
    }

    const result = await query(`
      INSERT INTO centres (
        name, cluster_id, address, is_active, created_at
      ) VALUES (?, ?, ?, ?, NOW())
    `, [
      name, cluster_id, address || null, 1
    ]);

    const insertId = (result as any).insertId;
    res.status(201).json({ 
      success: true,
      message: "Centre created successfully",
      data: { id: insertId, name, cluster_id, address }
    });
  } catch (error: any) {
    console.error('Create centre error:', error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Update centre
const updateCentre = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    // Check if centre exists
    const existingResult = await query('SELECT * FROM centres WHERE id = ?', [id]);
    if (!existingResult.rows || existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Centre not found" });
    }

    const fields: string[] = [];
    const values: any[] = [];
    
    // Build dynamic update query
    const allowedFields = [
      'name', 'code', 'address', 'cluster_id', 'manager_name', 
      'manager_phone', 'manager_email', 'capacity', 'is_active'
    ];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = ?`);
        // Convert boolean to integer for is_active field
        if (field === 'is_active') {
          values.push(updateData[field] ? 1 : 0);
        } else {
          values.push(updateData[field]);
        }
      }
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }
    
    values.push(id);
    
    await query(
      `UPDATE centres SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: "Centre updated successfully" });
  } catch (error: any) {
    console.error('Update centre error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: "Centre code already exists" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Delete centre
const deleteCentre = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if centre exists
    const existingResult = await query('SELECT * FROM centres WHERE id = ?', [id]);
    if (!existingResult.rows || existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Centre not found" });
    }
    
    await query('DELETE FROM centres WHERE id = ?', [id]);
    
    res.json({ message: "Centre deleted successfully" });
  } catch (error) {
    console.error('Delete centre error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get centres by cluster
const getCentresByCluster = async (req: Request, res: Response) => {
  try {
    const clusterId = parseInt(req.params.clusterId);
    
    const result = await query(`
      SELECT 
        c.*,
        cl.name as cluster_name,
        cl.code as cluster_code
      FROM centres c
      LEFT JOIN clusters cl ON c.cluster_id = cl.id
      WHERE c.cluster_id = ? AND c.is_active = 1
      ORDER BY c.name
    `, [clusterId]);
    
    res.json({ 
      data: result.rows || [],
      count: result.rows?.length || 0
    });
  } catch (error) {
    console.error('Get centres by cluster error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle centre status
const toggleCentreStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get current status
    const result = await query('SELECT is_active FROM centres WHERE id = ?', [id]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "Centre not found" });
    }
    
    const currentStatus = (result.rows[0] as any).is_active;
    const newStatus = currentStatus ? 0 : 1;
    
    await query('UPDATE centres SET is_active = ? WHERE id = ?', [newStatus, id]);
    
    res.json({ 
      success: true,
      message: `Centre ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
      data: { is_active: newStatus }
    });
  } catch (error) {
    console.error('Toggle centre status error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const centreController = {
  getCentres,
  getCentreById,
  createCentre,
  updateCentre,
  deleteCentre,
  getCentresByCluster,
  toggleCentreStatus
};
