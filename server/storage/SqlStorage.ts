import { query } from '../config/db';
// Models removed - using any types for raw SQL approach
import { 
  IStorage, 
  CreateOptions, 
  UpdateOptions, 
  StatusUpdateOptions, 
  FilterOptions 
} from '../interfaces/IStorage';

export class SqlStorage implements IStorage {
  // Helper method for building WHERE clauses with filters
  private buildFilterClause(filters?: FilterOptions): { whereClause: string; orderClause: string; limitClause: string } {
    let whereClause = '';
    let orderClause = '';
    let limitClause = '';
    
    if (filters?.sortBy) {
      orderClause = `ORDER BY ${filters.sortBy} ${filters.sortOrder || 'ASC'}`;
    }
    
    if (filters?.limit) {
      limitClause = `LIMIT ${filters.limit}`;
      if (filters.offset) {
        limitClause += ` OFFSET ${filters.offset}`;
      }
    }
    
    return { whereClause, orderClause, limitClause };
  }

  // Helper method for audit trail creation
  private async createAuditTrail(
    userId: number, 
    action: string, 
    tableName: string, 
    recordId: number, 
    oldValues: any, 
    newValues: any, 
    changedBy?: number
  ): Promise<any> {
    if (changedBy) {
      await this.createUserAudit({
        userId,
        changedBy,
        changeType: action,
        tableName,
        recordId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null
      });
    }
  }

  // User Management - Production-ready CRUD operations with any types
  async getUsers(filters?: FilterOptions): Promise<any[]> {
    console.log('SqlStorage.getUsers called with filters:', filters);
    
    try {
      let queryStr = 'SELECT * FROM users';
      const params: any[] = [];
      
      if (filters?.isActive !== undefined) {
        queryStr += ' WHERE is_active = ?';
        params.push(filters.isActive);
      }
      
      if (filters?.sortBy) {
        queryStr += ` ORDER BY ${filters.sortBy} ${filters.sortOrder || 'ASC'}`;
      } else {
        queryStr += ' ORDER BY created_at DESC';
      }
      
      if (filters?.limit) {
        queryStr += ' LIMIT ?';
        params.push(filters.limit);
        
        if (filters?.offset) {
          queryStr += ' OFFSET ?';
          params.push(filters.offset);
        }
      }
      
      console.log('Executing query:', queryStr, 'with params:', params);
      const result = await query(queryStr, params);
      console.log('Query result:', result.rows?.length, 'rows');
      return result.rows;
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  }

  async getUser(id: number): Promise<any> {
    const result = await query('SELECT * FROM users WHERE id = ?', [id]);
    return result.rows[0] || null;
  }

  async getUserByUserId(userId: number): Promise<any> {
    const result = await query('SELECT * FROM users WHERE user_id = ?', [userId]);
    return result.rows[0] || null;
  }

  async getUserByEmail(email: string): Promise<any> {
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);
    return result.rows[0] || null;
  }

