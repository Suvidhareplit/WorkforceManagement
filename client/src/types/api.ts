// API response types for frontend

export interface City {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface Cluster {
  id: number;
  name: string;
  code: string;
  cityId: number;
  isActive: boolean;
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  jobDescriptionFile?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  contactPerson?: string;
  commercialTerms?: string;
  managementFees?: string;
  sourcingFee?: string;
  replacementDays?: number;
  deliveryLeadName?: string;
  deliveryLeadEmail?: string;
  deliveryLeadPhone?: string;
  businessHeadName?: string;
  businessHeadEmail?: string;
  businessHeadPhone?: string;
  payrollSpocName?: string;
  payrollSpocEmail?: string;
  payrollSpocPhone?: string;
  isActive: boolean;
  createdAt: string;
  // Extended vendor with city SPOC data
  citySpocData?: {
    [cityId: number]: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  contacts?: VendorCityContact[];
}

export interface VendorCityContact {
  id: number;
  vendorId: number;
  cityId: number;
  recruitmentSpocName: string;
  recruitmentSpocEmail: string;
  recruitmentSpocPhone?: string;
  createdAt: string;
  cityName?: string;
}

export interface Recruiter {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cityId?: number;
  vendorId?: number;
  managementFee?: string;
  isActive: boolean;
  createdAt: string;
  cityName?: string;
  vendorName?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  userId: number;
  role: 'admin' | 'hr' | 'recruiter' | 'manager' | 'trainer';
  managerId?: number;
  cityId?: number;
  clusterId?: number;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  // Extended with relations
  city?: City;
  cluster?: Cluster;
  manager?: User;
}

export interface UserAuditTrail {
  id: number;
  userId: number;
  changedBy: number;
  changeType: string;
  tableName: string;
  recordId: number;
  oldValues?: string;
  newValues?: string;
  timestamp: string;
}

export interface HiringRequest {
  id: number;
  requestId: string;
  cityId: number;
  clusterId: number;
  roleId: number;
  numberOfPositions: number;
  requestDate: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  requestType: 'replacement' | 'fresh';
  replacementReason?: string;
  status: 'open' | 'closed' | 'called_off';
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  // Extended with relations
  city?: City;
  cluster?: Cluster;
  role?: Role;
  cityName?: string;
  clusterName?: string;
  roleName?: string;
}

export interface Candidate {
  id: number;
  applicationId: string;
  hiringRequestId: number;
  name: string;
  email: string;
  phone: string;
  cityId: number;
  clusterId: number;
  roleId: number;
  vendorId?: number;
  recruiterId?: number;
  sourcingChannel?: string;
  qualification?: string;
  applicationDate?: string;
  status: 'applied' | 'prescreening' | 'technical' | 'selected' | 'rejected' | 'offered' | 'joined';
  prescreeningDate?: string;
  prescreeningStatus?: string;
  prescreeningNotes?: string;
  technicalRound1Date?: string;
  technicalRound1Status?: string;
  technicalRound1Notes?: string;
  technicalRound2Date?: string;
  technicalRound2Status?: string;
  technicalRound2Notes?: string;
  offerDate?: string;
  offerSalary?: string;
  joinDate?: string;
  createdAt: string;
  updatedAt: string;
  // Extended with relations
  city?: City;
  cluster?: Cluster;
  role?: Role;
  vendor?: Vendor;
  recruiter?: Recruiter;
  hiringRequest?: HiringRequest;
}

export interface TrainingSession {
  id: number;
  trainingType: 'induction' | 'classroom' | 'field';
  candidateId: number;
  trainerId: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'dropped_out';
  startDate?: string;
  endDate?: string;
  duration?: number;
  attendanceMarked: boolean;
  fitStatus?: string;
  comments?: string;
  dropoutReason?: string;
  fteConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  // Extended with relations
  candidate?: Candidate;
  trainer?: User;
}

export interface Employee {
  id: number;
  candidateId?: number;
  employeeId: string;
  personalDetails?: string;
  contactDetails?: string;
  employmentDetails?: string;
  govtIds?: string;
  bankDetails?: string;
  documents?: string;
  status: 'active' | 'inactive' | 'terminated' | 'resigned';
  joinDate?: string;
  exitDate?: string;
  createdAt: string;
  updatedAt: string;
  // Extended with relations
  candidate?: Candidate;
}

export interface EmployeeAction {
  id: number;
  employeeId: number;
  actionType: string;
  description?: string;
  requestedBy: number;
  approvedBy?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Extended with relations
  employee?: Employee;
  requestedByUser?: User;
  approvedByUser?: User;
}

export interface ExitRecord {
  id: number;
  employeeId: number;
  exitType: 'voluntary' | 'termination' | 'absconding';
  exitDate: string;
  reason?: string;
  exitInterview?: string;
  finalSettlement?: string;
  handoverCompleted: boolean;
  createdBy: number;
  createdAt: string;
  // Extended with relations
  employee?: Employee;
  createdByUser?: User;
}

// Analytics types
export interface HiringAnalytics {
  openPositions: number;
  closedPositions: number;
  totalRequests: number;
  byCity: {
    [cityName: string]: {
      openPositions: number;
      totalRequests: number;
    };
  };
}

export interface CandidatePipeline {
  applications: number;
  prescreening: number;
  technical: number;
  selected: number;
  offered: number;
  joined: number;
  rejected: number;
}

export interface VendorPerformance {
  vendorId: number;
  vendorName: string;
  totalCandidates: number;
  joinedCandidates: number;
  conversionRate: number;
  avgTimeToJoin: number;
}

export interface RecruiterPerformance {
  recruiterId: number;
  recruiterName: string;
  totalCandidates: number;
  joinedCandidates: number;
  conversionRate: number;
  incentivesEarned: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

// Form input types
export interface CreateHiringRequestInput {
  cityId: number;
  clusterId: number;
  roleId: number;
  numberOfPositions: number;
  requestDate?: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  requestType: 'replacement' | 'fresh';
  replacementReason?: string;
  notes?: string;
}

export interface CreateCandidateInput {
  hiringRequestId: number;
  name: string;
  email: string;
  phone: string;
  cityId: number;
  clusterId: number;
  roleId: number;
  vendorId?: number;
  recruiterId?: number;
  sourcingChannel?: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  phone?: string;
  userId: number;
  password: string;
  role: 'admin' | 'hr' | 'recruiter' | 'manager' | 'trainer';
  managerId?: number;
  cityId?: number;
  clusterId?: number;
}