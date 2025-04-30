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
  dailyStandups, DailyStandup, InsertDailyStandup,
  billing, Billing, InsertBilling,
  wallet, Wallet, InsertWallet,
  clientRatings, ClientRating, InsertClientRating,
  clientNotes, ClientNote, InsertClientNote
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(): Promise<User[]>;
  
  // Agencies
  getAgency(id: number): Promise<Agency | undefined>;
  createAgency(agency: InsertAgency): Promise<Agency>;
  updateAgency(id: number, agency: Partial<InsertAgency>): Promise<Agency | undefined>;
  deleteAgency(id: number): Promise<boolean>;
  listAgencies(): Promise<Agency[]>;
  
  // Clients
  getClient(id: number): Promise<Client | undefined>;
  getClientsByAgency(agencyId: number): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Employees
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeesByAgency(agencyId: number): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Projects
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByAgency(agencyId: number): Promise<Project[]>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Subgoals
  getSubgoal(id: number): Promise<Subgoal | undefined>;
  getSubgoalsByProject(projectId: number): Promise<Subgoal[]>;
  createSubgoal(subgoal: InsertSubgoal): Promise<Subgoal>;
  updateSubgoal(id: number, subgoal: Partial<InsertSubgoal>): Promise<Subgoal | undefined>;
  deleteSubgoal(id: number): Promise<boolean>;
  
  // Tasks
  getTask(id: number): Promise<Task | undefined>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTasksBySubgoal(subgoalId: number): Promise<Task[]>;
  getTasksByEmployee(employeeId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Task Submissions
  getTaskSubmission(id: number): Promise<TaskSubmission | undefined>;
  getTaskSubmissionsByTask(taskId: number): Promise<TaskSubmission[]>;
  createTaskSubmission(submission: InsertTaskSubmission): Promise<TaskSubmission>;
  updateTaskSubmission(id: number, submission: Partial<InsertTaskSubmission>): Promise<TaskSubmission | undefined>;
  
  // Notifications
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Files
  getFile(id: number): Promise<File | undefined>;
  getFilesByProject(projectId: number): Promise<File[]>;
  getFilesByTask(taskId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  deleteFile(id: number): Promise<boolean>;
  
  // AI Scenarios
  getAiScenario(id: number): Promise<AiScenario | undefined>;
  getAiScenarioByKey(scenarioKey: string): Promise<AiScenario | undefined>;
  listAiScenarios(): Promise<AiScenario[]>;
  listActiveAiScenarios(): Promise<AiScenario[]>;
  createAiScenario(scenario: InsertAiScenario): Promise<AiScenario>;
  updateAiScenario(id: number, scenario: Partial<InsertAiScenario>): Promise<AiScenario | undefined>;
  deleteAiScenario(id: number): Promise<boolean>;
  
  // AI Usage Logs
  createAiUsageLog(log: InsertAiUsageLog): Promise<AiUsageLog>;
  getAiUsageLogsByAgency(agencyId: number): Promise<AiUsageLog[]>;
  
  // Payments
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByAgency(agencyId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // AI Chat Logs
  createAiChatLog(log: InsertAiChatLog): Promise<AiChatLog>;
  getAiChatLogsByAgency(agencyId: number): Promise<AiChatLog[]>;
  
  // AI Providers
  getAiProvider(id: number): Promise<AiProvider | undefined>;
  getAiProviderByName(name: string): Promise<AiProvider | undefined>;
  listAiProviders(): Promise<AiProvider[]>;
  listEnabledAiProviders(): Promise<AiProvider[]>;
  getDefaultAiProvider(): Promise<AiProvider | undefined>;
  createAiProvider(provider: InsertAiProvider): Promise<AiProvider>;
  updateAiProvider(id: number, provider: Partial<InsertAiProvider>): Promise<AiProvider | undefined>;
  deleteAiProvider(id: number): Promise<boolean>;
  
  // AI Models
  getAiModel(id: number): Promise<AiModel | undefined>;
  getAiModelsByProvider(providerId: number): Promise<AiModel[]>;
  listEnabledAiModels(): Promise<AiModel[]>;
  getDefaultAiModelForProvider(providerId: number): Promise<AiModel | undefined>;
  createAiModel(model: InsertAiModel): Promise<AiModel>;
  updateAiModel(id: number, model: Partial<InsertAiModel>): Promise<AiModel | undefined>;
  deleteAiModel(id: number): Promise<boolean>;
  
  // Daily Standups
  getDailyStandup(id: number): Promise<DailyStandup | undefined>;
  getDailyStandupByEmployeeAndDate(employeeId: number, date: Date): Promise<DailyStandup | undefined>;
  getEmployeeDailyStandups(employeeId: number): Promise<DailyStandup[]>;
  getAgencyDailyStandups(agencyId: number, date?: Date): Promise<DailyStandup[]>;
  createDailyStandup(standup: InsertDailyStandup): Promise<DailyStandup>;
  updateDailyStandup(id: number, standup: Partial<InsertDailyStandup>): Promise<DailyStandup | undefined>;
  closeDailyStandup(id: number, tasksDone: number[], comments?: string, rating?: number): Promise<DailyStandup | undefined>;
  reviewDailyStandup(id: number, reviewerId: number, comments: string): Promise<DailyStandup | undefined>;
  deleteDailyStandup(id: number): Promise<boolean>;

  // وظائف التقارير الأسبوعية
  getWeeklyReport(id: number): Promise<WeeklyReport | undefined>;
  getWeeklyReportsByClient(clientId: number): Promise<WeeklyReport[]>;
  getWeeklyReportsByAgency(agencyId: number): Promise<WeeklyReport[]>;
  createWeeklyReport(report: InsertWeeklyReport): Promise<WeeklyReport>;
  updateWeeklyReportStatus(id: number, status: string): Promise<WeeklyReport | undefined>;
  
  // وظائف التقارير الشهرية
  getMonthlyReport(id: number): Promise<MonthlyReport | undefined>;
  getMonthlyReportsByAgency(agencyId: number): Promise<MonthlyReport[]>;
  getMonthlyReportByMonth(agencyId: number, month: string): Promise<MonthlyReport | undefined>;
  createMonthlyReport(report: InsertMonthlyReport): Promise<MonthlyReport>;
  
  // Billing operations
  getBilling(id: number): Promise<Billing | undefined>;
  getBillingsByAgency(agencyId: number): Promise<Billing[]>;
  getAllBillings(): Promise<Billing[]>;
  createBilling(billing: InsertBilling): Promise<Billing>;
  updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined>;
  
  // Wallet operations
  getWalletByAgency(agencyId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: number, wallet: Partial<InsertWallet>): Promise<Wallet | undefined>;
  
  // Client Ratings operations
  getClientRating(id: number): Promise<ClientRating | undefined>;
  getClientRatingsByClient(clientId: number): Promise<ClientRating[]>;
  getClientRatingsByProject(projectId: number): Promise<ClientRating[]>;
  createClientRating(rating: InsertClientRating): Promise<ClientRating>;
  updateClientRating(id: number, rating: Partial<InsertClientRating>): Promise<ClientRating | undefined>;
  deleteClientRating(id: number): Promise<boolean>;
  calculateClientAverageRating(clientId: number): Promise<number | null>;
  
  // Client Notes operations
  getClientNote(id: number): Promise<ClientNote | undefined>;
  getClientNotesByClient(clientId: number): Promise<ClientNote[]>;
  createClientNote(note: InsertClientNote): Promise<ClientNote>;
  updateClientNote(id: number, note: Partial<InsertClientNote>): Promise<ClientNote | undefined>;
  deleteClientNote(id: number): Promise<boolean>;
  
  // Client Payment Status operations
  updateClientPaymentStatus(clientId: number, paymentStatus: string): Promise<Client | undefined>;
  calculateClientPaymentStatus(clientId: number): Promise<string>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private agencies: Map<number, Agency>;
  private clients: Map<number, Client>;
  private employees: Map<number, Employee>;
  private projects: Map<number, Project>;
  private subgoals: Map<number, Subgoal>;
  private tasks: Map<number, Task>;
  private taskSubmissions: Map<number, TaskSubmission>;
  private notifications: Map<number, Notification>;
  private files: Map<number, File>;
  private aiScenarios: Map<number, AiScenario>;
  private aiUsageLogs: Map<number, AiUsageLog>;
  private payments: Map<number, Payment>;
  private aiChatLogs: Map<number, AiChatLog>;
  private dailyStandups: Map<number, DailyStandup>;
  private weeklyReports: Map<number, WeeklyReport>;
  private monthlyReports: Map<number, MonthlyReport>;
  private billings: Map<number, Billing>;
  private wallets: Map<number, Wallet>;

  // ID counters
  private userIdCounter = 1;
  private agencyIdCounter = 1;
  private clientIdCounter = 1;
  private employeeIdCounter = 1;
  private projectIdCounter = 1;
  private subgoalIdCounter = 1;
  private taskIdCounter = 1;
  private taskSubmissionIdCounter = 1;
  private notificationIdCounter = 1;
  private fileIdCounter = 1;
  private aiScenarioIdCounter = 1;
  private aiUsageLogIdCounter = 1;
  private paymentIdCounter = 1;
  private aiChatLogIdCounter = 1;
  private dailyStandupIdCounter = 1;
  private billingIdCounter = 1;
  private walletIdCounter = 1;

  constructor() {
    this.users = new Map();
    this.agencies = new Map();
    this.clients = new Map();
    this.employees = new Map();
    this.projects = new Map();
    this.subgoals = new Map();
    this.tasks = new Map();
    this.taskSubmissions = new Map();
    this.notifications = new Map();
    this.files = new Map();
    this.aiScenarios = new Map();
    this.aiUsageLogs = new Map();
    this.payments = new Map();
    this.aiChatLogs = new Map();
    this.dailyStandups = new Map();
    this.weeklyReports = new Map();
    this.monthlyReports = new Map();
    this.billings = new Map();
    this.wallets = new Map();

    // Initialize with default AI scenarios
    this.seedAiScenarios();
    // Initialize with sample data for development
    this.seedSampleData();
  }

  // Seed default AI scenarios
  private seedAiScenarios() {
    const scenarios = [
      {
        scenarioKey: "general",
        title: "المساعد العام",
        description: "مساعد ذكي عام يمكنه الإجابة على الأسئلة وتقديم المساعدة في مختلف المجالات",
        systemPrompt: "أنت مساعد مفيد ومتعاون. أجب على أسئلة المستخدم بأفضل ما تستطيع وقدم معلومات دقيقة ومفيدة.",
        model: "gpt-4o",
        temperature: 70,
        maxTokens: 4000,
        isActive: true
      },
      {
        scenarioKey: "project-creation",
        title: "إنشاء مشروع",
        description: "مساعد متخصص في إنشاء وتخطيط المشاريع وتقسيمها إلى مهام وأهداف",
        systemPrompt: "أنت مستشار متخصص في إدارة المشاريع. مهمتك تحليل متطلبات المشروع وتحويلها إلى خطة عمل منظمة. اسأل المستخدم عن تفاصيل المشروع ومتطلباته، ثم حول هذه المعلومات إلى: 1. وصف مشروع واضح 2. أهداف فرعية محددة 3. مهام قابلة للتنفيذ مرتبطة بالأهداف 4. جدول زمني مع تواريخ توقع للبدء والانتهاء. قدم المعلومات بطريقة منظمة وواضحة.",
        model: "gpt-4o",
        temperature: 50,
        maxTokens: 4000,
        isActive: true
      },
      {
        scenarioKey: "content",
        title: "إنشاء محتوى",
        description: "مساعد متخصص في كتابة وتحرير المحتوى التسويقي والإعلاني",
        systemPrompt: "أنت متخصص في إنشاء المحتوى التسويقي والإعلاني. مهمتك مساعدة المستخدم في كتابة محتوى جذاب ومقنع لمختلف الأغراض التسويقية. استمع لمتطلبات المستخدم وقدم محتوى مخصصاً يناسب احتياجاته.",
        model: "gpt-4o",
        temperature: 80,
        maxTokens: 4000,
        isActive: true
      },
      {
        scenarioKey: "marketing",
        title: "استراتيجيات التسويق",
        description: "مساعد متخصص في وضع وتطوير استراتيجيات التسويق وخطط الحملات الإعلانية",
        systemPrompt: "أنت مستشار متخصص في تطوير استراتيجيات التسويق. مهمتك مساعدة المستخدم في وضع خطط تسويقية فعالة وتحليل الأسواق والمنافسين. استمع لتحديات المستخدم وقدم استراتيجيات عملية وحلول مبتكرة.",
        model: "gpt-4o",
        temperature: 70,
        maxTokens: 4000,
        isActive: true
      }
    ];

    scenarios.forEach(scenario => {
      const id = this.aiScenarioIdCounter++;
      const timestamp = new Date();
      this.aiScenarios.set(id, { 
        ...scenario, 
        id, 
        createdAt: timestamp, 
        updatedAt: timestamp 
      });
    });
  }

  // Seed sample data for development
  private seedSampleData() {
    // Add an agency
    const agency: Agency = {
      id: this.agencyIdCounter++,
      name: "وكالة الرقمية",
      description: "وكالة متخصصة في الحلول الرقمية والتسويق",
      subscriptionPlan: "premium",
      status: "active",
      createdAt: new Date()
    };
    this.agencies.set(agency.id, agency);

    // Add an admin user
    const adminUser: User = {
      id: this.userIdCounter++,
      name: "أحمد المدير",
      email: "admin@taskaaya.com",
      role: "admin",
      agencyId: null,
      status: "active",
      createdAt: new Date()
    };
    this.users.set(adminUser.id, adminUser);

    // Add an agency user
    const agencyUser: User = {
      id: this.userIdCounter++,
      name: "مدير الوكالة",
      email: "agency@taskaaya.com",
      role: "agency",
      agencyId: agency.id,
      status: "active",
      createdAt: new Date()
    };
    this.users.set(agencyUser.id, agencyUser);

    // Add a client
    const client: Client = {
      id: this.clientIdCounter++,
      name: "شركة السلام",
      email: "client@example.com",
      phone: "01234567890",
      agencyId: agency.id,
      company: "شركة السلام للاستشارات الهندسية",
      createdAt: new Date()
    };
    this.clients.set(client.id, client);

    // Add a client user
    const clientUser: User = {
      id: this.userIdCounter++,
      name: "مدير شركة السلام",
      email: "client_user@taskaaya.com",
      role: "client",
      agencyId: agency.id,
      status: "active",
      createdAt: new Date()
    };
    this.users.set(clientUser.id, clientUser);

    // Add some employees
    const employee1: Employee = {
      id: this.employeeIdCounter++,
      name: "علي محمد",
      email: "ali@example.com",
      phone: "01234567891",
      agencyId: agency.id,
      position: "مطور ويب",
      createdAt: new Date()
    };
    this.employees.set(employee1.id, employee1);

    const employee2: Employee = {
      id: this.employeeIdCounter++,
      name: "سارة أحمد",
      email: "sara@example.com",
      phone: "01234567892",
      agencyId: agency.id,
      position: "مصممة UI/UX",
      createdAt: new Date()
    };
    this.employees.set(employee2.id, employee2);

    // Add an employee user
    const employeeUser: User = {
      id: this.userIdCounter++,
      name: "علي محمد",
      email: "employee@taskaaya.com",
      role: "employee",
      agencyId: agency.id,
      status: "active",
      createdAt: new Date()
    };
    this.users.set(employeeUser.id, employeeUser);

    // Add a project
    const project: Project = {
      id: this.projectIdCounter++,
      name: "تطوير موقع شركة السلام",
      description: "تطوير موقع إلكتروني متجاوب لشركة السلام للاستشارات الهندسية",
      clientId: client.id,
      agencyId: agency.id,
      createdBy: agencyUser.id,
      status: "open",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
      createdAt: new Date()
    };
    this.projects.set(project.id, project);

    // Add some subgoals
    const subgoal1: Subgoal = {
      id: this.subgoalIdCounter++,
      title: "تصميم واجهة المستخدم",
      description: "تصميم واجهة المستخدم للموقع بما يتناسب مع هوية الشركة",
      projectId: project.id,
      kpi: "تسليم تصاميم لجميع الصفحات الرئيسية",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days later
      createdAt: new Date()
    };
    this.subgoals.set(subgoal1.id, subgoal1);

    const subgoal2: Subgoal = {
      id: this.subgoalIdCounter++,
      title: "تطوير الواجهة الأمامية",
      description: "برمجة الواجهة الأمامية للموقع باستخدام React",
      projectId: project.id,
      kpi: "تنفيذ جميع الصفحات بدقة 100% مطابقة للتصميم",
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days later
      createdAt: new Date()
    };
    this.subgoals.set(subgoal2.id, subgoal2);

    // Add some tasks
    const task1: Task = {
      id: this.taskIdCounter++,
      title: "تصميم الصفحة الرئيسية",
      description: "تصميم واجهة المستخدم للصفحة الرئيسية للموقع",
      projectId: project.id,
      subgoalId: subgoal1.id,
      assignedTo: employee2.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
      status: "open",
      createdAt: new Date()
    };
    this.tasks.set(task1.id, task1);

    const task2: Task = {
      id: this.taskIdCounter++,
      title: "برمجة وظائف التسجيل",
      description: "برمجة وظائف تسجيل الدخول والتسجيل في الموقع",
      projectId: project.id,
      subgoalId: subgoal2.id,
      assignedTo: employee1.id,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days later
      status: "open",
      createdAt: new Date()
    };
    this.tasks.set(task2.id, task2);
    
    // Add wallet for agency
    const wallet: Wallet = {
      id: this.walletIdCounter++,
      agencyId: agency.id,
      balance: 5000.00,
      currency: "EGP",
      lastUpdated: new Date().toISOString(),
      createdAt: new Date()
    };
    this.wallets.set(wallet.id, wallet);
    
    // Add billing records
    const billing1: Billing = {
      id: this.billingIdCounter++,
      agencyId: agency.id,
      clientId: client.id,
      projectId: project.id,
      invoiceNumber: "INV-2025-001",
      amount: 2500.00,
      currency: "EGP",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: "unpaid",
      description: "دفعة أولى لمشروع تطوير موقع الويب",
      items: JSON.stringify([
        { description: "تصميم واجهة المستخدم", amount: 1500.00 },
        { description: "تطوير Frontend", amount: 1000.00 }
      ]),
      createdAt: new Date()
    };
    this.billings.set(billing1.id, billing1);
    
    const billing2: Billing = {
      id: this.billingIdCounter++,
      agencyId: agency.id,
      clientId: client.id,
      projectId: project.id,
      invoiceNumber: "INV-2025-002",
      amount: 1500.00,
      currency: "EGP",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "pending",
      description: "دفعة ثانية لمشروع تطوير موقع الويب",
      items: JSON.stringify([
        { description: "تطوير Backend", amount: 1500.00 }
      ]),
      createdAt: new Date()
    };
    this.billings.set(billing2.id, billing2);
    
    // Add a payment record
    const payment: Payment = {
      id: this.paymentIdCounter++,
      agencyId: agency.id,
      clientId: client.id,
      projectId: project.id,
      billingId: billing1.id,
      amount: 2500.00,
      status: "completed",
      paymentDate: new Date(),
      reference: "PAY-2025-001",
      createdAt: new Date()
    };
    this.payments.set(payment.id, payment);
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Agencies
  async getAgency(id: number): Promise<Agency | undefined> {
    return this.agencies.get(id);
  }

  async createAgency(agency: InsertAgency): Promise<Agency> {
    const id = this.agencyIdCounter++;
    const newAgency: Agency = { ...agency, id, createdAt: new Date() };
    this.agencies.set(id, newAgency);
    return newAgency;
  }

  async updateAgency(id: number, agency: Partial<InsertAgency>): Promise<Agency | undefined> {
    const existingAgency = this.agencies.get(id);
    if (!existingAgency) return undefined;
    
    const updatedAgency = { ...existingAgency, ...agency };
    this.agencies.set(id, updatedAgency);
    return updatedAgency;
  }

  async deleteAgency(id: number): Promise<boolean> {
    return this.agencies.delete(id);
  }

  async listAgencies(): Promise<Agency[]> {
    return Array.from(this.agencies.values());
  }

  // Clients
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientsByAgency(agencyId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(
      client => client.agencyId === agencyId
    );
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientIdCounter++;
    const newClient: Client = { ...client, id, createdAt: new Date() };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) return undefined;
    
    const updatedClient = { ...existingClient, ...client };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Employees
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeesByAgency(agencyId: number): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(
      employee => employee.agencyId === agencyId
    );
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.employeeIdCounter++;
    const newEmployee: Employee = { ...employee, id, createdAt: new Date() };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existingEmployee = this.employees.get(id);
    if (!existingEmployee) return undefined;
    
    const updatedEmployee = { ...existingEmployee, ...employee };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Projects
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByAgency(agencyId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.agencyId === agencyId
    );
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.clientId === clientId
    );
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const newProject: Project = { ...project, id, createdAt: new Date() };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Subgoals
  async getSubgoal(id: number): Promise<Subgoal | undefined> {
    return this.subgoals.get(id);
  }

  async getSubgoalsByProject(projectId: number): Promise<Subgoal[]> {
    return Array.from(this.subgoals.values()).filter(
      subgoal => subgoal.projectId === projectId
    );
  }

  async createSubgoal(subgoal: InsertSubgoal): Promise<Subgoal> {
    const id = this.subgoalIdCounter++;
    const newSubgoal: Subgoal = { ...subgoal, id, createdAt: new Date() };
    this.subgoals.set(id, newSubgoal);
    return newSubgoal;
  }

  async updateSubgoal(id: number, subgoal: Partial<InsertSubgoal>): Promise<Subgoal | undefined> {
    const existingSubgoal = this.subgoals.get(id);
    if (!existingSubgoal) return undefined;
    
    const updatedSubgoal = { ...existingSubgoal, ...subgoal };
    this.subgoals.set(id, updatedSubgoal);
    return updatedSubgoal;
  }

  async deleteSubgoal(id: number): Promise<boolean> {
    return this.subgoals.delete(id);
  }

  // Tasks
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.projectId === projectId
    );
  }

  async getTasksBySubgoal(subgoalId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.subgoalId === subgoalId
    );
  }

  async getTasksByEmployee(employeeId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.assignedTo === employeeId
    );
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const newTask: Task = { ...task, id, createdAt: new Date() };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask = { ...existingTask, ...task };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Task Submissions
  async getTaskSubmission(id: number): Promise<TaskSubmission | undefined> {
    return this.taskSubmissions.get(id);
  }

  async getTaskSubmissionsByTask(taskId: number): Promise<TaskSubmission[]> {
    return Array.from(this.taskSubmissions.values()).filter(
      submission => submission.taskId === taskId
    );
  }

  async createTaskSubmission(submission: InsertTaskSubmission): Promise<TaskSubmission> {
    const id = this.taskSubmissionIdCounter++;
    const now = new Date();
    const newSubmission: TaskSubmission = { 
      ...submission, 
      id, 
      submittedAt: now,
      createdAt: now
    };
    this.taskSubmissions.set(id, newSubmission);
    return newSubmission;
  }

  async updateTaskSubmission(id: number, submission: Partial<InsertTaskSubmission>): Promise<TaskSubmission | undefined> {
    const existingSubmission = this.taskSubmissions.get(id);
    if (!existingSubmission) return undefined;
    
    const updatedSubmission = { ...existingSubmission, ...submission };
    this.taskSubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  // Notifications
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      notification => notification.userId === userId
    );
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const newNotification: Notification = { ...notification, id, createdAt: new Date() };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Files
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByProject(projectId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      file => file.linkedType === 'project' && file.linkedId === projectId
    );
  }

  async getFilesByTask(taskId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      file => file.linkedType === 'task' && file.linkedId === taskId
    );
  }

  async createFile(file: InsertFile): Promise<File> {
    const id = this.fileIdCounter++;
    const newFile: File = { ...file, id, uploadedAt: new Date() };
    this.files.set(id, newFile);
    return newFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  // AI Scenarios
  async getAiScenario(id: number): Promise<AiScenario | undefined> {
    return this.aiScenarios.get(id);
  }

  async getAiScenarioByKey(scenarioKey: string): Promise<AiScenario | undefined> {
    return Array.from(this.aiScenarios.values()).find(
      scenario => scenario.scenarioKey === scenarioKey
    );
  }

  async listAiScenarios(): Promise<AiScenario[]> {
    return Array.from(this.aiScenarios.values());
  }

  async listActiveAiScenarios(): Promise<AiScenario[]> {
    return Array.from(this.aiScenarios.values()).filter(
      scenario => scenario.isActive
    );
  }

  async createAiScenario(scenario: InsertAiScenario): Promise<AiScenario> {
    const id = this.aiScenarioIdCounter++;
    const timestamp = new Date();
    const newScenario: AiScenario = { 
      ...scenario, 
      id, 
      createdAt: timestamp, 
      updatedAt: timestamp 
    };
    this.aiScenarios.set(id, newScenario);
    return newScenario;
  }

  async updateAiScenario(id: number, scenario: Partial<InsertAiScenario>): Promise<AiScenario | undefined> {
    const existingScenario = this.aiScenarios.get(id);
    if (!existingScenario) return undefined;
    
    const updatedScenario = { 
      ...existingScenario, 
      ...scenario, 
      updatedAt: new Date() 
    };
    this.aiScenarios.set(id, updatedScenario);
    return updatedScenario;
  }

  async deleteAiScenario(id: number): Promise<boolean> {
    return this.aiScenarios.delete(id);
  }

  // AI Usage Logs
  async createAiUsageLog(log: InsertAiUsageLog): Promise<AiUsageLog> {
    const id = this.aiUsageLogIdCounter++;
    const newLog: AiUsageLog = { ...log, id, createdAt: new Date() };
    this.aiUsageLogs.set(id, newLog);
    return newLog;
  }

  async getAiUsageLogsByAgency(agencyId: number): Promise<AiUsageLog[]> {
    return Array.from(this.aiUsageLogs.values()).filter(
      log => log.agencyId === agencyId
    );
  }

  // Payments
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByAgency(agencyId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.agencyId === agencyId
    );
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const newPayment: Payment = { ...payment, id, createdAt: new Date() };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) return undefined;
    
    const updatedPayment = { ...existingPayment, ...payment };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // AI Chat Logs
  async createAiChatLog(log: InsertAiChatLog): Promise<AiChatLog> {
    const id = this.aiChatLogIdCounter++;
    const newLog: AiChatLog = { ...log, id, createdAt: new Date() };
    this.aiChatLogs.set(id, newLog);
    return newLog;
  }

  async getAiChatLogsByAgency(agencyId: number): Promise<AiChatLog[]> {
    return Array.from(this.aiChatLogs.values()).filter(
      log => log.agencyId === agencyId
    );
  }
  
  // Daily Standups
  async getDailyStandup(id: number): Promise<DailyStandup | undefined> {
    return this.dailyStandups.get(id);
  }
  
  async getDailyStandupByEmployeeAndDate(employeeId: number, date: Date): Promise<DailyStandup | undefined> {
    const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    return Array.from(this.dailyStandups.values()).find(
      standup => 
        standup.employeeId === employeeId && 
        standup.date.toISOString().split('T')[0] === dateStr
    );
  }
  
  async getEmployeeDailyStandups(employeeId: number): Promise<DailyStandup[]> {
    return Array.from(this.dailyStandups.values())
      .filter(standup => standup.employeeId === employeeId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getAgencyDailyStandups(agencyId: number, date?: Date): Promise<DailyStandup[]> {
    let standups = Array.from(this.dailyStandups.values())
      .filter(standup => standup.agencyId === agencyId);
    
    if (date) {
      const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      standups = standups.filter(
        standup => standup.date.toISOString().split('T')[0] === dateStr
      );
    }
    
    return standups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createDailyStandup(standup: InsertDailyStandup): Promise<DailyStandup> {
    const id = this.dailyStandupIdCounter++;
    const timestamp = new Date();
    const newStandup: DailyStandup = {
      ...standup,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: standup.status || 'open',
      tasksDone: standup.tasksDone || [],
      dayTasks: standup.dayTasks || []
    };
    this.dailyStandups.set(id, newStandup);
    return newStandup;
  }
  
  async updateDailyStandup(id: number, standup: Partial<InsertDailyStandup>): Promise<DailyStandup | undefined> {
    const existingStandup = this.dailyStandups.get(id);
    if (!existingStandup) return undefined;
    
    const updatedStandup: DailyStandup = {
      ...existingStandup,
      ...standup,
      updatedAt: new Date()
    };
    
    this.dailyStandups.set(id, updatedStandup);
    return updatedStandup;
  }
  
  async closeDailyStandup(id: number, tasksDone: number[], comments?: string, rating?: number): Promise<DailyStandup | undefined> {
    const existingStandup = this.dailyStandups.get(id);
    if (!existingStandup) return undefined;
    
    const updatedStandup: DailyStandup = {
      ...existingStandup,
      tasksDone,
      comments: comments || existingStandup.comments,
      dayRating: rating !== undefined ? rating : existingStandup.dayRating,
      status: 'closed',
      updatedAt: new Date()
    };
    
    this.dailyStandups.set(id, updatedStandup);
    return updatedStandup;
  }
  
  async reviewDailyStandup(id: number, reviewerId: number, comments: string): Promise<DailyStandup | undefined> {
    const existingStandup = this.dailyStandups.get(id);
    if (!existingStandup) return undefined;
    
    const updatedStandup: DailyStandup = {
      ...existingStandup,
      reviewedBy: reviewerId,
      reviewComments: comments,
      updatedAt: new Date()
    };
    
    this.dailyStandups.set(id, updatedStandup);
    return updatedStandup;
  }
  
  async deleteDailyStandup(id: number): Promise<boolean> {
    return this.dailyStandups.delete(id);
  }
  
  // Billing operations
  async getBilling(id: number): Promise<Billing | undefined> {
    return this.billings.get(id);
  }
  
  async getBillingsByAgency(agencyId: number): Promise<Billing[]> {
    return Array.from(this.billings.values()).filter(
      billing => billing.agencyId === agencyId
    );
  }
  
  async getAllBillings(): Promise<Billing[]> {
    return Array.from(this.billings.values());
  }
  
  async createBilling(billing: InsertBilling): Promise<Billing> {
    const id = this.billingIdCounter++;
    const newBilling: Billing = { ...billing, id, createdAt: new Date() };
    this.billings.set(id, newBilling);
    return newBilling;
  }
  
  async updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined> {
    const existingBilling = this.billings.get(id);
    if (!existingBilling) return undefined;
    
    const updatedBilling = { ...existingBilling, ...billing };
    this.billings.set(id, updatedBilling);
    return updatedBilling;
  }
  
  // Wallet operations
  async getWalletByAgency(agencyId: number): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      wallet => wallet.agencyId === agencyId
    );
  }
  
  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const id = this.walletIdCounter++;
    const newWallet: Wallet = { 
      ...wallet, 
      id, 
      createdAt: new Date(),
      lastUpdated: wallet.lastUpdated || new Date().toISOString()
    };
    this.wallets.set(id, newWallet);
    return newWallet;
  }
  
  async updateWallet(id: number, wallet: Partial<InsertWallet>): Promise<Wallet | undefined> {
    const existingWallet = this.wallets.get(id);
    if (!existingWallet) return undefined;
    
    const updatedWallet = { 
      ...existingWallet, 
      ...wallet,
      lastUpdated: wallet.lastUpdated || new Date().toISOString()
    };
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }
}

// تحديد نوع التخزين بناءً على البيئة أو متغيرات البيئة
// Using in-memory storage for easier development and testing
export const storage = new MemStorage();