  async createUser(userData: any, options?: CreateOptions): Promise<any> {
    const {
      email,
      name,
      phone,
      userId,
      passwordHash,
      role,
      managerId,
      cityId,
      clusterId,
      isActive = true
    } = userData;

    const insertResult = await query(`
      INSERT INTO users (
        email, name, phone, user_id, password_hash, role, 
        manager_id, city_id, cluster_id, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [email, name, phone, userId, passwordHash, role, managerId, cityId, clusterId, isActive]);

    const newUserId = (insertResult.rows as any).insertId;
    const user = await this.getUser(newUserId);
    
    if (user && options?.changedBy) {
      await this.createAuditTrail(user.id, 'CREATE', 'users', user.id, null, user, options.changedBy);
    }

    return user!;
  }

  async updateUser(id: number, userData: any, options?: UpdateOptions): Promise<any> {
    const oldUser = options?.changedBy ? await this.getUser(id) : null;
    
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(userData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getUser(id);
    }
    
    fields.push('updated_at = NOW()');
    values.push(id);
    
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    
    const updatedUser = await this.getUser(id);
    
    if (updatedUser && options?.changedBy && oldUser) {
      await this.createAuditTrail(updatedUser.id, 'UPDATE', 'users', updatedUser.id, oldUser, updatedUser, options.changedBy);
    }
    
    return updatedUser;
  }

  async deleteUser(id: number, options?: UpdateOptions): Promise<any> {
    const user = options?.changedBy ? await this.getUser(id) : null;
    
    const result = await query('DELETE FROM users WHERE id = ?', [id]);
    const success = result.rowCount > 0;
    
    if (success && user && options?.changedBy) {
      await this.createAuditTrail(user.id, 'DELETE', 'users', user.id, user, null, options.changedBy);
    }
    
    return success;
  }

  async updateUserStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any> {
    return this.updateUser(id, { isActive }, options);
  }

  // User audit trail
  async createUserAudit(auditData: any): Promise<any> {
    const {
      userId,
      changedBy,
      changeType,
      tableName,
      recordId,
      oldValues,
      newValues
    } = auditData;

    const insertResult = await query(`
      INSERT INTO user_audit_trail (
        user_id, changed_by, change_type, table_name, record_id, 
        old_values, new_values, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [userId, changedBy, changeType, tableName, recordId, oldValues, newValues]);

    const auditId = (insertResult.rows as any).insertId;
    const result = await query('SELECT * FROM user_audit_trail WHERE id = ?', [auditId]);
    return result.rows[0];
  }

  async getUserAuditTrail(userId: number, filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM user_audit_trail 
      WHERE user_id = ? 
      ${orderClause || 'ORDER BY timestamp DESC'} 
      ${limitClause}
    `, [userId]);
    return result.rows;
  }

  // Cities - production-ready CRUD
  async getCities(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM cities 
      WHERE 1=1 
      ${orderClause || 'ORDER BY name ASC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getCity(id: number): Promise<any> {
    const result = await query('SELECT * FROM cities WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createCity(cityData: any, options?: CreateOptions): Promise<any> {
    const { name, code, isActive = true } = cityData;
    
    const insertResult = await query(`
      INSERT INTO cities (name, code, is_active, created_at)
      VALUES (?, ?, ?, NOW())
    `, [name, code, isActive]);
    
    const cityId = (insertResult.rows as any).insertId;
    return await this.getCity(cityId) as any;
  }

  async updateCity(id: number, cityData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(cityData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getCity(id);
    }
    
    values.push(id);
    await query(`UPDATE cities SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getCity(id);
  }

  async deleteCity(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM cities WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async updateCityStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any> {
    return this.updateCity(id, { isActive }, options);
  }

  // Clusters - production-ready CRUD
      async getClusters(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT c.*, ct.name as cityName 
      FROM clusters c
      LEFT JOIN cities ct ON c.city_id = ct.id
      WHERE 1=1 
      ${orderClause || 'ORDER BY c.name ASC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getClustersByCity(cityId: number, filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT c.*, ct.name as city_name 
      FROM clusters c
      LEFT JOIN cities ct ON c.city_id = ct.id
      WHERE c.city_id = ? 
      ${orderClause || 'ORDER BY c.name ASC'} 
      ${limitClause}
    `, [cityId]);
    return result.rows as any[];
  }

  async getCluster(id: number): Promise<any> {
    const result = await query(`
      SELECT c.*, ct.name as city_name 
      FROM clusters c
      LEFT JOIN cities ct ON c.city_id = ct.id
      WHERE c.id = ?
    `, [id]);
    return result.rows[0] as any || null;
  }

  async createCluster(clusterData: any, options?: CreateOptions): Promise<any> {
    const { name, code, city_id, cityId, isActive = true } = clusterData;
    
    // Handle both camelCase and snake_case field names
    const actualCityId = city_id || cityId;
    
    const insertResult = await query(`
      INSERT INTO clusters (name, code, city_id, is_active, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [name, code, actualCityId, isActive]);
    
    const clusterId = (insertResult.rows as any).insertId;
    return await this.getCluster(clusterId) as any;
  }

  async updateCluster(id: number, clusterData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(clusterData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        // Map camelCase to snake_case for database fields
        let dbField = key;
        if (key === 'cityId') {
          dbField = 'city_id';
        } else if (key === 'isActive') {
          dbField = 'is_active';
        }
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getCluster(id);
    }
    
    values.push(id);
    await query(`UPDATE clusters SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getCluster(id);
  }

  async deleteCluster(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM clusters WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async updateClusterStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any> {
    return this.updateCluster(id, { isActive }, options);
  }
  // Roles - production-ready CRUD
  async getRoles(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT r.*, 
             pg.name as paygroup_name,
             bu.name as business_unit_name,
             d.name as department_name,
             sd.name as sub_department_name
      FROM roles r
      LEFT JOIN paygroups pg ON r.paygroup_id = pg.id
      LEFT JOIN business_units bu ON r.business_unit_id = bu.id
      LEFT JOIN departments d ON r.department_id = d.id
      LEFT JOIN sub_departments sd ON r.sub_department_id = sd.id
      WHERE 1=1 
      ${orderClause} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getRole(id: number): Promise<any> {
    const result = await query(`
      SELECT r.*, 
             pg.name as paygroup_name,
             bu.name as business_unit_name,
             d.name as department_name,
             sd.name as sub_department_name
      FROM roles r
      LEFT JOIN paygroups pg ON r.paygroup_id = pg.id
      LEFT JOIN business_units bu ON r.business_unit_id = bu.id
      LEFT JOIN departments d ON r.department_id = d.id
      LEFT JOIN sub_departments sd ON r.sub_department_id = sd.id
      WHERE r.id = ?
    `, [id]);
    return result.rows[0] as any || null;
  }

  async createRole(roleData: any, options?: CreateOptions): Promise<any> {
    console.log('SqlStorage.createRole called with:', roleData);
    
    // Handle both camelCase (from FormData) and snake_case (from JSON)
    const name = roleData.name;
    const code = roleData.code;
    const job_description_file = roleData.job_description_file || roleData.jobDescriptionFile;
    const paygroup_id = roleData.paygroup_id || roleData.paygroupId;
    const business_unit_id = roleData.business_unit_id || roleData.businessUnitId;
    const department_id = roleData.department_id || roleData.departmentId;
    const sub_department_id = roleData.sub_department_id || roleData.subDepartmentId;
    const is_active = roleData.is_active !== undefined ? roleData.is_active : (roleData.isActive !== undefined ? roleData.isActive : true);
    
    console.log('Prepared values for insertion:', {
      name, code, job_description_file, paygroup_id, 
      business_unit_id, department_id, sub_department_id, is_active
    });
    
    try {
      const insertResult = await query(`
        INSERT INTO roles (name, code, job_description_file, paygroup_id, business_unit_id, department_id, sub_department_id, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [name, code, job_description_file, paygroup_id, business_unit_id, department_id, sub_department_id, is_active]);
      
      console.log('Insert result:', insertResult);
      
      const roleId = (insertResult.rows as any).insertId;
      console.log('New role ID:', roleId);
      
      const newRole = await this.getRole(roleId);
      console.log('Retrieved new role:', newRole);
      
      return newRole as any;
    } catch (error) {
      console.error('Error in createRole:', error);
      throw error;
    }
  }

  async updateRole(id: number, roleData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    // Map of camelCase/snake_case to database column names
    const fieldMap: Record<string, string> = {
      'name': 'name',
      'code': 'code',
      'paygroup_id': 'paygroup_id',
      'paygroupId': 'paygroup_id',
      'business_unit_id': 'business_unit_id',
      'businessUnitId': 'business_unit_id',
      'department_id': 'department_id',
      'departmentId': 'department_id',
      'sub_department_id': 'sub_department_id',
      'subDepartmentId': 'sub_department_id',
      'job_description_file': 'job_description_file',
      'jobDescriptionFile': 'job_description_file',
      'is_active': 'is_active',
      'isActive': 'is_active'
    };
    
    Object.entries(roleData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        const dbField = fieldMap[key] || key;
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getRole(id);
    }
    
    values.push(id);
    await query(`UPDATE roles SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getRole(id);
  }

  async deleteRole(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM roles WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async updateRoleStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any> {
    return this.updateRole(id, { isActive }, options);
  }

  // Paygroups - production-ready CRUD
  async getPaygroups(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM paygroups 
      WHERE 1=1 
      ${orderClause || 'ORDER BY name ASC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getPaygroup(id: number): Promise<any> {
    const result = await query('SELECT * FROM paygroups WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createPaygroup(data: any, options?: CreateOptions): Promise<any> {
    const { name, code, isActive = true } = data;
    const insertResult = await query(`
      INSERT INTO paygroups (name, code, is_active, created_at)
      VALUES (?, ?, ?, NOW())
    `, [name, code, isActive]);
    const paygroupId = (insertResult.rows as any).insertId;
    return await this.getPaygroup(paygroupId);
  }

  async updatePaygroup(id: number, data: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    });
    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE paygroups SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    return await this.getPaygroup(id);
  }

  async deletePaygroup(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM paygroups WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  // Business Units - production-ready CRUD
  async getBusinessUnits(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM business_units 
      WHERE 1=1 
      ${orderClause || 'ORDER BY name ASC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getBusinessUnit(id: number): Promise<any> {
    const result = await query('SELECT * FROM business_units WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createBusinessUnit(data: any, options?: CreateOptions): Promise<any> {
    const { name, code, isActive = true } = data;
    const insertResult = await query(`
      INSERT INTO business_units (name, code, is_active, created_at)
      VALUES (?, ?, ?, NOW())
    `, [name, code, isActive]);
    const businessUnitId = (insertResult.rows as any).insertId;
    return await this.getBusinessUnit(businessUnitId);
  }

  async updateBusinessUnit(id: number, data: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    });
    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE business_units SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    return await this.getBusinessUnit(id);
  }

  async deleteBusinessUnit(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM business_units WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  // Departments - production-ready CRUD
  async getDepartments(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT d.*, bu.name as business_unit_name
      FROM departments d
      LEFT JOIN business_units bu ON d.business_unit_id = bu.id
      WHERE 1=1 
      ${orderClause || 'ORDER BY d.name ASC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getDepartment(id: number): Promise<any> {
    const result = await query(`
      SELECT d.*, bu.name as business_unit_name
      FROM departments d
      LEFT JOIN business_units bu ON d.business_unit_id = bu.id
      WHERE d.id = ?
    `, [id]);
    return result.rows[0] as any || null;
  }

  async createDepartment(data: any, options?: CreateOptions): Promise<any> {
    const { name, code, business_unit_id, is_active = true } = data;
    const businessUnitId = business_unit_id;
    const isActive = is_active;
    const insertResult = await query(`
      INSERT INTO departments (name, code, business_unit_id, is_active, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [name, code, businessUnitId, isActive]);
    const departmentId = (insertResult.rows as any).insertId;
    return await this.getDepartment(departmentId);
  }

  async updateDepartment(id: number, data: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    });
    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE departments SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    return await this.getDepartment(id);
  }

  async deleteDepartment(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM departments WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  // Sub Departments - production-ready CRUD
  async getSubDepartments(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT sd.*, d.name as department_name
      FROM sub_departments sd
      LEFT JOIN departments d ON sd.department_id = d.id
      WHERE 1=1 
      ${orderClause || 'ORDER BY sd.name ASC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getSubDepartment(id: number): Promise<any> {
    const result = await query(`
      SELECT sd.*, d.name as department_name
      FROM sub_departments sd
      LEFT JOIN departments d ON sd.department_id = d.id
      WHERE sd.id = ?
    `, [id]);
    return result.rows[0] as any || null;
  }

  async createSubDepartment(data: any, options?: CreateOptions): Promise<any> {
    const { name, code, department_id, is_active = true } = data;
    const departmentId = department_id;
    const isActive = is_active;
    const insertResult = await query(`
      INSERT INTO sub_departments (name, code, department_id, is_active, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [name, code, departmentId, isActive]);
    const subDepartmentId = (insertResult.rows as any).insertId;
    return await this.getSubDepartment(subDepartmentId);
  }

  async updateSubDepartment(id: number, data: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    });
    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE sub_departments SET ${fields.join(', ')} WHERE id = ?`, values);
    }
    return await this.getSubDepartment(id);
  }

  async deleteSubDepartment(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM sub_departments WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  // Vendors - production-ready CRUD
  async getVendors(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM vendors 
      WHERE 1=1
      ${orderClause || 'ORDER BY name ASC'} 
      ${limitClause}
    `);
    const vendors = result.rows as any[];
    
    // Parse JSON city_spocs for each vendor
    vendors.forEach(vendor => {
      if (vendor.city_spocs) {
        try {
          vendor.citySpocs = typeof vendor.city_spocs === 'string' 
            ? JSON.parse(vendor.city_spocs) 
            : vendor.city_spocs;
        } catch (e) {
          vendor.citySpocs = {};
        }
        delete vendor.city_spocs;
      }
    });
    
    return vendors;
  }
  
  async getVendor(id: number): Promise<any> {
    const result = await query('SELECT * FROM vendors WHERE id = ?', [id]);
    const vendor = result.rows[0] as any || null;
    
    if (vendor && vendor.city_spocs) {
      // Parse JSON city_spocs
      try {
        vendor.citySpocs = typeof vendor.city_spocs === 'string' 
          ? JSON.parse(vendor.city_spocs) 
          : vendor.city_spocs;
      } catch (e) {
        vendor.citySpocs = {};
      }
      delete vendor.city_spocs; // Remove snake_case version
    }
    
    return vendor;
  }
  
  async createVendor(vendorData: any, options?: CreateOptions): Promise<any> {
    // Handle both camelCase and snake_case
    const name = vendorData.name;
    const code = vendorData.code;
    const managementFees = vendorData.management_fees || vendorData.managementFees;
    const sourcingFee = vendorData.sourcing_fee || vendorData.sourcingFee;
    const replacementDays = vendorData.replacement_days || vendorData.replacementDays;
    const deliveryLeadName = vendorData.delivery_lead_name || vendorData.deliveryLeadName;
    const deliveryLeadEmail = vendorData.delivery_lead_email || vendorData.deliveryLeadEmail;
    const deliveryLeadPhone = vendorData.delivery_lead_phone || vendorData.deliveryLeadPhone;
    const businessHeadName = vendorData.business_head_name || vendorData.businessHeadName;
    const businessHeadEmail = vendorData.business_head_email || vendorData.businessHeadEmail;
    const businessHeadPhone = vendorData.business_head_phone || vendorData.businessHeadPhone;
    const payrollSpocName = vendorData.payroll_spoc_name || vendorData.payrollSpocName;
    const payrollSpocEmail = vendorData.payroll_spoc_email || vendorData.payrollSpocEmail;
    const payrollSpocPhone = vendorData.payroll_spoc_phone || vendorData.payrollSpocPhone;
    const citySpocs = vendorData.city_spocs || vendorData.citySpocs || {};
    const isActive = vendorData.is_active !== undefined ? vendorData.is_active : (vendorData.isActive !== undefined ? vendorData.isActive : true);
    
    console.log('🔍 createVendor called with:', vendorData);
    console.log('🔍 Extracted values:', {
      name,
      managementFees,
      sourcingFee,
      replacementDays,
      deliveryLeadName,
      deliveryLeadEmail,
      deliveryLeadPhone,
      businessHeadName,
      businessHeadEmail,
      businessHeadPhone,
      payrollSpocName,
      payrollSpocEmail,
      payrollSpocPhone
    });
    
    // Convert citySpocs object to JSON format for storage
    const citySpocJson = Object.keys(citySpocs).length > 0 ? JSON.stringify(citySpocs) : null;
    
    const insertResult = await query(`
      INSERT INTO vendors (
        name, code,
        management_fees, sourcing_fee, replacement_days,
        delivery_lead_name, delivery_lead_email, delivery_lead_phone,
        business_head_name, business_head_email, business_head_phone,
        payroll_spoc_name, payroll_spoc_email, payroll_spoc_phone,
        city_spocs,
        is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      name, code,
      managementFees, sourcingFee, replacementDays,
      deliveryLeadName, deliveryLeadEmail, deliveryLeadPhone,
      businessHeadName, businessHeadEmail, businessHeadPhone,
      payrollSpocName, payrollSpocEmail, payrollSpocPhone,
      citySpocJson,
      isActive
    ]);
    
    const vendorId = (insertResult.rows as any).insertId;
    console.log('✅ Vendor created with ID:', vendorId);
    
    return await this.getVendor(vendorId) as any;
  }
  
  async updateVendor(id: number, vendorData: any, options?: UpdateOptions): Promise<any> {
    console.log('🔍 updateVendor called with:', { id, vendorData });
    
    try {
      // Extract citySpocs (could be citySpocs or city_spocs depending on conversion)
      const citySpocs = vendorData.citySpocs || vendorData.city_spocs;
      const fields: string[] = [];
      const values: any[] = [];
      
      // Fields that don't exist in vendors table
      const excludedFields = ['id', 'email', 'phone', 'contactPerson', 'contact_person', 
                              'commercialTerms', 'commercial_terms', 'replacementPeriod', 'replacement_period',
                              'citySpocs', 'city_spocs', 'incentiveStructure', 'incentive_structure',
                              'cityRecruitmentSpocName', 'city_recruitment_spoc_name',
                              'cityRecruitmentSpocEmail', 'city_recruitment_spoc_email',
                              'cityRecruitmentSpocPhone', 'city_recruitment_spoc_phone'];
      
      // Convert camelCase to snake_case for database columns
      Object.entries(vendorData).forEach(([key, value]) => {
        if (!excludedFields.includes(key) &&
            value !== undefined && 
            value !== null &&
            value !== '' &&
            !key.startsWith('citySpoc') &&
            !key.startsWith('city_spoc')) {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
          console.log(`  Field: ${key} -> ${dbKey} = ${value}`);
          fields.push(`${dbKey} = ?`);
          values.push(value);
        }
      });
      
      // Handle city_spocs JSON update
      if (citySpocs && typeof citySpocs === 'object' && Object.keys(citySpocs).length > 0) {
        console.log('  Adding city_spocs:', citySpocs);
        fields.push('city_spocs = ?');
        values.push(JSON.stringify(citySpocs));
      }
      
      if (fields.length > 0) {
        values.push(id);
        const sql = `UPDATE vendors SET ${fields.join(', ')} WHERE id = ?`;
        console.log('  SQL:', sql);
        console.log('  Values:', values);
        await query(sql, values);
        console.log('✅ Vendor updated');
      } else {
        console.log('⚠️ No fields to update');
      }
      
      return await this.getVendor(id) as any;
    } catch (error) {
      console.error('❌ Error in updateVendor:', error);
      throw error;
    }
  }
  
  async deleteVendor(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM vendors WHERE id = ?', [id]);
    return result.rowCount > 0;
  }
  
  async updateVendorStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any> {
    return this.updateVendor(id, { isActive }, options);
  }

  // Recruiters - production-ready CRUD
  async getRecruiters(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM recruiters 
      WHERE 1=1 
      ${orderClause || 'ORDER BY name ASC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getRecruiter(id: number): Promise<any> {
    const result = await query('SELECT * FROM recruiters WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createRecruiter(recruiterData: any, options?: CreateOptions): Promise<any> {
    const { name, email, phone, vendorId, isActive = true } = recruiterData;
    
    const insertResult = await query(`
      INSERT INTO recruiters (name, email, phone, vendor_id, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [name, email, phone, vendorId, isActive]);
    
    const recruiterId = (insertResult.rows as any).insertId;
    return await this.getRecruiter(recruiterId) as any;
  }

  async updateRecruiter(id: number, recruiterData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(recruiterData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getRecruiter(id);
    }
    
    values.push(id);
    await query(`UPDATE recruiters SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getRecruiter(id);
  }

  async deleteRecruiter(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM recruiters WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async updateRecruiterStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any> {
    return this.updateRecruiter(id, { isActive }, options);
  }

  // Trainers - production-ready CRUD
  async getTrainers(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT t.*, c.name as cityName 
      FROM trainers t
      LEFT JOIN cities c ON t.city_id = c.id
      WHERE 1=1 
      ${orderClause || 'ORDER BY t.name ASC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getTrainer(id: number): Promise<any> {
    const result = await query(`
      SELECT t.*, c.name as cityName 
      FROM trainers t
      LEFT JOIN cities c ON t.city_id = c.id
      WHERE t.id = ?
    `, [id]);
    return result.rows[0] as any || null;
  }

  async createTrainer(trainerData: any, options?: CreateOptions): Promise<any> {
    const { name, cityId, email, phone, isActive = true } = trainerData;
    
    const insertResult = await query(`
      INSERT INTO trainers (name, city_id, email, phone, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [name, cityId, email, phone, isActive]);
    
    const trainerId = (insertResult.rows as any).insertId;
    return await this.getTrainer(trainerId) as any;
  }

  async updateTrainer(id: number, trainerData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(trainerData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getTrainer(id);
    }
    
    values.push(id);
    await query(`UPDATE trainers SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getTrainer(id);
  }

  async deleteTrainer(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM trainers WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async updateTrainerStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any> {
    return this.updateTrainer(id, { isActive }, options);
  }

  // Hiring Requests - production-ready CRUD
  async getHiringRequests(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.status) {
      whereClause += ' AND hr.status = ?';
      params.push(filters.status);
    }
    if (filters?.cityId) {
      whereClause += ' AND hr.city_id = ?';
      params.push(filters.cityId);
    }
    if (filters?.clusterId) {
      whereClause += ' AND hr.cluster_id = ?';
      params.push(filters.clusterId);
    }
    if (filters?.roleId) {
      whereClause += ' AND hr.role_id = ?';
      params.push(filters.roleId);
    }
    
    const result = await query(`
      SELECT 
        hr.*,
        c.name as city_name,
        c.code as city_code,
        cl.name as cluster_name,
        cl.code as cluster_code,
        r.name as role_name,
        r.code as role_code
      FROM hiring_requests hr
      LEFT JOIN cities c ON hr.city_id = c.id
      LEFT JOIN clusters cl ON hr.cluster_id = cl.id
      LEFT JOIN roles r ON hr.role_id = r.id
      ${whereClause} 
      ${orderClause || 'ORDER BY hr.created_at DESC'} 
      ${limitClause}
    `, params);
    return result.rows as any[];
  }

  async getHiringRequest(id: number): Promise<any> {
    const result = await query(`
      SELECT 
        hr.*,
        c.name as city_name,
        c.code as city_code,
        cl.name as cluster_name,
        cl.code as cluster_code,
        r.name as role_name,
        r.code as role_code
      FROM hiring_requests hr
      LEFT JOIN cities c ON hr.city_id = c.id
      LEFT JOIN clusters cl ON hr.cluster_id = cl.id
      LEFT JOIN roles r ON hr.role_id = r.id
      WHERE hr.id = ?
    `, [id]);
    return result.rows[0] as any || null;
  }

  async createHiringRequest(requestData: any, options?: CreateOptions): Promise<any> {
    const {
      requestId,
      cityId,
      clusterId,
      roleId,
      numberOfPositions,
      priority = 'P2',
      requestType = 'fresh',
      replacementReason,
      status = 'open',
      notes,
      requestDate,
      createdBy
    } = requestData;
    
    // Use provided requestDate or current timestamp
    const actualRequestDate = requestDate || new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const insertResult = await query(`
      INSERT INTO hiring_requests (
        request_id, city_id, cluster_id, role_id, position_title, no_of_openings,
        priority, request_type, status, description, request_date, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      requestId, cityId, clusterId, roleId, 'Position', numberOfPositions,
      priority, requestType, status, notes, actualRequestDate, createdBy
    ]);
    
    const hiringRequestId = (insertResult as any).insertId;
    return await this.getHiringRequest(hiringRequestId) as any;
  }

  async updateHiringRequest(id: number, requestData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(requestData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getHiringRequest(id);
    }
    
    fields.push('updated_at = NOW()');
    values.push(id);
    await query(`UPDATE hiring_requests SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getHiringRequest(id);
  }

  async deleteHiringRequest(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM hiring_requests WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async getNextHiringRequestSequence(roleId: number): Promise<number> {
    const result = await query(`
      SELECT COUNT(*) as count 
      FROM hiring_requests hr
      JOIN roles r ON hr.role_id = r.id
      WHERE hr.role_id = ?
    `, [roleId]);
    
    const count = (result.rows as any)[0]?.count || 0;
    return count + 1;
  }

  async updateHiringRequestStatus(id: number, status: 'open' | 'closed' | 'called_off', options?: StatusUpdateOptions): Promise<any> {
    return this.updateHiringRequest(id, { status }, options);
  }

  // Candidates - NEW STRUCTURE
  async getCandidates(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.status) {
      whereClause += ' AND c.status = ?';
      params.push(filters.status);
    }
    
    const result = await query(`
      SELECT * FROM candidates c
      ${whereClause} 
      ${orderClause || 'ORDER BY c.created_at DESC'} 
      ${limitClause}
    `, params);
    return result.rows as any[];
  }

  async getCandidate(id: number): Promise<any> {
    console.log('Getting candidate with ID:', id);
    const result = await query(`
      SELECT * FROM candidates WHERE id = ?
    `, [id]);
    
    console.log('getCandidate query result:', JSON.stringify(result, null, 2));
    console.log('First row:', result.rows[0]);
    
    return result.rows[0] as any || null;
  }

  async createCandidate(candidateData: any): Promise<any> {
    console.log('Creating candidate with data:', candidateData);
    
    const {
      name,
      phone,
      aadharNumber,
      email,
      role,
      city,
      cluster,
      qualification,
      resumeSource,
      vendor,
      recruiter,
      referralName
    } = candidateData;
    
    // Validate required fields
    if (!resumeSource) {
      throw new Error('Resume source is required');
    }
    
    // Validate Aadhar Number (MANDATORY - must be exactly 12 digits)
    if (!aadharNumber) {
      throw new Error('Aadhar number is required');
    }
    
    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(aadharNumber)) {
      throw new Error('Aadhar number must be exactly 12 digits');
    }
    
    // Check for duplicate Aadhar number
    const duplicateCheck = await query('SELECT id, name, status FROM candidates WHERE aadhar_number = ?', [aadharNumber]);
    if (duplicateCheck.rows.length > 0) {
      const existingCandidate = duplicateCheck.rows[0] as any;
      throw new Error(`Duplicate Aadhar Number! This Aadhar is already registered for candidate: ${existingCandidate.name} (Status: ${existingCandidate.status}). This may be a rejoiner.`);
    }
    
    // Get IDs and codes from names
    const roleResult = await query('SELECT id, code FROM roles WHERE name = ?', [role]);
    const cityResult = await query('SELECT id, code FROM cities WHERE name = ?', [city]);
    const clusterResult = await query('SELECT id, code FROM clusters WHERE name = ?', [cluster]);
    
    if (!roleResult.rows[0] || !cityResult.rows[0] || !clusterResult.rows[0]) {
      throw new Error('Invalid role, city, or cluster');
    }
    
    const roleId = (roleResult.rows[0] as any).id;
    const roleCode = (roleResult.rows[0] as any).code;
    const cityId = (cityResult.rows[0] as any).id;
    const cityCode = (cityResult.rows[0] as any).code;
    const clusterId = (clusterResult.rows[0] as any).id;
    const clusterCode = (clusterResult.rows[0] as any).code;
    
    // Generate Application ID: CITY_CLUSTER_ROLE_FIRST3LETTERS_SEQUENCE
    const namePrefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    const basePattern = `${cityCode}_${clusterCode}_${roleCode}_${namePrefix}_%`;
    
    // Get the next sequence number for this pattern
    const seqResult = await query(`
      SELECT application_id FROM candidates 
      WHERE application_id LIKE ? 
      ORDER BY application_id DESC LIMIT 1
    `, [basePattern]);
    
    let nextSeq = 1;
    if (seqResult.rows[0]) {
      const lastId = (seqResult.rows[0] as any).application_id;
      const lastSeqStr = lastId.split('_').pop();
      nextSeq = parseInt(lastSeqStr) + 1;
    }
    
    const applicationId = `${cityCode}_${clusterCode}_${roleCode}_${namePrefix}_${String(nextSeq).padStart(4, '0')}`;
    
    let vendorId = null;
    let vendorName = null;
    let recruiterId = null;
    let recruiterName = null;
    
    if (resumeSource === 'vendor' && vendor) {
      const vendorResult = await query('SELECT id, name FROM vendors WHERE name = ?', [vendor]);
      if (vendorResult.rows[0]) {
        vendorId = (vendorResult.rows[0] as any).id;
        vendorName = (vendorResult.rows[0] as any).name;
      }
    }
    
    if (resumeSource === 'field_recruiter' && recruiter) {
      const recruiterResult = await query('SELECT id, name FROM recruiters WHERE name = ?', [recruiter]);
      if (recruiterResult.rows[0]) {
        recruiterId = (recruiterResult.rows[0] as any).id;
        recruiterName = (recruiterResult.rows[0] as any).name;
      }
    }

    const insertResult = await query(`
      INSERT INTO candidates (
        application_id, name, phone, aadhar_number, email, role_id, role_name, city_id, city_name, cluster_id, cluster_name,
        qualification, resume_source, vendor_id, vendor_name, recruiter_id, recruiter_name, referral_name,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'applied', NOW())
    `, [
      applicationId, name, phone, aadharNumber, email, roleId, role, cityId, city, clusterId, cluster,
      qualification, resumeSource, vendorId, vendorName, recruiterId, recruiterName, referralName
    ]);
    
    // Return success response with application ID
    return {
      id: 'pending',
      applicationId,
      name,
      phone,
      email,
      role,
      city,
      cluster,
      qualification,
      resumeSource,
      vendorName,
      recruiterName,
      referralName,
      status: 'applied',
      message: `Candidate application submitted successfully. Your Application ID is: ${applicationId}`
    };
  }

  async updateCandidate(id: number, candidateData: any, options?: UpdateOptions): Promise<any> {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(candidateData)) {
      if (value !== undefined) {
        // Convert camelCase to snake_case for database columns
        // Remove leading underscore if present (happens when first letter is capital)
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
        console.log(`Converting field: ${key} → ${dbKey} = ${value}`);
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    }
    
    // If no fields to update, return current candidate
    if (fields.length === 0) {
      const result = await query('SELECT * FROM candidates WHERE id = ?', [id]);
      return result.rows[0] as any || null;
    }
    
    values.push(id);
    await query(`UPDATE candidates SET ${fields.join(', ')} WHERE id = ?`, values);
    
    // Return updated candidate data
    const result = await query('SELECT * FROM candidates WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async deleteCandidate(id: number, options?: UpdateOptions): Promise<boolean> {
    const result = await query('DELETE FROM candidates WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async updateCandidateStatus(id: number, status: string, options?: StatusUpdateOptions): Promise<any> {
    return this.updateCandidate(id, { status }, options);
  }


  async getTrainingSessions(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM training_sessions 
      ${orderClause || 'ORDER BY created_at DESC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getTrainingSession(id: number): Promise<any> {
    const result = await query('SELECT * FROM training_sessions WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createTrainingSession(sessionData: any, options?: CreateOptions): Promise<any> {
    const { trainingType, candidateId, trainerId, status = 'assigned' } = sessionData;
    
    const insertResult = await query(`
      INSERT INTO training_sessions (training_type, candidate_id, trainer_id, status, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [trainingType, candidateId, trainerId, status]);
    
    const sessionId = (insertResult as any).insertId;
    return await this.getTrainingSession(sessionId) as any;
  }

  async updateTrainingSession(id: number, sessionData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(sessionData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getTrainingSession(id);
    }
    
    values.push(id);
    await query(`UPDATE training_sessions SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getTrainingSession(id);
  }

  async deleteTrainingSession(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM training_sessions WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async updateTrainingSessionStatus(id: number, status: 'assigned' | 'in_progress' | 'completed' | 'dropped_out', options?: StatusUpdateOptions): Promise<any> {
    return this.updateTrainingSession(id, { status }, options);
  }

  // Employees - production-ready CRUD
  async getEmployees(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.isActive !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(filters.isActive);
    }
    if (filters?.cityId) {
      whereClause += ' AND city_id = ?';
      params.push(filters.cityId);
    }
    
    const result = await query(`
      SELECT * FROM employees 
      ${whereClause} 
      ${orderClause || 'ORDER BY name ASC'} 
      ${limitClause}
    `, params);
    return result.rows as any[];
  }

  async getEmployee(id: number): Promise<any> {
    const result = await query('SELECT * FROM employees WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createEmployee(employeeData: any, options?: CreateOptions): Promise<any> {
    const {
      candidateId,
      employeeId,
      personalDetails,
      contactDetails,
      employmentDetails,
      govtIds,
      bankDetails,
      documents,
      status = 'active',
      joinDate
    } = employeeData;
    
    const insertResult = await query(`
      INSERT INTO employees (
        candidate_id, employee_id, personal_details, contact_details, employment_details,
        govt_ids, bank_details, documents, status, join_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      candidateId, employeeId, personalDetails, contactDetails, employmentDetails,
      govtIds, bankDetails, documents, status, joinDate
    ]);
    
    const empId = (insertResult.rows as any).insertId;
    return await this.getEmployee(empId) as any;
  }

  async updateEmployee(id: number, employeeData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(employeeData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getEmployee(id);
    }
    
    values.push(id);
    await query(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getEmployee(id);
  }

  async deleteEmployee(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM employees WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async updateEmployeeStatus(id: number, status: string, options?: StatusUpdateOptions): Promise<any> {
    return this.updateEmployee(id, { status: status as 'active' | 'inactive' | 'terminated' | 'resigned' }, options);
  }

  async getTrainingAttendance(sessionId: number, filters?: FilterOptions): Promise<any[]> {
    const result = await query('SELECT * FROM training_attendance WHERE session_id = ?', [sessionId]);
    return result.rows as any[];
  }

  async createTrainingAttendance(attendanceData: any, options?: CreateOptions): Promise<any> {
    const { sessionId, candidateId, attendanceDate, status } = attendanceData;
    
    const insertResult = await query(`
      INSERT INTO training_attendance (session_id, candidate_id, attendance_date, status, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [sessionId, candidateId, attendanceDate, status]);
    
    const attendanceId = (insertResult.rows as any).insertId;
    const result = await query('SELECT * FROM training_attendance WHERE id = ?', [attendanceId]);
    return result.rows[0] as any;
  }

  async updateTrainingAttendance(id: number, attendanceData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(attendanceData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      const result = await query('SELECT * FROM training_attendance WHERE id = ?', [id]);
      return result.rows[0] as any || null;
    }
    
    values.push(id);
    await query(`UPDATE training_attendance SET ${fields.join(', ')} WHERE id = ?`, values);
    
    const result = await query('SELECT * FROM training_attendance WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async deleteTrainingAttendance(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM training_attendance WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async getEmployeeActions(employeeId: number, filters?: FilterOptions): Promise<any[]> {
    const result = await query('SELECT * FROM employee_actions WHERE employee_id = ? ORDER BY created_at DESC', [employeeId]);
    return result.rows as any[];
  }

  async getEmployeeAction(id: number): Promise<any> {
    const result = await query('SELECT * FROM employee_actions WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createEmployeeAction(actionData: any, options?: CreateOptions): Promise<any> {
    const { employeeId, actionType, description, requestedBy } = actionData;
    
    const insertResult = await query(`
      INSERT INTO employee_actions (employee_id, action_type, description, requested_by, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [employeeId, actionType, description, requestedBy]);
    
    const actionId = (insertResult.rows as any).insertId;
    const result = await query('SELECT * FROM employee_actions WHERE id = ?', [actionId]);
    return result.rows[0] as any;
  }

  async updateEmployeeAction(id: number, actionData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(actionData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      const result = await query('SELECT * FROM employee_actions WHERE id = ?', [id]);
      return result.rows[0] as any || null;
    }
    
    values.push(id);
    await query(`UPDATE employee_actions SET ${fields.join(', ')} WHERE id = ?`, values);
    
    const result = await query('SELECT * FROM employee_actions WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async deleteEmployeeAction(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM employee_actions WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async getExitRecords(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM exit_records 
      WHERE 1=1 
      ${orderClause || 'ORDER BY exit_date DESC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getExitRecord(id: number): Promise<any> {
    const result = await query('SELECT * FROM exit_records WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createExitRecord(exitData: any, options?: CreateOptions): Promise<any> {
    const { employeeId, exitType, exitDate, reason, exitInterview, finalSettlement, handoverCompleted, createdBy } = exitData;
    
    const insertResult = await query(`
      INSERT INTO exit_records (employee_id, exit_type, exit_date, reason, exit_interview, final_settlement, handover_completed, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [employeeId, exitType, exitDate, reason, exitInterview, finalSettlement, handoverCompleted, createdBy]);
    
    const exitId = (insertResult.rows as any).insertId;
    return await this.getExitRecord(exitId) as any;
  }

  async updateExitRecord(id: number, exitData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(exitData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getExitRecord(id);
    }
    
    values.push(id);
    await query(`UPDATE exit_records SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getExitRecord(id);
  }

  async deleteExitRecord(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM exit_records WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async getRecruiterIncentives(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM recruiter_incentives 
      WHERE 1=1 
      ${orderClause || 'ORDER BY created_at DESC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getRecruiterIncentive(id: number): Promise<any> {
    const result = await query('SELECT * FROM recruiter_incentives WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createRecruiterIncentive(incentiveData: any, options?: CreateOptions): Promise<any> {
    const { recruiterId, month, year, incentiveAmount, status = 'pending' } = incentiveData;
    
    const insertResult = await query(`
      INSERT INTO recruiter_incentives (recruiter_id, month, year, incentive_amount, status, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [recruiterId, month, year, incentiveAmount, status]);
    
    const incentiveId = (insertResult.rows as any).insertId;
    return await this.getRecruiterIncentive(incentiveId) as any;
  }

  async updateRecruiterIncentive(id: number, incentiveData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(incentiveData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getRecruiterIncentive(id);
    }
    
    values.push(id);
    await query(`UPDATE recruiter_incentives SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getRecruiterIncentive(id);
  }

  async getCandidatePipeline(): Promise<{
    status: string;
    count: number;
    percentage: number;
  }[]> {
    // Return empty array since candidates table is removed
    return Promise.resolve([]);
  }

  async getVendorPerformance(): Promise<{
    vendorName: string;
    totalCandidates: number;
    successfulHires: number;
    rejectedCandidates: number;
    successRate: number;
  }[]> {
    // Return empty array since candidates table is removed
    return Promise.resolve([]);
  }

  async getRecruiterPerformance(): Promise<{
    recruiterName: string;
    totalCandidates: number;
    successfulHires: number;
    selectedCandidates: number;
    successRate: number;
    avgTimeToHire: number;
  }[]> {
    // Return empty array since candidates table is removed
    return Promise.resolve([]);
  }

  async getHiringAnalytics(filters?: FilterOptions): Promise<{
    date: string;
    totalRequests: number;
    openRequests: number;
    closedRequests: number;
    totalPositions: number;
  }[]> {
    const result = await query(`
      SELECT 
        DATE(hr.created_at) as date,
        COUNT(hr.id) as totalRequests,
        SUM(CASE WHEN hr.status = 'open' THEN 1 ELSE 0 END) as openRequests,
        SUM(CASE WHEN hr.status = 'closed' THEN 1 ELSE 0 END) as closedRequests,
        SUM(hr.no_of_openings) as totalPositions
      FROM hiring_requests hr
      GROUP BY DATE(hr.created_at)
      ORDER BY date DESC
      LIMIT 30
    `);
    
    return result.rows.map((row: any) => ({
      date: row.date,
      totalRequests: parseInt(row.totalRequests) || 0,
      openRequests: parseInt(row.openRequests) || 0,
      closedRequests: parseInt(row.closedRequests) || 0,
      totalPositions: parseInt(row.totalPositions) || 0
    }));
  }
}
