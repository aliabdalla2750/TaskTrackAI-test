import { storage } from "../storage";
import { MailService } from '@sendgrid/mail';
import { formatDate, getMonthYearString, toISODate } from "../utils/dates";
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import axios from 'axios';

// تحويل exec إلى وعد
const execPromise = util.promisify(exec);

// تهيئة خدمة البريد الإلكتروني
const mailService = new MailService();

// تعيين مفتاح API لخدمة SendGrid (إذا كان متاحًا)
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

// الدالة التي تقوم بتوليد ملف PDF من HTML
async function generatePdfFromHtml(html: string, outputPath: string): Promise<boolean> {
  try {
    // استخدام wkhtmltopdf لتحويل HTML إلى PDF
    // ملاحظة: يجب تثبيت wkhtmltopdf على الخادم
    const tempHtmlPath = path.join(process.cwd(), 'temp', 'report-temp.html');
    
    // التأكد من وجود مجلد temp
    if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'temp'), { recursive: true });
    }
    
    // كتابة HTML في ملف مؤقت
    fs.writeFileSync(tempHtmlPath, html);
    
    // تنفيذ الأمر لتحويل HTML إلى PDF
    await execPromise(`wkhtmltopdf ${tempHtmlPath} ${outputPath}`);
    
    // التحقق من إنشاء الملف بنجاح
    return fs.existsSync(outputPath);
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
}

