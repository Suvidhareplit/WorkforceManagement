export interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
  userId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'hr' | 'recruiter' | 'manager' | 'trainer';
  managerId?: number | null;
  cityId?: number | null;
  clusterId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

export interface Cluster {
  id: number;
  name: string;
  code: string;
  cityId: number;
  isActive: boolean;
  cityName?: string;
  description?: string;
}

export interface Role {
  id?: number;
  name: string;
  code: string;
  description?: string;
  jobDescriptionFile?: string;
  paygroup?: string;
  businessUnit?: string;
  department?: string;
  subDepartment?: string;
  isActive?: boolean;
}

export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  contactPerson?: string;
  commercialTerms?: string;
  
  // Commercial terms - detailed breakdown (removed duplicate replacementPeriod)
  managementFees?: number;
  sourcingFee?: number;
  replacementDays?: number;
  
  // Contact details for different SPOCs
  deliveryLeadName?: string;
  deliveryLeadEmail?: string;
  deliveryLeadPhone?: string;
  
  businessHeadName?: string;
  businessHeadEmail?: string;
  businessHeadPhone?: string;
  
  payrollSpocName?: string;
  payrollSpocEmail?: string;
  payrollSpocPhone?: string;
  
  // City-specific SPOC data
  citySpocData?: {
    [cityId: number]: {
      name: string;
      email: string;
      phone: string;
      cityId: number;
      cityName: string;
    };
  };
  
  isActive: boolean;
}

export interface Recruiter {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cityId: number;
  isActive: boolean;
}

export interface HiringRequest {
  id: number;
  cityId: number;
  clusterId: number;
  roleId: number;
  numberOfPositions: number;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  requestType: 'backfill' | 'fresh' | 'training_attrition';
  status: 'open' | 'closed' | 'called_off';
  notes?: string;
  createdBy: number;
  cluster?: Cluster;
  role?: Role;
  createdByUser?: User;
}

export interface Candidate {
  id: number;
  name: string;
  phone: string;
  email?: string;
  roleId: number;
  roleName?: string;
  cityId: number;
  cityName?: string;
  clusterId: number;
  clusterName?: string;
  qualification?: string;
  resumeSource?: string;
  vendorId?: number;
  vendorName?: string;
  recruiterId?: number;
  recruiterName?: string;
  referralName?: string;
  status: 'applied' | 'prescreening' | 'technical' | 'selected' | 'rejected' | 'offered' | 'joined';
  prescreeningApproved?: boolean;
  prescreeningNotes?: string;
  screeningScore?: string;
  benchmarkMet?: boolean;
  technicalStatus?: string;
  technicalNotes?: string;
  dateOfJoining?: string;
  grossSalary?: string;
  createdAt: string;
  updatedAt: string;
  role?: Role;
  city?: City;
  cluster?: Cluster;
  vendor?: Vendor;
  recruiter?: Recruiter;
}

export interface TrainingSession {
  id: number;
  candidateId: number;
  trainingType: 'induction' | 'classroom' | 'field';
  status: 'assigned' | 'in_progress' | 'completed' | 'dropped_out';
  trainerId?: number;
  managerId?: number;
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
  candidate?: Candidate;
  trainer?: User;
  manager?: User;
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
  candidate?: Candidate;
}

export interface EmployeeAction {
  id: number;
  employeeId: number;
  actionType: string;
  description?: string;
  requestedBy: number;
  approvedBy?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
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
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface HiringAnalytics {
  openPositions: number;
  closedPositions: number;
}

export interface CandidatePipeline {
  applications: number;
  prescreening: number;
  technical: number;
  selected: number;
  onboarding: number;
}
