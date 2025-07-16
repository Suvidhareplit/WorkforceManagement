import { z } from "zod";

// Database model types for backend
export interface City {
  id: number;
  name: string;
  code: string;
  isActive: boolean | null;
  createdAt: Date | null;
}

export interface Cluster {
  id: number;
  name: string;
  code: string;
  cityId: number;
  isActive: boolean | null;
  createdAt: Date | null;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description: string | null;
  jobDescriptionFile: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  contactPerson: string | null;
  commercialTerms: string | null;
  managementFees: string | null;
  sourcingFee: string | null;
  replacementDays: number | null;
  deliveryLeadName: string | null;
  deliveryLeadEmail: string | null;
  deliveryLeadPhone: string | null;
  businessHeadName: string | null;
  businessHeadEmail: string | null;
  businessHeadPhone: string | null;
  payrollSpocName: string | null;
  payrollSpocEmail: string | null;
  payrollSpocPhone: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

export interface VendorCityContact {
  id: number;
  vendorId: number;
  cityId: number;
  recruitmentSpocName: string;
  recruitmentSpocEmail: string;
  recruitmentSpocPhone: string | null;
  createdAt: Date | null;
}

export interface Recruiter {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  cityId: number | null;
  vendorId: number | null;
  managementFee: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  userId: number;
  passwordHash: string;
  role: 'admin' | 'hr' | 'recruiter' | 'manager' | 'trainer';
  managerId: number | null;
  cityId: number | null;
  clusterId: number | null;
  isActive: boolean | null;
  lastLogin: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UserAuditTrail {
  id: number;
  userId: number;
  changedBy: number;
  changeType: string;
  tableName: string;
  recordId: number;
  oldValues: string | null;
  newValues: string | null;
  timestamp: Date | null;
}

export interface HiringRequest {
  id: number;
  requestId: string;
  cityId: number;
  clusterId: number;
  roleId: number;
  numberOfPositions: number;
  requestDate: Date | null;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  requestType: 'replacement' | 'fresh';
  replacementReason: string | null;
  status: 'open' | 'closed' | 'called_off';
  notes: string | null;
  createdBy: number;
  createdAt: Date | null;
  updatedAt: Date | null;
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
  vendorId: number | null;
  recruiterId: number | null;
  sourcingChannel: string | null;
  qualification: string | null;
  applicationDate: Date | null;
  status: 'applied' | 'prescreening' | 'technical' | 'selected' | 'rejected' | 'offered' | 'joined';
  prescreeningDate: Date | null;
  prescreeningStatus: string | null;
  prescreeningNotes: string | null;
  technicalRound1Date: Date | null;
  technicalRound1Status: string | null;
  technicalRound1Notes: string | null;
  technicalRound2Date: Date | null;
  technicalRound2Status: string | null;
  technicalRound2Notes: string | null;
  offerDate: Date | null;
  offerSalary: string | null;
  joinDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface TrainingSession {
  id: number;
  trainingType: 'induction' | 'classroom' | 'field';
  candidateId: number;
  trainerId: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'dropped_out';
  startDate: Date | null;
  endDate: Date | null;
  duration: number | null;
  attendanceMarked: boolean | null;
  fitStatus: string | null;
  comments: string | null;
  dropoutReason: string | null;
  fteConfirmed: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Employee {
  id: number;
  candidateId: number | null;
  employeeId: string;
  personalDetails: string | null;
  contactDetails: string | null;
  employmentDetails: string | null;
  govtIds: string | null;
  bankDetails: string | null;
  documents: string | null;
  status: 'active' | 'inactive' | 'terminated' | 'resigned' | null;
  joinDate: Date | null;
  exitDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface EmployeeAction {
  id: number;
  employeeId: number;
  actionType: string;
  description: string | null;
  requestedBy: number;
  approvedBy: number | null;
  status: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ExitRecord {
  id: number;
  employeeId: number;
  exitType: 'voluntary' | 'termination' | 'absconding';
  exitDate: Date;
  reason: string | null;
  exitInterview: string | null;
  finalSettlement: string | null;
  handoverCompleted: boolean | null;
  createdBy: number;
  createdAt: Date | null;
}

// Validation schemas for insert operations
export const insertCitySchema = z.object({
  name: z.string(),
  code: z.string(),
  isActive: z.boolean().optional()
});

export const insertClusterSchema = z.object({
  name: z.string(),
  code: z.string(),
  cityId: z.number(),
  isActive: z.boolean().optional()
});

export const insertRoleSchema = z.object({
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  jobDescriptionFile: z.string().optional(),
  isActive: z.boolean().optional()
});

export const insertVendorSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
  commercialTerms: z.string().optional(),
  managementFees: z.string().optional(),
  sourcingFee: z.string().optional(),
  replacementDays: z.number().optional(),
  deliveryLeadName: z.string().optional(),
  deliveryLeadEmail: z.string().optional(),
  deliveryLeadPhone: z.string().optional(),
  businessHeadName: z.string().optional(),
  businessHeadEmail: z.string().optional(),
  businessHeadPhone: z.string().optional(),
  payrollSpocName: z.string().optional(),
  payrollSpocEmail: z.string().optional(),
  payrollSpocPhone: z.string().optional(),
  isActive: z.boolean().optional()
});

export const insertVendorCityContactSchema = z.object({
  vendorId: z.number(),
  cityId: z.number(),
  recruitmentSpocName: z.string(),
  recruitmentSpocEmail: z.string().email(),
  recruitmentSpocPhone: z.string().optional()
});

export const insertRecruiterSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  cityId: z.number().optional(),
  vendorId: z.number().optional(),
  managementFee: z.string().optional(),
  isActive: z.boolean().optional()
});

export const insertUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  phone: z.string().optional(),
  userId: z.number(),
  password: z.string(),
  role: z.enum(['admin', 'hr', 'recruiter', 'manager', 'trainer']),
  managerId: z.number().optional(),
  cityId: z.number().optional(),
  clusterId: z.number().optional(),
  isActive: z.boolean().optional()
});

