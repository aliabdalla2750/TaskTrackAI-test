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

/**
 * Middleware to ensure the user has admin role
 */
export function isAdminUser(req: Request, res: Response, next: NextFunction) {
  // First ensure user is authenticated
  isAuthenticated(req, res, () => {
    if (req.user?.role === 'admin') {
      return next();
    }
    return res.status(403).json({ error: 'Unauthorized: Admin access required' });
  });
}

/**
 * Middleware to ensure the user has agency role
 */
export function isAgencyUser(req: Request, res: Response, next: NextFunction) {
  // First ensure user is authenticated
  isAuthenticated(req, res, () => {
    if (req.user?.role === 'agency' || req.user?.role === 'admin') {
      return next();
    }
    return res.status(403).json({ error: 'Unauthorized: Agency access required' });
  });
}

/**
 * Middleware to ensure the user has employee role
 */
export function isEmployeeUser(req: Request, res: Response, next: NextFunction) {
  // First ensure user is authenticated
  isAuthenticated(req, res, () => {
    if (req.user?.role === 'employee' || req.user?.role === 'admin') {
      return next();
    }
    return res.status(403).json({ error: 'Unauthorized: Employee access required' });
  });
}

/**
 * Middleware to ensure the user has client role
 */
export function isClientUser(req: Request, res: Response, next: NextFunction) {
  // First ensure user is authenticated
  isAuthenticated(req, res, () => {
    if (req.user?.role === 'client' || req.user?.role === 'admin') {
      return next();
    }
    return res.status(403).json({ error: 'Unauthorized: Client access required' });
  });
}