import Anthropic from "@anthropic-ai/sdk";
import { storage } from "../storage";
import type { AiScenario } from "@shared/schema";

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const DEFAULT_MODEL = "claude-3-7-sonnet-20250219";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "dummy-key-for-development",
});

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  scenarioKey: string;
  messages: Message[];
  userId?: number;
  agencyId?: number;
}

export interface ProjectAnalysisResult {
  title: string;
  description: string;
  subgoals: { title: string; description: string }[];
  tasks: { title: string; description: string; deadline: string }[];
  timeline: { startDate: string; endDate: string; duration: string };
}

export class AnthropicService {
  // Process chat request
  async processChat(request: ChatRequest): Promise<{ response: string; tokensUsed: number }> {
    // Get the scenario
    const scenario = await this.getScenario(request.scenarioKey);
    
    // Map messages to Anthropic format
    const anthropicMessages = [];
    
    // Add system prompt if exists
    if (scenario.systemPrompt) {
      anthropicMessages.push({
        role: "system",
        content: scenario.systemPrompt
      });
    }
    
    // Add user messages
    request.messages.forEach(message => {
      if (message.role === "user" || message.role === "assistant") {
        anthropicMessages.push({
          role: message.role,
          content: message.content
        });
      }
    });
    
    try {
      // Call Anthropic API
      const result = await anthropic.messages.create({
        model: scenario.model || DEFAULT_MODEL,
        messages: anthropicMessages,
        max_tokens: scenario.maxTokens || 1000,
        temperature: scenario.temperature / 100, // Convert from 0-100 to 0-1
      });
      
      // Extract response
      const response = result.content[0].text;
      
      // Approximate token count for usage logging
      // Anthropic doesn't provide exact token counts like OpenAI
      const tokensUsed = this.estimateTokens(
        JSON.stringify(anthropicMessages) + response
      );
      
      // Log AI usage
      await this.logAIUsage({
        scenarioKey: request.scenarioKey,
        userId: request.userId,
        agencyId: request.agencyId,
        tokensUsed,
        model: scenario.model || DEFAULT_MODEL
      });
      
      // Log chat
      await this.logChat({
        scenarioKey: request.scenarioKey,
        userId: request.userId,
        agencyId: request.agencyId,
        messages: [...request.messages, { role: "assistant", content: response }]
      });
      
      return {
        response,
        tokensUsed
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error('Failed to generate response from Anthropic AI service');
    }
  }
  
  // Process project creation request
  async processProjectCreation(
    projectName: string,
    projectDetails: string,
    userId?: number,
    agencyId?: number
  ): Promise<{ response: string; result: ProjectAnalysisResult; tokensUsed: number }> {
    // Get the scenario
    const scenario = await this.getScenario("project-creation");
    
    // Prepare system prompt
    const systemPrompt = `${scenario.systemPrompt}\n\nقم بتحليل المعلومات المقدمة وإنشاء خطة مشروع كاملة. قم بتحليل المشروع وتقسيمه إلى أهداف فرعية ومهام وجدول زمني. في النهاية، قدم النتيجة بتنسيق JSON فقط بالهيكل التالي:
    {
      "title": "عنوان المشروع",
      "description": "وصف المشروع",
      "subgoals": [
        { "title": "عنوان الهدف الفرعي", "description": "وصف الهدف الفرعي" }
      ],
      "tasks": [
        { "title": "عنوان المهمة", "description": "وصف المهمة", "deadline": "تاريخ الانتهاء" }
      ],
      "timeline": {
        "startDate": "تاريخ البدء",
        "endDate": "تاريخ الانتهاء",
        "duration": "المدة"
      }
    }
    
    هام: يجب أن تكون الاستجابة بتنسيق JSON فقط بدون أي نص إضافي قبل أو بعد هيكل JSON.`;
    
    // Prepare user message
    const userMessage = `أريد إنشاء مشروع جديد باسم "${projectName}".\n\nتفاصيل المشروع:\n${projectDetails}\n\nقم بتحليل هذه المعلومات وإنشاء خطة مشروع متكاملة.`;
    
    try {
      // Call Anthropic API
      const result = await anthropic.messages.create({
        model: scenario.model || DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: scenario.maxTokens || 2000,
        temperature: scenario.temperature / 100, // Convert from 0-100 to 0-1
      });
      
      // Extract response
      const response = result.content[0].text;
      
      // Parse JSON
      let parsedResult: ProjectAnalysisResult;
      try {
        // Strip any markdown code block formatting if present
        const jsonString = response.replace(/^\s*```json\s*|\s*```\s*$/g, '');
        parsedResult = JSON.parse(jsonString);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Failed to parse Anthropic AI response');
      }
      
      // Approximate token usage
      const tokensUsed = this.estimateTokens(systemPrompt + userMessage + response);
      
      // Log AI usage
      await this.logAIUsage({
        scenarioKey: "project-creation",
        userId,
        agencyId,
        tokensUsed,
        model: scenario.model || DEFAULT_MODEL
      });
      
      // Log chat
      await this.logChat({
        scenarioKey: "project-creation",
        userId,
        agencyId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
          { role: "assistant", content: response }
        ]
      });
      
      return {
        response,
        result: parsedResult,
        tokensUsed
      };
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error('Failed to generate project plan from Anthropic AI service');
    }
  }
  
  // Get AI scenario
  private async getScenario(scenarioKey: string): Promise<AiScenario> {
    const scenario = await storage.getAiScenarioByKey(scenarioKey);
    if (!scenario) {
      throw new Error(`AI scenario with key "${scenarioKey}" not found`);
    }
    if (!scenario.isActive) {
      throw new Error(`AI scenario with key "${scenarioKey}" is not active`);
    }
    return scenario;
  }
  
  // Log AI usage
  private async logAIUsage({
    scenarioKey,
    userId,
    agencyId,
    tokensUsed,
    model
  }: {
    scenarioKey: string;
    userId?: number;
    agencyId?: number;
    tokensUsed: number;
    model: string;
  }) {
    // Calculate cost estimate (approximate, in cents)
    // Claude pricing: approx $0.015 per 1K tokens = 1.5 cents per 1K tokens
    const costEstimate = Math.ceil((tokensUsed / 1000) * 1.5);
    
    await storage.createAiUsageLog({
      userId: userId || null,
      agencyId: agencyId || null,
      scenarioKey,
      modelUsed: model,
      tokensUsed,
      costEstimate
    });
  }
  
  // Log chat
  private async logChat({
    scenarioKey,
    userId,
    agencyId,
    messages
  }: {
    scenarioKey: string;
    userId?: number;
    agencyId?: number;
    messages: Message[];
  }) {
    await storage.createAiChatLog({
      userId: userId || null,
      agencyId: agencyId || null,
      scenarioKey,
      messages
    });
  }
  
  // Estimate tokens (simplified approximation)
  private estimateTokens(text: string): number {
    // Rough approximation: 1 token is about 4 characters for English, less for other languages
    return Math.ceil(text.length / 3.5);
  }
}

export const anthropicService = new AnthropicService();