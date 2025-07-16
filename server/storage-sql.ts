import { query, transaction } from './config/db';
import { 
  User, Vendor, City, Cluster, Role, Recruiter, HiringRequest, 
  Candidate, TrainingSession, Employee, EmployeeAction, ExitRecord,
  VendorCityContact, UserAuditTrail
} from './types/models';

export interface IStorage {
  // User management
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUserId(userId: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any, changedBy?: number): Promise<User>;
  updateUser(id: number, user: any, changedBy?: number): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  updateUserStatus(id: number, isActive: boolean, changedBy?: number): Promise<User | undefined>;
  createUserAudit(audit: any): Promise<void>;
  getUserAuditTrail(userId: number): Promise<UserAuditTrail[]>;

  // Master data - Cities
  getCities(): Promise<City[]>;
  getCity(id: number): Promise<City | undefined>;
  createCity(city: any): Promise<City>;
  updateCity(id: number, city: any): Promise<City | undefined>;
  updateCityStatus(id: number, isActive: boolean, changedBy?: number): Promise<City | undefined>;

  // Master data - Clusters
  getClusters(): Promise<Cluster[]>;
  getClustersByCity(cityId: number): Promise<Cluster[]>;
  getCluster(id: number): Promise<Cluster | undefined>;
  createCluster(cluster: any): Promise<Cluster>;
  updateCluster(id: number, cluster: any): Promise<Cluster | undefined>;
  updateClusterStatus(id: number, isActive: boolean, changedBy?: number): Promise<Cluster | undefined>;

  // Master data - Roles
  getRoles(): Promise<Role[]>;
  getRole(id: number): Promise<Role | undefined>;
  createRole(role: any): Promise<Role>;
  updateRole(id: number, role: any): Promise<Role | undefined>;
  updateRoleStatus(id: number, isActive: boolean, changedBy?: number): Promise<Role | undefined>;

  // Master data - Vendors
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: any): Promise<Vendor>;
  updateVendor(id: number, vendor: any): Promise<Vendor | undefined>;
  updateVendorStatus(id: number, isActive: boolean, changedBy?: number): Promise<Vendor | undefined>;
  
  // Vendor city contacts
  getVendorCityContacts(vendorId: number): Promise<VendorCityContact[]>;
  createVendorCityContact(contact: any): Promise<VendorCityContact>;
  updateVendorCityContact(id: number, contact: any): Promise<VendorCityContact | undefined>;
  deleteVendorCityContact(id: number): Promise<boolean>;

  // Master data - Recruiters
  getRecruiters(): Promise<Recruiter[]>;
  getRecruiter(id: number): Promise<Recruiter | undefined>;
  createRecruiter(recruiter: any): Promise<Recruiter>;
  updateRecruiter(id: number, recruiter: any): Promise<Recruiter | undefined>;
  updateRecruiterStatus(id: number, isActive: boolean, changedBy?: number): Promise<Recruiter | undefined>;

  // Hiring requests
  createHiringRequest(request: any): Promise<HiringRequest>;
  getHiringRequests(filters?: any): Promise<HiringRequest[]>;
  getHiringRequest(id: number): Promise<HiringRequest | undefined>;
  updateHiringRequest(id: number, request: any): Promise<HiringRequest | undefined>;
  
  // Candidates
  createCandidate(candidate: any): Promise<Candidate>;
  getCandidates(filters?: any): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  updateCandidate(id: number, candidate: any): Promise<Candidate | undefined>;
  
  // Training
  createTrainingSession(session: any): Promise<TrainingSession>;
  getTrainingSessions(filters?: any): Promise<TrainingSession[]>;
  getTrainingSession(id: number): Promise<TrainingSession | undefined>;
  updateTrainingSession(id: number, session: any): Promise<TrainingSession | undefined>;
  
  // Employees
  createEmployee(employee: any): Promise<Employee>;
  getEmployees(filters?: any): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  updateEmployee(id: number, employee: any): Promise<Employee | undefined>;
  
  // Employee actions
  createEmployeeAction(action: any): Promise<EmployeeAction>;
  getEmployeeActions(employeeId: number): Promise<EmployeeAction[]>;
  updateEmployeeAction(id: number, action: any): Promise<EmployeeAction | undefined>;
  
  // Exit management
  createExitRecord(exit: any): Promise<ExitRecord>;
  getExitRecords(filters?: any): Promise<ExitRecord[]>;
  
  // Analytics
  getHiringAnalytics(filters?: any): Promise<any>;
  getCandidatePipeline(): Promise<any>;
  getVendorPerformance(): Promise<any>;
  getRecruiterPerformance(): Promise<any>;
}

