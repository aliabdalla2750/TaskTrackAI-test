import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // 'admin', 'agency', 'client', 'employee'
  agencyId: integer("agency_id"),
  status: text("status").notNull().default("active"), // 'active', 'inactive'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Agencies table
export const agencies = pgTable("agencies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  subscriptionPlan: text("subscription_plan").notNull(),
  status: text("status").notNull().default("active"), // 'active', 'inactive'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAgencySchema = createInsertSchema(agencies).omit({
  id: true,
  createdAt: true,
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  agencyId: integer("agency_id").notNull(),
  company: text("company"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

// Employees table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  agencyId: integer("agency_id").notNull(),
  position: text("position"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  clientId: integer("client_id"),
  agencyId: integer("agency_id").notNull(),
  createdBy: integer("created_by").notNull(),
  status: text("status").notNull().default("open"), // 'open', 'completed'
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

// Subgoals table
export const subgoals = pgTable("subgoals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("project_id").notNull(),
  kpi: text("kpi"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubgoalSchema = createInsertSchema(subgoals).omit({
  id: true,
  createdAt: true,
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("project_id").notNull(),
  subgoalId: integer("subgoal_id"),
  assignedTo: integer("assigned_to"), // Employee ID
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("open"), // 'open', 'in_progress', 'completed', 'overdue'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Task submissions table
export const taskSubmissions = pgTable("task_submissions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  fileUrl: text("file_url"),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'needs_revision', 'rejected'
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const insertTaskSubmissionSchema = createInsertSchema(taskSubmissions).omit({
  id: true,
  submittedAt: true,
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'task_assigned', 'task_completed', etc.
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Files table
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type"),
  fileSize: text("file_size"),
  linkedType: text("linked_type"), // 'project', 'task'
  linkedId: integer("linked_id"), // Project ID or Task ID
  uploaderId: integer("uploader_id").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadedAt: true,
});

// AI providers table
export const aiProviders = pgTable("ai_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),  // 'openai', 'deepseek', 'openrouter'
  displayName: text("display_name").notNull(), // 'OpenAI', 'DeepSeek', 'OpenRouter'
  apiKey: text("api_key").notNull(),
  baseUrl: text("base_url"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAiProviderSchema = createInsertSchema(aiProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// AI models table
export const aiModels = pgTable("ai_models", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  name: text("name").notNull(), // 'gpt-4o', 'deepseek-chat', etc.
  displayName: text("display_name").notNull(), // 'GPT-4o', 'DeepSeek Chat', etc.
  maxTokens: integer("max_tokens").notNull().default(4000),
  isEnabled: boolean("is_enabled").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiModelSchema = createInsertSchema(aiModels).omit({
  id: true,
  createdAt: true,
});

// AI scenarios table
export const aiScenarios = pgTable("ai_scenarios", {
  id: serial("id").primaryKey(),
  scenarioKey: text("scenario_key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  model: text("model").notNull().default("gpt-4o"),
  providerId: integer("provider_id"), // Link to specific AI provider
  temperature: integer("temperature").notNull().default(70), // 0-100, divided by 100 when used
  maxTokens: integer("max_tokens").notNull().default(4000),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAiScenarioSchema = createInsertSchema(aiScenarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// AI usage logs table
export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  agencyId: integer("agency_id"),
  scenarioKey: text("scenario_key").notNull(),
  modelUsed: text("model_used").notNull(),
  tokensUsed: integer("tokens_used").notNull(),
  costEstimate: integer("cost_estimate").notNull(), // in cents
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiUsageLogSchema = createInsertSchema(aiUsageLogs).omit({
  id: true,
  createdAt: true,
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  agencyId: integer("agency_id").notNull(),
  amount: integer("amount").notNull(), // in cents
  status: text("status").notNull().default("pending"), // 'pending', 'paid'
  paymentDate: timestamp("payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// AI chat logs table
export const aiChatLogs = pgTable("ai_chat_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  agencyId: integer("agency_id"),
  scenarioKey: text("scenario_key").notNull(),
  messages: json("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiChatLogSchema = createInsertSchema(aiChatLogs).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Agency = typeof agencies.$inferSelect;
export type InsertAgency = z.infer<typeof insertAgencySchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Subgoal = typeof subgoals.$inferSelect;
export type InsertSubgoal = z.infer<typeof insertSubgoalSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TaskSubmission = typeof taskSubmissions.$inferSelect;
export type InsertTaskSubmission = z.infer<typeof insertTaskSubmissionSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;

export type AiProvider = typeof aiProviders.$inferSelect;
export type InsertAiProvider = z.infer<typeof insertAiProviderSchema>;

export type AiModel = typeof aiModels.$inferSelect;
export type InsertAiModel = z.infer<typeof insertAiModelSchema>;

export type AiScenario = typeof aiScenarios.$inferSelect;
export type InsertAiScenario = z.infer<typeof insertAiScenarioSchema>;

export type AiUsageLog = typeof aiUsageLogs.$inferSelect;
export type InsertAiUsageLog = z.infer<typeof insertAiUsageLogSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type AiChatLog = typeof aiChatLogs.$inferSelect;
export type InsertAiChatLog = z.infer<typeof insertAiChatLogSchema>;

// Relations

// User relations
export const usersRelations = relations(users, ({ one }) => ({
  agency: one(agencies, {
    fields: [users.agencyId],
    references: [agencies.id],
  }),
}));

// Agency relations
export const agenciesRelations = relations(agencies, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  employees: many(employees),
  projects: many(projects),
  payments: many(payments),
}));

// Client relations
export const clientsRelations = relations(clients, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [clients.agencyId],
    references: [agencies.id],
  }),
  projects: many(projects),
}));

// Employee relations
export const employeesRelations = relations(employees, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [employees.agencyId],
    references: [agencies.id],
  }),
  assignedTasks: many(tasks, { relationName: "employeeTasks" }),
  submissions: many(taskSubmissions),
}));

// Project relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [projects.agencyId],
    references: [agencies.id],
  }),
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
    relationName: "projectClient",
  }),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  subgoals: many(subgoals),
  tasks: many(tasks),
}));

// Subgoal relations
export const subgoalsRelations = relations(subgoals, ({ one, many }) => ({
  project: one(projects, {
    fields: [subgoals.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
}));

// Task relations
export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  subgoal: one(subgoals, {
    fields: [tasks.subgoalId],
    references: [subgoals.id],
  }),
  assignedEmployee: one(employees, {
    fields: [tasks.assignedTo],
    references: [employees.id],
    relationName: "employeeTasks",
  }),
  submissions: many(taskSubmissions),
}));

// Task submission relations
export const taskSubmissionsRelations = relations(taskSubmissions, ({ one }) => ({
  task: one(tasks, {
    fields: [taskSubmissions.taskId],
    references: [tasks.id],
  }),
  employee: one(employees, {
    fields: [taskSubmissions.employeeId],
    references: [employees.id],
  }),
}));

// Notification relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// File relations
export const filesRelations = relations(files, ({ one }) => ({
  uploader: one(users, {
    fields: [files.uploaderId],
    references: [users.id],
  }),
}));

// AI usage logs relations
export const aiUsageLogsRelations = relations(aiUsageLogs, ({ one }) => ({
  user: one(users, {
    fields: [aiUsageLogs.userId],
    references: [users.id],
  }),
  agency: one(agencies, {
    fields: [aiUsageLogs.agencyId],
    references: [agencies.id],
  }),
}));

// Payment relations
export const paymentsRelations = relations(payments, ({ one }) => ({
  agency: one(agencies, {
    fields: [payments.agencyId],
    references: [agencies.id],
  }),
}));

// AI providers relations
export const aiProvidersRelations = relations(aiProviders, ({ many }) => ({
  models: many(aiModels),
  scenarios: many(aiScenarios),
}));

// AI models relations
export const aiModelsRelations = relations(aiModels, ({ one }) => ({
  provider: one(aiProviders, {
    fields: [aiModels.providerId],
    references: [aiProviders.id],
  }),
}));

// AI scenarios relations
export const aiScenariosRelations = relations(aiScenarios, ({ one }) => ({
  provider: one(aiProviders, {
    fields: [aiScenarios.providerId],
    references: [aiProviders.id],
  }),
}));

// AI chat logs relations
export const aiChatLogsRelations = relations(aiChatLogs, ({ one }) => ({
  user: one(users, {
    fields: [aiChatLogs.userId],
    references: [users.id],
  }),
  agency: one(agencies, {
    fields: [aiChatLogs.agencyId],
    references: [agencies.id],
  }),
}));
