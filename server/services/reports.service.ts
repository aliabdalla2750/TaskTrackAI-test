import { storage } from "../storage";
import { format, subWeeks, startOfWeek, endOfWeek, parseISO, isAfter, isBefore } from "date-fns";
import { ar } from "date-fns/locale";

/**
 * خدمة التقارير
 */
class ReportsService {
  /**
   * الحصول على جميع التقارير الأسبوعية للوكالة
   * @param agencyId معرف الوكالة
   */
  async getAllWeeklyReports(agencyId: number) {
    // في تطبيق حقيقي، سيتم جلب البيانات من قاعدة البيانات
    // بما أننا نقوم بإنشاء عرض توضيحي، سنقوم بإنشاء بيانات وهمية
    
    // إنشاء تقارير وهمية للعرض التوضيحي
    const demoReports = this.generateDemoWeeklyReports(agencyId);
    
    return demoReports;
  }
  
  /**
   * إنشاء تقارير أسبوعية وهمية للعرض التوضيحي
   * @param agencyId معرف الوكالة
   */
  private generateDemoWeeklyReports(agencyId: number) {
    const now = new Date();
    
    // إنشاء تقارير أسبوعية لعملاء وهميين
    const clientIds = [1, 2, 3, 4]; // معرفات العملاء الوهميين
    
    const reports = [];
    
    for (const clientId of clientIds) {
      // إنشاء تقارير للأسابيع الماضية
      for (let i = 0; i < 3; i++) {
        const weekStart = format(subWeeks(startOfWeek(now), i), "yyyy-MM-dd");
        const weekEnd = format(subWeeks(endOfWeek(now), i), "yyyy-MM-dd");
        
        // تحديد ما إذا كان التقرير قد تم إرساله
        const sent = i === 0 ? Math.random() > 0.5 : true;
        
        reports.push({
          id: (clientId * 10) + i,
          agencyId,
          clientId,
          weekStart,
          weekEnd,
          sentAt: sent ? format(subWeeks(now, i), "yyyy-MM-dd") : null,
          status: sent ? "sent" : "pending",
          reportData: {
            projectsCount: Math.floor(Math.random() * 3) + 1,
            tasksCompleted: Math.floor(Math.random() * 15) + 5,
            tasksInProgress: Math.floor(Math.random() * 8) + 2,
            tasksDelayed: Math.floor(Math.random() * 3),
            completionRate: Math.floor(Math.random() * 30) + 70,
            achievements: [
              "إطلاق حملة تسويقية جديدة",
              "تحسين معدل التحويل بنسبة 15%",
              "إكمال تصميم الهوية البصرية"
            ],
            upcomingTasks: [
              "إعداد محتوى لوسائل التواصل الاجتماعي",
              "تحليل أداء الحملة السابقة",
              "بدء العمل على الفيديو الترويجي"
            ]
          }
        });
      }
    }
    
    return reports;
  }
  
  /**
   * إنشاء نص تقرير واتساب
   * @param client معلومات العميل
   * @param reportData بيانات التقرير
   */
  generateWhatsAppReportText(client: any, reportData: any): string {
    // تنسيق محتوى الرسالة
    return `*التقرير الأسبوعي - ${client.name}*
    
تحية طيبة ${client.name}،

هذا هو تقريرنا الأسبوعي عن مشاريعك الجارية:

*إحصائيات الأسبوع:*
• عدد المشاريع النشطة: ${reportData.projectsCount}
• المهام المكتملة: ${reportData.tasksCompleted}
• المهام قيد التنفيذ: ${reportData.tasksInProgress}
• معدل الإنجاز: ${reportData.completionRate}%

*الإنجازات:*
${reportData.achievements.map((item: string) => `• ${item}`).join('\n')}

*المهام القادمة:*
${reportData.upcomingTasks.map((item: string) => `• ${item}`).join('\n')}

يمكنك الاطلاع على التفاصيل الكاملة من خلال منصة Taskaaya.

فريق عمل Taskaaya
`;
  }
  