export const insertHiringRequestSchema = z.object({
  cityId: z.number(),
  clusterId: z.number(),
  roleId: z.number(),
  numberOfPositions: z.number(),
  requestDate: z.date().optional(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']),
  requestType: z.enum(['replacement', 'fresh']),
  replacementReason: z.string().optional(),
  status: z.enum(['open', 'closed', 'called_off']).optional(),
  notes: z.string().optional()
});

export const insertCandidateSchema = z.object({
  hiringRequestId: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  cityId: z.number(),
  clusterId: z.number(),
  roleId: z.number(),
  vendorId: z.number().optional(),
  recruiterId: z.number().optional(),
  sourcingChannel: z.string().optional(),
  applicationDate: z.date().optional(),
  status: z.enum(['applied', 'prescreening', 'technical', 'selected', 'rejected', 'offered', 'joined']).optional()
});

export const insertTrainingSessionSchema = z.object({
  trainingType: z.enum(['induction', 'classroom', 'field']),
  candidateId: z.number(),
  trainerId: z.number(),
  status: z.enum(['assigned', 'in_progress', 'completed', 'dropped_out']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  duration: z.number().optional()
});

export const insertEmployeeSchema = z.object({
  candidateId: z.number().optional(),
  employeeId: z.string(),
  personalDetails: z.string().optional(),
  contactDetails: z.string().optional(),
  employmentDetails: z.string().optional(),
  govtIds: z.string().optional(),
  bankDetails: z.string().optional(),
  documents: z.string().optional(),
  status: z.enum(['active', 'inactive', 'terminated', 'resigned']).optional(),
  joinDate: z.date().optional()
});

export const insertEmployeeActionSchema = z.object({
  employeeId: z.number(),
  actionType: z.string(),
  description: z.string().optional(),
  requestedBy: z.number(),
  approvedBy: z.number().optional(),
  status: z.string().optional()
});

export const insertExitRecordSchema = z.object({
  employeeId: z.number(),
  exitType: z.enum(['voluntary', 'termination', 'absconding']),
  exitDate: z.date(),
  reason: z.string().optional(),
  exitInterview: z.string().optional(),
  finalSettlement: z.string().optional(),
  handoverCompleted: z.boolean().optional(),
  createdBy: z.number()
});

// Type aliases for insert operations
export type InsertCity = z.infer<typeof insertCitySchema>;
export type InsertCluster = z.infer<typeof insertClusterSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertVendorCityContact = z.infer<typeof insertVendorCityContactSchema>;
export type InsertRecruiter = z.infer<typeof insertRecruiterSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserAuditTrail = {
  userId: number;
  changedBy: number;
  changeType: string;
  tableName: string;
  recordId: number;
  oldValues?: string | null;
  newValues?: string | null;
  timestamp?: Date | null;
};
export type InsertHiringRequest = z.infer<typeof insertHiringRequestSchema>;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertEmployeeAction = z.infer<typeof insertEmployeeActionSchema>;
export type InsertExitRecord = z.infer<typeof insertExitRecordSchema>;