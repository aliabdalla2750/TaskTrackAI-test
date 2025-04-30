import { Router } from "express";
import { isAgencyUser, isAuthenticated } from "../middleware/auth";
import { reportsService } from "../services/reports.service";
import { z } from "zod";

const reportsRouter = Router();

// تعريف مخطط التحقق من صحة معاملات إنشاء تقرير أسبوعي
const createWeeklyReportSchema = z.object({
  clientId: z.number(),
  agencyId: z.number(),
  weekStart: z.string(),
  weekEnd: z.string(),
  reportData: z.any()
});

// تعريف مخطط التحقق من صحة معاملات إنشاء تقرير شهري
const createMonthlyReportSchema = z.object({
  agencyId: z.number(),
  month: z.string(),
  metrics: z.any(),
  projectsStats: z.any(),
  employeesStats: z.any(),
  clientsStats: z.any(),
  financialStats: z.any()
});

// تعريف مخطط التحقق من صحة معاملات إرسال التقرير
const sendReportSchema = z.object({
  reportId: z.number(),
  recipient: z.string().email()
});

const sendWhatsAppReportSchema = z.object({
  reportId: z.number(),
  phoneNumber: z.string()
});

// ======== مسارات التقارير الأسبوعية ========

// الحصول على تقرير أسبوعي بواسطة المعرف
reportsRouter.get("/weekly/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const report = await reportsService.getWeeklyReport(id);
    
    if (!report) {
      return res.status(404).json({ message: "التقرير غير موجود" });
    }
    
    res.json({ report });
  } catch (error) {
    console.error("خطأ في الحصول على التقرير الأسبوعي:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// الحصول على التقارير الأسبوعية الخاصة بعميل معين
reportsRouter.get("/weekly/client/:clientId", isAuthenticated, async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const reports = await reportsService.getWeeklyReportsByClient(clientId);
    
    res.json({ reports });
  } catch (error) {
    console.error("خطأ في الحصول على التقارير الأسبوعية للعميل:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// الحصول على التقارير الأسبوعية الخاصة بوكالة معينة
reportsRouter.get("/weekly/agency/:agencyId", isAgencyUser, async (req, res) => {
  try {
    const agencyId = parseInt(req.params.agencyId);
    const reports = await reportsService.getWeeklyReportsByAgency(agencyId);
    
    res.json({ reports });
  } catch (error) {
    console.error("خطأ في الحصول على التقارير الأسبوعية للوكالة:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// إنشاء تقرير أسبوعي جديد
reportsRouter.post("/weekly", isAgencyUser, async (req, res) => {
  try {
    // التحقق من صحة البيانات المدخلة
    const validationResult = createWeeklyReportSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "البيانات غير صالحة", 
        errors: validationResult.error.errors 
      });
    }
    
    const reportData = validationResult.data;
    const newReport = await reportsService.createWeeklyReport(reportData);
    
    res.status(201).json({ report: newReport });
  } catch (error) {
    console.error("خطأ في إنشاء التقرير الأسبوعي:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// تحديث حالة تقرير أسبوعي
reportsRouter.patch("/weekly/:id/status", isAgencyUser, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "الحالة مطلوبة وتجب أن تكون نصية" });
    }
    
    const updatedReport = await reportsService.updateWeeklyReportStatus(id, status);
    
    if (!updatedReport) {
      return res.status(404).json({ message: "التقرير غير موجود" });
    }
    
    res.json({ report: updatedReport });
  } catch (error) {
    console.error("خطأ في تحديث حالة التقرير الأسبوعي:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// إرسال تقرير أسبوعي عبر البريد الإلكتروني
reportsRouter.post("/weekly/send-email", isAgencyUser, async (req, res) => {
  try {
    // التحقق من صحة البيانات المدخلة
    const validationResult = sendReportSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "البيانات غير صالحة", 
        errors: validationResult.error.errors 
      });
    }
    
    const { reportId, recipient } = validationResult.data;
    const success = await reportsService.sendWeeklyReportByEmail(reportId, recipient);
    
    if (!success) {
      return res.status(400).json({ message: "فشل في إرسال التقرير" });
    }
    
    res.json({ message: "تم إرسال التقرير بنجاح" });
  } catch (error) {
    console.error("خطأ في إرسال التقرير الأسبوعي بالبريد الإلكتروني:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// إرسال تقرير أسبوعي عبر واتساب
reportsRouter.post("/weekly/send-whatsapp", isAgencyUser, async (req, res) => {
  try {
    // التحقق من صحة البيانات المدخلة
    const validationResult = sendWhatsAppReportSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "البيانات غير صالحة", 
        errors: validationResult.error.errors 
      });
    }
    
    const { reportId, phoneNumber } = validationResult.data;
    const success = await reportsService.sendWeeklyReportByWhatsApp(reportId, phoneNumber);
    
    if (!success) {
      return res.status(400).json({ message: "فشل في إرسال التقرير" });
    }
    
    res.json({ message: "تم إرسال التقرير بنجاح" });
  } catch (error) {
    console.error("خطأ في إرسال التقرير الأسبوعي عبر واتساب:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// تصدير تقرير أسبوعي بصيغة PDF
reportsRouter.get("/weekly/:id/export-pdf", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pdfBuffer = await reportsService.exportWeeklyReportToPdf(id);
    
    if (!pdfBuffer) {
      return res.status(400).json({ message: "فشل في تصدير التقرير" });
    }
    
    // تحديد اسم الملف
    const report = await reportsService.getWeeklyReport(id);
    const filename = report 
      ? `تقرير_أسبوعي_${report.weekStart}_${report.weekEnd}.pdf` 
      : `تقرير_أسبوعي_${id}.pdf`;
    
    // إرسال الملف
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("خطأ في تصدير التقرير الأسبوعي بصيغة PDF:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// ======== مسارات التقارير الشهرية ========

// الحصول على تقرير شهري بواسطة المعرف
reportsRouter.get("/monthly/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const report = await reportsService.getMonthlyReport(id);
    
    if (!report) {
      return res.status(404).json({ message: "التقرير غير موجود" });
    }
    
    res.json({ report });
  } catch (error) {
    console.error("خطأ في الحصول على التقرير الشهري:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// الحصول على التقارير الشهرية الخاصة بوكالة معينة
reportsRouter.get("/monthly/agency/:agencyId", isAgencyUser, async (req, res) => {
  try {
    const agencyId = parseInt(req.params.agencyId);
    const reports = await reportsService.getMonthlyReportsByAgency(agencyId);
    
    res.json({ reports });
  } catch (error) {
    console.error("خطأ في الحصول على التقارير الشهرية للوكالة:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// الحصول على تقرير شهري بناءً على الشهر
reportsRouter.get("/monthly/agency/:agencyId/month/:month", isAgencyUser, async (req, res) => {
  try {
    const agencyId = parseInt(req.params.agencyId);
    const { month } = req.params;
    
    const report = await reportsService.getMonthlyReportByMonth(agencyId, month);
    
    if (!report) {
      return res.status(404).json({ message: "التقرير غير موجود" });
    }
    
    res.json({ report });
  } catch (error) {
    console.error("خطأ في الحصول على التقرير الشهري:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// إنشاء تقرير شهري جديد
reportsRouter.post("/monthly", isAgencyUser, async (req, res) => {
  try {
    // التحقق من صحة البيانات المدخلة
    const validationResult = createMonthlyReportSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "البيانات غير صالحة", 
        errors: validationResult.error.errors 
      });
    }
    
    const reportData = validationResult.data;
    const newReport = await reportsService.createMonthlyReport(reportData);
    
    res.status(201).json({ report: newReport });
  } catch (error) {
    console.error("خطأ في إنشاء التقرير الشهري:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// إرسال تقرير شهري عبر البريد الإلكتروني
reportsRouter.post("/monthly/send-email", isAgencyUser, async (req, res) => {
  try {
    // التحقق من صحة البيانات المدخلة
    const validationResult = sendReportSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "البيانات غير صالحة", 
        errors: validationResult.error.errors 
      });
    }
    
    const { reportId, recipient } = validationResult.data;
    const success = await reportsService.sendMonthlyReportByEmail(reportId, recipient);
    
    if (!success) {
      return res.status(400).json({ message: "فشل في إرسال التقرير" });
    }
    
    res.json({ message: "تم إرسال التقرير بنجاح" });
  } catch (error) {
    console.error("خطأ في إرسال التقرير الشهري بالبريد الإلكتروني:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// تصدير تقرير شهري بصيغة PDF
reportsRouter.get("/monthly/:id/export-pdf", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pdfBuffer = await reportsService.exportMonthlyReportToPdf(id);
    
    if (!pdfBuffer) {
      return res.status(400).json({ message: "فشل في تصدير التقرير" });
    }
    
    // تحديد اسم الملف
    const report = await reportsService.getMonthlyReport(id);
    const filename = report 
      ? `تقرير_شهري_${report.month}.pdf` 
      : `تقرير_شهري_${id}.pdf`;
    
    // إرسال الملف
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("خطأ في تصدير التقرير الشهري بصيغة PDF:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// ======== مسارات التقارير اليومية ========

// إرسال تقرير يومي عبر البريد الإلكتروني
reportsRouter.post("/daily-standup/send-email", isAgencyUser, async (req, res) => {
  try {
    const { standupId, recipient } = req.body;
    
    if (!standupId || !recipient) {
      return res.status(400).json({ message: "معرف التقرير اليومي والمستلم مطلوبان" });
    }
    
    const success = await reportsService.sendDailyStandupByEmail(standupId, recipient);
    
    if (!success) {
      return res.status(400).json({ message: "فشل في إرسال التقرير" });
    }
    
    res.json({ message: "تم إرسال التقرير بنجاح" });
  } catch (error) {
    console.error("خطأ في إرسال التقرير اليومي بالبريد الإلكتروني:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

// تصدير تقرير يومي بصيغة PDF
reportsRouter.get("/daily-standup/:id/export-pdf", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pdfBuffer = await reportsService.exportDailyStandupToPdf(id);
    
    if (!pdfBuffer) {
      return res.status(400).json({ message: "فشل في تصدير التقرير" });
    }
    
    // تحديد اسم الملف
    const standup = await reportsService.getWeeklyReport(id);
    const filename = standup 
      ? `تقرير_يومي_${standup.id}.pdf` 
      : `تقرير_يومي_${id}.pdf`;
    
    // إرسال الملف
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("خطأ في تصدير التقرير اليومي بصيغة PDF:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
});

export { reportsRouter };