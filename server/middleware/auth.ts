import { Request, Response, NextFunction } from "express";

/**
 * Middleware to ensure the user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // توقيت ديمو، يتم تخطي التحقق من المصادقة
  // في التطبيق الفعلي، سيتم التحقق من جلسة المستخدم
  
  // إضافة بيانات المستخدم الافتراضية للديمو
  req.user = {
    id: 1,
    agencyId: 1,
    role: "agency",
    name: "أحمد محمد",
    email: "ahmed@example.com"
  };
  
  next();
}