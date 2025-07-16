import { pgTable, serial, text, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Define enums
export const priorityEnum = pgEnum('priority', ['P0', 'P1', 'P2', 'P3']);
export const requestTypeEnum = pgEnum('request_type', ['replacement', 'fresh']);
export const statusEnum = pgEnum('status', ['open', 'closed', 'called_off']);
export const roleEnum = pgEnum('role', ['admin', 'hr', 'recruiter', 'manager', 'trainer']);
export const candidateStatusEnum = pgEnum('candidate_status', ['applied', 'prescreening', 'technical', 'selected', 'rejected', 'offered', 'joined']);
export const trainingStatusEnum = pgEnum('training_status', ['scheduled', 'ongoing', 'completed', 'cancelled']);
export const employeeStatusEnum = pgEnum('employee_status', ['active', 'inactive', 'terminated']);
export const actionTypeEnum = pgEnum('action_type', ['promotion', 'transfer', 'warning', 'termination', 'salary_change']);

// Cities table
export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Clusters table
export const clusters = pgTable('clusters', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  cityId: integer('city_id').references(() => cities.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Roles table
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  jobDescriptionFile: text('job_description_file'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Vendors table
export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  contactPerson: text('contact_person'),
  commercialTerms: text('commercial_terms'),
  managementFees: text('management_fees'),
  sourcingFee: text('sourcing_fee'),
  replacementDays: integer('replacement_days'),
  deliveryLeadName: text('delivery_lead_name'),
  deliveryLeadEmail: text('delivery_lead_email'),
  deliveryLeadPhone: text('delivery_lead_phone'),
  businessHeadName: text('business_head_name'),
  businessHeadEmail: text('business_head_email'),
  businessHeadPhone: text('business_head_phone'),
  payrollSpocName: text('payroll_spoc_name'),
  payrollSpocEmail: text('payroll_spoc_email'),
  payrollSpocPhone: text('payroll_spoc_phone'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Vendor City Contacts table
export const vendorCityContacts = pgTable('vendor_city_contacts', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id),
  cityId: integer('city_id').references(() => cities.id),
  recruitmentSpocName: text('recruitment_spoc_name').notNull(),
  recruitmentSpocEmail: text('recruitment_spoc_email').notNull(),
  recruitmentSpocPhone: text('recruitment_spoc_phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Recruiters table
export const recruiters = pgTable('recruiters', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  cityId: integer('city_id').references(() => cities.id),
  vendorId: integer('vendor_id').references(() => vendors.id),
  managementFee: text('management_fee'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  userId: integer('user_id').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull(),
  managerId: integer('manager_id').references(() => users.id),
  cityId: integer('city_id').references(() => cities.id),
  clusterId: integer('cluster_id').references(() => clusters.id),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Audit Trail table
export const userAuditTrail = pgTable('user_audit_trail', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  changedBy: integer('changed_by').references(() => users.id),
  changeType: text('change_type').notNull(),
  tableName: text('table_name').notNull(),
  recordId: integer('record_id').notNull(),
  oldValues: text('old_values'),
  newValues: text('new_values'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Hiring Requests table
export const hiringRequests = pgTable('hiring_requests', {
  id: serial('id').primaryKey(),
  requestId: text('request_id').notNull().unique(),
  cityId: integer('city_id').references(() => cities.id),
  clusterId: integer('cluster_id').references(() => clusters.id),
  roleId: integer('role_id').references(() => roles.id),
  numberOfPositions: integer('number_of_positions').notNull(),
  requestDate: timestamp('request_date'),
  priority: priorityEnum('priority').notNull(),
  requestType: requestTypeEnum('request_type').notNull(),
  replacementReason: text('replacement_reason'),
  status: statusEnum('status').default('open'),
  notes: text('notes'),
  handoverCompleted: boolean('handover_completed').default(false),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Candidates table
export const candidates = pgTable('candidates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  roleId: integer('role_id').references(() => roles.id),
  cityId: integer('city_id').references(() => cities.id),
  clusterId: integer('cluster_id').references(() => clusters.id),
  qualification: text('qualification'),
  resumeSource: text('resume_source'),
  vendorId: integer('vendor_id').references(() => vendors.id),
  recruiterId: integer('recruiter_id').references(() => recruiters.id),
  referralName: text('referral_name'),
  status: candidateStatusEnum('status').default('applied'),
  hiringRequestId: integer('hiring_request_id').references(() => hiringRequests.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Training Sessions table
export const trainingSessions = pgTable('training_sessions', {
  id: serial('id').primaryKey(),
  sessionName: text('session_name').notNull(),
  roleId: integer('role_id').references(() => roles.id),
  cityId: integer('city_id').references(() => cities.id),
  clusterId: integer('cluster_id').references(() => clusters.id),
  trainerId: integer('trainer_id').references(() => users.id),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  duration: integer('duration'), // in days
  maxParticipants: integer('max_participants'),
  status: trainingStatusEnum('status').default('scheduled'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Employees table
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  employeeId: text('employee_id').notNull().unique(),
  candidateId: integer('candidate_id').references(() => candidates.id),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  roleId: integer('role_id').references(() => roles.id),
  cityId: integer('city_id').references(() => cities.id),
  clusterId: integer('cluster_id').references(() => clusters.id),
  vendorId: integer('vendor_id').references(() => vendors.id),
  recruiterId: integer('recruiter_id').references(() => recruiters.id),
  joinDate: timestamp('join_date'),
  salary: text('salary'),
  status: employeeStatusEnum('status').default('active'),
  managerId: integer('manager_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Employee Actions table
export const employeeActions = pgTable('employee_actions', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id),
  actionType: actionTypeEnum('action_type').notNull(),
  actionDate: timestamp('action_date'),
  description: text('description'),
  previousValue: text('previous_value'),
  newValue: text('new_value'),
  approvedBy: integer('approved_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Exit Records table
export const exitRecords = pgTable('exit_records', {
  id: serial('id').primaryKey(),
  employeeId: integer('employee_id').references(() => employees.id),
  exitDate: timestamp('exit_date'),
  exitReason: text('exit_reason'),
  lastWorkingDay: timestamp('last_working_day'),
  clearanceCompleted: boolean('clearance_completed').default(false),
  exitInterviewCompleted: boolean('exit_interview_completed').default(false),
  handoverCompleted: boolean('handover_completed').default(false),
  notes: text('notes'),
  processedBy: integer('processed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Insert schemas
export const insertCitySchema = createInsertSchema(cities).omit({ id: true, createdAt: true });
export const insertClusterSchema = createInsertSchema(clusters).omit({ id: true, createdAt: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true });
export const insertVendorCityContactSchema = createInsertSchema(vendorCityContacts).omit({ id: true, createdAt: true });
export const insertRecruiterSchema = createInsertSchema(recruiters).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserAuditTrailSchema = createInsertSchema(userAuditTrail).omit({ id: true, timestamp: true });
export const insertHiringRequestSchema = createInsertSchema(hiringRequests).omit({ id: true, createdAt: true });
export const insertCandidateSchema = createInsertSchema(candidates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTrainingSessionSchema = createInsertSchema(trainingSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmployeeActionSchema = createInsertSchema(employeeActions).omit({ id: true, createdAt: true });
export const insertExitRecordSchema = createInsertSchema(exitRecords).omit({ id: true, createdAt: true });

// Insert types
export type InsertCity = z.infer<typeof insertCitySchema>;
export type InsertCluster = z.infer<typeof insertClusterSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertVendorCityContact = z.infer<typeof insertVendorCityContactSchema>;
export type InsertRecruiter = z.infer<typeof insertRecruiterSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserAuditTrail = z.infer<typeof insertUserAuditTrailSchema>;
export type InsertHiringRequest = z.infer<typeof insertHiringRequestSchema>;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertEmployeeAction = z.infer<typeof insertEmployeeActionSchema>;
export type InsertExitRecord = z.infer<typeof insertExitRecordSchema>;

// Select types
export type City = typeof cities.$inferSelect;
export type Cluster = typeof clusters.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type VendorCityContact = typeof vendorCityContacts.$inferSelect;
export type Recruiter = typeof recruiters.$inferSelect;
export type User = typeof users.$inferSelect;
export type UserAuditTrail = typeof userAuditTrail.$inferSelect;
export type HiringRequest = typeof hiringRequests.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type EmployeeAction = typeof employeeActions.$inferSelect;
export type ExitRecord = typeof exitRecords.$inferSelect;