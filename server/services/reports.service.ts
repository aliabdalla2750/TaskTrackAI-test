import { storage } from "../storage";
import { db } from "../db";
import { and, between, desc, eq, gte, lte } from "drizzle-orm";
import { 
  tasks, 
  projects, 
  weeklyReportsSent, 
  monthlyReportsCache,
  clients,
  employees
} from "@shared/schema";
import type { 
  WeeklyReport, 
  InsertWeeklyReport, 
  MonthlyReport, 
  InsertMonthlyReport,
  Client
} from "@shared/schema";

/**
 * تاريخ بداية الأسبوع الحالي (الأحد)
 */
export function getCurrentWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = الأحد، 1 = الاثنين، ...
  const diff = now.getDate() - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

/**
 * تاريخ نهاية الأسبوع الحالي (السبت)
 */
export function getCurrentWeekEnd(): Date {
  const weekStart = getCurrentWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * الحصول على سلسلة الشهر بتنسيق "YYYY-MM"
 */
export function getMonthString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * الحصول على أول يوم في الشهر
 */
export function getMonthStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * الحصول على آخر يوم في الشهر
 */
export function getMonthEnd(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * خدمة التقارير
 */
export class ReportsService {
  /**
   * توليد وحفظ تقرير أسبوعي لعميل
   */
  async generateWeeklyReport(clientId: number, agencyId: number): Promise<WeeklyReport> {
    // الحصول على معلومات العميل
    const client = await storage.getClient(clientId);
    if (!client) {
      throw new Error(`لم يتم العثور على العميل بمعرف ${clientId}`);
    }
    
    // تاريخ بداية ونهاية الأسبوع
    const weekStart = getCurrentWeekStart();
    const weekEnd = getCurrentWeekEnd();
    
    // الحصول على مشاريع العميل
    const clientProjects = await storage.getProjectsByClient(clientId);
    
    // إعداد بيانات التقرير
    const reportData: any = {
      client: {
        id: client.id,
        name: client.name,
        company: client.company
      },
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      projects: await Promise.all(clientProjects.map(async (project) => {
        // الحصول على المهام المكتملة هذا الأسبوع
        const completedTasks = await db.select().from(tasks).where(
          and(
            eq(tasks.projectId, project.id),
            eq(tasks.status, "completed"),
            between(tasks.createdAt, weekStart, weekEnd)
          )
        );
        
        // الحصول على المهام المتأخرة
        const overdueTasks = await db.select().from(tasks).where(
          and(
            eq(tasks.projectId, project.id),
            eq(tasks.status, "overdue")
          )
        );
        
        // الحصول على جميع المهام للمشروع
        const allTasks = await storage.getTasksByProject(project.id);
        
        // حساب نسبة التقدم
        const progressPercentage = allTasks.length > 0 
          ? Math.round((allTasks.filter(t => t.status === "completed").length / allTasks.length) * 100) 
          : 0;
        
        return {
          id: project.id,
          name: project.name,
          progress: progressPercentage,
          completedTasksCount: completedTasks.length,
          overdueTasksCount: overdueTasks.length,
          allTasksCount: allTasks.length,
          startDate: project.startDate,
          endDate: project.endDate,
          status: project.status
        };
      }))
    };
    
    // حفظ التقرير في قاعدة البيانات
    const [savedReport] = await db.insert(weeklyReportsSent).values({
      clientId,
      agencyId,
      weekStart,
      weekEnd,
      status: "sent",
      method: "whatsapp",
      reportData,
    }).returning();
    
    return savedReport;
  }
  
  /**
   * الحصول على تقرير أسبوعي بواسطة معرف العميل
   */
  async getWeeklyReportByClient(clientId: number): Promise<WeeklyReport | undefined> {
    const weekStart = getCurrentWeekStart();
    const [report] = await db.select().from(weeklyReportsSent).where(
      and(
        eq(weeklyReportsSent.clientId, clientId),
        eq(weeklyReportsSent.weekStart, weekStart)
      )
    ).orderBy(desc(weeklyReportsSent.createdAt)).limit(1);
    
    return report;
  }
  
  /**
   * الحصول على جميع تقارير العميل الأسبوعية
   */
  async getAllClientWeeklyReports(clientId: number): Promise<WeeklyReport[]> {
    const reports = await db.select().from(weeklyReportsSent).where(
      eq(weeklyReportsSent.clientId, clientId)
    ).orderBy(desc(weeklyReportsSent.createdAt));
    
    return reports;
  }
  
  /**
   * توليد وحفظ تقرير شهري للوكالة
   */
  async generateMonthlyReport(agencyId: number): Promise<MonthlyReport> {
    // الحصول على معلومات الوكالة
    const agency = await storage.getAgency(agencyId);
    if (!agency) {
      throw new Error(`لم يتم العثور على الوكالة بمعرف ${agencyId}`);
    }
    
    // إعداد سلسلة الشهر وتواريخه
    const monthString = getMonthString();
    const monthStart = getMonthStart();
    const monthEnd = getMonthEnd();
    
    // الحصول على جميع المشاريع المفتوحة خلال الشهر
    const allProjects = await storage.getProjectsByAgency(agencyId);
    const openProjects = allProjects.filter(p => p.status === 'open');
    const completedProjects = allProjects.filter(
      p => p.status === 'completed' && p.createdAt >= monthStart && p.createdAt <= monthEnd
    );
    
    // الحصول على المهام خلال الشهر
    const allTasks = await Promise.all(allProjects.map(p => storage.getTasksByProject(p.id)));
    const flattenedTasks = allTasks.flat();
    const completedTasks = flattenedTasks.filter(t => t.status === 'completed');
    const overdueTasks = flattenedTasks.filter(t => t.status === 'overdue');
    
    // الحصول على الموظفين وأدائهم
    const allEmployees = await storage.getEmployeesByAgency(agencyId);
    const employeePerformance = await Promise.all(
      allEmployees.map(async (employee) => {
        const employeeTasks = await storage.getTasksByEmployee(employee.id);
        const completedByEmployee = employeeTasks.filter(t => 
          t.status === 'completed' && 
          t.createdAt >= monthStart && 
          t.createdAt <= monthEnd
        );
        
        return {
          id: employee.id,
          name: employee.name,
          position: employee.position,
          completedTasksCount: completedByEmployee.length,
          totalTasksCount: employeeTasks.length,
          completionRate: employeeTasks.length > 0 
            ? Math.round((completedByEmployee.length / employeeTasks.length) * 100) 
            : 0
        };
      })
    );
    
    // ترتيب الموظفين حسب الأداء
    const sortedEmployees = [...employeePerformance].sort(
      (a, b) => b.completedTasksCount - a.completedTasksCount
    );
    
    // الحصول على العملاء وأنشطتهم
    const allClients = await storage.getClientsByAgency(agencyId);
    const clientActivity = await Promise.all(
      allClients.map(async (client) => {
        const clientProjects = await storage.getProjectsByClient(client.id);
        const activeProjects = clientProjects.filter(p => p.status === 'open');
        
        return {
          id: client.id,
          name: client.name,
          company: client.company,
          projectsCount: clientProjects.length,
          activeProjectsCount: activeProjects.length
        };
      })
    );
    
    // ترتيب العملاء حسب النشاط
    const sortedClients = [...clientActivity].sort(
      (a, b) => b.activeProjectsCount - a.activeProjectsCount
    );
    
    // حساب معدل إنجاز المهام
    const taskCompletionRate = flattenedTasks.length > 0
      ? Math.round((completedTasks.length / flattenedTasks.length) * 100)
      : 0;
    
    // حساب معدل التأخير
    const lateTaskRate = flattenedTasks.length > 0
      ? Math.round((overdueTasks.length / flattenedTasks.length) * 100)
      : 0;
    
    // إحصائيات المالية (نموذجية لأغراض العرض)
    // في تطبيق حقيقي، ستكون هذه البيانات من جدول المدفوعات
    const financialStats = {
      totalRevenue: 0,
      pendingPayments: 0,
      averageProjectValue: 0
    };
    
    // إنشاء بيانات التقرير
    const reportData = {
      month: monthString,
      agency: {
        id: agency.id,
        name: agency.name
      },
      metrics: {
        openProjectsCount: openProjects.length,
        completedProjectsCount: completedProjects.length,
        taskCompletionRate,
        lateTaskRate,
        topPerformer: sortedEmployees.length > 0 ? sortedEmployees[0] : null,
        mostActiveClient: sortedClients.length > 0 ? sortedClients[0] : null,
      },
      projectsStats: {
        openProjects: openProjects.map(p => ({
          id: p.id,
          name: p.name,
          startDate: p.startDate,
          endDate: p.endDate
        })),
        completedProjects: completedProjects.map(p => ({
          id: p.id,
          name: p.name,
          startDate: p.startDate,
          endDate: p.endDate
        }))
      },
      employeesStats: {
        totalEmployees: allEmployees.length,
        performance: sortedEmployees
      },
      clientsStats: {
        totalClients: allClients.length,
        activity: sortedClients
      },
      financialStats
    };
    
    // التحقق من وجود تقرير سابق لهذا الشهر
    const existingReport = await this.getMonthlyReportByMonth(agencyId, monthString);
    
    if (existingReport) {
      // تحديث التقرير الموجود
      const [updatedReport] = await db.update(monthlyReportsCache)
        .set({
          metrics: reportData.metrics,
          projectsStats: reportData.projectsStats,
          employeesStats: reportData.employeesStats,
          clientsStats: reportData.clientsStats,
          financialStats: reportData.financialStats,
          generatedAt: new Date()
        })
        .where(eq(monthlyReportsCache.id, existingReport.id))
        .returning();
        
      return updatedReport;
    } else {
      // إنشاء تقرير جديد
      const [newReport] = await db.insert(monthlyReportsCache).values({
        agencyId,
        month: monthString,
        metrics: reportData.metrics,
        projectsStats: reportData.projectsStats,
        employeesStats: reportData.employeesStats,
        clientsStats: reportData.clientsStats,
        financialStats: reportData.financialStats
      }).returning();
      
      return newReport;
    }
  }
  
  /**
   * الحصول على تقرير شهري للوكالة حسب الشهر
   */
  async getMonthlyReportByMonth(agencyId: number, month: string): Promise<MonthlyReport | undefined> {
    const [report] = await db.select().from(monthlyReportsCache).where(
      and(
        eq(monthlyReportsCache.agencyId, agencyId),
        eq(monthlyReportsCache.month, month)
      )
    );
    
    return report;
  }
  
  /**
   * الحصول على آخر تقرير شهري للوكالة
   */
  async getLatestMonthlyReport(agencyId: number): Promise<MonthlyReport | undefined> {
    const [report] = await db.select().from(monthlyReportsCache)
      .where(eq(monthlyReportsCache.agencyId, agencyId))
      .orderBy(desc(monthlyReportsCache.generatedAt))
      .limit(1);
      
    return report;
  }
  
  /**
   * الحصول على جميع التقارير الشهرية للوكالة
   */
  async getAllMonthlyReports(agencyId: number): Promise<MonthlyReport[]> {
    const reports = await db.select().from(monthlyReportsCache)
      .where(eq(monthlyReportsCache.agencyId, agencyId))
      .orderBy(desc(monthlyReportsCache.month));
      
    return reports;
  }
  
  /**
   * توليد نص تقرير WhatsApp للعميل
   */
  generateWhatsAppReportText(client: Client, report: any): string {
    const clientName = client.name.split(' ')[0]; // استخدام الاسم الأول فقط
    const totalProjects = report.projects.length;
    const activeProjects = report.projects.filter((p: any) => p.status === 'open').length;
    const completedTasks = report.projects.reduce((sum: number, p: any) => sum + p.completedTasksCount, 0);
    const overdueTasks = report.projects.reduce((sum: number, p: any) => sum + p.overdueTasksCount, 0);
    
    let reportText = `*تقرير أسبوعي*: ${clientName}،\n\n`;
    reportText += `إليك ملخص التقدم في مشاريعك خلال هذا الأسبوع (${new Date(report.weekStart).toLocaleDateString('ar-EG')} - ${new Date(report.weekEnd).toLocaleDateString('ar-EG')}):\n\n`;
    
    if (totalProjects === 0) {
      reportText += "لا توجد مشاريع نشطة حاليًا.\n";
    } else {
      reportText += `📊 *نظرة عامة*:\n`;
      reportText += `- مشاريع نشطة: ${activeProjects}\n`;
      reportText += `- مهام تم إنجازها: ${completedTasks}\n`;
      reportText += overdueTasks > 0 ? `- مهام متأخرة: ${overdueTasks} ⚠️\n\n` : `- لا توجد مهام متأخرة ✅\n\n`;
      
      // تفاصيل المشاريع
      reportText += `*تفاصيل المشاريع*:\n`;
      report.projects.forEach((project: any, index: number) => {
        const progressEmoji = project.progress >= 75 ? "🟢" : 
                            project.progress >= 50 ? "🟡" : 
                            project.progress >= 25 ? "🟠" : "🔴";
                            
        reportText += `${index + 1}. *${project.name}* - ${progressEmoji} ${project.progress}%\n`;
        reportText += `   ✅ ${project.completedTasksCount} مهام مكتملة`;
        
        if (project.overdueTasksCount > 0) {
          reportText += ` | ⚠️ ${project.overdueTasksCount} مهام متأخرة`;
        }
        
        reportText += `\n`;
      });
    }
    
    reportText += `\n📱 *لمزيد من التفاصيل*، يرجى زيارة لوحة المعلومات الخاصة بك على الرابط: https://taskaaya.app/client/dashboard\n\n`;
    reportText += `مع خالص التقدير،\nفريق وكالة تاسكايا`;
    
    return reportText;
  }
}

export const reportsService = new ReportsService();