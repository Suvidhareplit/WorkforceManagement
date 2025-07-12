import { pgTable, text, varchar, serial, integer, boolean, timestamp, decimal, pgEnum, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  replacementPeriod: integer("replacement_period"), // in days
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recruiters = pgTable("recruiters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: varchar("phone", { length: 10 }),
  incentiveStructure: text("incentive_structure"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 10 }).notNull(), // Exactly 10 digits
  email: text("email").notNull().unique(),
  userId: integer("user_id").notNull().unique(), // Changed to integer for numeric-only
  role: userRoleEnum("role").notNull(),
  managerId: integer("manager_id"),
  cityId: integer("city_id").references(() => cities.id),
  clusterId: integer("cluster_id").references(() => clusters.id),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User audit trail table
export const userAuditTrail = pgTable("user_audit_trail", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE
  changedBy: integer("changed_by").notNull(), // ID of user who made the change
  oldValues: json("old_values"), // Previous values before change
  newValues: json("new_values"), // New values after change
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Hiring Module
export const hiringRequests = pgTable("hiring_requests", {
  id: serial("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  cityId: integer("city_id").references(() => cities.id).notNull(),
  clusterId: integer("cluster_id").references(() => clusters.id).notNull(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  numberOfPositions: integer("number_of_positions").notNull(),
  priority: priorityEnum("priority").notNull(),
  requestType: requestTypeEnum("request_type").notNull(),
  status: requestStatusEnum("status").default('open'),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interview Module
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 10 }).notNull(),
  email: text("email"),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  cityId: integer("city_id").references(() => cities.id).notNull(),
  clusterId: integer("cluster_id").references(() => clusters.id).notNull(),
  qualification: text("qualification"),
  resumeSource: text("resume_source"), // vendor, field_recruiter, referral
  vendorId: integer("vendor_id").references(() => vendors.id),
  recruiterId: integer("recruiter_id").references(() => recruiters.id),
  referralName: text("referral_name"),
  status: candidateStatusEnum("status").default('applied'),
  prescreeningApproved: boolean("prescreening_approved"),
  prescreeningNotes: text("prescreening_notes"),
  screeningScore: decimal("screening_score"),
  benchmarkMet: boolean("benchmark_met"),
  technicalStatus: text("technical_status"), // selected, rejected
  technicalNotes: text("technical_notes"),
  dateOfJoining: timestamp("date_of_joining"),
  grossSalary: decimal("gross_salary"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Training Module
export const trainingSessions = pgTable("training_sessions", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").references(() => candidates.id).notNull(),
  trainingType: trainingTypeEnum("training_type").notNull(),
  status: trainingStatusEnum("status").default('assigned'),
  trainerId: integer("trainer_id").references(() => users.id),
  managerId: integer("manager_id").references(() => users.id),
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

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  role: one(roles, {
    fields: [candidates.roleId],
    references: [roles.id],
  }),
  city: one(cities, {
    fields: [candidates.cityId],
    references: [cities.id],
  }),
  cluster: one(clusters, {
    fields: [candidates.clusterId],
    references: [clusters.id],
  }),
  vendor: one(vendors, {
    fields: [candidates.vendorId],
    references: [vendors.id],
  }),
  recruiter: one(recruiters, {
    fields: [candidates.recruiterId],
    references: [recruiters.id],
  }),
  trainingSessions: many(trainingSessions),
}));

export const trainingSessionsRelations = relations(trainingSessions, ({ one, many }) => ({
  candidate: one(candidates, {
    fields: [trainingSessions.candidateId],
    references: [candidates.id],
  }),
  trainer: one(users, {
    fields: [trainingSessions.trainerId],
    references: [users.id],
  }),
  manager: one(users, {
    fields: [trainingSessions.managerId],
    references: [users.id],
  }),
  attendance: many(trainingAttendance),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  candidate: one(candidates, {
    fields: [employees.candidateId],
    references: [candidates.id],
  }),
  actions: many(employeeActions),
  exitRecord: many(exitRecords),
}));

// Insert Schemas
export const insertCitySchema = createInsertSchema(cities).omit({ id: true, createdAt: true });
export const insertClusterSchema = createInsertSchema(clusters).omit({ id: true, createdAt: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true });
export const insertRecruiterSchema = createInsertSchema(recruiters).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserAuditSchema = createInsertSchema(userAuditTrail).omit({ id: true });
export const insertHiringRequestSchema = createInsertSchema(hiringRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCandidateSchema = createInsertSchema(candidates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTrainingSessionSchema = createInsertSchema(trainingSessions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmployeeActionSchema = createInsertSchema(employeeActions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertExitRecordSchema = createInsertSchema(exitRecords).omit({ id: true, createdAt: true });

// Types
export type City = typeof cities.$inferSelect;
export type Cluster = typeof clusters.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type Recruiter = typeof recruiters.$inferSelect;
export type User = typeof users.$inferSelect;
export type UserAuditTrail = typeof userAuditTrail.$inferSelect;
export type HiringRequest = typeof hiringRequests.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type EmployeeAction = typeof employeeActions.$inferSelect;
export type ExitRecord = typeof exitRecords.$inferSelect;

export type InsertCity = z.infer<typeof insertCitySchema>;
export type InsertCluster = z.infer<typeof insertClusterSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertRecruiter = z.infer<typeof insertRecruiterSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserAuditTrail = z.infer<typeof insertUserAuditSchema>;
export type InsertHiringRequest = z.infer<typeof insertHiringRequestSchema>;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertEmployeeAction = z.infer<typeof insertEmployeeActionSchema>;
export type InsertExitRecord = z.infer<typeof insertExitRecordSchema>;
