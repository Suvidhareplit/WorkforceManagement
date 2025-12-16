// Models removed - using any types for raw SQL approach

// Base interfaces for consistent CRUD operations
export interface CreateOptions {
  changedBy?: number;
}

export interface UpdateOptions {
  changedBy?: number;
}

export interface StatusUpdateOptions {
  changedBy?: number;
}

export interface FilterOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  // Additional filtering parameters
  hiringRequestId?: number;
  cityId?: number;
  clusterId?: number;
  designationId?: number;
  vendorId?: number;
  recruiterId?: number;
  status?: string;
  isActive?: boolean;
  [key: string]: any; // Allow additional dynamic filters
}

// Main storage interface - production-ready with consistent patterns
export interface IStorage {
  // User management - using any types for raw SQL approach
  getUsers(filters?: FilterOptions): Promise<any[]>;
  getUser(id: number): Promise<any>;
  getUserByUserId(userId: number): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  createUser(userData: any, options?: CreateOptions): Promise<any>;
  updateUser(id: number, userData: any, options?: UpdateOptions): Promise<any>;
  deleteUser(id: number, options?: UpdateOptions): Promise<boolean>;
  updateUserStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any>;
  
  // User audit trail - using any types
  createUserAudit(auditData: any): Promise<any>;
  getUserAuditTrail(userId: number, filters?: FilterOptions): Promise<any[]>;

  // Cities - using any types for raw SQL approach
  getCities(filters?: FilterOptions): Promise<any[]>;
  getCity(id: number): Promise<any>;
  createCity(cityData: any, options?: CreateOptions): Promise<any>;
  updateCity(id: number, cityData: any, options?: UpdateOptions): Promise<any>;
  deleteCity(id: number, options?: UpdateOptions): Promise<boolean>;
  updateCityStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any>;

  // Clusters - using any types for raw SQL approach
  getClusters(filters?: FilterOptions): Promise<any[]>;
  getClustersByCity(cityId: number, filters?: FilterOptions): Promise<any[]>;
  getCluster(id: number): Promise<any>;
  createCluster(clusterData: any, options?: CreateOptions): Promise<any>;
  updateCluster(id: number, clusterData: any, options?: UpdateOptions): Promise<any>;
  deleteCluster(id: number, options?: UpdateOptions): Promise<boolean>;
  updateClusterStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any>;

  // Business Units - using any types for raw SQL approach
  getBusinessUnits(filters?: FilterOptions): Promise<any[]>;
  getBusinessUnit(id: number): Promise<any>;
  createBusinessUnit(businessUnitData: any, options?: CreateOptions): Promise<any>;
  updateBusinessUnit(id: number, businessUnitData: any, options?: UpdateOptions): Promise<any>;
  deleteBusinessUnit(id: number, options?: UpdateOptions): Promise<boolean>;

  // Departments - using any types for raw SQL approach
  getDepartments(filters?: FilterOptions): Promise<any[]>;
  getDepartment(id: number): Promise<any>;
  createDepartment(departmentData: any, options?: CreateOptions): Promise<any>;
  updateDepartment(id: number, departmentData: any, options?: UpdateOptions): Promise<any>;
  deleteDepartment(id: number, options?: UpdateOptions): Promise<boolean>;

  // Sub Departments - using any types for raw SQL approach
  getSubDepartments(filters?: FilterOptions): Promise<any[]>;
  getSubDepartment(id: number): Promise<any>;
  createSubDepartment(subDepartmentData: any, options?: CreateOptions): Promise<any>;
  updateSubDepartment(id: number, subDepartmentData: any, options?: UpdateOptions): Promise<any>;
  deleteSubDepartment(id: number, options?: UpdateOptions): Promise<boolean>;

  // Roles - using any types for raw SQL approach
  getRoles(filters?: FilterOptions): Promise<any[]>;
  getRole(id: number): Promise<any>;
  createRole(roleData: any, options?: CreateOptions): Promise<any>;
  updateRole(id: number, roleData: any, options?: UpdateOptions): Promise<any>;
  deleteRole(id: number, options?: UpdateOptions): Promise<boolean>;
  updateRoleStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any>;

