import { pgTable, text, varchar, serial, integer, boolean, timestamp, decimal, pgEnum, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const priorityEnum = pgEnum('priority', ['P0', 'P1', 'P2', 'P3']);
export const requestTypeEnum = pgEnum('request_type', ['replacement', 'fresh']);
export const requestStatusEnum = pgEnum('request_status', ['open', 'closed', 'called_off']);
export const candidateStatusEnum = pgEnum('candidate_status', ['applied', 'prescreening', 'technical', 'selected', 'rejected', 'offered', 'joined']);
export const trainingTypeEnum = pgEnum('training_type', ['induction', 'classroom', 'field']);
export const trainingStatusEnum = pgEnum('training_status', ['assigned', 'in_progress', 'completed', 'dropped_out']);
export const employeeStatusEnum = pgEnum('employee_status', ['active', 'inactive', 'terminated', 'resigned']);
export const exitTypeEnum = pgEnum('exit_type', ['voluntary', 'termination', 'absconding']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'hr', 'recruiter', 'manager', 'trainer']);

// Master Data Tables
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clusters = pgTable("clusters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  cityId: integer("city_id").references(() => cities.id).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  description: text("description"),
  jobDescriptionFile: text("job_description_file"), // Path to uploaded JD file
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: varchar("phone", { length: 10 }),
  contactPerson: text("contact_person"),
  commercialTerms: text("commercial_terms"),
  
  // Commercial terms - detailed breakdown (removed duplicate replacementPeriod)
  managementFees: decimal("management_fees", { precision: 5, scale: 2 }), // percentage
  sourcingFee: decimal("sourcing_fee", { precision: 5, scale: 2 }), // percentage
  replacementDays: integer("replacement_days"), // Keep only this field for replacement period
  
  // Contact details for different SPOCs
  deliveryLeadName: text("delivery_lead_name"),
  deliveryLeadEmail: text("delivery_lead_email"),
  deliveryLeadPhone: varchar("delivery_lead_phone", { length: 10 }),
  
  businessHeadName: text("business_head_name"),
  businessHeadEmail: text("business_head_email"),
  businessHeadPhone: varchar("business_head_phone", { length: 10 }),
  
  payrollSpocName: text("payroll_spoc_name"),
  payrollSpocEmail: text("payroll_spoc_email"),
  payrollSpocPhone: varchar("payroll_spoc_phone", { length: 10 }),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor city-specific contacts table
export const vendorCityContacts = pgTable("vendor_city_contacts", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  cityId: integer("city_id").references(() => cities.id).notNull(),
  recruitmentSpocName: text("recruitment_spoc_name").notNull(),
  recruitmentSpocEmail: text("recruitment_spoc_email").notNull(),
  recruitmentSpocPhone: varchar("recruitment_spoc_phone", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recruiters = pgTable("recruiters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: varchar("phone", { length: 10 }),
  cityId: integer("city_id").references(() => cities.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  managementFee: decimal("management_fee", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 10 }),
  userId: integer("user_id").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  managerId: integer("manager_id").references(() => users.id),
  cityId: integer("city_id").references(() => cities.id),
  clusterId: integer("cluster_id").references(() => clusters.id),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Trail
export const userAuditTrail = pgTable("user_audit_trail", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  changedBy: integer("changed_by").notNull(),
  changeType: text("change_type").notNull(), // CREATE, UPDATE, DELETE, STATUS_CHANGE, LOGIN
  tableName: text("table_name").notNull(),
  recordId: integer("record_id").notNull(),
  oldValues: json("old_values"),
  newValues: json("new_values"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Hiring Management
export const hiringRequests = pgTable("hiring_requests", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  cityId: integer("city_id").references(() => cities.id).notNull(),
  clusterId: integer("cluster_id").references(() => clusters.id).notNull(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  numberOfPositions: integer("number_of_positions").notNull(),
  requestDate: timestamp("request_date").defaultNow(),
  priority: priorityEnum("priority").notNull(),
  requestType: requestTypeEnum("request_type").notNull(),
  replacementReason: text("replacement_reason"),
  status: requestStatusEnum("status").default('open'),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Candidate Management
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  hiringRequestId: integer("hiring_request_id").references(() => hiringRequests.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: varchar("phone", { length: 10 }).notNull(),
  cityId: integer("city_id").references(() => cities.id).notNull(),
  clusterId: integer("cluster_id").references(() => clusters.id).notNull(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  recruiterId: integer("recruiter_id").references(() => recruiters.id),
  sourcingChannel: text("sourcing_channel"),
  applicationDate: timestamp("application_date").defaultNow(),
  status: candidateStatusEnum("status").default('applied'),
  prescreeningDate: timestamp("prescreening_date"),
  prescreeningStatus: text("prescreening_status"),
  prescreeningNotes: text("prescreening_notes"),
  technicalRound1Date: timestamp("technical_round1_date"),
  technicalRound1Status: text("technical_round1_status"),
  technicalRound1Notes: text("technical_round1_notes"),
  technicalRound2Date: timestamp("technical_round2_date"),
  technicalRound2Status: text("technical_round2_status"),
  technicalRound2Notes: text("technical_round2_notes"),
  offerDate: timestamp("offer_date"),
  offerSalary: decimal("offer_salary"),
  joinDate: timestamp("join_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Training Management
export const trainingSessions = pgTable("training_sessions", {
  id: serial("id").primaryKey(),
  trainingType: trainingTypeEnum("training_type").notNull(),
  candidateId: integer("candidate_id").references(() => candidates.id).notNull(),
  trainerId: integer("trainer_id").references(() => users.id).notNull(),
  status: trainingStatusEnum("status").default('assigned'),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  duration: integer("duration"), // in days
  attendanceMarked: boolean("attendance_marked").default(false),
  fitStatus: text("fit_status"), // fit, not_fit
  comments: text("comments"),
  dropoutReason: text("dropout_reason"),
  fteConfirmed: boolean("fte_confirmed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trainingAttendance = pgTable("training_attendance", {
  id: serial("id").primaryKey(),
  trainingSessionId: integer("training_session_id").references(() => trainingSessions.id).notNull(),
  date: timestamp("date").notNull(),
  present: boolean("present").default(false),
  notes: text("notes"),
  markedBy: integer("marked_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee Management
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").references(() => candidates.id),
  employeeId: text("employee_id").notNull().unique(),
  personalDetails: text("personal_details"), // JSON string
  contactDetails: text("contact_details"), // JSON string
  employmentDetails: text("employment_details"), // JSON string
  govtIds: text("govt_ids"), // JSON string
  bankDetails: text("bank_details"), // JSON string
  documents: text("documents"), // JSON string
  status: employeeStatusEnum("status").default('active'),
  joinDate: timestamp("join_date"),
  exitDate: timestamp("exit_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const employeeActions = pgTable("employee_actions", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  actionType: text("action_type").notNull(), // PIP, warning, termination
  description: text("description"),
  requestedBy: integer("requested_by").references(() => users.id).notNull(),
  approvedBy: integer("approved_by").references(() => users.id),
  status: text("status").default('pending'), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exit Management
export const exitRecords = pgTable("exit_records", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  exitType: exitTypeEnum("exit_type").notNull(),
  exitDate: timestamp("exit_date").notNull(),
  reason: text("reason"),
  exitInterview: text("exit_interview"), // JSON string
  finalSettlement: decimal("final_settlement"),
  handoverCompleted: boolean("handover_completed").default(false),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics and Tracking
export const vendorInvoices = pgTable("vendor_invoices", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  candidateId: integer("candidate_id").references(() => candidates.id).notNull(),
  sourcingFee: decimal("sourcing_fee").notNull(),
  invoiceDate: timestamp("invoice_date").notNull(),
  paymentStatus: text("payment_status").default('pending'), // pending, paid
  paymentDate: timestamp("payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recruiterIncentives = pgTable("recruiter_incentives", {
  id: serial("id").primaryKey(),
  recruiterId: integer("recruiter_id").references(() => recruiters.id).notNull(),
  candidateId: integer("candidate_id").references(() => candidates.id).notNull(),
  incentiveAmount: decimal("incentive_amount").notNull(),
  calculatedDate: timestamp("calculated_date").notNull(),
  paymentStatus: text("payment_status").default('pending'), // pending, paid
  paymentDate: timestamp("payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const citiesRelations = relations(cities, ({ many }) => ({
  clusters: many(clusters),
  hiringRequests: many(hiringRequests),
  candidates: many(candidates),
  vendorCityContacts: many(vendorCityContacts),
}));

export const clustersRelations = relations(clusters, ({ one, many }) => ({
  city: one(cities, {
    fields: [clusters.cityId],
    references: [cities.id],
  }),
  hiringRequests: many(hiringRequests),
  candidates: many(candidates),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  hiringRequests: many(hiringRequests),
  candidates: many(candidates),
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  candidates: many(candidates),
  invoices: many(vendorInvoices),
  cityContacts: many(vendorCityContacts),
}));

export const vendorCityContactsRelations = relations(vendorCityContacts, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorCityContacts.vendorId],
    references: [vendors.id],
  }),
  city: one(cities, {
    fields: [vendorCityContacts.cityId],
    references: [cities.id],
  }),
}));

export const recruitersRelations = relations(recruiters, ({ many }) => ({
  candidates: many(candidates),
  incentives: many(recruiterIncentives),
}));

export const usersRelations = relations(users, ({ many }) => ({
  hiringRequests: many(hiringRequests),
  trainingSessions: many(trainingSessions),
  employeeActions: many(employeeActions),
  exitRecords: many(exitRecords),
}));

export const hiringRequestsRelations = relations(hiringRequests, ({ one }) => ({
  city: one(cities, {
    fields: [hiringRequests.cityId],
    references: [cities.id],
  }),
  cluster: one(clusters, {
    fields: [hiringRequests.clusterId],
    references: [clusters.id],
  }),
  role: one(roles, {
    fields: [hiringRequests.roleId],
    references: [roles.id],
  }),
  createdByUser: one(users, {
    fields: [hiringRequests.createdBy],
    references: [users.id],
  }),
}));

export const candidatesRelations = relations(candidates, ({ one }) => ({
  hiringRequest: one(hiringRequests, {
    fields: [candidates.hiringRequestId],
    references: [hiringRequests.id],
  }),
  city: one(cities, {
    fields: [candidates.cityId],
    references: [cities.id],
  }),
  cluster: one(clusters, {
    fields: [candidates.clusterId],
    references: [clusters.id],
  }),
  role: one(roles, {
    fields: [candidates.roleId],
    references: [roles.id],
  }),
  vendor: one(vendors, {
    fields: [candidates.vendorId],
    references: [vendors.id],
  }),
  recruiter: one(recruiters, {
    fields: [candidates.recruiterId],
    references: [recruiters.id],
  }),
}));

export const trainingSessionsRelations = relations(trainingSessions, ({ one }) => ({
  candidate: one(candidates, {
    fields: [trainingSessions.candidateId],
    references: [candidates.id],
  }),
  trainer: one(users, {
    fields: [trainingSessions.trainerId],
    references: [users.id],
  }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  candidate: one(candidates, {
    fields: [employees.candidateId],
    references: [candidates.id],
  }),
  actions: many(employeeActions),
  exitRecord: many(exitRecords),
}));

// Drizzle Zod schemas for validation
import { createInsertSchema } from "drizzle-zod";

// Insert schemas for validation
export const insertCitySchema = createInsertSchema(cities).omit({ id: true, createdAt: true });
export const insertClusterSchema = createInsertSchema(clusters).omit({ id: true, createdAt: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true });
export const insertVendorCityContactSchema = createInsertSchema(vendorCityContacts).omit({ id: true, createdAt: true });
export const insertRecruiterSchema = createInsertSchema(recruiters).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true, lastLogin: true });
export const insertUserAuditTrailSchema = createInsertSchema(userAuditTrail).omit({ id: true, timestamp: true });
export const insertHiringRequestSchema = createInsertSchema(hiringRequests).omit({ id: true, requestId: true, createdAt: true, updatedAt: true, requestDate: true });
export const insertCandidateSchema = createInsertSchema(candidates).omit({ id: true, createdAt: true, updatedAt: true, applicationDate: true });
export const insertTrainingSessionSchema = createInsertSchema(trainingSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTrainingAttendanceSchema = createInsertSchema(trainingAttendance).omit({ id: true, createdAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmployeeActionSchema = createInsertSchema(employeeActions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExitRecordSchema = createInsertSchema(exitRecords).omit({ id: true, createdAt: true });
export const insertVendorInvoiceSchema = createInsertSchema(vendorInvoices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRecruiterIncentiveSchema = createInsertSchema(recruiterIncentives).omit({ id: true, createdAt: true });

// Type exports using $inferSelect
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
export type TrainingAttendance = typeof trainingAttendance.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type EmployeeAction = typeof employeeActions.$inferSelect;
export type ExitRecord = typeof exitRecords.$inferSelect;
export type VendorInvoice = typeof vendorInvoices.$inferSelect;
export type RecruiterIncentive = typeof recruiterIncentives.$inferSelect;

// Insert types
export type InsertCity = typeof cities.$inferInsert;
export type InsertCluster = typeof clusters.$inferInsert;
export type InsertRole = typeof roles.$inferInsert;
export type InsertVendor = typeof vendors.$inferInsert;
export type InsertVendorCityContact = typeof vendorCityContacts.$inferInsert;
export type InsertRecruiter = typeof recruiters.$inferInsert;
export type InsertUser = typeof users.$inferInsert;
export type InsertUserAuditTrail = typeof userAuditTrail.$inferInsert;
export type InsertHiringRequest = typeof hiringRequests.$inferInsert;
export type InsertCandidate = typeof candidates.$inferInsert;
export type InsertTrainingSession = typeof trainingSessions.$inferInsert;
export type InsertTrainingAttendance = typeof trainingAttendance.$inferInsert;
export type InsertEmployee = typeof employees.$inferInsert;
export type InsertEmployeeAction = typeof employeeActions.$inferInsert;
export type InsertExitRecord = typeof exitRecords.$inferInsert;
export type InsertVendorInvoice = typeof vendorInvoices.$inferInsert;
export type InsertRecruiterIncentive = typeof recruiterIncentives.$inferInsert;