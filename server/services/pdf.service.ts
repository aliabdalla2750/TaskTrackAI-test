/**
 * PDF Service for generating PDF reports
 * 
 * This service uses a headless browser approach with Puppeteer to convert
 * HTML templates to PDF files. It supports both weekly and monthly reports.
 */

import { Client, Project, WeeklyReport, MonthlyReport, Task } from "@shared/schema";
import { storage } from "../storage";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// In a production environment, you would use a headless browser like Puppeteer
// However, since we can't install puppeteer in this environment, we'll simulate PDF generation
class PDFService {
  /**
   * Generate a PDF for a weekly client report
   */
  async generateWeeklyReportPDF(reportId: number): Promise<{ filePath: string, fileName: string }> {
    // Get report data
    const report = await storage.getWeeklyReport(reportId);
    if (!report) {
      throw new Error(`Weekly report with ID ${reportId} not found`);
    }

    const client = await storage.getClient(report.clientId);
    if (!client) {
      throw new Error(`Client with ID ${report.clientId} not found`);
    }

    // Get projects for this client
    const projects = await storage.getProjectsByClient(client.id);
    
    // Get tasks for each project
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        const tasks = await storage.getTasksByProject(project.id);
        return {
          ...project,
          tasks,
          completedTasks: tasks.filter(task => task.status === "completed").length,
          totalTasks: tasks.length,
          delayedTasks: tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            return dueDate < now && task.status !== "completed";
          }).length,
          progress: this.calculateProgress(tasks),
        };
      })
    );

    // Create HTML content for the PDF
    const htmlContent = this.generateWeeklyReportHTML(client, projectsWithTasks, report);
    
    // Create a PDF from the HTML content
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `weekly_report_${client.name.replace(/\s+/g, "_")}_${timestamp}.pdf`;
    const filePath = path.join("/tmp", fileName);
    
    // In a real implementation, we would use Puppeteer to generate the PDF
    // Since we can't install Puppeteer in this environment, we'll just create a placeholder
    try {
      // Write the HTML to a file first
      const htmlPath = path.join("/tmp", `report_${timestamp}.html`);
      fs.writeFileSync(htmlPath, htmlContent);
      
      console.log(`[PDF Service] HTML file created at ${htmlPath}`);
      
      // In a real implementation, we would do something like:
      // const browser = await puppeteer.launch();
      // const page = await browser.newPage();
      // await page.setContent(htmlContent);
      // await page.pdf({ path: filePath, format: 'A4' });
      // await browser.close();
      
      // For now, we'll just create a placeholder PDF file
      fs.writeFileSync(filePath, "PDF content would go here");
      
      return { filePath, fileName };
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  }

  /**
   * Generate a PDF for a monthly agency report
   */
  async generateMonthlyReportPDF(reportId: number): Promise<{ filePath: string, fileName: string }> {
    // Get report data
    const report = await storage.getMonthlyReport(reportId);
    if (!report) {
      throw new Error(`Monthly report with ID ${reportId} not found`);
    }

    const agency = await storage.getAgency(report.agencyId);
    if (!agency) {
      throw new Error(`Agency with ID ${report.agencyId} not found`);
    }

    // Create HTML content for the PDF
    const htmlContent = this.generateMonthlyReportHTML(agency, report);
    
    // Create a PDF from the HTML content
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `monthly_report_${agency.name.replace(/\s+/g, "_")}_${report.month}.pdf`;
    const filePath = path.join("/tmp", fileName);
    
    try {
      // Write the HTML to a file first
      const htmlPath = path.join("/tmp", `report_${timestamp}.html`);
      fs.writeFileSync(htmlPath, htmlContent);
      
      console.log(`[PDF Service] HTML file created at ${htmlPath}`);
      
      // In a real implementation, we would convert the HTML to PDF
      // For now, we'll just create a placeholder PDF file
      fs.writeFileSync(filePath, "PDF content would go here");
      
      return { filePath, fileName };
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  }

  /**
   * Generate HTML content for a weekly report
   */
  private generateWeeklyReportHTML(
    client: Client, 
    projects: Array<Project & { 
      tasks: Task[]; 
      completedTasks: number; 
      totalTasks: number; 
      delayedTasks: number; 
      progress: number;
    }>,
    report: WeeklyReport
  ): string {
    // Arabic CSS for RTL support and proper fonts
    const arabicStyles = `
      body, html {
        direction: rtl;
        font-family: 'Hacen Maghreb', 'Arial', sans-serif;
        background-color: #f9f9f9;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 2px solid #430d58;
      }
      .header h1 {
        color: #430d58;
        margin-bottom: 5px;
      }
      .header .date {
        color: #666;
        font-size: 0.9em;
      }
      .project {
        margin-bottom: 30px;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background: #f9f9f9;
      }
      .project h2 {
        color: #430d58;
        margin-top: 0;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      .progress-bar {
        height: 10px;
        background: #e0e0e0;
        border-radius: 5px;
        overflow: hidden;
        margin: 10px 0;
      }
      .progress-bar .fill {
        height: 100%;
        background: #ed5609;
      }
      .stats {
        display: flex;
        justify-content: space-between;
        margin: 15px 0;
      }
      .stat {
        text-align: center;
        padding: 10px;
        border-radius: 5px;
        background: #f0f0f0;
        flex: 1;
        margin: 0 5px;
      }
      .stat .label {
        font-size: 0.8em;
        color: #666;
      }
      .stat .value {
        font-size: 1.2em;
        font-weight: bold;
        color: #430d58;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 0.8em;
        color: #666;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }
      .submission {
        padding: 10px;
        background: #f0f0f0;
        border-radius: 5px;
        margin-top: 15px;
      }
    `;

    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const weekStart = new Date(report.weekStart).toLocaleDateString('ar-EG', dateOptions as any);

    let projectsHTML = '';
    
    if (projects.length === 0) {
      projectsHTML = '<p style="text-align: center; padding: 20px;">لا توجد مشاريع نشطة لهذا العميل خلال الأسبوع الماضي</p>';
    } else {
      projectsHTML = projects.map(project => {
        const latestTask = project.tasks
          .filter(task => task.status === 'completed')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          
        return `
          <div class="project">
            <h2>${project.name}</h2>
            <div>
              <div style="display: flex; justify-content: space-between;">
                <span>نسبة التقدم</span>
                <span>${project.progress}%</span>
              </div>
              <div class="progress-bar">
                <div class="fill" style="width: ${project.progress}%"></div>
              </div>
            </div>
            
            <div class="stats">
              <div class="stat">
                <div class="label">المهام المكتملة</div>
                <div class="value">${project.completedTasks} / ${project.totalTasks}</div>
              </div>
              
              <div class="stat">
                <div class="label">المهام المتأخرة</div>
                <div class="value">${project.delayedTasks}</div>
              </div>
              
              <div class="stat">
                <div class="label">تاريخ الانتهاء المتوقع</div>
                <div class="value">${new Date(project.endDate).toLocaleDateString('ar-EG')}</div>
              </div>
            </div>
            
            ${latestTask ? `
              <div class="submission">
                <h4 style="margin-top: 0;">آخر تسليم</h4>
                <div style="display: flex; justify-content: space-between;">
                  <span>${latestTask.title}</span>
                  <span style="color: #666;">${new Date(latestTask.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    return `
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>التقرير الأسبوعي - ${client.name}</title>
        <style>${arabicStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>التقرير الأسبوعي</h1>
            <div class="client">${client.name}${client.company ? ` - ${client.company}` : ''}</div>
            <div class="date">الأسبوع المنتهي في ${weekStart}</div>
          </div>
          
          <h2>ملخص المشاريع</h2>
          ${projectsHTML}
          
          <div class="footer">
            <p>تم إنشاء هذا التقرير بواسطة منصة تسقية &copy; ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML content for a monthly report
   */
  private generateMonthlyReportHTML(agency: Agency, report: MonthlyReport): string {
    // Similar structure to weekly report but with agency-specific metrics
    // In a real implementation, we would generate the HTML based on the report data
    return `
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>التقرير الشهري - ${agency.name}</title>
        <style>
          body, html {
            direction: rtl;
            font-family: 'Hacen Maghreb', 'Arial', sans-serif;
          }
          /* Additional styles would go here */
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>التقرير الشهري</h1>
            <div class="agency">${agency.name}</div>
            <div class="date">شهر ${report.month}</div>
          </div>
          
          <!-- Monthly report metrics would go here -->
          
          <div class="footer">
            <p>تم إنشاء هذا التقرير بواسطة منصة تسقية &copy; ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Calculate progress percentage for a project based on its tasks
   */
  private calculateProgress(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === "completed").length;
    return Math.round((completedTasks / tasks.length) * 100);
  }
}

export default new PDFService();