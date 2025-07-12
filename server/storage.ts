import { 
  users, userAuditTrail, cities, clusters, roles, vendors, recruiters, hiringRequests, candidates, 
  trainingSessions, employees, employeeActions, exitRecords, vendorInvoices, recruiterIncentives,
  type User, type UserAuditTrail, type City, type Cluster, type Role, type Vendor, type Recruiter, 
  type HiringRequest, type Candidate, type TrainingSession, type Employee, 
  type EmployeeAction, type ExitRecord,
  type InsertUser, type InsertUserAuditTrail, type InsertCity, type InsertCluster, type InsertRole, 
  type InsertVendor, type InsertRecruiter, type InsertHiringRequest, 
  type InsertCandidate, type InsertTrainingSession, type InsertEmployee,
  type InsertEmployeeAction, type InsertExitRecord
} from "@shared/schema";
import { db } from "./config/database";
import { eq, and, desc, asc, like, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUserId(userId: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser, changedBy?: number): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>, changedBy?: number): Promise<User | undefined>;
  
  // Audit trail
  createUserAudit(audit: InsertUserAuditTrail): Promise<UserAuditTrail>;
  getUserAuditTrail(userId: number): Promise<UserAuditTrail[]>;
  
  // Master data
  getCities(): Promise<City[]>;
  getClustersByCity(cityId: number): Promise<Cluster[]>;
  getClusters(): Promise<Cluster[]>;
  getRoles(): Promise<Role[]>;
  getVendors(): Promise<Vendor[]>;
  getRecruiters(): Promise<Recruiter[]>;
  createCity(city: InsertCity): Promise<City>;
  createCluster(cluster: InsertCluster): Promise<Cluster>;
  createRole(role: InsertRole): Promise<Role>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  createRecruiter(recruiter: InsertRecruiter): Promise<Recruiter>;
  deleteCity(id: number): Promise<void>;
  deleteCluster(id: number): Promise<void>;
  deleteRole(id: number): Promise<void>;
  deleteVendor(id: number): Promise<void>;
  deleteRecruiter(id: number): Promise<void>;
  
  // Hiring requests
  createHiringRequest(request: InsertHiringRequest): Promise<HiringRequest>;
  getHiringRequests(filters?: any): Promise<HiringRequest[]>;
  getHiringRequest(id: number): Promise<HiringRequest | undefined>;
  updateHiringRequestStatus(id: number, status: string): Promise<HiringRequest | undefined>;
  
  // Candidates
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  getCandidates(filters?: any): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  
  // Training
  createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession>;
  getTrainingSessions(filters?: any): Promise<TrainingSession[]>;
  updateTrainingSession(id: number, session: Partial<InsertTrainingSession>): Promise<TrainingSession | undefined>;
  
  // Employees
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  getEmployees(filters?: any): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  
  // Employee actions
  createEmployeeAction(action: InsertEmployeeAction): Promise<EmployeeAction>;
  getEmployeeActions(employeeId: number): Promise<EmployeeAction[]>;
  updateEmployeeAction(id: number, action: Partial<InsertEmployeeAction>): Promise<EmployeeAction | undefined>;
  
  // Exit management
  createExitRecord(exit: InsertExitRecord): Promise<ExitRecord>;
  getExitRecords(filters?: any): Promise<ExitRecord[]>;
  
  // Analytics
  getHiringAnalytics(filters?: any): Promise<any>;
  getCandidatePipeline(): Promise<any>;
  getVendorPerformance(): Promise<any>;
  getRecruiterPerformance(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUserId(userId: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.userId, userId));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser, changedBy?: number): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    
    // Create audit trail
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

  async updateUser(id: number, updateData: Partial<InsertUser>, changedBy?: number): Promise<User | undefined> {
    // Get old values for audit trail
    const oldUser = changedBy ? await this.getUser(id) : null;
    
    const [updatedUser] = await db.update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    // Create audit trail
    if (updatedUser && changedBy && oldUser) {
      await this.createUserAudit({
        userId: updatedUser.id,
        action: 'UPDATE',
        changedBy,
        oldValues: oldUser,
        newValues: updatedUser,
      });
    }
    
    return updatedUser || undefined;
  }

  // Audit trail
  async createUserAudit(audit: InsertUserAuditTrail): Promise<UserAuditTrail> {
    const [auditRecord] = await db.insert(userAuditTrail).values(audit).returning();
    return auditRecord;
  }

  async getUserAuditTrail(userId: number): Promise<UserAuditTrail[]> {
    return await db.select().from(userAuditTrail)
      .where(eq(userAuditTrail.userId, userId))
      .orderBy(desc(userAuditTrail.timestamp));
  }

  // Master data
  async getCities(): Promise<City[]> {
    return await db.select().from(cities).where(eq(cities.isActive, true)).orderBy(asc(cities.name));
  }

  async getClustersByCity(cityId: number): Promise<Cluster[]> {
    return await db.select().from(clusters)
      .where(and(eq(clusters.cityId, cityId), eq(clusters.isActive, true)))
      .orderBy(asc(clusters.name));
  }

  async getClusters(): Promise<Cluster[]> {
    return await db.select().from(clusters).where(eq(clusters.isActive, true)).orderBy(asc(clusters.name));
  }

  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles).where(eq(roles.isActive, true)).orderBy(asc(roles.name));
  }

  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.isActive, true)).orderBy(asc(vendors.name));
  }

  async getRecruiters(): Promise<Recruiter[]> {
    return await db.select().from(recruiters).where(eq(recruiters.isActive, true)).orderBy(asc(recruiters.name));
  }

  async createCity(city: InsertCity): Promise<City> {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }

  async createCluster(cluster: InsertCluster): Promise<Cluster> {
    const [newCluster] = await db.insert(clusters).values(cluster).returning();
    return newCluster;
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db.insert(roles).values(role).returning();
    return newRole;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async createRecruiter(recruiter: InsertRecruiter): Promise<Recruiter> {
    const [newRecruiter] = await db.insert(recruiters).values(recruiter).returning();
    return newRecruiter;
  }

  async deleteCity(id: number): Promise<void> {
    await db.update(cities).set({ isActive: false }).where(eq(cities.id, id));
  }

  async deleteCluster(id: number): Promise<void> {
    await db.update(clusters).set({ isActive: false }).where(eq(clusters.id, id));
  }

  async deleteRole(id: number): Promise<void> {
    await db.update(roles).set({ isActive: false }).where(eq(roles.id, id));
  }

  async deleteVendor(id: number): Promise<void> {
    await db.update(vendors).set({ isActive: false }).where(eq(vendors.id, id));
  }

  async deleteRecruiter(id: number): Promise<void> {
    await db.update(recruiters).set({ isActive: false }).where(eq(recruiters.id, id));
  }

  // Hiring requests
  async createHiringRequest(request: InsertHiringRequest): Promise<HiringRequest> {
    const [newRequest] = await db.insert(hiringRequests).values(request).returning();
    return newRequest;
  }

  async getHiringRequests(filters?: any): Promise<HiringRequest[]> {
    if (filters) {
      const conditions = [];
      if (filters.cityId) conditions.push(eq(hiringRequests.cityId, filters.cityId));
      if (filters.clusterId) conditions.push(eq(hiringRequests.clusterId, filters.clusterId));
      if (filters.roleId) conditions.push(eq(hiringRequests.roleId, filters.roleId));
      if (filters.status) conditions.push(eq(hiringRequests.status, filters.status));
      if (filters.priority) conditions.push(eq(hiringRequests.priority, filters.priority));
      
      if (conditions.length > 0) {
        return await db.select().from(hiringRequests)
          .where(and(...conditions))
          .orderBy(desc(hiringRequests.createdAt));
      }
    }
    
    return await db.select().from(hiringRequests).orderBy(desc(hiringRequests.createdAt));
  }

  async getHiringRequest(id: number): Promise<HiringRequest | undefined> {
    const [request] = await db.select().from(hiringRequests).where(eq(hiringRequests.id, id));
    return request || undefined;
  }

  async updateHiringRequestStatus(id: number, status: string): Promise<HiringRequest | undefined> {
    const [updatedRequest] = await db.update(hiringRequests)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(hiringRequests.id, id))
      .returning();
    return updatedRequest || undefined;
  }

  // Candidates
  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [newCandidate] = await db.insert(candidates).values(candidate).returning();
    return newCandidate;
  }

  async getCandidates(filters?: any): Promise<Candidate[]> {
    if (filters) {
      const conditions = [];
      if (filters.status) conditions.push(eq(candidates.status, filters.status));
      if (filters.roleId) conditions.push(eq(candidates.roleId, filters.roleId));
      if (filters.cityId) conditions.push(eq(candidates.cityId, filters.cityId));
      if (filters.clusterId) conditions.push(eq(candidates.clusterId, filters.clusterId));
      
      if (conditions.length > 0) {
        return await db.select().from(candidates)
          .where(and(...conditions))
          .orderBy(desc(candidates.createdAt));
      }
    }
    
    return await db.select().from(candidates).orderBy(desc(candidates.createdAt));
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate || undefined;
  }

  async updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [updatedCandidate] = await db.update(candidates)
      .set({ ...candidate, updatedAt: new Date() })
      .where(eq(candidates.id, id))
      .returning();
    return updatedCandidate || undefined;
  }

  // Training
  async createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession> {
    const [newSession] = await db.insert(trainingSessions).values(session).returning();
    return newSession;
  }

  async getTrainingSessions(filters?: any): Promise<TrainingSession[]> {
    if (filters) {
      const conditions = [];
      if (filters.candidateId) conditions.push(eq(trainingSessions.candidateId, filters.candidateId));
      if (filters.trainingType) conditions.push(eq(trainingSessions.trainingType, filters.trainingType));
      if (filters.status) conditions.push(eq(trainingSessions.status, filters.status));
      
      if (conditions.length > 0) {
        return await db.select().from(trainingSessions)
          .where(and(...conditions))
          .orderBy(desc(trainingSessions.createdAt));
      }
    }
    
    return await db.select().from(trainingSessions).orderBy(desc(trainingSessions.createdAt));
  }

  async updateTrainingSession(id: number, session: Partial<InsertTrainingSession>): Promise<TrainingSession | undefined> {
    const [updatedSession] = await db.update(trainingSessions)
      .set({ ...session, updatedAt: new Date() })
      .where(eq(trainingSessions.id, id))
      .returning();
    return updatedSession || undefined;
  }

  // Employees
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async getEmployees(filters?: any): Promise<Employee[]> {
    if (filters) {
      const conditions = [];
      if (filters.status) conditions.push(eq(employees.status, filters.status));
      
      if (conditions.length > 0) {
        return await db.select().from(employees)
          .where(and(...conditions))
          .orderBy(desc(employees.createdAt));
      }
    }
    
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updatedEmployee] = await db.update(employees)
      .set({ ...employee, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee || undefined;
  }

  // Employee actions
  async createEmployeeAction(action: InsertEmployeeAction): Promise<EmployeeAction> {
    const [newAction] = await db.insert(employeeActions).values(action).returning();
    return newAction;
  }

  async getEmployeeActions(employeeId: number): Promise<EmployeeAction[]> {
    return await db.select().from(employeeActions)
      .where(eq(employeeActions.employeeId, employeeId))
      .orderBy(desc(employeeActions.createdAt));
  }

  async updateEmployeeAction(id: number, action: Partial<InsertEmployeeAction>): Promise<EmployeeAction | undefined> {
    const [updatedAction] = await db.update(employeeActions)
      .set({ ...action, updatedAt: new Date() })
      .where(eq(employeeActions.id, id))
      .returning();
    return updatedAction || undefined;
  }

  // Exit management
  async createExitRecord(exit: InsertExitRecord): Promise<ExitRecord> {
    const [newExit] = await db.insert(exitRecords).values(exit).returning();
    return newExit;
  }

  async getExitRecords(filters?: any): Promise<ExitRecord[]> {
    if (filters) {
      const conditions = [];
      if (filters.exitType) conditions.push(eq(exitRecords.exitType, filters.exitType));
      if (filters.startDate) conditions.push(gte(exitRecords.exitDate, filters.startDate));
      if (filters.endDate) conditions.push(lte(exitRecords.exitDate, filters.endDate));
      
      if (conditions.length > 0) {
        return await db.select().from(exitRecords)
          .where(and(...conditions))
          .orderBy(desc(exitRecords.createdAt));
      }
    }
    
    return await db.select().from(exitRecords).orderBy(desc(exitRecords.createdAt));
  }

  // Analytics
  async getHiringAnalytics(filters?: any): Promise<any> {
    const openPositions = await db.select({ count: count() })
      .from(hiringRequests)
      .where(eq(hiringRequests.status, 'open'));
    
    const closedPositions = await db.select({ count: count() })
      .from(hiringRequests)
      .where(eq(hiringRequests.status, 'closed'));
    
    return {
      openPositions: openPositions[0]?.count || 0,
      closedPositions: closedPositions[0]?.count || 0,
    };
  }

  async getCandidatePipeline(): Promise<any> {
    const applied = await db.select({ count: count() })
      .from(candidates)
      .where(eq(candidates.status, 'applied'));
    
    const prescreening = await db.select({ count: count() })
      .from(candidates)
      .where(eq(candidates.status, 'prescreening'));
    
    const technical = await db.select({ count: count() })
      .from(candidates)
      .where(eq(candidates.status, 'technical'));
    
    const selected = await db.select({ count: count() })
      .from(candidates)
      .where(eq(candidates.status, 'selected'));
    
    const joined = await db.select({ count: count() })
      .from(candidates)
      .where(eq(candidates.status, 'joined'));
    
    return {
      applications: applied[0]?.count || 0,
      prescreening: prescreening[0]?.count || 0,
      technical: technical[0]?.count || 0,
      selected: selected[0]?.count || 0,
      onboarding: joined[0]?.count || 0,
    };
  }

  async getVendorPerformance(): Promise<any> {
    return await db.select({
      vendorId: candidates.vendorId,
      interviewed: count(),
    })
    .from(candidates)
    .where(eq(candidates.status, 'technical'))
    .groupBy(candidates.vendorId);
  }

  async getRecruiterPerformance(): Promise<any> {
    return await db.select({
      recruiterId: candidates.recruiterId,
      interviewed: count(),
    })
    .from(candidates)
    .where(eq(candidates.status, 'technical'))
    .groupBy(candidates.recruiterId);
  }
}

export const storage = new DatabaseStorage();
