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
    
    const result = await query(queryStr, params);
    return result.rows;
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
      SELECT * FROM clusters 
      WHERE 1=1 
      ${orderClause || 'ORDER BY name ASC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getClustersByCity(cityId: number, filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM clusters 
      WHERE city_id = ? 
      ${orderClause || 'ORDER BY name ASC'} 
      ${limitClause}
    `, [cityId]);
    return result.rows as any[];
  }

  async getCluster(id: number): Promise<any> {
    const result = await query('SELECT * FROM clusters WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createCluster(clusterData: any, options?: CreateOptions): Promise<any> {
    const { name, code, cityId, isActive = true } = clusterData;
    
    const insertResult = await query(`
      INSERT INTO clusters (name, code, city_id, is_active, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [name, code, cityId, isActive]);
    
    const clusterId = (insertResult.rows as any).insertId;
    return await this.getCluster(clusterId) as any;
  }

  async updateCluster(id: number, clusterData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(clusterData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
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
      SELECT * FROM roles 
      WHERE 1=1 
      ${orderClause || 'ORDER BY name ASC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getRole(id: number): Promise<any> {
    const result = await query('SELECT * FROM roles WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createRole(roleData: any, options?: CreateOptions): Promise<any> {
    const { name, code, description, jobDescriptionFile, isActive = true } = roleData;
    
    const insertResult = await query(`
      INSERT INTO roles (name, code, description, job_description_file, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [name, code, description, jobDescriptionFile, isActive]);
    
    const roleId = (insertResult.rows as any).insertId;
    return await this.getRole(roleId) as any;
  }

  async updateRole(id: number, roleData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(roleData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
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

  // Vendors - production-ready CRUD
  async getVendors(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM vendors 
      WHERE 1=1 
      ${orderClause || 'ORDER BY name ASC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }
  
  async getVendor(id: number): Promise<any> {
    const result = await query('SELECT * FROM vendors WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }
  
  async createVendor(vendorData: any, options?: CreateOptions): Promise<any> {
    const { 
      name, 
      email, 
      phone, 
      contactPerson, 
      commercialTerms,
      managementFees,
      sourcingFee,
      replacementDays,
      deliveryLeadName,
      deliveryLeadEmail,
      deliveryLeadPhone,
      businessHeadName,
      businessHeadEmail,
      businessHeadPhone,
      isActive = true 
    } = vendorData;
    
    const insertResult = await query(`
      INSERT INTO vendors (
        name, email, phone, contact_person, commercial_terms, management_fees,
        sourcing_fee, replacement_days, delivery_lead_name, delivery_lead_email,
        delivery_lead_phone, business_head_name, business_head_email, business_head_phone,
        is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      name, email, phone, contactPerson, commercialTerms, managementFees,
      sourcingFee, replacementDays, deliveryLeadName, deliveryLeadEmail,
      deliveryLeadPhone, businessHeadName, businessHeadEmail, businessHeadPhone,
      isActive
    ]);
    
    const vendorId = (insertResult.rows as any).insertId;
    return await this.getVendor(vendorId) as any;
  }
  
  async updateVendor(id: number, vendorData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(vendorData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getVendor(id);
    }
    
    values.push(id);
    await query(`UPDATE vendors SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getVendor(id);
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

  // Hiring Requests - production-ready CRUD
  async getHiringRequests(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.cityId) {
      whereClause += ' AND city_id = ?';
      params.push(filters.cityId);
    }
    if (filters?.clusterId) {
      whereClause += ' AND cluster_id = ?';
      params.push(filters.clusterId);
    }
    if (filters?.roleId) {
      whereClause += ' AND role_id = ?';
      params.push(filters.roleId);
    }
    
    const result = await query(`
      SELECT * FROM hiring_requests 
      ${whereClause} 
      ${orderClause || 'ORDER BY created_at DESC'} 
      ${limitClause}
    `, params);
    return result.rows as any[];
  }

  async getHiringRequest(id: number): Promise<any> {
    const result = await query('SELECT * FROM hiring_requests WHERE id = ?', [id]);
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
      createdBy
    } = requestData;
    
    const insertResult = await query(`
      INSERT INTO hiring_requests (
        request_id, city_id, cluster_id, role_id, number_of_positions,
        request_date, priority, request_type, replacement_reason, status,
        notes, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      requestId, cityId, clusterId, roleId, numberOfPositions,
      priority, requestType, replacementReason, status,
      notes, createdBy
    ]);
    
    const hiringRequestId = (insertResult.rows as any).insertId;
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

  async updateHiringRequestStatus(id: number, status: 'open' | 'closed' | 'called_off', options?: StatusUpdateOptions): Promise<any> {
    return this.updateHiringRequest(id, { status }, options);
  }

  // Candidates - production-ready CRUD
  async getCandidates(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.hiringRequestId) {
      whereClause += ' AND hiring_request_id = ?';
      params.push(filters.hiringRequestId);
    }
    if (filters?.status) {
      whereClause += ' AND status = ?';
      params.push(filters.status);
    }
    
    const result = await query(`
      SELECT * FROM candidates 
      ${whereClause} 
      ${orderClause || 'ORDER BY application_date DESC'} 
      ${limitClause}
    `, params);
    return result.rows as any[];
  }

  async getCandidate(id: number): Promise<any> {
    const result = await query('SELECT * FROM candidates WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createCandidate(candidateData: any, options?: CreateOptions): Promise<any> {
    const {
      applicationId,
      name,
      email,
      phone,
      city,
      cluster,
      role,
      hiringRequestId,
      vendor,
      recruiter,
      sourcingChannel,
      qualification,
      status = 'applied',
      applicationDate = new Date()
    } = candidateData;
    
    const insertResult = await query(`
      INSERT INTO candidates (
        application_id, name, email, phone, city, cluster, role,
        hiring_request_id, vendor, recruiter, sourcing_channel,
        qualification, status, application_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      applicationId, name, email, phone, city, cluster, role,
      hiringRequestId, vendor, recruiter, sourcingChannel,
      qualification, status, applicationDate
    ]);
    
    const candidateId = (insertResult.rows as any).insertId;
    return await this.getCandidate(candidateId) as any;
  }

  async updateCandidate(id: number, candidateData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(candidateData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getCandidate(id);
    }
    
    values.push(id);
    await query(`UPDATE candidates SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getCandidate(id);
  }

  async deleteCandidate(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM candidates WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async updateCandidateStatus(id: number, status: 'applied' | 'prescreening' | 'technical' | 'selected' | 'rejected' | 'offered' | 'joined', options?: StatusUpdateOptions): Promise<any> {
    return this.updateCandidate(id, { status }, options);
  }

  // Vendor City Contacts - basic implementation
  async getVendorCityContacts(vendorId: number, filters?: FilterOptions): Promise<any[]> {
    const result = await query('SELECT * FROM vendor_city_contacts WHERE vendor_id = ?', [vendorId]);
    return result.rows as any[];
  }

  async createVendorCityContact(contactData: any, options?: CreateOptions): Promise<any> {
    const { vendorId, cityId, recruitmentSpocName, recruitmentSpocEmail, recruitmentSpocPhone } = contactData;
    
    const insertResult = await query(`
      INSERT INTO vendor_city_contacts (vendor_id, city_id, recruitment_spoc_name, recruitment_spoc_email, recruitment_spoc_phone, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [vendorId, cityId, recruitmentSpocName, recruitmentSpocEmail, recruitmentSpocPhone]);
    
    const contactId = (insertResult.rows as any).insertId;
    const result = await query('SELECT * FROM vendor_city_contacts WHERE id = ?', [contactId]);
    return result.rows[0] as any;
  }

  async updateVendorCityContact(id: number, contactData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(contactData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      const result = await query('SELECT * FROM vendor_city_contacts WHERE id = ?', [id]);
      return result.rows[0] as any || null;
    }
    
    values.push(id);
    await query(`UPDATE vendor_city_contacts SET ${fields.join(', ')} WHERE id = ?`, values);
    
    const result = await query('SELECT * FROM vendor_city_contacts WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async deleteVendorCityContact(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM vendor_city_contacts WHERE id = ?', [id]);
    return result.rowCount > 0;
  }

  async getTrainingSessions(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM training_sessions 
      WHERE 1=1 
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
    
    const sessionId = (insertResult.rows as any).insertId;
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

  async getVendorInvoices(filters?: FilterOptions): Promise<any[]> {
    const { orderClause, limitClause } = this.buildFilterClause(filters);
    const result = await query(`
      SELECT * FROM vendor_invoices 
      WHERE 1=1 
      ${orderClause || 'ORDER BY invoice_date DESC'} 
      ${limitClause}
    `);
    return result.rows as any[];
  }

  async getVendorInvoice(id: number): Promise<any> {
    const result = await query('SELECT * FROM vendor_invoices WHERE id = ?', [id]);
    return result.rows[0] as any || null;
  }

  async createVendorInvoice(invoiceData: any, options?: CreateOptions): Promise<any> {
    const { vendorId, invoiceNumber, invoiceDate, amount, status = 'pending' } = invoiceData;
    
    const insertResult = await query(`
      INSERT INTO vendor_invoices (vendor_id, invoice_number, invoice_date, amount, status, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [vendorId, invoiceNumber, invoiceDate, amount, status]);
    
    const invoiceId = (insertResult.rows as any).insertId;
    return await this.getVendorInvoice(invoiceId) as any;
  }

  async updateVendorInvoice(id: number, invoiceData: any, options?: UpdateOptions): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(invoiceData).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return await this.getVendorInvoice(id);
    }
    
    values.push(id);
    await query(`UPDATE vendor_invoices SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return await this.getVendorInvoice(id);
  }

  async deleteVendorInvoice(id: number, options?: UpdateOptions): Promise<any> {
    const result = await query('DELETE FROM vendor_invoices WHERE id = ?', [id]);
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
    const result = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM candidates)), 2) as percentage
      FROM candidates 
      GROUP BY status
      ORDER BY 
        CASE status
          WHEN 'applied' THEN 1
          WHEN 'prescreening' THEN 2
          WHEN 'technical' THEN 3
          WHEN 'selected' THEN 4
          WHEN 'offered' THEN 5
          WHEN 'joined' THEN 6
          WHEN 'rejected' THEN 7
          ELSE 8
        END
    `);
    return result.rows as any[];
  }

  async getVendorPerformance(): Promise<{
    vendorName: string;
    totalCandidates: number;
    successfulHires: number;
    rejectedCandidates: number;
    successRate: number;
  }[]> {
    const result = await query(`
      SELECT 
        v.name as vendorName,
        COUNT(c.id) as totalCandidates,
        SUM(CASE WHEN c.status = 'selected' THEN 1 ELSE 0 END) as successfulHires,
        SUM(CASE WHEN c.status = 'rejected' THEN 1 ELSE 0 END) as rejectedCandidates,
        ROUND(
          (SUM(CASE WHEN c.status = 'selected' THEN 1 ELSE 0 END) * 100.0) / 
          NULLIF(COUNT(c.id), 0), 2
        ) as successRate
      FROM vendors v
      LEFT JOIN candidates c ON c.vendor = v.name
      WHERE v.is_active = true
      GROUP BY v.id, v.name
      HAVING COUNT(c.id) > 0
      ORDER BY successRate DESC, totalCandidates DESC
    `);
    return result.rows as any[];
  }

  async getRecruiterPerformance(): Promise<{
    recruiterName: string;
    totalCandidates: number;
    successfulHires: number;
    selectedCandidates: number;
    successRate: number;
    avgTimeToHire: number;
  }[]> {
    const result = await query(`
      SELECT 
        r.name as recruiterName,
        COUNT(c.id) as totalCandidates,
        SUM(CASE WHEN c.status = 'selected' THEN 1 ELSE 0 END) as successfulHires,
        SUM(CASE WHEN c.status = 'selected' THEN 1 ELSE 0 END) as selectedCandidates,
        ROUND(
          (SUM(CASE WHEN c.status = 'selected' THEN 1 ELSE 0 END) * 100.0) / 
          NULLIF(COUNT(c.id), 0), 2
        ) as successRate,
        ROUND(AVG(DATEDIFF(c.join_date, c.application_date)), 2) as avgTimeToHire
      FROM recruiters r
      LEFT JOIN candidates c ON c.recruiter = r.name
      WHERE r.is_active = true
      GROUP BY r.id, r.name
      HAVING COUNT(c.id) > 0
      ORDER BY successRate DESC, totalCandidates DESC
    `);
    return result.rows as any[];
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