  /**
   * إنشاء تقرير أسبوعي لعميل
   * @param clientId معرف العميل
   * @param agencyId معرف الوكالة
   */
  async generateWeeklyReport(clientId: number, agencyId: number) {
    // في تطبيق حقيقي، سيتم جمع البيانات من المشاريع والمهام
    // للعرض التوضيحي، سنقوم بإنشاء بيانات وهمية
    
    const now = new Date();
    const weekStart = format(startOfWeek(now), "yyyy-MM-dd");
    const weekEnd = format(endOfWeek(now), "yyyy-MM-dd");
    
    const reportData = {
      projectsCount: Math.floor(Math.random() * 3) + 1,
      tasksCompleted: Math.floor(Math.random() * 15) + 5,
      tasksInProgress: Math.floor(Math.random() * 8) + 2,
      tasksDelayed: Math.floor(Math.random() * 3),
      completionRate: Math.floor(Math.random() * 30) + 70,
      achievements: [
        "إطلاق حملة تسويقية جديدة",
        "تحسين معدل التحويل بنسبة 15%",
        "إكمال تصميم الهوية البصرية"
      ],
      upcomingTasks: [
        "إعداد محتوى لوسائل التواصل الاجتماعي",
        "تحليل أداء الحملة السابقة",
        "بدء العمل على الفيديو الترويجي"
      ]
    };
    
    // إنشاء تقرير جديد
    const newReport = {
      id: Math.floor(Math.random() * 1000) + 100,
      agencyId,
      clientId,
      weekStart,
      weekEnd,
      sentAt: null,
      status: "pending",
      reportData
    };
    
    // في تطبيق حقيقي، سيتم حفظ التقرير في قاعدة البيانات
    // للعرض التوضيحي، سنعيد التقرير مباشرة
    
    return newReport;
  }
  
  /**
   * الحصول على التقارير الأسبوعية لعميل معين
   * @param clientId معرف العميل
   */
  async getAllClientWeeklyReports(clientId: number) {
    // للعرض التوضيحي، سنعيد تقارير وهمية
    const allReports = this.generateDemoWeeklyReports(1); // نفترض أن معرف الوكالة هو 1
    return allReports.filter(report => report.clientId === clientId);
  }
  
  /**
   * الحصول على أحدث تقرير أسبوعي لعميل
   * @param clientId معرف العميل
   */
  async getWeeklyReportByClient(clientId: number) {
    const reports = await this.getAllClientWeeklyReports(clientId);
    
    if (reports.length === 0) {
      return null;
    }
    
    // ترتيب التقارير بناءً على تاريخ الأسبوع (الأحدث أولاً)
    const sortedReports = reports.sort((a, b) => {
      const dateA = parseISO(a.weekStart);
      const dateB = parseISO(b.weekStart);
      return isAfter(dateA, dateB) ? -1 : 1;
    });
    
    return sortedReports[0];
  }
  
