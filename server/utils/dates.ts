/**
 * تنسيق التاريخ للعرض
 * @param dateString التاريخ كنص أو كائن Date
 * @returns تاريخ منسق مثل "٢٥ أبريل ٢٠٢٥"
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // تنسيق لغة عربية
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * الحصول على تاريخ البداية للأسبوع
 * @param date التاريخ المرجعي
 * @returns تاريخ بداية الأسبوع (الأحد)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
}

/**
 * الحصول على تاريخ نهاية الأسبوع
 * @param date التاريخ المرجعي
 * @returns تاريخ نهاية الأسبوع (السبت)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const diff = date.getDate() + (6 - day);
  return new Date(date.setDate(diff));
}

/**
 * الحصول على أول يوم في الشهر
 * @param date التاريخ المرجعي
 * @returns تاريخ أول الشهر
 */
export function getMonthStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * الحصول على آخر يوم في الشهر
 * @param date التاريخ المرجعي
 * @returns تاريخ آخر الشهر
 */
export function getMonthEnd(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * تحويل التاريخ إلى تنسيق ISO
 * @param date التاريخ
 * @returns تاريخ بتنسيق ISO مثل "2025-04-26"
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * الحصول على اسم الشهر والسنة بتنسيق "أبريل 2025"
 * @param date التاريخ
 * @returns نص يمثل الشهر والسنة
 */
export function getMonthYearString(date: Date = new Date()): string {
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long'
  });
}