// الدالة المسؤولة عن إرسال التقارير عبر واتساب
async function sendWhatsAppMessage(phoneNumber: string, message: string, mediaUrl?: string): Promise<boolean> {
  try {
    // هنا سيتم استخدام API لخدمة واتساب مثل Twilio أو MessageBird
    // هذا مثال لاستخدام Twilio API
    
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.error("Twilio credentials not found");
      return false;
    }
    
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';
    
    // تنسيق رقم الهاتف
    const formattedPhoneNumber = `whatsapp:${phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber}`;
    
    // إعداد بيانات الرسالة
    const messageData: any = {
      body: message,
      from: `whatsapp:${twilioWhatsAppNumber}`,
      to: formattedPhoneNumber
    };
    
    // إضافة رابط وسائط إذا كان متوفرًا
    if (mediaUrl) {
      messageData.mediaUrl = [mediaUrl];
    }
    
    // إرسال الرسالة باستخدام Twilio API
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      new URLSearchParams(messageData),
      {
        auth: {
          username: twilioSid,
          password: twilioToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return response.status === 201;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}

// ===== خدمة التقارير الأسبوعية =====

class ReportsService {
  // الحصول على تقرير أسبوعي بواسطة المعرف
  async getWeeklyReport(id: number) {
    return storage.getWeeklyReport(id);
  }
  
  // الحصول على التقارير الأسبوعية الخاصة بعميل معين
  async getWeeklyReportsByClient(clientId: number) {
    return storage.getWeeklyReportsByClient(clientId);
  }
  
  // الحصول على التقارير الأسبوعية الخاصة بوكالة معينة
  async getWeeklyReportsByAgency(agencyId: number) {
    return storage.getWeeklyReportsByAgency(agencyId);
  }
  
  // إنشاء تقرير أسبوعي جديد
  async createWeeklyReport(reportData: any) {
    return storage.createWeeklyReport(reportData);
  }
  
  // تحديث حالة تقرير أسبوعي
  async updateWeeklyReportStatus(id: number, status: string) {
    return storage.updateWeeklyReportStatus(id, status);
  }
  
  // توليد قالب HTML للتقرير الأسبوعي
  private async generateWeeklyReportHtml(report: any): Promise<string> {
    // جلب معلومات العميل
    const client = await storage.getClient(report.clientId);
    
    // جلب معلومات الوكالة
    const agency = await storage.getAgency(report.agencyId);
    
    // توليد HTML للتقرير
    const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير أسبوعي: ${client?.name || 'العميل'} - ${formatDate(report.weekStart)} إلى ${formatDate(report.weekEnd)}</title>
        <style>
            body {
                font-family: 'Hacen Maghreb Bd', 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .report-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                border-radius: 8px;
            }
            .report-header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #430d58;
                margin-bottom: 30px;
            }
            .report-header h1 {
                color: #430d58;
                margin-bottom: 5px;
            }
            .report-header .date {
                color: #ed5609;
                font-size: 18px;
                margin-bottom: 15px;
            }
            .report-header .client-info {
                display: flex;
                justify-content: space-between;
            }
            .report-section {
                margin-bottom: 30px;
            }
            .report-section h2 {
                color: #430d58;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            .task-item {
                padding: 10px;
                margin-bottom: 10px;
                border-left: 3px solid #430d58;
                background-color: #f9f9f9;
            }
            .task-completed {
                border-left-color: #4CAF50;
            }
            .task-in-progress {
                border-left-color: #FFC107;
            }
            .task-pending {
                border-left-color: #9E9E9E;
            }
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-top: 15px;
            }
            .metric-card {
                background-color: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
            }
            .metric-card .metric-value {
                font-size: 24px;
                font-weight: bold;
                color: #430d58;
                margin: 10px 0 5px;
            }
            .logo {
                max-width: 150px;
                margin-bottom: 15px;
            }
            footer {
                text-align: center;
                margin-top: 30px;
                font-size: 14px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="report-container">
            <div class="report-header">
                <h1>التقرير الأسبوعي</h1>
                <div class="date">${formatDate(report.weekStart)} - ${formatDate(report.weekEnd)}</div>
                <div class="client-info">
                    <div>
                        <strong>العميل:</strong> ${client?.name || 'غير محدد'}<br>
                        <strong>المشروع:</strong> ${report.reportData?.projectName || 'غير محدد'}
                    </div>
                    <div>
                        <strong>أعدته:</strong> ${agency?.name || 'الوكالة'}<br>
                        <strong>التاريخ:</strong> ${formatDate(new Date())}
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <h2>ملخص الأسبوع</h2>
                <p>${report.reportData?.summary || 'لا يوجد ملخص متاح'}</p>
            </div>
            
            <div class="report-section">
                <h2>الإنجازات</h2>
                <ul>
                    ${report.reportData?.achievements?.map((item: string) => `<li>${item}</li>`).join('') || '<li>لا توجد إنجازات مسجلة</li>'}
                </ul>
            </div>
            
            <div class="report-section">
                <h2>المهام المنجزة</h2>
                ${report.reportData?.completedTasks?.map((task: any) => `
                    <div class="task-item task-completed">
                        <strong>${task.title}</strong>
                        <p>${task.description || ''}</p>
                    </div>
                `).join('') || '<p>لا توجد مهام منجزة</p>'}
            </div>
            
            <div class="report-section">
                <h2>المهام قيد التنفيذ</h2>
                ${report.reportData?.inProgressTasks?.map((task: any) => `
                    <div class="task-item task-in-progress">
                        <strong>${task.title}</strong>
                        <p>${task.description || ''}</p>
                        <p><strong>الموعد النهائي:</strong> ${task.dueDate ? formatDate(task.dueDate) : 'غير محدد'}</p>
                    </div>
                `).join('') || '<p>لا توجد مهام قيد التنفيذ</p>'}
            </div>
            
            <div class="report-section">
                <h2>المقاييس والإحصائيات</h2>
                ${report.reportData?.metrics ? `
                <div class="metrics-grid">
                    ${Object.entries(report.reportData.metrics).map(([key, value]) => `
                        <div class="metric-card">
                            <div class="metric-name">${key}</div>
                            <div class="metric-value">${value}</div>
                        </div>
                    `).join('')}
                </div>
                ` : '<p>لا توجد مقاييس متاحة</p>'}
            </div>
            
            <div class="report-section">
                <h2>ملاحظات وتوصيات</h2>
                <p>${report.reportData?.notes || 'لا توجد ملاحظات أو توصيات'}</p>
            </div>
            
            <div class="report-section">
                <h2>خطة الأسبوع القادم</h2>
                <ul>
                    ${report.reportData?.nextWeekPlan?.map((item: string) => `<li>${item}</li>`).join('') || '<li>لم يتم تحديد خطة بعد</li>'}
                </ul>
            </div>
            
            <footer>
                <p>© ${new Date().getFullYear()} ${agency?.name || 'الوكالة'}. جميع الحقوق محفوظة.</p>
                <p>للاستفسارات أو المزيد من المعلومات، يرجى التواصل معنا على ${agency?.email || 'info@agency.com'}</p>
            </footer>
        </div>
    </body>
    </html>
    `;
    
    return html;
  }
  
  // إرسال تقرير أسبوعي عبر البريد الإلكتروني
  async sendWeeklyReportByEmail(reportId: number, recipient: string): Promise<boolean> {
    try {
      // التحقق من توفر مفتاح API لخدمة البريد الإلكتروني
      if (!process.env.SENDGRID_API_KEY) {
        console.error("SendGrid API key not found");
        return false;
      }
      
      // جلب التقرير
      const report = await storage.getWeeklyReport(reportId);
      
      if (!report) {
        console.error(`Weekly report with ID ${reportId} not found`);
        return false;
      }
      
      // جلب معلومات العميل
      const client = await storage.getClient(report.clientId);
      
      // جلب معلومات الوكالة
      const agency = await storage.getAgency(report.agencyId);
      
      // توليد HTML للتقرير
      const html = await this.generateWeeklyReportHtml(report);
      
      // إعداد رسالة البريد الإلكتروني
      const msg = {
        to: recipient,
        from: agency?.email || 'taskaaya@example.com',
        subject: `التقرير الأسبوعي: ${client?.name || 'العميل'} (${formatDate(report.weekStart)} - ${formatDate(report.weekEnd)})`,
        text: `التقرير الأسبوعي للفترة من ${formatDate(report.weekStart)} إلى ${formatDate(report.weekEnd)}`,
        html
      };
      
      // إرسال البريد الإلكتروني
      await mailService.send(msg);
      
      // تحديث حالة التقرير
      await storage.updateWeeklyReportStatus(reportId, 'sent');
      
      return true;
    } catch (error) {
      console.error("Error sending weekly report by email:", error);
      return false;
    }
  }
  
  // إرسال تقرير أسبوعي عبر واتساب
  async sendWeeklyReportByWhatsApp(reportId: number, phoneNumber: string): Promise<boolean> {
    try {
      // جلب التقرير
      const report = await storage.getWeeklyReport(reportId);
      
      if (!report) {
        console.error(`Weekly report with ID ${reportId} not found`);
        return false;
      }
      
      // جلب معلومات العميل
      const client = await storage.getClient(report.clientId);
      
      // جلب معلومات الوكالة
      const agency = await storage.getAgency(report.agencyId);
      
      // إنشاء ملف PDF للتقرير
      const tempPdfPath = path.join(process.cwd(), 'temp', `weekly-report-${reportId}.pdf`);
      
      // التأكد من وجود مجلد temp
      if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
        fs.mkdirSync(path.join(process.cwd(), 'temp'), { recursive: true });
      }
      
      // توليد HTML للتقرير
      const html = await this.generateWeeklyReportHtml(report);
      
      // تحويل HTML إلى PDF
      const pdfGenerated = await generatePdfFromHtml(html, tempPdfPath);
      
      if (!pdfGenerated) {
        console.error("Failed to generate PDF for weekly report");
        return false;
      }
      
      // إعداد رسالة واتساب
      const message = `التقرير الأسبوعي: ${client?.name || 'العميل'} (${formatDate(report.weekStart)} - ${formatDate(report.weekEnd)})
      
      تم إرسال هذا التقرير بواسطة ${agency?.name || 'الوكالة'}.
      
      لمراجعة التقرير بالكامل، يرجى الاطلاع على الملف المرفق.`;
      
      // هنا سنحتاج لرفع ملف PDF أولاً إلى خدمة استضافة ملفات ثم استخدام الرابط
      // لأغراض الاختبار، سنفترض أن لدينا خدمة ترفع الملف وتعيد الرابط
      
      // للاختبار فقط:
      const mediaUrl = `https://example.com/reports/weekly-report-${reportId}.pdf`;
      
      // إرسال رسالة واتساب
      const sent = await sendWhatsAppMessage(phoneNumber, message, mediaUrl);
      
      // تحديث حالة التقرير
      if (sent) {
        await storage.updateWeeklyReportStatus(reportId, 'sent');
      }
      
      return sent;
    } catch (error) {
      console.error("Error sending weekly report by WhatsApp:", error);
      return false;
    }
  }
  
  // تصدير تقرير أسبوعي بصيغة PDF
  async exportWeeklyReportToPdf(reportId: number): Promise<Buffer | null> {
    try {
      // جلب التقرير
      const report = await storage.getWeeklyReport(reportId);
      
      if (!report) {
        console.error(`Weekly report with ID ${reportId} not found`);
        return null;
      }
      
      // توليد HTML للتقرير
      const html = await this.generateWeeklyReportHtml(report);
      
      // تحديد مسار ملف PDF المؤقت
      const tempPdfPath = path.join(process.cwd(), 'temp', `weekly-report-${reportId}.pdf`);
      
      // التأكد من وجود مجلد temp
      if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
        fs.mkdirSync(path.join(process.cwd(), 'temp'), { recursive: true });
      }
      
      // تحويل HTML إلى PDF
      const pdfGenerated = await generatePdfFromHtml(html, tempPdfPath);
      
      if (!pdfGenerated) {
        console.error("Failed to generate PDF for weekly report");
        return null;
      }
      
      // قراءة ملف PDF كـ Buffer
      const pdfBuffer = fs.readFileSync(tempPdfPath);
      
      // حذف الملف المؤقت
      fs.unlinkSync(tempPdfPath);
      
      return pdfBuffer;
    } catch (error) {
      console.error("Error exporting weekly report to PDF:", error);
      return null;
    }
  }
  
  // ===== خدمة التقارير الشهرية =====
  
  // الحصول على تقرير شهري بواسطة المعرف
  async getMonthlyReport(id: number) {
    return storage.getMonthlyReport(id);
  }
  
  // الحصول على التقارير الشهرية الخاصة بوكالة معينة
  async getMonthlyReportsByAgency(agencyId: number) {
    return storage.getMonthlyReportsByAgency(agencyId);
  }
  
  // الحصول على تقرير شهري بناءً على الشهر
  async getMonthlyReportByMonth(agencyId: number, month: string) {
    return storage.getMonthlyReportByMonth(agencyId, month);
  }
  
  // إنشاء تقرير شهري جديد
  async createMonthlyReport(reportData: any) {
    return storage.createMonthlyReport(reportData);
  }
  
  // توليد قالب HTML للتقرير الشهري
  private async generateMonthlyReportHtml(report: any): Promise<string> {
    // جلب معلومات الوكالة
    const agency = await storage.getAgency(report.agencyId);
    
    // توليد HTML للتقرير
    const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>التقرير الشهري: ${getMonthYearString(new Date(report.month + '-01'))}</title>
        <style>
            body {
                font-family: 'Hacen Maghreb Bd', 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .report-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                border-radius: 8px;
            }
            .report-header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #430d58;
                margin-bottom: 30px;
            }
            .report-header h1 {
                color: #430d58;
                margin-bottom: 5px;
            }
            .report-header .date {
                color: #ed5609;
                font-size: 18px;
                margin-bottom: 15px;
            }
            .report-section {
                margin-bottom: 30px;
            }
            .report-section h2 {
                color: #430d58;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-top: 15px;
            }
            .metric-card {
                background-color: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
            }
            .metric-card .metric-value {
                font-size: 24px;
                font-weight: bold;
                color: #430d58;
                margin: 10px 0 5px;
            }
            .chart-container {
                margin: 20px 0;
                text-align: center;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            table, th, td {
                border: 1px solid #ddd;
            }
            th {
                background-color: #430d58;
                color: white;
                padding: 10px;
                text-align: right;
            }
            td {
                padding: 10px;
                text-align: right;
            }
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            footer {
                text-align: center;
                margin-top: 30px;
                font-size: 14px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="report-container">
            <div class="report-header">
                <h1>التقرير الشهري</h1>
                <div class="date">${getMonthYearString(new Date(report.month + '-01'))}</div>
                <div>
                    <strong>الوكالة:</strong> ${agency?.name || 'الوكالة'}<br>
                    <strong>تاريخ الإنشاء:</strong> ${formatDate(new Date())}
                </div>
            </div>
            
            <div class="report-section">
                <h2>ملخص الشهر</h2>
                <p>${report.metrics?.summary || 'لا يوجد ملخص متاح'}</p>
            </div>
            
            <div class="report-section">
                <h2>المقاييس الرئيسية</h2>
                <div class="metrics-grid">
                    ${report.metrics?.completed_projects ? `
                    <div class="metric-card">
                        <div class="metric-name">المشاريع المكتملة</div>
                        <div class="metric-value">${report.metrics.completed_projects}</div>
                    </div>
                    ` : ''}
                    
                    ${report.metrics?.active_projects ? `
                    <div class="metric-card">
                        <div class="metric-name">المشاريع النشطة</div>
                        <div class="metric-value">${report.metrics.active_projects}</div>
                    </div>
                    ` : ''}
                    
                    ${report.metrics?.new_clients ? `
                    <div class="metric-card">
                        <div class="metric-name">العملاء الجدد</div>
                        <div class="metric-value">${report.metrics.new_clients}</div>
                    </div>
                    ` : ''}
                    
                    ${report.metrics?.total_revenue ? `
                    <div class="metric-card">
                        <div class="metric-name">إجمالي الإيرادات</div>
                        <div class="metric-value">${report.metrics.total_revenue} ج.م</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="report-section">
                <h2>حالة المشاريع</h2>
                <table>
                    <thead>
                        <tr>
                            <th>اسم المشروع</th>
                            <th>العميل</th>
                            <th>الحالة</th>
                            <th>نسبة الإكمال</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.projectsStats?.map((project: any) => `
                        <tr>
                            <td>${project.name}</td>
                            <td>${project.client}</td>
                            <td>${project.status}</td>
                            <td>${project.progress}%</td>
                        </tr>
                        `).join('') || `
                        <tr>
                            <td colspan="4" style="text-align: center;">لا توجد مشاريع لعرضها</td>
                        </tr>
                        `}
                    </tbody>
                </table>
            </div>
            
            <div class="report-section">
                <h2>أداء الموظفين</h2>
                <table>
                    <thead>
                        <tr>
                            <th>الموظف</th>
                            <th>المهام المكتملة</th>
                            <th>معدل الإنتاجية</th>
                            <th>التقييم</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.employeesStats?.map((employee: any) => `
                        <tr>
                            <td>${employee.name}</td>
                            <td>${employee.completed_tasks}</td>
                            <td>${employee.productivity_rate}%</td>
                            <td>${employee.rating}/5</td>
                        </tr>
                        `).join('') || `
                        <tr>
                            <td colspan="4" style="text-align: center;">لا توجد بيانات موظفين لعرضها</td>
                        </tr>
                        `}
                    </tbody>
                </table>
            </div>
            
            <div class="report-section">
                <h2>تحليل العملاء</h2>
                <table>
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>المشاريع النشطة</th>
                            <th>إجمالي الإيرادات</th>
                            <th>حالة الدفع</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.clientsStats?.map((client: any) => `
                        <tr>
                            <td>${client.name}</td>
                            <td>${client.active_projects}</td>
                            <td>${client.total_revenue} ج.م</td>
                            <td>${client.payment_status}</td>
                        </tr>
                        `).join('') || `
                        <tr>
                            <td colspan="4" style="text-align: center;">لا توجد بيانات عملاء لعرضها</td>
                        </tr>
                        `}
                    </tbody>
                </table>
            </div>
            
            <div class="report-section">
                <h2>النتائج المالية</h2>
                <table>
                    <thead>
                        <tr>
                            <th>البند</th>
                            <th>القيمة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.financialStats ? `
                        <tr>
                            <td>إجمالي الإيرادات</td>
                            <td>${report.financialStats.total_revenue} ج.م</td>
                        </tr>
                        <tr>
                            <td>إجمالي المصروفات</td>
                            <td>${report.financialStats.total_expenses} ج.م</td>
                        </tr>
                        <tr>
                            <td>صافي الربح</td>
                            <td>${report.financialStats.net_profit} ج.م</td>
                        </tr>
                        <tr>
                            <td>نسبة الربح</td>
                            <td>${report.financialStats.profit_margin}%</td>
                        </tr>
                        <tr>
                            <td>المدفوعات المتأخرة</td>
                            <td>${report.financialStats.overdue_payments} ج.م</td>
                        </tr>
                        ` : `
                        <tr>
                            <td colspan="2" style="text-align: center;">لا توجد بيانات مالية لعرضها</td>
                        </tr>
                        `}
                    </tbody>
                </table>
            </div>
            
            <div class="report-section">
                <h2>التحديات والتوصيات</h2>
                <p>${report.metrics?.challenges || 'لم يتم تسجيل أي تحديات'}</p>
                <p>${report.metrics?.recommendations || 'لا توجد توصيات'}</p>
            </div>
            
            <footer>
                <p>© ${new Date().getFullYear()} ${agency?.name || 'الوكالة'}. جميع الحقوق محفوظة.</p>
                <p>للاستفسارات أو المزيد من المعلومات، يرجى التواصل معنا على ${agency?.email || 'info@agency.com'}</p>
            </footer>
        </div>
    </body>
    </html>
    `;
    
    return html;
  }
  
  // إرسال تقرير شهري عبر البريد الإلكتروني
  async sendMonthlyReportByEmail(reportId: number, recipient: string): Promise<boolean> {
    try {
      // التحقق من توفر مفتاح API لخدمة البريد الإلكتروني
      if (!process.env.SENDGRID_API_KEY) {
        console.error("SendGrid API key not found");
        return false;
      }
      
      // جلب التقرير
      const report = await storage.getMonthlyReport(reportId);
      
      if (!report) {
        console.error(`Monthly report with ID ${reportId} not found`);
        return false;
      }
      
      // جلب معلومات الوكالة
      const agency = await storage.getAgency(report.agencyId);
      
      // توليد HTML للتقرير
      const html = await this.generateMonthlyReportHtml(report);
      
      // إعداد رسالة البريد الإلكتروني
      const msg = {
        to: recipient,
        from: agency?.email || 'taskaaya@example.com',
        subject: `التقرير الشهري: ${getMonthYearString(new Date(report.month + '-01'))}`,
        text: `التقرير الشهري لشهر ${getMonthYearString(new Date(report.month + '-01'))}`,
        html
      };
      
      // إرسال البريد الإلكتروني
      await mailService.send(msg);
      
      return true;
    } catch (error) {
      console.error("Error sending monthly report by email:", error);
      return false;
    }
  }
  
  // تصدير تقرير شهري بصيغة PDF
  async exportMonthlyReportToPdf(reportId: number): Promise<Buffer | null> {
    try {
      // جلب التقرير
      const report = await storage.getMonthlyReport(reportId);
      
      if (!report) {
        console.error(`Monthly report with ID ${reportId} not found`);
        return null;
      }
      
      // توليد HTML للتقرير
      const html = await this.generateMonthlyReportHtml(report);
      
      // تحديد مسار ملف PDF المؤقت
      const tempPdfPath = path.join(process.cwd(), 'temp', `monthly-report-${reportId}.pdf`);
      
      // التأكد من وجود مجلد temp
      if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
        fs.mkdirSync(path.join(process.cwd(), 'temp'), { recursive: true });
      }
      
      // تحويل HTML إلى PDF
      const pdfGenerated = await generatePdfFromHtml(html, tempPdfPath);
      
      if (!pdfGenerated) {
        console.error("Failed to generate PDF for monthly report");
        return null;
      }
      
      // قراءة ملف PDF كـ Buffer
      const pdfBuffer = fs.readFileSync(tempPdfPath);
      
      // حذف الملف المؤقت
      fs.unlinkSync(tempPdfPath);
      
      return pdfBuffer;
    } catch (error) {
      console.error("Error exporting monthly report to PDF:", error);
      return null;
    }
  }
  
  // ===== خدمة التقارير اليومية =====
  
  // الحصول على تقرير يومي (stand-up)
  async getDailyStandup(id: number) {
    return storage.getDailyStandup(id);
  }
  
  // توليد قالب HTML للتقرير اليومي
  private async generateDailyStandupHtml(standupData: any): Promise<string> {
    // جلب معلومات المشروع
    const project = await storage.getProject(standupData.projectId);
    
    // جلب معلومات الوكالة
    const agency = project ? await storage.getAgency(project.agencyId) : null;
    
    // توليد HTML للتقرير
    const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير الاجتماع اليومي: ${formatDate(standupData.date)}</title>
        <style>
            body {
                font-family: 'Hacen Maghreb Bd', 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .report-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                border-radius: 8px;
            }
            .report-header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #430d58;
                margin-bottom: 30px;
            }
            .report-header h1 {
                color: #430d58;
                margin-bottom: 5px;
            }
            .report-header .date {
                color: #ed5609;
                font-size: 18px;
                margin-bottom: 15px;
            }
            .report-section {
                margin-bottom: 30px;
            }
            .report-section h2 {
                color: #430d58;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            .standup-item {
                background-color: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 15px;
            }
            .standup-item h3 {
                margin-top: 0;
                color: #430d58;
            }
            .standup-item ul {
                margin: 10px 0;
                padding-right: 20px;
            }
            .standup-item ul li {
                margin-bottom: 5px;
            }
            .team-members {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 15px;
            }
            .member-tag {
                background-color: #430d58;
                color: white;
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 14px;
            }
            footer {
                text-align: center;
                margin-top: 30px;
                font-size: 14px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="report-container">
            <div class="report-header">
                <h1>تقرير الاجتماع اليومي</h1>
                <div class="date">${formatDate(standupData.date)}</div>
                <div>
                    <strong>المشروع:</strong> ${project?.name || 'غير محدد'}<br>
                    <strong>الفريق:</strong> ${standupData.team || 'غير محدد'}
                </div>
            </div>
            
            <div class="report-section">
                <h2>ملخص الاجتماع</h2>
                <p>${standupData.summary || 'لا يوجد ملخص متاح'}</p>
            </div>
            
            <div class="report-section">
                <h2>العناصر المكتملة (أمس)</h2>
                ${standupData.completedItems?.map((item: string) => `<div class="standup-item"><p>${item}</p></div>`).join('') || '<p>لا توجد عناصر مكتملة</p>'}
            </div>
            
            <div class="report-section">
                <h2>العناصر المخطط لها (اليوم)</h2>
                ${standupData.plannedItems?.map((item: string) => `<div class="standup-item"><p>${item}</p></div>`).join('') || '<p>لا توجد عناصر مخطط لها</p>'}
            </div>
            
            <div class="report-section">
                <h2>العوائق والمشكلات</h2>
                ${standupData.blockers?.map((item: string) => `<div class="standup-item"><p>${item}</p></div>`).join('') || '<p>لا توجد عوائق مسجلة</p>'}
            </div>
            
            <div class="report-section">
                <h2>المشاركون</h2>
                <div class="team-members">
                    ${standupData.attendees?.map((name: string) => `<span class="member-tag">${name}</span>`).join('') || '<p>لم يتم تسجيل مشاركين</p>'}
                </div>
            </div>
            
            <div class="report-section">
                <h2>ملاحظات إضافية</h2>
                <p>${standupData.notes || 'لا توجد ملاحظات إضافية'}</p>
            </div>
            
            <footer>
                <p>© ${new Date().getFullYear()} ${agency?.name || 'الوكالة'}. جميع الحقوق محفوظة.</p>
            </footer>
        </div>
    </body>
    </html>
    `;
    
    return html;
  }
  
  // إرسال تقرير يومي عبر البريد الإلكتروني
  async sendDailyStandupByEmail(standupId: number, recipient: string): Promise<boolean> {
    try {
      // التحقق من توفر مفتاح API لخدمة البريد الإلكتروني
      if (!process.env.SENDGRID_API_KEY) {
        console.error("SendGrid API key not found");
        return false;
      }
      
      // جلب بيانات الاجتماع اليومي
      const standupData = await storage.getDailyStandup(standupId);
      
      if (!standupData) {
        console.error(`Daily standup with ID ${standupId} not found`);
        return false;
      }
      
      // جلب معلومات المشروع
      const project = await storage.getProject(standupData.projectId);
      
      // جلب معلومات الوكالة
      const agency = project ? await storage.getAgency(project.agencyId) : null;
      
      // توليد HTML للتقرير
      const html = await this.generateDailyStandupHtml(standupData);
      
      // إعداد رسالة البريد الإلكتروني
      const msg = {
        to: recipient,
        from: agency?.email || 'taskaaya@example.com',
        subject: `تقرير الاجتماع اليومي: ${project?.name || 'المشروع'} (${formatDate(standupData.date)})`,
        text: `تقرير الاجتماع اليومي ليوم ${formatDate(standupData.date)}`,
        html
      };
      
      // إرسال البريد الإلكتروني
      await mailService.send(msg);
      
      return true;
    } catch (error) {
      console.error("Error sending daily standup by email:", error);
      return false;
    }
  }
  
  // تصدير تقرير يومي بصيغة PDF
  async exportDailyStandupToPdf(standupId: number): Promise<Buffer | null> {
    try {
      // جلب بيانات الاجتماع اليومي
      const standupData = await storage.getDailyStandup(standupId);
      
      if (!standupData) {
        console.error(`Daily standup with ID ${standupId} not found`);
        return null;
      }
      
      // توليد HTML للتقرير
      const html = await this.generateDailyStandupHtml(standupData);
      
      // تحديد مسار ملف PDF المؤقت
      const tempPdfPath = path.join(process.cwd(), 'temp', `daily-standup-${standupId}.pdf`);
      
      // التأكد من وجود مجلد temp
      if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
        fs.mkdirSync(path.join(process.cwd(), 'temp'), { recursive: true });
      }
      
      // تحويل HTML إلى PDF
      const pdfGenerated = await generatePdfFromHtml(html, tempPdfPath);
      
      if (!pdfGenerated) {
        console.error("Failed to generate PDF for daily standup");
        return null;
      }
      
      // قراءة ملف PDF كـ Buffer
      const pdfBuffer = fs.readFileSync(tempPdfPath);
      
      // حذف الملف المؤقت
      fs.unlinkSync(tempPdfPath);
      
      return pdfBuffer;
    } catch (error) {
      console.error("Error exporting daily standup to PDF:", error);
      return null;
    }
  }
}

export const reportsService = new ReportsService();