  /**
   * إنشاء تقرير شهري للوكالة
   * @param agencyId معرف الوكالة
   */
  async generateMonthlyReport(agencyId: number) {
    // في تطبيق حقيقي، سيتم جمع البيانات من المشاريع والمهام والتقارير الأسبوعية
    // للعرض التوضيحي، سنقوم بإنشاء بيانات وهمية
    
    const now = new Date();
    const monthStart = format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd");
    const monthEnd = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), "yyyy-MM-dd");
    
    const reportData = {
      totalProjects: Math.floor(Math.random() * 10) + 5,
      completedProjects: Math.floor(Math.random() * 3) + 1,
      activeProjects: Math.floor(Math.random() * 7) + 3,
      totalTasks: Math.floor(Math.random() * 50) + 30,
      tasksCompleted: Math.floor(Math.random() * 30) + 20,
      tasksInProgress: Math.floor(Math.random() * 20) + 10,
      averageCompletionRate: Math.floor(Math.random() * 20) + 80,
      clientSatisfaction: Math.floor(Math.random() * 1) + 4,
      topPerformers: [
        { name: "محمد أحمد", tasksCompleted: Math.floor(Math.random() * 15) + 10 },
        { name: "سارة علي", tasksCompleted: Math.floor(Math.random() * 15) + 10 },
        { name: "خالد محمود", tasksCompleted: Math.floor(Math.random() * 15) + 10 }
      ],
      keyAchievements: [
        "إتمام 3 حملات تسويقية ناجحة",
        "إطلاق موقع إلكتروني جديد لأحد العملاء",
        "زيادة متابعي العملاء على وسائل التواصل بنسبة 25%"
      ],
      challengesAndSolutions: [
        {
          challenge: "تأخير في تسليم المحتوى من بعض العملاء",
          solution: "إنشاء نظام تذكير آلي وتحديد مواعيد نهائية واضحة"
        },
        {
          challenge: "صعوبة في التنسيق بين الفرق المختلفة",
          solution: "تطبيق نظام إدارة مشاريع جديد وتحسين آلية التواصل الداخلي"
        }
      ],
      nextMonthPlan: [
        "إطلاق استراتيجية محتوى جديدة لعميلين رئيسيين",
        "تنفيذ نظام تحليل أداء محسن",
        "تطوير مهارات الفريق من خلال دورات تدريبية متخصصة"
      ],
      revenueAndCosts: {
        revenue: Math.floor(Math.random() * 50000) + 30000,
        costs: Math.floor(Math.random() * 20000) + 15000,
        profit: Math.floor(Math.random() * 30000) + 15000,
        revenueChange: Math.floor(Math.random() * 20) + 5
      }
    };
    
    // إنشاء تقرير جديد
    const newReport = {
      id: Math.floor(Math.random() * 1000) + 100,
      agencyId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      monthStart,
      monthEnd,
      createdAt: format(now, "yyyy-MM-dd"),
      reportData
    };
    
    // في تطبيق حقيقي، سيتم حفظ التقرير في قاعدة البيانات
    // للعرض التوضيحي، سنعيد التقرير مباشرة
    
    return newReport;
  }
  
  /**
   * الحصول على جميع التقارير الشهرية للوكالة
   * @param agencyId معرف الوكالة
   */
  async getAllMonthlyReports(agencyId: number) {
    // للعرض التوضيحي، سنعيد تقارير وهمية للأشهر السابقة
    const now = new Date();
    const reports = [];
    
    for (let i = 0; i < 6; i++) {
      const reportDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = format(new Date(reportDate.getFullYear(), reportDate.getMonth(), 1), "yyyy-MM-dd");
      const monthEnd = format(new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0), "yyyy-MM-dd");
      
      reports.push({
        id: 200 + i,
        agencyId,
        month: reportDate.getMonth() + 1,
        year: reportDate.getFullYear(),
        monthStart,
        monthEnd,
        createdAt: format(new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, -5), "yyyy-MM-dd"),
        reportData: {
          totalProjects: Math.floor(Math.random() * 10) + 5,
          completedProjects: Math.floor(Math.random() * 3) + 1,
          activeProjects: Math.floor(Math.random() * 7) + 3,
          totalTasks: Math.floor(Math.random() * 50) + 30,
          tasksCompleted: Math.floor(Math.random() * 30) + 20,
          tasksInProgress: Math.floor(Math.random() * 20) + 10,
          averageCompletionRate: Math.floor(Math.random() * 20) + 80,
          clientSatisfaction: Math.floor(Math.random() * 1) + 4,
          // باقي البيانات المماثلة للتقرير الشهري...
        }
      });
    }
    
    return reports;
  }
  
  /**
   * الحصول على أحدث تقرير شهري للوكالة
   * @param agencyId معرف الوكالة
   */
  async getLatestMonthlyReport(agencyId: number) {
    const reports = await this.getAllMonthlyReports(agencyId);
    
    if (reports.length === 0) {
      return null;
    }
    
    // ترتيب التقارير بناءً على التاريخ (الأحدث أولاً)
    const sortedReports = reports.sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.month - a.month;
    });
    
    return sortedReports[0];
  }
}

export const reportsService = new ReportsService();