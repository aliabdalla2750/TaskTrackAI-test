import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openAIService } from "./services/openai-service";
import { insertAiScenarioSchema, insertClientSchema, insertEmployeeSchema, insertProjectSchema, insertSubgoalSchema, insertTaskSchema, insertTaskSubmissionSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
      const { message, scenarioKey = "general" } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const result = await openAIService.processChat({
        scenarioKey,
        messages: [
          { role: "user", content: message }
        ]
      });
      
      res.json({
        response: result.response,
        tokensUsed: result.tokensUsed
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process AI chat" });
    }
  });
  
  // Project creation with AI endpoint
  app.post("/api/ai/project-creation", async (req: Request, res: Response) => {
    try {
      const { projectName, projectDetails } = req.body;
      
      if (!projectName || !projectDetails) {
        return res.status(400).json({ message: "Project name and details are required" });
      }
      
      const result = await openAIService.processProjectCreation(
        projectName,
        projectDetails
      );
      
      res.json({
        response: result.response,
        result: result.result,
        tokensUsed: result.tokensUsed
      });
    } catch (error) {
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
      
      // Create project
      const project = await storage.createProject({
        name,
        description: aiResult.description,
        clientId: clientId || null,
        agencyId,
        createdBy: 1, // In a real app, would be from user session
        status: "open",
        startDate: aiResult.timeline?.startDate ? new Date(aiResult.timeline.startDate) : new Date(),
        endDate: aiResult.timeline?.endDate ? new Date(aiResult.timeline.endDate) : null
      });
      
      // Create subgoals
      const subgoalMap = new Map();
      if (aiResult.subgoals && Array.isArray(aiResult.subgoals)) {
        for (let i = 0; i < aiResult.subgoals.length; i++) {
          const subgoalData = aiResult.subgoals[i];
          const subgoal = await storage.createSubgoal({
            title: subgoalData.title,
            description: subgoalData.description,
            projectId: project.id,
            kpi: subgoalData.kpi || null,
            dueDate: null // Calculate later based on tasks
          });
          subgoalMap.set(i, subgoal.id);
        }
      }
      
      // Create tasks
      if (aiResult.tasks && Array.isArray(aiResult.tasks)) {
        for (const taskData of aiResult.tasks) {
          // Determine subgoal ID (simple mapping for demo)
          // In a real app, would have more sophisticated subgoal assignment
          const subgoalIndex = Math.floor(Math.random() * subgoalMap.size);
          const subgoalId = subgoalMap.get(subgoalIndex) || null;
          
          await storage.createTask({
            title: taskData.title,
            description: taskData.description,
            projectId: project.id,
            subgoalId,
            assignedTo: null,
            dueDate: taskData.deadline ? new Date(taskData.deadline) : null,
            status: "open"
          });
        }
      }
      
      res.status(201).json({ project });
    } catch (error) {
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
      const clients = await storage.getClientsByAgency(agencyId);
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
      const submissionData = insertTaskSubmissionSchema.parse(req.body);
      const submission = await storage.createTaskSubmission(submissionData);
      res.status(201).json({ submission });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create task submission" });
      }
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
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
