import { Request, Response, NextFunction } from "express";

/**
 * Middleware للتحقق من صلاحيات المستخدم
 */
export function checkRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "يجب تسجيل الدخول" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "غير مصرح لك بالوصول" });
    }

    next();
  };
}