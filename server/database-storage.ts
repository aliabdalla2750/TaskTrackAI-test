import { eq, and, desc, isNull } from "drizzle-orm";
import { db } from "./db";
import {
  users, User, InsertUser,
  agencies, Agency, InsertAgency,
  clients, Client, InsertClient,
  employees, Employee, InsertEmployee,
  projects, Project, InsertProject,
  subgoals, Subgoal, InsertSubgoal,
  tasks, Task, InsertTask,
  taskSubmissions, TaskSubmission, InsertTaskSubmission,
  notifications, Notification, InsertNotification,
  files, File, InsertFile,
  aiScenarios, AiScenario, InsertAiScenario,
  aiUsageLogs, AiUsageLog, InsertAiUsageLog,
  payments, Payment, InsertPayment,
  aiChatLogs, AiChatLog, InsertAiChatLog,
  aiProviders, AiProvider, InsertAiProvider,
  aiModels, AiModel, InsertAiModel,
  dailyStandups, DailyStandup, InsertDailyStandup
} from "@shared/schema";
import { IStorage } from "./storage";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return !!result;
  }

  async listUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Agencies
  async getAgency(id: number): Promise<Agency | undefined> {
    const [agency] = await db.select().from(agencies).where(eq(agencies.id, id));
    return agency;
  }

  async createAgency(agency: InsertAgency): Promise<Agency> {
    const [newAgency] = await db.insert(agencies).values(agency).returning();
    return newAgency;
  }

  async updateAgency(id: number, agency: Partial<InsertAgency>): Promise<Agency | undefined> {
    const [updatedAgency] = await db
      .update(agencies)
      .set(agency)
      .where(eq(agencies.id, id))
      .returning();
    return updatedAgency;
  }

  async deleteAgency(id: number): Promise<boolean> {
    const result = await db.delete(agencies).where(eq(agencies.id, id));
    return !!result;
  }

  async listAgencies(): Promise<Agency[]> {
    return db.select().from(agencies);
  }

  // Clients
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientsByAgency(agencyId: number): Promise<Client[]> {
    return db.select().from(clients).where(eq(clients.agencyId, agencyId));
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return !!result;
  }

  // Employees
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getEmployeesByAgency(agencyId: number): Promise<Employee[]> {
    return db.select().from(employees).where(eq(employees.agencyId, agencyId));
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updatedEmployee] = await db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return result.rowCount > 0;
  }

  // Projects
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByAgency(agencyId: number): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.agencyId, agencyId));
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.clientId, clientId));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  // Subgoals
  async getSubgoal(id: number): Promise<Subgoal | undefined> {
    const [subgoal] = await db.select().from(subgoals).where(eq(subgoals.id, id));
    return subgoal;
  }

  async getSubgoalsByProject(projectId: number): Promise<Subgoal[]> {
    return db.select().from(subgoals).where(eq(subgoals.projectId, projectId));
  }

  async createSubgoal(subgoal: InsertSubgoal): Promise<Subgoal> {
    const [newSubgoal] = await db.insert(subgoals).values(subgoal).returning();
    return newSubgoal;
  }

  async updateSubgoal(id: number, subgoal: Partial<InsertSubgoal>): Promise<Subgoal | undefined> {
    const [updatedSubgoal] = await db
      .update(subgoals)
      .set(subgoal)
      .where(eq(subgoals.id, id))
      .returning();
    return updatedSubgoal;
  }

  async deleteSubgoal(id: number): Promise<boolean> {
    const result = await db.delete(subgoals).where(eq(subgoals.id, id));
    return result.rowCount > 0;
  }

  // Tasks
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async getTasksBySubgoal(subgoalId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.subgoalId, subgoalId));
  }

  async getTasksByEmployee(employeeId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.assignedTo, employeeId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  // Task Submissions
  async getTaskSubmission(id: number): Promise<TaskSubmission | undefined> {
    const [submission] = await db.select().from(taskSubmissions).where(eq(taskSubmissions.id, id));
    return submission;
  }

  async getTaskSubmissionsByTask(taskId: number): Promise<TaskSubmission[]> {
    return db.select().from(taskSubmissions).where(eq(taskSubmissions.taskId, taskId));
  }

  async createTaskSubmission(submission: InsertTaskSubmission): Promise<TaskSubmission> {
    const [newSubmission] = await db.insert(taskSubmissions).values(submission).returning();
    return newSubmission;
  }

  async updateTaskSubmission(id: number, submission: Partial<InsertTaskSubmission>): Promise<TaskSubmission | undefined> {
    const [updatedSubmission] = await db
      .update(taskSubmissions)
      .set(submission)
      .where(eq(taskSubmissions.id, id))
      .returning();
    return updatedSubmission;
  }

  // Notifications
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return result.rowCount > 0;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return result.rowCount > 0;
  }

  // Files
  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async getFilesByProject(projectId: number): Promise<File[]> {
    return db
      .select()
      .from(files)
      .where(eq(files.linkedType, 'project'))
      .where(eq(files.linkedId, projectId));
  }

  async getFilesByTask(taskId: number): Promise<File[]> {
    return db
      .select()
      .from(files)
      .where(eq(files.linkedType, 'task'))
      .where(eq(files.linkedId, taskId));
  }

  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id));
    return result.rowCount > 0;
  }

  // AI Scenarios
  async getAiScenario(id: number): Promise<AiScenario | undefined> {
    const [scenario] = await db.select().from(aiScenarios).where(eq(aiScenarios.id, id));
    return scenario;
  }

  async getAiScenarioByKey(scenarioKey: string): Promise<AiScenario | undefined> {
    const [scenario] = await db.select().from(aiScenarios).where(eq(aiScenarios.scenarioKey, scenarioKey));
    return scenario;
  }

  async listAiScenarios(): Promise<AiScenario[]> {
    return db.select().from(aiScenarios);
  }

  async listActiveAiScenarios(): Promise<AiScenario[]> {
    return db.select().from(aiScenarios).where(eq(aiScenarios.isActive, true));
  }

  async createAiScenario(scenario: InsertAiScenario): Promise<AiScenario> {
    const [newScenario] = await db.insert(aiScenarios).values(scenario).returning();
    return newScenario;
  }

  async updateAiScenario(id: number, scenario: Partial<InsertAiScenario>): Promise<AiScenario | undefined> {
    const [updatedScenario] = await db
      .update(aiScenarios)
      .set(scenario)
      .where(eq(aiScenarios.id, id))
      .returning();
    return updatedScenario;
  }

  async deleteAiScenario(id: number): Promise<boolean> {
    const result = await db.delete(aiScenarios).where(eq(aiScenarios.id, id));
    return result.rowCount > 0;
  }

  // AI Usage Logs
  async createAiUsageLog(log: InsertAiUsageLog): Promise<AiUsageLog> {
    const [newLog] = await db.insert(aiUsageLogs).values(log).returning();
    return newLog;
  }

  async getAiUsageLogsByAgency(agencyId: number): Promise<AiUsageLog[]> {
    return db.select().from(aiUsageLogs).where(eq(aiUsageLogs.agencyId, agencyId));
  }

  // Payments
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByAgency(agencyId: number): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.agencyId, agencyId));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set(payment)
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  // AI Chat Logs
  async createAiChatLog(log: InsertAiChatLog): Promise<AiChatLog> {
    const [newLog] = await db.insert(aiChatLogs).values(log).returning();
    return newLog;
  }

  async getAiChatLogsByAgency(agencyId: number): Promise<AiChatLog[]> {
    return db.select().from(aiChatLogs).where(eq(aiChatLogs.agencyId, agencyId));
  }

  // AI Providers
  async getAiProvider(id: number): Promise<AiProvider | undefined> {
    const [provider] = await db.select().from(aiProviders).where(eq(aiProviders.id, id));
    return provider;
  }

  async getAiProviderByName(name: string): Promise<AiProvider | undefined> {
    const [provider] = await db.select().from(aiProviders).where(eq(aiProviders.name, name));
    return provider;
  }

  async listAiProviders(): Promise<AiProvider[]> {
    return db.select().from(aiProviders);
  }

  async listEnabledAiProviders(): Promise<AiProvider[]> {
    return db.select().from(aiProviders).where(eq(aiProviders.isEnabled, true));
  }

  async getDefaultAiProvider(): Promise<AiProvider | undefined> {
    const [provider] = await db.select().from(aiProviders)
      .where(and(
        eq(aiProviders.isEnabled, true),
        eq(aiProviders.isDefault, true)
      ));
    return provider;
  }

  async createAiProvider(provider: InsertAiProvider): Promise<AiProvider> {
    // If this is set as default, remove default from others
    if (provider.isDefault) {
      await db.update(aiProviders)
        .set({ isDefault: false })
        .where(eq(aiProviders.isDefault, true));
    }
    
    const [newProvider] = await db.insert(aiProviders).values(provider).returning();
    return newProvider;
  }

  async updateAiProvider(id: number, provider: Partial<InsertAiProvider>): Promise<AiProvider | undefined> {
    // If this is set as default, remove default from others
    if (provider.isDefault) {
      await db.update(aiProviders)
        .set({ isDefault: false })
        .where(and(
          eq(aiProviders.isDefault, true),
          eq(aiProviders.id, id, true) // NOT id
        ));
    }
    
    const [updatedProvider] = await db
      .update(aiProviders)
      .set(provider)
      .where(eq(aiProviders.id, id))
      .returning();
    return updatedProvider;
  }

  async deleteAiProvider(id: number): Promise<boolean> {
    const result = await db.delete(aiProviders).where(eq(aiProviders.id, id));
    return result.rowCount > 0;
  }

  // AI Models
  async getAiModel(id: number): Promise<AiModel | undefined> {
    const [model] = await db.select().from(aiModels).where(eq(aiModels.id, id));
    return model;
  }

  async getAiModelsByProvider(providerId: number): Promise<AiModel[]> {
    return db.select().from(aiModels).where(eq(aiModels.providerId, providerId));
  }

  async listEnabledAiModels(): Promise<AiModel[]> {
    return db.select().from(aiModels).where(eq(aiModels.isEnabled, true));
  }

  async getDefaultAiModelForProvider(providerId: number): Promise<AiModel | undefined> {
    const [model] = await db.select().from(aiModels)
      .where(and(
        eq(aiModels.providerId, providerId),
        eq(aiModels.isEnabled, true),
        eq(aiModels.isDefault, true)
      ));
    return model;
  }

  async createAiModel(model: InsertAiModel): Promise<AiModel> {
    // If this is set as default, remove default from others
    if (model.isDefault) {
      await db.update(aiModels)
        .set({ isDefault: false })
        .where(and(
          eq(aiModels.providerId, model.providerId),
          eq(aiModels.isDefault, true)
        ));
    }
    
    const [newModel] = await db.insert(aiModels).values(model).returning();
    return newModel;
  }

  async updateAiModel(id: number, model: Partial<InsertAiModel>): Promise<AiModel | undefined> {
    // If this is set as default and providerId doesn't change, remove default from others with same provider
    const [existingModel] = await db.select().from(aiModels).where(eq(aiModels.id, id));
    
    if (model.isDefault) {
      const providerId = model.providerId || existingModel.providerId;
      
      await db.update(aiModels)
        .set({ isDefault: false })
        .where(and(
          eq(aiModels.providerId, providerId),
          eq(aiModels.isDefault, true),
          eq(aiModels.id, id, true) // NOT id
        ));
    }
    
    const [updatedModel] = await db
      .update(aiModels)
      .set(model)
      .where(eq(aiModels.id, id))
      .returning();
    return updatedModel;
  }

  async deleteAiModel(id: number): Promise<boolean> {
    const result = await db.delete(aiModels).where(eq(aiModels.id, id));
    return result.rowCount > 0;
  }
  
  // Daily Standups
  async getDailyStandup(id: number): Promise<DailyStandup | undefined> {
    const [standup] = await db.select().from(dailyStandups).where(eq(dailyStandups.id, id));
    return standup;
  }
  
  async getDailyStandupByEmployeeAndDate(employeeId: number, date: Date): Promise<DailyStandup | undefined> {
    const [standup] = await db
      .select()
      .from(dailyStandups)
      .where(and(
        eq(dailyStandups.employeeId, employeeId),
        eq(dailyStandups.date, date)
      ));
    return standup;
  }
  
  async getEmployeeDailyStandups(employeeId: number): Promise<DailyStandup[]> {
    return db
      .select()
      .from(dailyStandups)
      .where(eq(dailyStandups.employeeId, employeeId))
      .orderBy(desc(dailyStandups.date));
  }
  
  async getAgencyDailyStandups(agencyId: number, date?: Date): Promise<DailyStandup[]> {
    let query = db
      .select()
      .from(dailyStandups)
      .where(eq(dailyStandups.agencyId, agencyId));
      
    if (date) {
      query = query.where(eq(dailyStandups.date, date));
    }
    
    return query.orderBy(desc(dailyStandups.date));
  }
  
  async createDailyStandup(standup: InsertDailyStandup): Promise<DailyStandup> {
    const [newStandup] = await db.insert(dailyStandups).values(standup).returning();
    return newStandup;
  }
  
  async updateDailyStandup(id: number, standup: Partial<InsertDailyStandup>): Promise<DailyStandup | undefined> {
    const [updatedStandup] = await db
      .update(dailyStandups)
      .set({
        ...standup,
        updatedAt: new Date()
      })
      .where(eq(dailyStandups.id, id))
      .returning();
    return updatedStandup;
  }
  
  async closeDailyStandup(id: number, tasksDone: number[], comments?: string, rating?: number): Promise<DailyStandup | undefined> {
    const [closedStandup] = await db
      .update(dailyStandups)
      .set({
        tasksDone,
        comments,
        dayRating: rating,
        status: 'closed',
        updatedAt: new Date()
      })
      .where(eq(dailyStandups.id, id))
      .returning();
    return closedStandup;
  }
  
  async reviewDailyStandup(id: number, reviewerId: number, comments: string): Promise<DailyStandup | undefined> {
    const [reviewedStandup] = await db
      .update(dailyStandups)
      .set({
        reviewedBy: reviewerId,
        reviewComments: comments,
        updatedAt: new Date()
      })
      .where(eq(dailyStandups.id, id))
      .returning();
    return reviewedStandup;
  }
  
  async deleteDailyStandup(id: number): Promise<boolean> {
    const result = await db.delete(dailyStandups).where(eq(dailyStandups.id, id));
    return result.rowCount > 0;
  }
}