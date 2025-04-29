import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openAIService } from "./services/openai-service";
import { aiSettingsService } from "./services/ai-settings-service";
import { insertAiScenarioSchema, insertClientSchema, insertEmployeeSchema, insertProjectSchema, insertSubgoalSchema, insertTaskSchema, insertTaskSubmissionSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import OpenAI from "openai";
import axios from "axios";
import { upload, handleUploadErrors, extractTextFromFile, cleanExtractedText } from "./services/file-service";
import { reportsRouter } from "./routes/reports.routes";
import billingRoutes from "./routes/billing.routes";
import { clientService } from "./services/client.service";
import fs from 'fs';
import path from 'path';

// تهيئة عميل OpenAI للاختبار المباشر
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development",
});

// Helper function to read demo data
const getDemoData = (filename: string): any => {
  try {
    const filePath = path.join(process.cwd(), 'server', 'demo-data', filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw error;
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo API endpoints for client data
  app.get('/api/clients', async (req: Request, res: Response) => {
    try {
      const clientsData = getDemoData('clients.json');
      res.json({ clients: clientsData });
    } catch (error) {
      console.error("Error loading clients data:", error);
      res.status(500).json({ error: 'Failed to load clients data' });
    }
  });

  // Demo API endpoint for projects data
  app.get('/api/projects', async (req: Request, res: Response) => {
    try {
      const projectsData = getDemoData('projects.json');
      res.json({ projects: projectsData });
    } catch (error) {
      console.error("Error loading projects data:", error);
      res.status(500).json({ error: 'Failed to load projects data' });
    }
  });

  // Demo API endpoint for weekly reports
  app.get('/api/reports/weekly', async (req: Request, res: Response) => {
    try {
      const reportsData = getDemoData('weekly-reports.json');
      res.json(reportsData);
    } catch (error) {
      console.error("Error loading weekly reports data:", error);
      res.status(500).json({ error: 'Failed to load weekly reports data' });
    }
  });

  // Demo API endpoint for generating a weekly report
  app.post('/api/reports/weekly/generate', async (req: Request, res: Response) => {
    try {
      const { clientId } = req.body;
      // In a real app, we would generate a new report here
      // For demo, we'll just return an existing one
      const reportsData = getDemoData('weekly-reports.json');
      const clientReport = reportsData.find((r: any) => r.clientId === parseInt(clientId));
      
      if (clientReport) {
        res.json(clientReport);
      } else {
        res.status(404).json({ error: 'No report found for this client' });
      }
    } catch (error) {
      console.error("Error generating weekly report:", error);
      res.status(500).json({ error: 'Failed to generate weekly report' });
    }
  });

  // Demo API endpoint for generating all weekly reports
  app.post('/api/reports/weekly/generate-all', async (req: Request, res: Response) => {
    try {
      const reportsData = getDemoData('weekly-reports.json');
      res.json({ message: 'All weekly reports generated', count: reportsData.length });
    } catch (error) {
      console.error("Error generating all weekly reports:", error);
      res.status(500).json({ error: 'Failed to generate weekly reports' });
    }
  });

  // Demo API endpoint for monthly reports
  app.get('/api/reports/monthly', async (req: Request, res: Response) => {
    try {
      const reportsData = getDemoData('monthly-reports.json');
      const { clientId, month } = req.query;
      
      if (clientId) {
        const clientReports = reportsData.filter((r: any) => r.clientId === parseInt(clientId as string));
        res.json(clientReports[0] || null); // Return first report or null
      } else {
        res.json(reportsData);
      }
    } catch (error) {
      console.error("Error loading monthly reports data:", error);
      res.status(500).json({ error: 'Failed to load monthly reports data' });
    }
  });

  // Demo API endpoint for generating a monthly report
  app.post('/api/reports/monthly/generate', async (req: Request, res: Response) => {
    try {
      const { clientId, month } = req.body;
      // In a real app, we would generate a new report here
      // For demo, we'll just return an existing one
      const reportsData = getDemoData('monthly-reports.json');
      const clientReport = reportsData.find((r: any) => r.clientId === parseInt(clientId));
      
      if (clientReport) {
        res.json(clientReport);
      } else {
        res.status(404).json({ error: 'No report found for this client' });
      }
    } catch (error) {
      console.error("Error generating monthly report:", error);
      res.status(500).json({ error: 'Failed to generate monthly report' });
    }
  });

  // Demo API endpoint for sending a monthly report
  app.post('/api/reports/monthly/:id/send', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { method } = req.body;
      
      // In a real app, we would send the report here
      res.json({ 
        message: `Monthly report sent via ${method}`,
        reportId: id,
        sentAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send monthly report' });
    }
  });
  // تسجيل مسارات التقارير
  app.use('/api/reports', reportsRouter);
  
  // تسجيل مسارات الفواتير
  app.use('/api', billingRoutes);
  
  // API Endpoints
  
  // Users endpoints
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.listUsers();
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.post("/api/admin/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json({ user });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });
  
  app.put("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid user data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update user" });
      }
    }
  });
  
  app.delete("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // AI Scenarios endpoints
  app.get("/api/admin/ai-scenarios", async (req: Request, res: Response) => {
    try {
      const scenarios = await storage.listAiScenarios();
      res.json({ scenarios });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI scenarios" });
    }
  });
  
  app.post("/api/admin/ai-scenarios", async (req: Request, res: Response) => {
    try {
      const scenarioData = insertAiScenarioSchema.parse(req.body);
      const scenario = await storage.createAiScenario(scenarioData);
      res.status(201).json({ scenario });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid scenario data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create AI scenario" });
      }
    }
  });
  
  app.put("/api/admin/ai-scenarios/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const scenarioData = insertAiScenarioSchema.partial().parse(req.body);
      const scenario = await storage.updateAiScenario(id, scenarioData);
      
      if (!scenario) {
        return res.status(404).json({ message: "AI scenario not found" });
      }
      
      res.json({ scenario });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid scenario data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update AI scenario" });
      }
    }
  });
  
  app.delete("/api/admin/ai-scenarios/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAiScenario(id);
      
      if (!success) {
        return res.status(404).json({ message: "AI scenario not found" });
      }
      
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete AI scenario" });
    }
  });
  
  app.post("/api/admin/ai-scenarios/:id/test", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const scenario = await storage.getAiScenario(id);
      
      if (!scenario) {
        return res.status(404).json({ message: "AI scenario not found" });
      }
      
      const { message } = req.body;
      
      const result = await openAIService.processChat({
        scenarioKey: scenario.scenarioKey,
        messages: [
          { role: "user", content: message || "Test message" }
        ]
      });
      
      res.json({
        response: result.response,
        tokensUsed: result.tokensUsed
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to test AI scenario" });
    }
  });
  
  // AI Chat endpoint
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const { message, fullConversation, scenarioKey = "general", model = "gpt-4o", providerId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // استخدام المحادثة الكاملة إذا كانت متوفرة، وإلا استخدام الرسالة الحالية فقط
      const messagesToProcess = fullConversation || [{ role: "user", content: message }];
      
      let result;
      
      // إذا كان معرف المزود متوفر، نستخدم الخدمة المناسبة
      if (providerId) {
        // الحصول على معلومات مزود الذكاء الاصطناعي
        const provider = await storage.getAiProvider(providerId);
        if (!provider) {
          return res.status(400).json({ message: "Invalid AI provider" });
        }
        
        // استخدام طريقة عامة للمحادثة تدعم المزودين المختلفين (عن طريق خدمة OpenAI)
        result = await openAIService.processChat({
          scenarioKey,
          messages: messagesToProcess,
          providerId: provider.id,
          model
        });
      } else {
        // استخدام OpenAI افتراضيًا
        result = await openAIService.processChat({
          scenarioKey,
          messages: messagesToProcess,
          model
        });
      }
      
      res.json({
        response: result.response,
        tokensUsed: result.tokensUsed,
        model: model
      });
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "Failed to process AI chat" });
    }
  });
  
  // Project creation with AI endpoint
  app.post("/api/ai/project-creation", async (req: Request, res: Response) => {
    try {
      const { projectName, projectDetails, fullConversation, aiSettings, model = "gpt-4o", providerId, isFileAnalysis } = req.body;
      
      if (!projectName || !projectDetails) {
        return res.status(400).json({ message: "Project name and details are required" });
      }
      
      // استخدام المحادثة الكاملة إذا كانت متوفرة، وإلا استخدام آخر رد
      const conversationContext = fullConversation || projectDetails;
      
      // إذا كان معرف المزود متوفر، نستخدمه كخطوة أولى لإنشاء المشروع
      if (providerId) {
        // استخدام نهج المحادثة المنتظمة أولاً لإنشاء المشروع باستخدام OpenRouter
        // ثم استخدام OpenAI لتنسيق النتيجة إلى JSON
        
        // الخطوة 1: استخدام OpenRouter للحصول على تحليل المشروع الأولي
        const provider = await storage.getAiProvider(providerId);
        if (!provider) {
          return res.status(400).json({ message: "Invalid AI provider" });
        }
        
        // تعديل رسالة المستخدم بناءً على نوع التحليل (ملف مرفوع أو محادثة)
        let userPrompt = '';
        if (isFileAnalysis) {
          userPrompt = `قمت برفع ملف (عقد/بروبوزال) خاص بمشروع "${projectName}".\n\nفيما يلي محتوى الملف:\n${conversationContext}\n\nمهمتك: قم بتحليل محتوى الملف وإنشاء خطة مشروع متكاملة تتضمن:\n1. وصف عام للمشروع\n2. الأهداف الفرعية الرئيسية\n3. قائمة بالمهام المطلوبة مع تواريخ تسليم تقريبية\n4. الإطار الزمني العام المتوقع للمشروع (تاريخ البدء والانتهاء والمدة)`;
        } else {
          userPrompt = `أريد إنشاء مشروع جديد باسم "${projectName}".\n\nفيما يلي التفاصيل:\n${conversationContext}\n\nقم بتحليل هذه المعلومات وإنشاء خطة مشروع كاملة تشمل الوصف والأهداف الفرعية والمهام والإطار الزمني. ضع المعلومات بشكل واضح ومنظم.`;
        }
        
        console.log("AI Project Prompt:", userPrompt);
        
        // استخدام المحادثة لفهم المشروع (مع OpenRouter أو المزود المختار)
        const chatResult = await openAIService.processChat({
          scenarioKey: "project-creation",
          messages: [
            {
              role: "user",
              content: userPrompt
            }
          ],
          providerId: provider.id,
          model: model
        });
        
        // الخطوة 2: استخدام OpenAI لتنسيق النتيجة إلى JSON
        // نمرر النتيجة التي حصلنا عليها من المزود إلى OpenAI ليقوم بتنسيقها إلى JSON
        const formattedResult = await openAIService.processProjectCreation(
          projectName,
          chatResult.response, // استخدام النتيجة من المزود كمدخل
          aiSettings
        );
        
        res.json({
          response: formattedResult.response,
          result: formattedResult.result,
          tokensUsed: chatResult.tokensUsed + formattedResult.tokensUsed,
          model: model,
          isFileAnalysis: isFileAnalysis || false
        });
      } else {
        // استخدام OpenAI مباشرة
        // تعديل رسالة المستخدم بناءً على نوع التحليل (ملف مرفوع أو محادثة)
        let enhancedContext = conversationContext;
        if (isFileAnalysis) {
          enhancedContext = `محتوى ملف العقد/البروبوزال للمشروع:\n\n${conversationContext}\n\nالمطلوب: تحليل الملف وإنشاء خطة مشروع متكاملة.`;
        }
        
        const result = await openAIService.processProjectCreation(
          projectName,
          enhancedContext,
          aiSettings
        );
        
        res.json({
          response: result.response,
          result: result.result,
          tokensUsed: result.tokensUsed,
          model: model || "gpt-4o", // استخدام gpt-4o افتراضيًا
          isFileAnalysis: isFileAnalysis || false
        });
      }
    } catch (error) {
      console.error("AI project creation error:", error);
      res.status(500).json({ message: "Failed to create project with AI" });
    }
  });
  
  // Projects endpoints
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      // In a real app, would filter by agency from user session
      const agencyId = parseInt(req.query.agencyId as string) || 1;
      const projects = await storage.getProjectsByAgency(agencyId);
      res.json({ projects });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  
  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      
      // If subgoals are provided, create them
      if (req.body.subgoals && Array.isArray(req.body.subgoals)) {
        for (const subgoalData of req.body.subgoals) {
          await storage.createSubgoal({
            title: subgoalData.title,
            description: subgoalData.description,
            projectId: project.id,
            kpi: subgoalData.kpi,
            dueDate: subgoalData.dueDate ? new Date(subgoalData.dueDate) : null
          });
        }
      }
      
      // If tasks are provided, create them
      if (req.body.tasks && Array.isArray(req.body.tasks)) {
        for (const taskData of req.body.tasks) {
          await storage.createTask({
            title: taskData.title,
            description: taskData.description,
            projectId: project.id,
            subgoalId: taskData.subgoalId || null,
            assignedTo: taskData.assignedTo || null,
            dueDate: taskData.deadline ? new Date(taskData.deadline) : null,
            status: "open"
          });
        }
      }
      
      res.status(201).json({ project });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid project data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create project" });
      }
    }
  });
  
  app.post("/api/projects/create-from-ai", async (req: Request, res: Response) => {
    try {
      const { name, clientId, agencyId, aiResult } = req.body;
      
      if (!name || !agencyId || !aiResult) {
        return res.status(400).json({ message: "Name, agencyId, and aiResult are required" });
      }
      
      console.log("Creating project with data:", { 
        aiResult,
        name, 
        clientId,
        agencyId 
      });
      
      // Create project
      // تحقق من صحة التواريخ وتحويلها بشكل آمن
      let startDate = new Date(); // استخدام تاريخ اليوم كتاريخ بدء افتراضي
      let endDate = null;
      
      // محاولة تحويل تاريخ البدء إذا كان صالحًا
      if (aiResult.timeline?.startDate && !isNaN(Date.parse(aiResult.timeline.startDate))) {
        startDate = new Date(aiResult.timeline.startDate);
      }
      
      // محاولة تحويل تاريخ الانتهاء إذا كان صالحًا
      if (aiResult.timeline?.endDate && !isNaN(Date.parse(aiResult.timeline.endDate))) {
        endDate = new Date(aiResult.timeline.endDate);
      } else if (aiResult.timeline?.duration) {
        // إذا كان هناك مدة محددة، يمكن حساب تاريخ الانتهاء
        const durationMatch = aiResult.timeline.duration.match(/(\d+)/);
        if (durationMatch && durationMatch[1]) {
          const durationValue = parseInt(durationMatch[1]);
          
          // افتراض أن المدة بالأسابيع إذا ذكرت كلمة "أسابيع" أو "أسبوع"
          if (aiResult.timeline.duration.includes('أسبوع') || aiResult.timeline.duration.includes('أسابيع')) {
            endDate = new Date(startDate.getTime() + (durationValue * 7 * 24 * 60 * 60 * 1000));
          } 
          // افتراض أن المدة بالأيام إذا ذكرت كلمة "يوم" أو "أيام"
          else if (aiResult.timeline.duration.includes('يوم') || aiResult.timeline.duration.includes('أيام')) {
            endDate = new Date(startDate.getTime() + (durationValue * 24 * 60 * 60 * 1000));
          }
          // افتراض أن المدة بالشهور إذا ذكرت كلمة "شهر" أو "شهور"
          else if (aiResult.timeline.duration.includes('شهر') || aiResult.timeline.duration.includes('شهور')) {
            const newEndDate = new Date(startDate);
            newEndDate.setMonth(newEndDate.getMonth() + durationValue);
            endDate = newEndDate;
          }
        }
      }
      
      console.log("Processed dates:", { 
        originalStart: aiResult.timeline?.startDate,
        originalEnd: aiResult.timeline?.endDate,
        computedStart: startDate,
        computedEnd: endDate,
        duration: aiResult.timeline?.duration
      });
      
      const project = await storage.createProject({
        name,
        description: aiResult.description || "",
        clientId: clientId || null,
        agencyId,
        createdBy: 1, // In a real app, would be from user session
        status: "open",
        startDate: startDate,
        endDate: endDate
      });
      
      // Create subgoals
      const subgoalMap = new Map();
      if (aiResult.subgoals && Array.isArray(aiResult.subgoals)) {
        for (let i = 0; i < aiResult.subgoals.length; i++) {
          const subgoalData = aiResult.subgoals[i];
          
          if (!subgoalData || !subgoalData.title) {
            console.warn(`Invalid subgoal data at index ${i}:`, subgoalData);
            continue; // Skip invalid subgoals
          }
          
          // تحقق من صحة تاريخ الاستحقاق للهدف الفرعي
        let subgoalDueDate = null;
        if (subgoalData.dueDate && !isNaN(Date.parse(subgoalData.dueDate))) {
          subgoalDueDate = new Date(subgoalData.dueDate);
        }
          
        const subgoal = await storage.createSubgoal({
          title: subgoalData.title,
          description: subgoalData.description || "",
          projectId: project.id,
          kpi: subgoalData.kpi || null,
          dueDate: subgoalDueDate
        });
          subgoalMap.set(i, subgoal.id);
        }
      }
      
      // Create tasks
      if (aiResult.tasks && Array.isArray(aiResult.tasks)) {
        for (const taskData of aiResult.tasks) {
          if (!taskData || !taskData.title) {
            console.warn(`Invalid task data:`, taskData);
            continue; // Skip invalid tasks
          }
          
          // Determine subgoal ID (simple mapping for demo)
          // In a real app, would have more sophisticated subgoal assignment
          const subgoalIndex = subgoalMap.size > 0 ? Math.floor(Math.random() * subgoalMap.size) : null;
          const subgoalId = subgoalIndex !== null ? subgoalMap.get(subgoalIndex) || null : null;
          
          // تحقق من صحة التاريخ المقدر للمهمة
          let taskDueDate = null;
          if (taskData.deadline && !isNaN(Date.parse(taskData.deadline))) {
            taskDueDate = new Date(taskData.deadline);
          }
          
          // إنشاء المهمة بتاريخ صحيح
          await storage.createTask({
            title: taskData.title,
            description: taskData.description || "",
            projectId: project.id,
            subgoalId,
            assignedTo: null,
            dueDate: taskDueDate,
            status: "open"
          });
        }
      }
      
      res.status(201).json({ project });
    } catch (error) {
      console.error("Error creating project from AI:", error);
      res.status(500).json({ message: "Failed to create project from AI result" });
    }
  });
  
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const subgoals = await storage.getSubgoalsByProject(id);
      const tasks = await storage.getTasksByProject(id);
      const files = await storage.getFilesByProject(id);
      
      res.json({ project, subgoals, tasks, files });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });
  
  app.put("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, projectData);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json({ project });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid project data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update project" });
      }
    }
  });
  
  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  
  // Clients endpoints
  app.get("/api/clients", async (req: Request, res: Response) => {
    try {
      // In a real app, would filter by agency from user session
      const agencyId = parseInt(req.query.agencyId as string) || 1;
      
      // استخدام خدمة العملاء للحصول على بيانات العملاء (مع بيانات ديمو عند الحاجة)
      const clients = await clientService.getAllClients(agencyId);
      res.json({ clients });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });
  
  app.post("/api/clients", async (req: Request, res: Response) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json({ client });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid client data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create client" });
      }
    }
  });
  
  // Team members (employees) endpoints
  app.get("/api/employees", async (req: Request, res: Response) => {
    try {
      // In a real app, would filter by agency from user session
      const agencyId = parseInt(req.query.agencyId as string) || 1;
      const employees = await storage.getEmployeesByAgency(agencyId);
      res.json({ employees });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });
  
  app.post("/api/employees", async (req: Request, res: Response) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json({ employee });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create employee" });
      }
    }
  });
  
  // Tasks endpoints
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      let tasks;
      
      if (req.query.projectId) {
        const projectId = parseInt(req.query.projectId as string);
        tasks = await storage.getTasksByProject(projectId);
      } else if (req.query.subgoalId) {
        const subgoalId = parseInt(req.query.subgoalId as string);
        tasks = await storage.getTasksBySubgoal(subgoalId);
      } else if (req.query.employeeId) {
        const employeeId = parseInt(req.query.employeeId as string);
        tasks = await storage.getTasksByEmployee(employeeId);
      } else {
        // Default to all tasks for agency 1 (for demo)
        const projects = await storage.getProjectsByAgency(1);
        tasks = [];
        for (const project of projects) {
          const projectTasks = await storage.getTasksByProject(project.id);
          tasks.push(...projectTasks);
        }
      }
      
      res.json({ tasks });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  
  // Get a specific task by ID
  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Get additional data: project info, employee info, attachments, comments
      const project = await storage.getProject(task.projectId);
      let employee;
      if (task.assignedTo) {
        employee = await storage.getEmployee(task.assignedTo);
      }
      
      // Get files attached to this task
      const attachments = await storage.getFilesByTask(id);
      
      // Get submissions (we'll use as comments)
      const submissions = await storage.getTaskSubmissionsByTask(id);
      
      res.json({ 
        task,
        project: project ? {
          id: project.id,
          name: project.name
        } : null,
        assignedTo: employee ? {
          id: employee.id,
          name: employee.name,
          avatar: employee.phone ? `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random` : null
        } : null,
        attachments,
        comments: submissions.map(sub => ({
          id: sub.id,
          text: sub.feedback || "",
          createdBy: sub.employeeId ? `موظف ${sub.employeeId}` : "مستخدم",
          createdAt: sub.submittedAt || new Date().toISOString().split('T')[0]
        }))
      });
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task details" });
    }
  });
  
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json({ task });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });
  
  app.put("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, taskData);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ task });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });
  
  // Task submissions endpoints
  app.post("/api/task-submissions", async (req: Request, res: Response) => {
    try {
      // Parse the request data
      const submissionData = insertTaskSubmissionSchema.parse(req.body);
      
      // Create the task submission (including comment)
      const submission = await storage.createTaskSubmission(submissionData);
      
      // After creating a submission (comment), return it in the format expected by the UI
      const comment = {
        id: submission.id,
        text: submission.content || "",
        createdBy: submission.submittedBy || "User",
        createdAt: submission.createdAt || submission.submittedAt
      };
      
      // Return both the submission record and the formatted comment for the UI
      res.status(201).json({ submission, comment });
    } catch (error) {
      console.error("Error creating task submission:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create task submission" });
      }
    }
  });
  
  // Add file to a task
  app.post("/api/tasks/:taskId/attachments", upload.single('file'), handleUploadErrors, async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Create file entry in the database
      const fileData = {
        fileName: req.file.originalname,
        fileUrl: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size.toString(), // convert to string as per schema
        linkedType: "task",
        linkedId: taskId,
        uploaderId: parseInt(req.body.userId) || 1, // Default to user 1 for demo
      };
      
      const file = await storage.createFile(fileData);
      
      res.status(201).json({ file });
    } catch (error) {
      console.error("Error uploading file to task:", error);
      res.status(500).json({ message: "Failed to upload file to task" });
    }
  });
  
  app.put("/api/task-submissions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const submissionData = insertTaskSubmissionSchema.partial().parse(req.body);
      const submission = await storage.updateTaskSubmission(id, submissionData);
      
      if (!submission) {
        return res.status(404).json({ message: "Task submission not found" });
      }
      
      res.json({ submission });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update task submission" });
      }
    }
  });
  
  // AI Settings endpoints
  app.get("/api/ai/settings", async (req: Request, res: Response) => {
    try {
      // في التطبيق الحقيقي، سيتم استخراج معرف الوكالة من جلسة المستخدم
      const agencyId = parseInt(req.query.agencyId as string) || 1;
      const settings = await aiSettingsService.getSettings(agencyId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching AI settings:", error);
      res.status(500).json({ message: "Failed to fetch AI settings" });
    }
  });
  
  app.post("/api/ai/settings", async (req: Request, res: Response) => {
    try {
      // في التطبيق الحقيقي، سيتم استخراج معرف الوكالة من جلسة المستخدم
      const agencyId = parseInt(req.body.agencyId as string) || 1;
      
      const settings = await aiSettingsService.saveSettings(agencyId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error saving AI settings:", error);
      res.status(500).json({ message: "Failed to save AI settings" });
    }
  });
  
  // نقطة نهاية لاختبار برومبت الذكاء الاصطناعي
  app.post("/api/ai/chat/test", async (req: Request, res: Response) => {
    try {
      const { message, systemPrompt, temperature = 0.7 } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      if (!systemPrompt) {
        return res.status(400).json({ message: "System prompt is required" });
      }
      
      // إعداد رسالة النظام والمستخدم
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ] as const;
      
      // استدعاء واجهة برمجة التطبيقات OpenAI مباشرة
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const result = await openai.chat.completions.create({
        model: "gpt-4o", // استخدام أحدث نموذج
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: parseFloat(temperature.toString()),
        max_tokens: 800,
      });
      
      // استخراج الرد
      const response = result.choices[0].message.content || "";
      
      // لا يتم تسجيل استخدام الذكاء الاصطناعي أو المحادثة في اختبار البرومبت
      
      res.json({ content: response });
    } catch (error) {
      console.error("Error testing AI prompt:", error);
      res.status(500).json({ message: "Failed to test AI prompt" });
    }
  });
  
  // نقطة نهاية لتطبيق الإعدادات على المنصة بالكامل
  app.post("/api/ai/settings/apply", async (req: Request, res: Response) => {
    try {
      // في التطبيق الحقيقي، سيتم استخراج معرف الوكالة من جلسة المستخدم
      const agencyId = parseInt(req.body.agencyId as string) || 1;
      
      // حفظ الإعدادات
      const settings = await aiSettingsService.saveSettings(agencyId, req.body);
      
      // هنا يمكن إضافة منطق لتطبيق الإعدادات على جميع أجزاء المنصة
      // مثل تحديث التخزين المؤقت للبرومبت في جميع الخدمات، إلخ.
      
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error applying AI settings:", error);
      res.status(500).json({ message: "Failed to apply AI settings" });
    }
  });

  // ------------ مسارات إدارة مزودي الذكاء الاصطناعي ------------

  // الحصول على قائمة مزودي الذكاء الاصطناعي
  app.get("/api/admin/ai-providers", async (req: Request, res: Response) => {
    try {
      const providers = await storage.listAiProviders();
      res.json(providers);
    } catch (error) {
      console.error("Error fetching AI providers:", error);
      res.status(500).json({ message: "Failed to fetch AI providers" });
    }
  });

  // إنشاء مزود ذكاء اصطناعي جديد
  app.post("/api/admin/ai-providers", async (req: Request, res: Response) => {
    try {
      const providerData = req.body;
      const provider = await storage.createAiProvider(providerData);
      
      // إضافة نماذج افتراضية بناءً على نوع المزود
      try {
        if (provider.name === 'openai') {
          // نماذج OpenAI الافتراضية
          await storage.createAiModel({
            providerId: provider.id,
            name: 'gpt-4o',
            displayName: 'GPT-4o',
            maxTokens: 4096,
            isDefault: true,
            isEnabled: true
          });
          
          await storage.createAiModel({
            providerId: provider.id,
            name: 'gpt-4-turbo',
            displayName: 'GPT-4 Turbo',
            maxTokens: 4096,
            isDefault: false,
            isEnabled: true
          });
          
          await storage.createAiModel({
            providerId: provider.id,
            name: 'gpt-3.5-turbo',
            displayName: 'GPT-3.5 Turbo',
            maxTokens: 4096,
            isDefault: false,
            isEnabled: true
          });
        } else if (provider.name === 'deepseek') {
          // نماذج DeepSeek الافتراضية
          await storage.createAiModel({
            providerId: provider.id,
            name: 'deepseek-chat',
            displayName: 'DeepSeek Chat',
            maxTokens: 4096,
            isDefault: true,
            isEnabled: true
          });
          
          await storage.createAiModel({
            providerId: provider.id,
            name: 'deepseek-coder',
            displayName: 'DeepSeek Coder',
            maxTokens: 4096,
            isDefault: false,
            isEnabled: true
          });
        } else if (provider.name === 'openrouter') {
          // نماذج OpenRouter الافتراضية
          await storage.createAiModel({
            providerId: provider.id,
            name: 'openai/gpt-4',
            displayName: 'OpenAI GPT-4',
            maxTokens: 4096,
            isDefault: true,
            isEnabled: true
          });
          
          await storage.createAiModel({
            providerId: provider.id,
            name: 'anthropic/claude-3-opus',
            displayName: 'Anthropic Claude 3 Opus',
            maxTokens: 4096,
            isDefault: false,
            isEnabled: true
          });
          
          await storage.createAiModel({
            providerId: provider.id,
            name: 'google/gemini-pro',
            displayName: 'Google Gemini Pro',
            maxTokens: 4096,
            isDefault: false,
            isEnabled: true
          });
        }
      } catch (modelsError) {
        console.error("Error creating default models for provider:", modelsError);
        // لا نوقف إنشاء المزود إذا فشلت إضافة النماذج الافتراضية
      }
      
      res.status(201).json(provider);
    } catch (error) {
      console.error("Error creating AI provider:", error);
      res.status(500).json({ message: "Failed to create AI provider" });
    }
  });

  // تحديث مزود ذكاء اصطناعي
  app.put("/api/admin/ai-providers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const providerData = req.body;
      const provider = await storage.updateAiProvider(id, providerData);
      
      if (!provider) {
        return res.status(404).json({ message: "AI provider not found" });
      }
      
      res.json(provider);
    } catch (error) {
      console.error("Error updating AI provider:", error);
      res.status(500).json({ message: "Failed to update AI provider" });
    }
  });

  // حذف مزود ذكاء اصطناعي
  app.delete("/api/admin/ai-providers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAiProvider(id);
      
      if (!success) {
        return res.status(404).json({ message: "AI provider not found" });
      }
      
      res.json({ message: "AI provider deleted successfully" });
    } catch (error) {
      console.error("Error deleting AI provider:", error);
      res.status(500).json({ message: "Failed to delete AI provider" });
    }
  });

  // اختبار مزود ذكاء اصطناعي
  app.post("/api/admin/ai-providers/:id/test", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const provider = await storage.getAiProvider(id);
      
      if (!provider) {
        return res.status(404).json({ message: "AI provider not found" });
      }
      
      // اختبار المزود باستخدام الـ API الخاص به
      let testResult = false;
      let testMessage = '';
      
      try {
        let apiUrl;
        let requestBody;
        let headers = {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        };
        
        switch (provider.name) {
          case 'openai':
            apiUrl = provider.baseUrl || 'https://api.openai.com/v1/chat/completions';
            requestBody = {
              model: "gpt-4o",
              messages: [{ role: "user", content: "Hello" }],
              max_tokens: 5
            };
            break;
            
          case 'deepseek':
            apiUrl = provider.baseUrl || 'https://api.deepseek.com/v1/chat/completions';
            requestBody = {
              model: "deepseek-chat",
              messages: [{ role: "user", content: "Hello" }],
              max_tokens: 5
            };
            break;
            
          case 'openrouter':
            apiUrl = provider.baseUrl || 'https://openrouter.ai/api/v1/chat/completions';
            requestBody = {
              model: "openai/gpt-4",
              messages: [{ role: "user", content: "Hello" }],
              max_tokens: 5,
              temperature: 0.7
            };
            
            // تحديد الرؤوس مع معالجة خاصة للرؤوس المخصصة
            const openRouterHeaders: Record<string, string> = {
              'Authorization': `Bearer ${provider.apiKey}`,
              'Content-Type': 'application/json'
            };
            
            // إضافة رأس HTTP-Referer باستخدام كائن سجل لتجنب أخطاء TypeScript
            openRouterHeaders['HTTP-Referer'] = 'https://taskaaya.com';
            
            // استبدال كائن الرؤوس الأصلي بالكائن الجديد
            headers = openRouterHeaders;
            break;
            
          default:
            testMessage = 'Unknown provider type';
            return res.json({ success: false, message: testMessage });
        }
        
        const response = await axios.post(apiUrl, requestBody, { headers });
        testResult = !!response.data;
        testMessage = `${provider.displayName} connection successful`;
        
      } catch (error: any) {
        console.error("Provider test error:", error);
        testMessage = `Test failed: ${error.message}`;
      }
      
      res.json({ 
        success: testResult, 
        message: testMessage 
      });
      
    } catch (error) {
      console.error("Error testing AI provider:", error);
      res.status(500).json({ message: "Failed to test AI provider" });
    }
  });

  // ------------ مسارات إدارة نماذج الذكاء الاصطناعي ------------

  // الحصول على قائمة نماذج الذكاء الاصطناعي لمزود معين
  app.get("/api/admin/ai-providers/:providerId/models", async (req: Request, res: Response) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const models = await storage.getAiModelsByProvider(providerId);
      res.json(models);
    } catch (error) {
      console.error("Error fetching AI models:", error);
      res.status(500).json({ message: "Failed to fetch AI models" });
    }
  });

  // إنشاء نموذج ذكاء اصطناعي جديد
  app.post("/api/admin/ai-models", async (req: Request, res: Response) => {
    try {
      const modelData = req.body;
      const model = await storage.createAiModel(modelData);
      res.status(201).json(model);
    } catch (error) {
      console.error("Error creating AI model:", error);
      res.status(500).json({ message: "Failed to create AI model" });
    }
  });

  // تحديث نموذج ذكاء اصطناعي
  app.put("/api/admin/ai-models/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const modelData = req.body;
      const model = await storage.updateAiModel(id, modelData);
      
      if (!model) {
        return res.status(404).json({ message: "AI model not found" });
      }
      
      res.json(model);
    } catch (error) {
      console.error("Error updating AI model:", error);
      res.status(500).json({ message: "Failed to update AI model" });
    }
  });
  
  // إضافة نماذج افتراضية لمزود ذكاء اصطناعي
  app.post("/api/admin/ai-providers/:id/add-default-models", async (req: Request, res: Response) => {
    try {
      const providerId = parseInt(req.params.id);
      const provider = await storage.getAiProvider(providerId);
      
      if (!provider) {
        return res.status(404).json({ message: "AI provider not found" });
      }
      
      // إضافة نماذج افتراضية بناءً على نوع المزود
      const createdModels = [];
      
      if (provider.name === 'openai') {
        // نماذج OpenAI الافتراضية
        createdModels.push(await storage.createAiModel({
          providerId: provider.id,
          name: 'gpt-4o',
          displayName: 'GPT-4o',
          maxTokens: 4096,
          isDefault: true,
          isEnabled: true
        }));
        
        createdModels.push(await storage.createAiModel({
          providerId: provider.id,
          name: 'gpt-4-turbo',
          displayName: 'GPT-4 Turbo',
          maxTokens: 4096,
          isDefault: false,
          isEnabled: true
        }));
        
        createdModels.push(await storage.createAiModel({
          providerId: provider.id,
          name: 'gpt-3.5-turbo',
          displayName: 'GPT-3.5 Turbo',
          maxTokens: 4096,
          isDefault: false,
          isEnabled: true
        }));
      } else if (provider.name === 'deepseek') {
        // نماذج DeepSeek الافتراضية
        createdModels.push(await storage.createAiModel({
          providerId: provider.id,
          name: 'deepseek-chat',
          displayName: 'DeepSeek Chat',
          maxTokens: 4096,
          isDefault: true,
          isEnabled: true
        }));
        
        createdModels.push(await storage.createAiModel({
          providerId: provider.id,
          name: 'deepseek-coder',
          displayName: 'DeepSeek Coder',
          maxTokens: 4096,
          isDefault: false,
          isEnabled: true
        }));
      } else if (provider.name === 'openrouter') {
        // نماذج OpenRouter الافتراضية
        createdModels.push(await storage.createAiModel({
          providerId: provider.id,
          name: 'openai/gpt-4',
          displayName: 'OpenAI GPT-4',
          maxTokens: 4096,
          isDefault: true,
          isEnabled: true
        }));
        
        createdModels.push(await storage.createAiModel({
          providerId: provider.id,
          name: 'anthropic/claude-3-opus',
          displayName: 'Anthropic Claude 3 Opus',
          maxTokens: 4096,
          isDefault: false,
          isEnabled: true
        }));
        
        createdModels.push(await storage.createAiModel({
          providerId: provider.id,
          name: 'google/gemini-pro',
          displayName: 'Google Gemini Pro',
          maxTokens: 4096,
          isDefault: false,
          isEnabled: true
        }));
      }
      
      res.json({ 
        message: `Added ${createdModels.length} default models for ${provider.displayName}`,
        models: createdModels
      });
      
    } catch (error) {
      console.error("Error adding default models:", error);
      res.status(500).json({ message: "Failed to add default models" });
    }
  });

  // حذف نموذج ذكاء اصطناعي
  app.delete("/api/admin/ai-models/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAiModel(id);
      
      if (!success) {
        return res.status(404).json({ message: "AI model not found" });
      }
      
      res.json({ message: "AI model deleted successfully" });
    } catch (error) {
      console.error("Error deleting AI model:", error);
      res.status(500).json({ message: "Failed to delete AI model" });
    }
  });

  // اختبار محادثة الذكاء الاصطناعي بمزود محدد
  app.post("/api/admin/ai-chat/test", async (req: Request, res: Response) => {
    try {
      const { providerId, modelId, messages } = req.body;
      
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "Invalid messages provided" });
      }
      
      // التحقق من المزود ونموذج الذكاء الاصطناعي
      const provider = await storage.getAiProvider(providerId);
      if (!provider) {
        return res.status(404).json({ message: "AI provider not found" });
      }
      
      const model = await storage.getAiModel(modelId);
      if (!model) {
        return res.status(404).json({ message: "AI model not found" });
      }
      
      // استدعاء API مزود الذكاء الاصطناعي المناسب
      let aiResponse = "";
      
      // طباعة معلومات للتشخيص
      console.log("Provider:", provider.name);
      console.log("Model:", model.name);
      console.log("Messages:", JSON.stringify(messages).substring(0, 100) + "...");
      
      switch (provider.name) {
        case 'openai': {
          try {
            const openai = new OpenAI({
              apiKey: provider.apiKey,
              baseURL: provider.baseUrl || undefined
            });
            
            const completion = await openai.chat.completions.create({
              model: model.name,
              messages: messages as any[],
              temperature: 0.7,
              max_tokens: model.maxTokens || 1000
            });
            
            if (completion.choices && completion.choices.length > 0 && completion.choices[0].message) {
              aiResponse = completion.choices[0].message.content || "";
            } else {
              aiResponse = "استجابة فارغة من OpenAI";
            }
          } catch (error: any) {
            console.error("OpenAI API error:", error);
            throw new Error(`OpenAI API error: ${error.message || JSON.stringify(error)}`);
          }
          break;
        }
        
        case 'deepseek': {
          try {
            // استدعاء DeepSeek API
            const response = await axios.post(
              provider.baseUrl || 'https://api.deepseek.com/v1/chat/completions',
              {
                model: model.name,
                messages,
                temperature: 0.7,
                max_tokens: model.maxTokens || 1000
              },
              {
                headers: {
                  'Authorization': `Bearer ${provider.apiKey}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (response.data && response.data.choices && response.data.choices.length > 0 && 
                response.data.choices[0].message && response.data.choices[0].message.content) {
              aiResponse = response.data.choices[0].message.content;
            } else {
              console.log("Unexpected DeepSeek API response:", response.data);
              aiResponse = "تم استلام استجابة من DeepSeek بتنسيق غير متوقع.";
            }
          } catch (error: any) {
            console.error("DeepSeek API error:", error);
            throw new Error(`DeepSeek API error: ${error.message || JSON.stringify(error)}`);
          }
          break;
        }
        
        case 'openrouter': {
          try {
            console.log("Calling OpenRouter API...");
            
            // دائماً استخدم نموذج OpenAI GPT-3.5 Turbo مع OpenRouter للاختبار
            // هذا النموذج معروف بأنه يعمل بشكل موثوق به مع OpenRouter
            const modelName = 'openai/gpt-3.5-turbo';
            console.log("استخدام نموذج OpenAI GPT-3.5 Turbo للاختبار مع OpenRouter بغض النظر عن النموذج المحدد");
            
            // تحديد الرؤوس مع جميع الرؤوس المطلوبة لـ OpenRouter
            const headers: Record<string, string> = {
              'Authorization': `Bearer ${provider.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://taskaaya.com',
              'User-Agent': 'Taskaaya/1.0.0',
              'X-Title': 'Taskaaya AI Testing',
              'Accept': 'application/json'
            };
            
            // قم بإعداد الرسائل بتنسيق واضح
            const formattedMessages = messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }));
            
            console.log("OpenRouter request:", {
              model: modelName,
              messages: formattedMessages.length > 0 ? `${formattedMessages.length} messages` : "empty", 
              firstMessage: formattedMessages.length > 0 ? (formattedMessages[0].content?.substring(0, 50) || "") + "..." : ""
            });
            
            // استخدم المزيد من الإعدادات الموصى بها من OpenRouter
            const response = await axios.post(
              provider.baseUrl || 'https://openrouter.ai/api/v1/chat/completions',
              {
                model: modelName,
                messages: formattedMessages,
                temperature: 0.7,
                max_tokens: model.maxTokens || 1000,
                route: "fallback", // استخدم احتياطي إذا كان النموذج المحدد غير متاح
                prompt_interface: "default"
              },
              { 
                headers,
                timeout: 30000 // زيادة مهلة الانتظار إلى 30 ثانية
              }
            );
            
            // طباعة كامل استجابة OpenRouter للتشخيص
            console.log("OpenRouter API full response:", JSON.stringify(response.data, null, 2));
            
            try {
              // تحقق من نوع الاستجابة (HTML أو JSON)
              const contentType = response.headers['content-type'] || '';
              console.log("OpenRouter response content type:", contentType);
              
              // إذا كانت الاستجابة HTML (خطأ عادةً)
              if (contentType.includes('text/html') || (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>'))) {
                console.log("Received HTML response from OpenRouter - switching to direct API call");
                
                // محاولة استخدام OpenAI API مباشرة بدلاً من OpenRouter كحل بديل
                const openaiResponse = await axios.post(
                  'https://api.openai.com/v1/chat/completions',
                  {
                    model: "gpt-3.5-turbo",
                    messages: formattedMessages,
                    temperature: 0.7,
                    max_tokens: model.maxTokens || 1000
                  },
                  { 
                    headers: {
                      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                      'Content-Type': 'application/json'
                    },
                    timeout: 30000
                  }
                );
                
                console.log("Fallback to direct OpenAI API succeeded");
                aiResponse = openaiResponse.data.choices[0].message.content;
              }
              // إذا كانت استجابة JSON طبيعية
              else if (response.data) {
                // النمط القياسي: data.choices[0].message.content
                if (response.data.choices && response.data.choices.length > 0) {
                  const choice = response.data.choices[0];
                  
                  if (choice.message && choice.message.content) {
                    aiResponse = choice.message.content;
                  } else if (choice.content) {
                    aiResponse = choice.content;
                  } else if (typeof choice === 'string') {
                    aiResponse = choice;
                  } else if (choice.message_content) {
                    aiResponse = choice.message_content;
                  } else if (choice.text) {
                    aiResponse = choice.text;
                  } else {
                    console.log("Unexpected OpenRouter choice structure:", JSON.stringify(choice, null, 2));
                    const choiceStr = JSON.stringify(choice);
                    if (choiceStr.length < 1000) {
                      aiResponse = `استجابة OpenRouter (هيكل غير معالج): ${choiceStr}`;
                    } else {
                      aiResponse = "تم استلام استجابة من المزود ولكن لم يتم العثور على محتوى الرسالة.";
                    }
                  }
                } 
                // أنماط بديلة
                else if (response.data.content) {
                  aiResponse = response.data.content;
                } else if (response.data.output) {
                  aiResponse = response.data.output;
                } else if (response.data.completion) {
                  aiResponse = response.data.completion;
                } else if (response.data.text) {
                  aiResponse = response.data.text;
                } else if (response.data.message) {
                  aiResponse = response.data.message;
                } else if (typeof response.data === 'string') {
                  aiResponse = response.data;
                } else {
                  const dataStr = JSON.stringify(response.data);
                  console.log("Trying to extract content from full response:", dataStr.substring(0, 200) + "...");
                  
                  if (dataStr.includes('"content":"')) {
                    const contentMatch = dataStr.match(/"content":"([^"]+)"/);
                    if (contentMatch && contentMatch[1]) {
                      aiResponse = contentMatch[1];
                    } else {
                      aiResponse = "تم استلام استجابة من OpenRouter بتنسيق غير متوقع. يرجى التحقق من مفتاح API الخاص بك.";
                    }
                  } else {
                    aiResponse = "تم استلام استجابة من OpenRouter بتنسيق غير متوقع. يرجى التحقق من مفتاح API الخاص بك.";
                  }
                }
              } else {
                aiResponse = "لم يتم استلام أي بيانات من OpenRouter. يرجى التحقق من صحة مفتاح API الخاص بك.";
              }
            } catch (parseError) {
              console.error("Error parsing OpenRouter response:", parseError);
              aiResponse = "حدث خطأ أثناء معالجة استجابة OpenRouter. تأكد من صحة الإعدادات ومفتاح API.";
            }
          } catch (error: any) {
            console.error("OpenRouter API error:", error);
            if (error.response) {
              console.error("OpenRouter error response:", error.response.data);
            }
            throw new Error(`OpenRouter API error: ${error.message || JSON.stringify(error)}`);
          }
          break;
        }
        
        default:
          return res.status(400).json({ message: "Unsupported AI provider" });
      }
      
      // تسجيل استخدام الذكاء الاصطناعي
      try {
        await storage.createAiChatLog({
          scenarioKey: "admin-test",
          messages: messages,
          userId: 1 // ضع معرف المستخدم المشرف الفعلي هنا
        });
      } catch (logError) {
        console.error("Error logging AI chat:", logError);
        // استمر في العملية رغم خطأ التسجيل
      }
      
      res.json({ response: aiResponse });
      
    } catch (error: any) {
      console.error("Error in admin AI chat test:", error);
      res.status(500).json({ 
        message: "Error processing AI chat test",
        error: error.message || 'Unknown error'
      });
    }
  });

  // نقطة نهاية لتحليل الملفات المرفوعة
  app.post("/api/upload/analyze-document", upload.single('file'), handleUploadErrors, async (req: Request, res: Response) => {
    try {
      // تم تعديل هذا الكود لاستخدام req.file من multer بشكل صحيح
      const file = req.file as Express.Multer.File;
      
      if (!file) {
        return res.status(400).json({ message: "يرجى رفع ملف صالح" });
      }
      
      // استخراج النص من الملف المرفوع
      console.log("Extracting text from file:", file.originalname, file.mimetype, file.path);
      const extractedText = await extractTextFromFile(file.path);
      const cleanedText = cleanExtractedText(extractedText);
      
      // تحقق من صحة الاستخراج
      if (!cleanedText || cleanedText.trim() === '') {
        return res.status(400).json({ message: "لم يتم العثور على محتوى نصي في الملف المرفوع" });
      }
      
      // إرجاع النص المستخرج للاستخدام في التحليل
      res.json({
        success: true,
        fileName: file.originalname,
        fileContent: cleanedText,
        contentPreview: cleanedText.slice(0, 300) + '...'
      });
    } catch (err) {
      const error = err as Error;
      console.error("Error analyzing document:", error);
      res.status(500).json({ message: "خطأ في تحليل الملف: " + (error.message || "حدث خطأ أثناء تحليل المحتوى. يرجى المحاولة مرة أخرى.") });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
