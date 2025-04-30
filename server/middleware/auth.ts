import { Request, Response, NextFunction } from "express";

// وظيفة الوسيط للتحقق من أن المستخدم مصادق عليه
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
  }
  next();
}

// وظيفة الوسيط للتحقق من أن المستخدم هو مستخدم من وكالة
export function isAgencyUser(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
  }
  
  if (req.user.role !== "agency" && req.user.role !== "agency_admin") {
    return res.status(403).json({ message: "ليس لديك صلاحية الوصول" });
  }
  
  next();
}

// وظيفة الوسيط للتحقق من أن المستخدم هو مستخدم من وكالة بصلاحيات إدارية
export function isAgencyAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
  }
  
  if (req.user.role !== "agency_admin") {
    return res.status(403).json({ message: "ليس لديك صلاحية الوصول" });
  }
  
  next();
}

// وظيفة الوسيط للتحقق من أن المستخدم هو عميل
export function isClient(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
  }
  
  if (req.user.role !== "client") {
    return res.status(403).json({ message: "ليس لديك صلاحية الوصول" });
  }
  
  next();
}

// وظيفة الوسيط للتحقق من أن المستخدم هو موظف
export function isEmployee(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
  }
  
  if (req.user.role !== "employee") {
    return res.status(403).json({ message: "ليس لديك صلاحية الوصول" });
  }
  
  next();
}

// وظيفة الوسيط للتحقق من أن المستخدم هو مدير النظام
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "ليس لديك صلاحية الوصول" });
  }
  
  next();
}