  // Designations - using any types for raw SQL approach
  getDesignations(filters?: FilterOptions): Promise<any[]>;
  getDesignation(id: number): Promise<any>;
  createDesignation(designationData: any, options?: CreateOptions): Promise<any>;
  updateDesignation(id: number, designationData: any, options?: UpdateOptions): Promise<any>;
  deleteDesignation(id: number, options?: UpdateOptions): Promise<boolean>;
  updateDesignationStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any>;

  // Vendors - using any types for raw SQL approach
  getVendors(filters?: FilterOptions): Promise<any[]>;
  getVendor(id: number): Promise<any>;
  createVendor(vendorData: any, options?: CreateOptions): Promise<any>;
  updateVendor(id: number, vendorData: any, options?: UpdateOptions): Promise<any>;
  deleteVendor(id: number, options?: UpdateOptions): Promise<boolean>;
  updateVendorStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any>;

  // Recruiters - using any types for raw SQL approach
  getRecruiters(filters?: FilterOptions): Promise<any[]>;
  getRecruiter(id: number): Promise<any>;
  createRecruiter(recruiterData: any, options?: CreateOptions): Promise<any>;
  updateRecruiter(id: number, recruiterData: any, options?: UpdateOptions): Promise<any>;
  deleteRecruiter(id: number, options?: UpdateOptions): Promise<boolean>;
  updateRecruiterStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any>;

  // Trainers - using any types for raw SQL approach
  getTrainers(filters?: FilterOptions): Promise<any[]>;
  getTrainer(id: number): Promise<any>;
  createTrainer(trainerData: any, options?: CreateOptions): Promise<any>;
  updateTrainer(id: number, trainerData: any, options?: UpdateOptions): Promise<any>;
  deleteTrainer(id: number, options?: UpdateOptions): Promise<boolean>;
  updateTrainerStatus(id: number, isActive: boolean, options?: StatusUpdateOptions): Promise<any>;

  // Hiring requests - using any types for raw SQL approach
  getHiringRequests(filters?: FilterOptions): Promise<any[]>;
  getHiringRequest(id: number): Promise<any>;
  createHiringRequest(requestData: any, options?: CreateOptions): Promise<any>;
  updateHiringRequest(id: number, requestData: any, options?: UpdateOptions): Promise<any>;
  updateHiringRequestStatus(id: number, status: string, options?: UpdateOptions): Promise<any>;
  deleteHiringRequest(id: number, options?: UpdateOptions): Promise<boolean>;
  getNextHiringRequestSequence(designationId: number): Promise<number>;

  // Candidates - NEW STRUCTURE
  getCandidates(filters?: FilterOptions): Promise<any[]>;
  getCandidate(id: number): Promise<any>;
  createCandidate(candidateData: any, options?: CreateOptions): Promise<any>;
  updateCandidate(id: number, candidateData: any, options?: UpdateOptions): Promise<any>;
  deleteCandidate(id: number, options?: UpdateOptions): Promise<boolean>;
  updateCandidateStatus(id: number, status: string, options?: StatusUpdateOptions): Promise<any>;

  // Training sessions - using any types for raw SQL approach
  getTrainingSessions(filters?: FilterOptions): Promise<any[]>;
  getTrainingSession(id: number): Promise<any>;
  createTrainingSession(sessionData: any, options?: CreateOptions): Promise<any>;
  updateTrainingSession(id: number, sessionData: any, options?: UpdateOptions): Promise<any>;
  deleteTrainingSession(id: number, options?: UpdateOptions): Promise<boolean>;
  updateTrainingSessionStatus(id: number, status: string, options?: StatusUpdateOptions): Promise<any>;

  // Analytics - production-ready with proper typing
  getHiringAnalytics(filters?: FilterOptions): Promise<{
    date: string;
    totalRequests: number;
    openRequests: number;
    closedRequests: number;
    totalPositions: number;
  }[]>;
  
  getCandidatePipeline(): Promise<{
    status: string;
    count: number;
    percentage: number;
  }[]>;
  
  getVendorPerformance(): Promise<{
    vendorName: string;
    totalCandidates: number;
    successfulHires: number;
    rejectedCandidates: number;
    successRate: number;
  }[]>;
  
  getRecruiterPerformance(): Promise<{
    recruiterName: string;
    totalCandidates: number;
    successfulHires: number;
    selectedCandidates: number;
    successRate: number;
    avgTimeToHire: number;
  }[]>;
}
