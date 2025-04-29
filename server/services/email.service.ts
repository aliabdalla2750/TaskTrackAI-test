import { Client, User } from '@shared/schema';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { pdfService } from './pdf.service';
import type { SendEmailData } from "@sendgrid/mail";

/**
 * Service for sending email messages
 * Note: This is a stub implementation that would need an actual email API integration
 * like SendGrid or nodemailer
 */
export class EmailService {
  /**
   * Sends a weekly report to a client via email
   * @param clientId The ID of the client
   * @param reportId The ID of the weekly report
   * @param client The client object
   * @returns Success status
   */
  public async sendWeeklyReport(clientId: number, reportId: number, client: Client): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key not provided, email delivery is simulated');
      }

      // Generate the PDF first
      const pdfUrl = await pdfService.generateWeeklyReportPdf(reportId);
      
      // In a real implementation, we would use SendGrid or similar
      // This is just a stub for demonstration
      console.log(`[Email Service] Sending weekly report to client ${client.name}`);
      console.log(`[Email Service] Email: ${client.email}`);
      console.log(`[Email Service] PDF URL: ${pdfUrl}`);
      
      // Compose the email content (in Arabic)
      const emailHtml = `
        <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
          <h1 style="color: #430d58;">التقرير الأسبوعي - ${format(new Date(), 'dd MMMM yyyy', { locale: ar })}</h1>
          
          <p style="font-size: 16px;">مرحبًا ${client.name}،</p>
          
          <p style="font-size: 16px;">نرفق لك التقرير الأسبوعي الخاص بمشاريعك للفترة المنتهية في ${format(new Date(), 'dd MMMM yyyy', { locale: ar })}.</p>
          
          <p style="font-size: 16px;">يمكنك العثور على ملخص لتقدم المشروع، المهام المكتملة، والخطوات التالية في التقرير المرفق.</p>
          
          <p style="font-size: 16px;">لأية استفسارات، يرجى التواصل مع مدير حسابك مباشرة أو الرد على هذا البريد الإلكتروني.</p>
          
          <div style="margin-top: 30px;">
            <p style="font-size: 16px;">مع أطيب التحيات،</p>
            <p style="font-size: 16px; font-weight: bold; color: #430d58;">فريق تاسكايا</p>
          </div>
        </div>
      `;
      
      // If we have SendGrid API key, attempt to send the email
      if (process.env.SENDGRID_API_KEY) {
        // Import dynamically to avoid loading if not needed
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const msg: SendEmailData = {
          to: client.email,
          from: 'reports@taskaaya.com', // Replace with your validated sender
          subject: `التقرير الأسبوعي - ${format(new Date(), 'dd MMMM yyyy', { locale: ar })}`,
          html: emailHtml,
          attachments: [
            {
              content: Buffer.from('dummy-content').toString('base64'),
              filename: 'weekly-report.pdf',
              type: 'application/pdf',
              disposition: 'attachment'
            }
          ]
        };
        
        await sgMail.send(msg);
        console.log('[Email Service] Weekly report email sent successfully via SendGrid');
      } else {
        // Log the email content for demonstration
        console.log(`[Email Service] Email HTML: ${emailHtml}`);
        console.log('[Email Service] Weekly report email simulated successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending weekly report email:', error);
      return false;
    }
  }
  
  /**
   * Sends a monthly report to a client via email
   * @param clientId The ID of the client
   * @param reportId The ID of the monthly report
   * @param client The client object
   * @returns Success status
   */
  public async sendMonthlyReport(clientId: number, reportId: number, client: Client): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key not provided, email delivery is simulated');
      }

      // Generate the PDF first
      const pdfUrl = await pdfService.generateMonthlyReportPdf(reportId);
      
      // In a real implementation, we would use SendGrid or similar
      console.log(`[Email Service] Sending monthly report to client ${client.name}`);
      console.log(`[Email Service] Email: ${client.email}`);
      console.log(`[Email Service] PDF URL: ${pdfUrl}`);
      
      // Compose the email content (in Arabic)
      const emailHtml = `
        <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
          <h1 style="color: #430d58;">التقرير الشهري - ${format(new Date(), 'MMMM yyyy', { locale: ar })}</h1>
          
          <p style="font-size: 16px;">مرحبًا ${client.name}،</p>
          
          <p style="font-size: 16px;">نرفق لك التقرير الشهري الشامل لشهر ${format(new Date(), 'MMMM yyyy', { locale: ar })}.</p>
          
          <p style="font-size: 16px;">يتضمن هذا التقرير:
            <ul>
              <li>ملخص التقدم للمشاريع النشطة</li>
              <li>تحليل لمؤشرات الأداء الرئيسية</li>
              <li>إحصائيات المهام (المكتملة، قيد التنفيذ، المتأخرة)</li>
              <li>توصيات وخطوات قادمة</li>
            </ul>
          </p>
          
          <p style="font-size: 16px;">نرحب بالتواصل لمناقشة نتائج هذا التقرير وكيفية تحسين العمل في الشهر القادم.</p>
          
          <div style="margin-top: 30px;">
            <p style="font-size: 16px;">مع أطيب التحيات،</p>
            <p style="font-size: 16px; font-weight: bold; color: #430d58;">فريق تاسكايا</p>
          </div>
        </div>
      `;
      
      // If we have SendGrid API key, attempt to send the email
      if (process.env.SENDGRID_API_KEY) {
        // Import dynamically to avoid loading if not needed
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const msg: SendEmailData = {
          to: client.email,
          from: 'reports@taskaaya.com', // Replace with your validated sender
          subject: `التقرير الشهري - ${format(new Date(), 'MMMM yyyy', { locale: ar })}`,
          html: emailHtml,
          attachments: [
            {
              content: Buffer.from('dummy-content').toString('base64'),
              filename: 'monthly-report.pdf',
              type: 'application/pdf',
              disposition: 'attachment'
            }
          ]
        };
        
        await sgMail.send(msg);
        console.log('[Email Service] Monthly report email sent successfully via SendGrid');
      } else {
        // Log the email content for demonstration
        console.log(`[Email Service] Email HTML: ${emailHtml}`);
        console.log('[Email Service] Monthly report email simulated successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending monthly report email:', error);
      return false;
    }
  }
  
  /**
   * Sends a notification about a daily standup to a manager
   * @param employeeId The ID of the employee who submitted the standup
   * @param employeeName The name of the employee
   * @param manager The manager object
   * @returns Success status
   */
  public async sendDailyStandupNotification(employeeId: number, employeeName: string, manager: User): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key not provided, email delivery is simulated');
      }

      // In a real implementation, we would use SendGrid or similar
      console.log(`[Email Service] Sending daily standup notification for employee ${employeeName}`);
      console.log(`[Email Service] Manager Email: ${manager.email}`);
      
      // Compose the email content (in Arabic)
      const emailHtml = `
        <div dir="rtl" style="text-align: right; font-family: Arial, sans-serif;">
          <h1 style="color: #430d58;">إشعار تقرير يومي جديد</h1>
          
          <p style="font-size: 16px;">مرحبًا ${manager.name}،</p>
          
          <p style="font-size: 16px;">قام الموظف <strong>${employeeName}</strong> بتقديم تقريره اليومي بتاريخ ${format(new Date(), 'dd MMMM yyyy', { locale: ar })}.</p>
          
          <p style="font-size: 16px;">يمكنك عرض تفاصيل التقرير ومراجعته من خلال الرابط أدناه:</p>
          
          <div style="margin: 25px 0;">
            <a href="#" style="background-color: #430d58; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">عرض التقرير اليومي</a>
          </div>
          
          <div style="margin-top: 30px;">
            <p style="font-size: 16px;">مع أطيب التحيات،</p>
            <p style="font-size: 16px; font-weight: bold; color: #430d58;">نظام تاسكايا</p>
          </div>
        </div>
      `;
      
      // If we have SendGrid API key, attempt to send the email
      if (process.env.SENDGRID_API_KEY) {
        // Import dynamically to avoid loading if not needed
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const msg: SendEmailData = {
          to: manager.email,
          from: 'notifications@taskaaya.com', // Replace with your validated sender
          subject: `تقرير يومي جديد - ${employeeName} - ${format(new Date(), 'dd MMMM yyyy', { locale: ar })}`,
          html: emailHtml
        };
        
        await sgMail.send(msg);
        console.log('[Email Service] Daily standup notification email sent successfully via SendGrid');
      } else {
        // Log the email content for demonstration
        console.log(`[Email Service] Email HTML: ${emailHtml}`);
        console.log('[Email Service] Daily standup notification email simulated successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending daily standup notification email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();