export class SqlStorage implements IStorage {
  // User management
  async getUsers(): Promise<User[]> {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getUserByUserId(userId: number): Promise<User | undefined> {
    const result = await query('SELECT * FROM users WHERE user_id = $1', [userId]);
    return result.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async createUser(userData: any, changedBy?: number): Promise<User> {
    const { email, name, phone, userId, password, role, managerId, cityId, clusterId } = userData;
    
    const result = await query(
      `INSERT INTO users (email, name, phone, user_id, password, role, manager_id, city_id, cluster_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [email, name, phone, userId, password, role, managerId, cityId, clusterId]
    );
    
    const user = result.rows[0];
    
    if (changedBy) {
      await this.createUserAudit({
        userId: user.id,
        action: 'CREATE',
        changedBy,
        oldValues: null,
        newValues: user,
      });
    }
    
    return user;
  }

  async updateUser(id: number, updateData: any, changedBy?: number): Promise<User | undefined> {
    const oldUser = changedBy ? await this.getUser(id) : null;
    
    const fields = [];
    const values = [];
    let paramCounter = 1;
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (key !== 'id') {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );
    
    const updatedUser = result.rows[0];
    
    if (updatedUser && changedBy && oldUser) {
      await this.createUserAudit({
        userId: updatedUser.id,
        action: 'UPDATE',
        changedBy,
        oldValues: oldUser,
        newValues: updatedUser,
      });
    }
    
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async updateUserStatus(id: number, isActive: boolean, changedBy?: number): Promise<User | undefined> {
    return this.updateUser(id, { is_active: isActive }, changedBy);
  }

  async createUserAudit(audit: any): Promise<void> {
    await query(
      `INSERT INTO user_audit_trail (user_id, changed_by, change_type, table_name, record_id, old_values, new_values)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        audit.userId,
        audit.changedBy,
        audit.action || audit.changeType,
        'users',
        audit.userId,
        JSON.stringify(audit.oldValues),
        JSON.stringify(audit.newValues)
      ]
    );
  }

  async getUserAuditTrail(userId: number): Promise<UserAuditTrail[]> {
    const result = await query(
      'SELECT * FROM user_audit_trail WHERE user_id = $1 ORDER BY timestamp DESC',
      [userId]
    );
    return result.rows;
  }

  // Master data - Cities
  async getCities(): Promise<City[]> {
    const result = await query('SELECT * FROM cities ORDER BY name');
    return result.rows;
  }

  async getCity(id: number): Promise<City | undefined> {
    const result = await query('SELECT * FROM cities WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createCity(city: any): Promise<City> {
    const result = await query(
      'INSERT INTO cities (name, code) VALUES ($1, $2) RETURNING *',
      [city.name, city.code]
    );
    return result.rows[0];
  }

  async updateCity(id: number, city: any): Promise<City | undefined> {
    const result = await query(
      'UPDATE cities SET name = $1, code = $2 WHERE id = $3 RETURNING *',
      [city.name, city.code, id]
    );
    return result.rows[0];
  }

  async updateCityStatus(id: number, isActive: boolean, changedBy?: number): Promise<City | undefined> {
    const result = await query(
      'UPDATE cities SET is_active = $1 WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    
    if (result.rows[0] && changedBy) {
      await this.createUserAudit({
        userId: changedBy,
        changedBy,
        changeType: 'STATUS_CHANGE',
        tableName: 'cities',
        recordId: id,
        oldValues: { is_active: !isActive },
        newValues: { is_active: isActive }
      });
    }
    
    return result.rows[0];
  }

  // Master data - Clusters
  async getClusters(): Promise<Cluster[]> {
    const result = await query('SELECT * FROM clusters ORDER BY name');
    return result.rows;
  }

  async getClustersByCity(cityId: number): Promise<Cluster[]> {
    const result = await query(
      'SELECT * FROM clusters WHERE city_id = $1 ORDER BY name',
      [cityId]
    );
    return result.rows;
  }

  async getCluster(id: number): Promise<Cluster | undefined> {
    const result = await query('SELECT * FROM clusters WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createCluster(cluster: any): Promise<Cluster> {
    const result = await query(
      'INSERT INTO clusters (name, code, city_id) VALUES ($1, $2, $3) RETURNING *',
      [cluster.name, cluster.code, cluster.cityId]
    );
    return result.rows[0];
  }

  async updateCluster(id: number, cluster: any): Promise<Cluster | undefined> {
    const result = await query(
      'UPDATE clusters SET name = $1, code = $2, city_id = $3 WHERE id = $4 RETURNING *',
      [cluster.name, cluster.code, cluster.cityId, id]
    );
    return result.rows[0];
  }

  async updateClusterStatus(id: number, isActive: boolean, changedBy?: number): Promise<Cluster | undefined> {
    const result = await query(
      'UPDATE clusters SET is_active = $1 WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    
    if (result.rows[0] && changedBy) {
      await this.createUserAudit({
        userId: changedBy,
        changedBy,
        changeType: 'STATUS_CHANGE',
        tableName: 'clusters',
        recordId: id,
        oldValues: { is_active: !isActive },
        newValues: { is_active: isActive }
      });
    }
    
    return result.rows[0];
  }

  // Master data - Roles
  async getRoles(): Promise<Role[]> {
    const result = await query('SELECT * FROM roles ORDER BY name');
    return result.rows;
  }

  async getRole(id: number): Promise<Role | undefined> {
    const result = await query('SELECT * FROM roles WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createRole(role: any): Promise<Role> {
    const result = await query(
      'INSERT INTO roles (name, code, description, job_description_file) VALUES ($1, $2, $3, $4) RETURNING *',
      [role.name, role.code, role.description, role.jobDescriptionFile]
    );
    return result.rows[0];
  }

  async updateRole(id: number, role: any): Promise<Role | undefined> {
    const result = await query(
      'UPDATE roles SET name = $1, code = $2, description = $3, job_description_file = $4 WHERE id = $5 RETURNING *',
      [role.name, role.code, role.description, role.jobDescriptionFile, id]
    );
    return result.rows[0];
  }

  async updateRoleStatus(id: number, isActive: boolean, changedBy?: number): Promise<Role | undefined> {
    const result = await query(
      'UPDATE roles SET is_active = $1 WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    
    if (result.rows[0] && changedBy) {
      await this.createUserAudit({
        userId: changedBy,
        changedBy,
        changeType: 'STATUS_CHANGE',
        tableName: 'roles',
        recordId: id,
        oldValues: { is_active: !isActive },
        newValues: { is_active: isActive }
      });
    }
    
    return result.rows[0];
  }

  // Master data - Vendors
  async getVendors(): Promise<Vendor[]> {
    const result = await query(`
      SELECT v.*, 
        COUNT(DISTINCT vcc.id) as contact_count
      FROM vendors v
      LEFT JOIN vendor_city_contacts vcc ON v.id = vcc.vendor_id
      GROUP BY v.id
      ORDER BY v.name
    `);
    return result.rows;
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const result = await query('SELECT * FROM vendors WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createVendor(vendor: any): Promise<Vendor> {
    const result = await query(
      `INSERT INTO vendors (
        name, email, phone, contact_person, commercial_terms, management_fees,
        sourcing_fee, replacement_days, delivery_lead_name, delivery_lead_email,
        delivery_lead_phone, business_head_name, business_head_email, business_head_phone,
        payroll_spoc_name, payroll_spoc_email, payroll_spoc_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        vendor.name, vendor.email, vendor.phone, vendor.contactPerson,
        vendor.commercialTerms, vendor.managementFees, vendor.sourcingFee,
        vendor.replacementDays, vendor.deliveryLeadName, vendor.deliveryLeadEmail,
        vendor.deliveryLeadPhone, vendor.businessHeadName, vendor.businessHeadEmail,
        vendor.businessHeadPhone, vendor.payrollSpocName, vendor.payrollSpocEmail,
        vendor.payrollSpocPhone
      ]
    );
    return result.rows[0];
  }

  async updateVendor(id: number, vendor: any): Promise<Vendor | undefined> {
    const result = await query(
      `UPDATE vendors SET 
        name = $1, email = $2, phone = $3, contact_person = $4,
        commercial_terms = $5, management_fees = $6, sourcing_fee = $7,
        replacement_days = $8, delivery_lead_name = $9, delivery_lead_email = $10,
        delivery_lead_phone = $11, business_head_name = $12, business_head_email = $13,
        business_head_phone = $14, payroll_spoc_name = $15, payroll_spoc_email = $16,
        payroll_spoc_phone = $17
      WHERE id = $18 RETURNING *`,
      [
        vendor.name, vendor.email, vendor.phone, vendor.contactPerson,
        vendor.commercialTerms, vendor.managementFees, vendor.sourcingFee,
        vendor.replacementDays, vendor.deliveryLeadName, vendor.deliveryLeadEmail,
        vendor.deliveryLeadPhone, vendor.businessHeadName, vendor.businessHeadEmail,
        vendor.businessHeadPhone, vendor.payrollSpocName, vendor.payrollSpocEmail,
        vendor.payrollSpocPhone, id
      ]
    );
    return result.rows[0];
  }

  async updateVendorStatus(id: number, isActive: boolean, changedBy?: number): Promise<Vendor | undefined> {
    const result = await query(
      'UPDATE vendors SET is_active = $1 WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    
    if (result.rows[0] && changedBy) {
      await this.createUserAudit({
        userId: changedBy,
        changedBy,
        changeType: 'STATUS_CHANGE',
        tableName: 'vendors',
        recordId: id,
        oldValues: { is_active: !isActive },
        newValues: { is_active: isActive }
      });
    }
    
    return result.rows[0];
  }

  // Vendor city contacts
  async getVendorCityContacts(vendorId: number): Promise<VendorCityContact[]> {
    const result = await query(
      `SELECT vcc.*, c.name as city_name 
       FROM vendor_city_contacts vcc
       JOIN cities c ON vcc.city_id = c.id
       WHERE vcc.vendor_id = $1
       ORDER BY c.name`,
      [vendorId]
    );
    return result.rows;
  }

  async createVendorCityContact(contact: any): Promise<VendorCityContact> {
    const result = await query(
      `INSERT INTO vendor_city_contacts (
        vendor_id, city_id, recruitment_spoc_name, recruitment_spoc_email, recruitment_spoc_phone
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        contact.vendorId, contact.cityId, contact.recruitmentSpocName,
        contact.recruitmentSpocEmail, contact.recruitmentSpocPhone
      ]
    );
    return result.rows[0];
  }

  async updateVendorCityContact(id: number, contact: any): Promise<VendorCityContact | undefined> {
    const result = await query(
      `UPDATE vendor_city_contacts SET 
        recruitment_spoc_name = $1, recruitment_spoc_email = $2, recruitment_spoc_phone = $3
      WHERE id = $4 RETURNING *`,
      [contact.recruitmentSpocName, contact.recruitmentSpocEmail, contact.recruitmentSpocPhone, id]
    );
    return result.rows[0];
  }

  async deleteVendorCityContact(id: number): Promise<boolean> {
    const result = await query('DELETE FROM vendor_city_contacts WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // Master data - Recruiters
  async getRecruiters(): Promise<Recruiter[]> {
    const result = await query(`
      SELECT r.*, c.name as city_name
      FROM recruiters r
      LEFT JOIN cities c ON r.city_id = c.id
      ORDER BY r.name
    `);
    return result.rows;
  }

  async getRecruiter(id: number): Promise<Recruiter | undefined> {
    const result = await query('SELECT * FROM recruiters WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createRecruiter(recruiter: any): Promise<Recruiter> {
    const result = await query(
      `INSERT INTO recruiters (name, email, phone, city_id, management_fee)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [recruiter.name, recruiter.email, recruiter.phone, recruiter.cityId, recruiter.managementFee]
    );
    return result.rows[0];
  }

  async updateRecruiter(id: number, recruiter: any): Promise<Recruiter | undefined> {
    const result = await query(
      `UPDATE recruiters SET name = $1, email = $2, phone = $3, city_id = $4, management_fee = $5
       WHERE id = $6 RETURNING *`,
      [recruiter.name, recruiter.email, recruiter.phone, recruiter.cityId, recruiter.managementFee, id]
    );
    return result.rows[0];
  }

  async updateRecruiterStatus(id: number, isActive: boolean, changedBy?: number): Promise<Recruiter | undefined> {
    const result = await query(
      'UPDATE recruiters SET is_active = $1 WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    
    if (result.rows[0] && changedBy) {
      await this.createUserAudit({
        userId: changedBy,
        changedBy,
        changeType: 'STATUS_CHANGE',
        tableName: 'recruiters',
        recordId: id,
        oldValues: { is_active: !isActive },
        newValues: { is_active: isActive }
      });
    }
    
    return result.rows[0];
  }

  // Hiring requests
  async createHiringRequest(request: any): Promise<HiringRequest> {
    const requestId = `HR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await query(
      `INSERT INTO hiring_requests (
        request_id, city_id, cluster_id, role_id, number_of_positions,
        priority, request_type, replacement_reason, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        requestId, request.cityId, request.clusterId, request.roleId,
        request.numberOfPositions, request.priority, request.requestType,
        request.replacementReason, request.notes, request.createdBy
      ]
    );
    return result.rows[0];
  }

  async getHiringRequests(filters?: any): Promise<HiringRequest[]> {
    let queryText = `
      SELECT hr.*, 
        c.name as city_name, cl.name as cluster_name, r.name as role_name,
        u.name as created_by_name
      FROM hiring_requests hr
      JOIN cities c ON hr.city_id = c.id
      JOIN clusters cl ON hr.cluster_id = cl.id
      JOIN roles r ON hr.role_id = r.id
      JOIN users u ON hr.created_by = u.id
    `;
    
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    if (filters?.cityId) {
      conditions.push(`hr.city_id = $${paramIndex++}`);
      values.push(filters.cityId);
    }
    
    if (filters?.status) {
      conditions.push(`hr.status = $${paramIndex++}`);
      values.push(filters.status);
    }
    
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryText += ' ORDER BY hr.created_at DESC';
    
    const result = await query(queryText, values);
    return result.rows;
  }

  async getHiringRequest(id: number): Promise<HiringRequest | undefined> {
    const result = await query('SELECT * FROM hiring_requests WHERE id = $1', [id]);
    return result.rows[0];
  }

  async updateHiringRequest(id: number, request: any): Promise<HiringRequest | undefined> {
    const fields = [];
    const values = [];
    let paramCounter = 1;
    
    Object.entries(request).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await query(
      `UPDATE hiring_requests SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  // Candidates
  async createCandidate(candidate: any): Promise<Candidate> {
    const result = await query(
      `INSERT INTO candidates (
        hiring_request_id, name, email, phone, city_id, cluster_id, role_id,
        vendor_id, recruiter_id, sourcing_channel
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        candidate.hiringRequestId, candidate.name, candidate.email, candidate.phone,
        candidate.cityId, candidate.clusterId, candidate.roleId,
        candidate.vendorId, candidate.recruiterId, candidate.sourcingChannel
      ]
    );
    return result.rows[0];
  }

  async getCandidates(filters?: any): Promise<Candidate[]> {
    let queryText = `
      SELECT c.*, 
        hr.request_id as hiring_request_id,
        ct.name as city_name, cl.name as cluster_name, r.name as role_name,
        v.name as vendor_name, rc.name as recruiter_name
      FROM candidates c
      JOIN hiring_requests hr ON c.hiring_request_id = hr.id
      JOIN cities ct ON c.city_id = ct.id
      JOIN clusters cl ON c.cluster_id = cl.id
      JOIN roles r ON c.role_id = r.id
      LEFT JOIN vendors v ON c.vendor_id = v.id
      LEFT JOIN recruiters rc ON c.recruiter_id = rc.id
    `;
    
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    if (filters?.hiringRequestId) {
      conditions.push(`c.hiring_request_id = $${paramIndex++}`);
      values.push(filters.hiringRequestId);
    }
    
    if (filters?.status) {
      conditions.push(`c.status = $${paramIndex++}`);
      values.push(filters.status);
    }
    
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryText += ' ORDER BY c.created_at DESC';
    
    const result = await query(queryText, values);
    return result.rows;
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    const result = await query('SELECT * FROM candidates WHERE id = $1', [id]);
    return result.rows[0];
  }

  async updateCandidate(id: number, candidate: any): Promise<Candidate | undefined> {
    const fields = [];
    const values = [];
    let paramCounter = 1;
    
    Object.entries(candidate).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await query(
      `UPDATE candidates SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  // Training
  async createTrainingSession(session: any): Promise<TrainingSession> {
    const result = await query(
      `INSERT INTO training_sessions (
        training_type, candidate_id, trainer_id, status, start_date, end_date,
        duration, fit_status, comments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        session.trainingType, session.candidateId, session.trainerId,
        session.status, session.startDate, session.endDate,
        session.duration, session.fitStatus, session.comments
      ]
    );
    return result.rows[0];
  }

  async getTrainingSessions(filters?: any): Promise<TrainingSession[]> {
    let queryText = `
      SELECT ts.*, 
        c.name as candidate_name, u.name as trainer_name
      FROM training_sessions ts
      JOIN candidates c ON ts.candidate_id = c.id
      JOIN users u ON ts.trainer_id = u.id
    `;
    
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    if (filters?.trainingType) {
      conditions.push(`ts.training_type = $${paramIndex++}`);
      values.push(filters.trainingType);
    }
    
    if (filters?.status) {
      conditions.push(`ts.status = $${paramIndex++}`);
      values.push(filters.status);
    }
    
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryText += ' ORDER BY ts.created_at DESC';
    
    const result = await query(queryText, values);
    return result.rows;
  }

  async getTrainingSession(id: number): Promise<TrainingSession | undefined> {
    const result = await query('SELECT * FROM training_sessions WHERE id = $1', [id]);
    return result.rows[0];
  }

  async updateTrainingSession(id: number, session: any): Promise<TrainingSession | undefined> {
    const fields = [];
    const values = [];
    let paramCounter = 1;
    
    Object.entries(session).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await query(
      `UPDATE training_sessions SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  // Employees
  async createEmployee(employee: any): Promise<Employee> {
    const employeeId = `EMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await query(
      `INSERT INTO employees (
        candidate_id, employee_id, personal_details, contact_details,
        employment_details, govt_ids, bank_details, documents, join_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        employee.candidateId, employeeId,
        JSON.stringify(employee.personalDetails),
        JSON.stringify(employee.contactDetails),
        JSON.stringify(employee.employmentDetails),
        JSON.stringify(employee.govtIds),
        JSON.stringify(employee.bankDetails),
        JSON.stringify(employee.documents),
        employee.joinDate
      ]
    );
    return result.rows[0];
  }

  async getEmployees(filters?: any): Promise<Employee[]> {
    let queryText = `
      SELECT e.*, c.name as candidate_name
      FROM employees e
      LEFT JOIN candidates c ON e.candidate_id = c.id
    `;
    
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    if (filters?.status) {
      conditions.push(`e.status = $${paramIndex++}`);
      values.push(filters.status);
    }
    
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryText += ' ORDER BY e.created_at DESC';
    
    const result = await query(queryText, values);
    return result.rows;
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const result = await query('SELECT * FROM employees WHERE id = $1', [id]);
    return result.rows[0];
  }

  async updateEmployee(id: number, employee: any): Promise<Employee | undefined> {
    const fields = [];
    const values = [];
    let paramCounter = 1;
    
    Object.entries(employee).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          fields.push(`${key} = $${paramCounter}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramCounter}`);
          values.push(value);
        }
        paramCounter++;
      }
    });
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await query(
      `UPDATE employees SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  // Employee actions
  async createEmployeeAction(action: any): Promise<EmployeeAction> {
    const result = await query(
      `INSERT INTO employee_actions (
        employee_id, action_type, description, requested_by, approved_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        action.employeeId, action.actionType, action.description,
        action.requestedBy, action.approvedBy, action.status
      ]
    );
    return result.rows[0];
  }

  async getEmployeeActions(employeeId: number): Promise<EmployeeAction[]> {
    const result = await query(
      `SELECT ea.*, 
        u1.name as requested_by_name, u2.name as approved_by_name
      FROM employee_actions ea
      JOIN users u1 ON ea.requested_by = u1.id
      LEFT JOIN users u2 ON ea.approved_by = u2.id
      WHERE ea.employee_id = $1
      ORDER BY ea.created_at DESC`,
      [employeeId]
    );
    return result.rows;
  }

  async updateEmployeeAction(id: number, action: any): Promise<EmployeeAction | undefined> {
    const fields = [];
    const values = [];
    let paramCounter = 1;
    
    Object.entries(action).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    });
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await query(
      `UPDATE employee_actions SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      values
    );
    
    return result.rows[0];
  }

  // Exit management
  async createExitRecord(exit: any): Promise<ExitRecord> {
    const result = await query(
      `INSERT INTO exit_records (
        employee_id, exit_type, exit_date, reason, exit_interview,
        final_settlement, handover_completed, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        exit.employeeId, exit.exitType, exit.exitDate, exit.reason,
        JSON.stringify(exit.exitInterview), JSON.stringify(exit.finalSettlement),
        exit.handoverCompleted, exit.createdBy
      ]
    );
    return result.rows[0];
  }

  async getExitRecords(filters?: any): Promise<ExitRecord[]> {
    let queryText = `
      SELECT er.*, e.employee_id, u.name as created_by_name
      FROM exit_records er
      JOIN employees e ON er.employee_id = e.id
      JOIN users u ON er.created_by = u.id
    `;
    
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    if (filters?.exitType) {
      conditions.push(`er.exit_type = $${paramIndex++}`);
      values.push(filters.exitType);
    }
    
    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }
    
    queryText += ' ORDER BY er.created_at DESC';
    
    const result = await query(queryText, values);
    return result.rows;
  }

  // Analytics
  async getHiringAnalytics(filters?: any): Promise<any> {
    const result = await query(`
      SELECT 
        COUNT(DISTINCT hr.id) as total_requests,
        SUM(hr.number_of_positions) as total_positions,
        SUM(CASE WHEN hr.status = 'open' THEN hr.number_of_positions ELSE 0 END) as open_positions,
        SUM(CASE WHEN hr.status = 'closed' THEN hr.number_of_positions ELSE 0 END) as closed_positions,
        COUNT(DISTINCT CASE WHEN hr.status = 'open' THEN hr.id END) as open_requests,
        COUNT(DISTINCT CASE WHEN hr.status = 'closed' THEN hr.id END) as closed_requests
      FROM hiring_requests hr
    `);
    
    const byCity = await query(`
      SELECT 
        c.name as city_name,
        COUNT(DISTINCT hr.id) as total_requests,
        SUM(CASE WHEN hr.status = 'open' THEN hr.number_of_positions ELSE 0 END) as open_positions
      FROM hiring_requests hr
      JOIN cities c ON hr.city_id = c.id
      GROUP BY c.id, c.name
      ORDER BY c.name
    `);
    
    return {
      ...result.rows[0],
      byCity: byCity.rows.reduce((acc, row) => {
        acc[row.city_name] = {
          openPositions: parseInt(row.open_positions),
          totalRequests: parseInt(row.total_requests)
        };
        return acc;
      }, {})
    };
  }

  async getCandidatePipeline(): Promise<any> {
    const result = await query(`
      SELECT 
        COUNT(CASE WHEN status = 'applied' THEN 1 END) as applications,
        COUNT(CASE WHEN status = 'prescreening' THEN 1 END) as prescreening,
        COUNT(CASE WHEN status = 'technical' THEN 1 END) as technical,
        COUNT(CASE WHEN status = 'selected' THEN 1 END) as selected,
        COUNT(CASE WHEN status = 'offered' THEN 1 END) as offered,
        COUNT(CASE WHEN status = 'joined' THEN 1 END) as joined,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM candidates
    `);
    
    return result.rows[0];
  }

  async getVendorPerformance(): Promise<any> {
    const result = await query(`
      SELECT 
        v.id as vendor_id,
        v.name as vendor_name,
        COUNT(DISTINCT c.id) as total_candidates,
        COUNT(DISTINCT CASE WHEN c.status = 'joined' THEN c.id END) as joined_candidates,
        ROUND(
          COUNT(DISTINCT CASE WHEN c.status = 'joined' THEN c.id END)::numeric * 100 / 
          NULLIF(COUNT(DISTINCT c.id), 0), 2
        ) as conversion_rate,
        AVG(
          CASE WHEN c.status = 'joined' AND c.join_date IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (c.join_date - c.application_date)) / 86400
          END
        )::integer as avg_time_to_join
      FROM vendors v
      LEFT JOIN candidates c ON v.id = c.vendor_id
      GROUP BY v.id, v.name
      ORDER BY joined_candidates DESC
    `);
    
    return result.rows;
  }

  async getRecruiterPerformance(): Promise<any> {
    const result = await query(`
      SELECT 
        r.id as recruiter_id,
        r.name as recruiter_name,
        COUNT(DISTINCT c.id) as total_candidates,
        COUNT(DISTINCT CASE WHEN c.status = 'joined' THEN c.id END) as joined_candidates,
        ROUND(
          COUNT(DISTINCT CASE WHEN c.status = 'joined' THEN c.id END)::numeric * 100 / 
          NULLIF(COUNT(DISTINCT c.id), 0), 2
        ) as conversion_rate,
        COALESCE(SUM(ri.incentive_amount), 0) as incentives_earned
      FROM recruiters r
      LEFT JOIN candidates c ON r.id = c.recruiter_id
      LEFT JOIN recruiter_incentives ri ON r.id = ri.recruiter_id AND c.id = ri.candidate_id
      GROUP BY r.id, r.name
      ORDER BY joined_candidates DESC
    `);
    
    return result.rows;
  }
}

export const storage = new SqlStorage();