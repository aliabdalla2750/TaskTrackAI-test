import { Request, Response, Router } from "express";
import { reportsService } from "../services/reports.service";
import { whatsappService } from "../services/whatsapp.service";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth";
import { checkRole } from "../middleware/roles";

// إضافة تعريف لواجهة العميل إلى الـ Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        agencyId: number;
        role: string;
        name: string;
        email: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * مسارات API للتقارير
 */
export const reportsRouter = Router();

/**
 * @route GET /api/reports/weekly
 * @desc الحصول على التقارير الأسبوعية للوكالة
 * @access خاص (وكالة)
 */
reportsRouter.get(
  "/weekly",
  isAuthenticated,
  checkRole(["agency", "admin"]),
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.agencyId) {
        return res.status(400).json({ message: "معرف الوكالة مطلوب" });
      }
      
      // الحصول على التقارير الأسبوعية للوكالة
      const reports = await reportsService.getAllWeeklyReports(req.user.agencyId);
      
      return res.status(200).json(reports);
    } catch (error: any) {
      console.error("Error getting weekly reports:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route POST /api/reports/weekly/generate
 * @desc توليد تقرير أسبوعي لعميل
 * @access خاص (وكالة)
 */
reportsRouter.post(
  "/weekly/generate",
  isAuthenticated,
  checkRole(["agency", "admin"]),
  async (req: Request, res: Response) => {
    try {
      const { clientId } = req.body;
      
      if (!clientId) {
        return res.status(400).json({ message: "معرف العميل مطلوب" });
      }
      
      // التحقق من صلاحية العميل
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ message: "لم يتم العثور على العميل" });
      }
      
      // التحقق من أن العميل ينتمي للوكالة
      if (req.user?.agencyId && client.agencyId !== req.user.agencyId) {
        return res.status(403).json({ message: "غير مصرح لك بالوصول إلى هذا العميل" });
      }
      
      const agencyId = req.user?.agencyId || client.agencyId;
      
      // توليد التقرير
      const report = await reportsService.generateWeeklyReport(clientId, agencyId);
      
      return res.status(201).json(report);
    } catch (error: any) {
      console.error("Error generating weekly report:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route POST /api/reports/weekly/send/:reportId
 * @desc إرسال تقرير أسبوعي إلى العميل عبر WhatsApp
 * @access خاص (وكالة)
 */
reportsRouter.post(
  "/weekly/send/:reportId",
  isAuthenticated,
  checkRole(["agency", "admin"]),
  async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;
      
      // الحصول على التقرير
      const report = await storage.getWeeklyReport(parseInt(reportId));
      
      if (!report) {
        return res.status(404).json({ message: "لم يتم العثور على التقرير" });
      }
      
      // التحقق من صلاحية الوصول
      if (req.user?.agencyId && report.agencyId !== req.user.agencyId) {
        return res.status(403).json({ message: "غير مصرح لك بالوصول إلى هذا التقرير" });
      }
      
      // الحصول على معلومات العميل
      const client = await storage.getClient(report.clientId);
      
      if (!client) {
        return res.status(404).json({ message: "لم يتم العثور على العميل" });
      }
      
      // توليد نص التقرير
      const reportText = reportsService.generateWhatsAppReportText(client, report.reportData);
      
      // إرسال التقرير
      const sent = await whatsappService.sendReportToClient(client.id, reportText);
      
      if (sent) {
        // تحديث حالة التقرير
        await storage.updateWeeklyReportStatus(parseInt(reportId), "sent");
        return res.status(200).json({ message: "تم إرسال التقرير بنجاح" });
      } else {
        return res.status(500).json({ message: "فشل إرسال التقرير" });
      }
    } catch (error: any) {
      console.error("Error sending weekly report:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route GET /api/reports/weekly/client/:clientId
 * @desc الحصول على التقارير الأسبوعية لعميل
 * @access خاص (وكالة، عميل)
 */
reportsRouter.get(
  "/weekly/client/:clientId",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      
      // التحقق من صلاحية الوصول
      if (req.user?.role === "client" && req.user.id !== parseInt(clientId)) {
        return res.status(403).json({ message: "غير مصرح لك بالوصول إلى هذا العميل" });
      }
      
      // إذا كان المستخدم وكالة، تحقق من أن العميل ينتمي للوكالة
      if (req.user?.role === "agency") {
        const client = await storage.getClient(parseInt(clientId));
        
        if (!client || client.agencyId !== req.user.agencyId) {
          return res.status(403).json({ message: "غير مصرح لك بالوصول إلى هذا العميل" });
        }
      }
      
      // الحصول على التقارير
      const reports = await reportsService.getAllClientWeeklyReports(parseInt(clientId));
      
      return res.status(200).json(reports);
    } catch (error: any) {
      console.error("Error getting client weekly reports:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route GET /api/reports/weekly/latest/:clientId
 * @desc الحصول على آخر تقرير أسبوعي لعميل
 * @access خاص (وكالة، عميل)
 */
reportsRouter.get(
  "/weekly/latest/:clientId",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      
      // التحقق من صلاحية الوصول
      if (req.user?.role === "client" && req.user.id !== parseInt(clientId)) {
        return res.status(403).json({ message: "غير مصرح لك بالوصول إلى هذا العميل" });
      }
      
      // إذا كان المستخدم وكالة، تحقق من أن العميل ينتمي للوكالة
      if (req.user?.role === "agency") {
        const client = await storage.getClient(parseInt(clientId));
        
        if (!client || client.agencyId !== req.user.agencyId) {
          return res.status(403).json({ message: "غير مصرح لك بالوصول إلى هذا العميل" });
        }
      }
      
      // الحصول على التقرير
      const report = await reportsService.getWeeklyReportByClient(parseInt(clientId));
      
      if (!report) {
        return res.status(404).json({ message: "لم يتم العثور على تقرير" });
      }
      
      return res.status(200).json(report);
    } catch (error: any) {
      console.error("Error getting latest weekly report:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route POST /api/reports/monthly/generate
 * @desc توليد تقرير شهري للوكالة
 * @access خاص (وكالة)
 */
reportsRouter.post(
  "/monthly/generate",
  isAuthenticated,
  checkRole(["agency", "admin"]),
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.agencyId) {
        return res.status(400).json({ message: "معرف الوكالة مطلوب" });
      }
      
      // توليد التقرير
      const report = await reportsService.generateMonthlyReport(req.user.agencyId);
      
      return res.status(201).json(report);
    } catch (error: any) {
      console.error("Error generating monthly report:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route GET /api/reports/monthly/agency/:agencyId
 * @desc الحصول على التقارير الشهرية للوكالة
 * @access خاص (وكالة)
 */
reportsRouter.get(
  "/monthly/agency/:agencyId",
  isAuthenticated,
  checkRole(["agency", "admin"]),
  async (req: Request, res: Response) => {
    try {
      const { agencyId } = req.params;
      
      // التحقق من صلاحية الوصول
      if (req.user?.role === "agency" && req.user.agencyId !== parseInt(agencyId)) {
        return res.status(403).json({ message: "غير مصرح لك بالوصول إلى هذه الوكالة" });
      }
      
      // الحصول على التقارير
      const reports = await reportsService.getAllMonthlyReports(parseInt(agencyId));
      
      return res.status(200).json(reports);
    } catch (error: any) {
      console.error("Error getting agency monthly reports:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route GET /api/reports/monthly/latest/:agencyId
 * @desc الحصول على آخر تقرير شهري للوكالة
 * @access خاص (وكالة)
 */
reportsRouter.get(
  "/monthly/latest/:agencyId",
  isAuthenticated,
  checkRole(["agency", "admin"]),
  async (req: Request, res: Response) => {
    try {
      const { agencyId } = req.params;
      
      // التحقق من صلاحية الوصول
      if (req.user?.role === "agency" && req.user.agencyId !== parseInt(agencyId)) {
        return res.status(403).json({ message: "غير مصرح لك بالوصول إلى هذه الوكالة" });
      }
      
      // الحصول على التقرير
      const report = await reportsService.getLatestMonthlyReport(parseInt(agencyId));
      
      if (!report) {
        return res.status(404).json({ message: "لم يتم العثور على تقرير" });
      }
      
      return res.status(200).json(report);
    } catch (error: any) {
      console.error("Error getting latest monthly report:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);