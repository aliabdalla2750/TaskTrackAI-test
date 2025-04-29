import OpenAI from "openai";
import { storage } from "../storage";
import type { AiScenario } from "@shared/schema";
import { aiSettingsService } from "./ai-settings-service";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development",
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
  providerId?: number; // إضافة معرف مزود الذكاء الاصطناعي
  model?: string; // إضافة اسم النموذج المستخدم
}

export interface ProjectAnalysisResult {
  title: string;
  description: string;
  subgoals: { title: string; description: string }[];
  tasks: { title: string; description: string; deadline: string }[];
  timeline: { startDate: string; endDate: string; duration: string };
}

export class OpenAIService {
  // Process chat request
  async processChat(request: ChatRequest): Promise<{ response: string; tokensUsed: number; result?: any }> {
    // Get the scenario
    const scenario = await this.getScenario(request.scenarioKey);
    
    // الحصول على إعدادات الذكاء الاصطناعي المخصصة للوكالة
    const agencyId = request.agencyId || 1;
    const customPrompt = await aiSettingsService.getFinalPromptForScenario(agencyId, request.scenarioKey);
    
    // Add system message if not already included
    const messages = [...request.messages];
    if (!messages.some(m => m.role === "system")) {
      messages.unshift({
        role: "system",
        // استخدام البرومبت المخصص إذا كان متوفرًا، وإلا استخدام البرومبت الافتراضي من السيناريو
        content: customPrompt || scenario.systemPrompt
      });
    }
    
    try {
      // الحصول على إعدادات الذكاء الاصطناعي
      const aiSettings = await aiSettingsService.getSettings(agencyId);
      
      // تحديد النموذج المستخدم - استخدام النموذج المحدد من الطلب أو من السيناريو أو النموذج الافتراضي
      const modelToUse = request.model || scenario.model || DEFAULT_MODEL;
      
      let result;
      
      // التحقق من نوع مزود الذكاء الاصطناعي المطلوب
      if (request.providerId) {
        // الحصول على معلومات المزود
        const provider = await storage.getAiProvider(request.providerId);
        if (!provider) {
          throw new Error(`AI provider with ID ${request.providerId} not found`);
        }
        
        // استدعاء خدمة OpenAI أو خدمة OpenRouter حسب نوع المزود
        if (provider.name === "openrouter") {
          // استخدام OpenRouter API
          console.log(`Using OpenRouter API with model: ${modelToUse}`);
          
          // تكوين هيدرز الطلب لـ OpenRouter
          const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${provider.apiKey}`,
            "HTTP-Referer": "https://taskaaya.com", // Replace with your actual domain
            "X-Title": "Taskaaya AI Assistant",
            "User-Agent": "Taskaaya/1.0.0"
          };
          
          // إعداد الطلب
          const requestBody = {
            model: modelToUse,
            messages: messages,
            temperature: aiSettings.temperature || scenario.temperature / 100,
            max_tokens: scenario.maxTokens,
          };
          
          // استدعاء OpenRouter API
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // زيادة مهلة الطلب إلى 30 ثانية
          
          const openRouterResponse = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          // تحقق من استجابة OpenRouter
          if (!openRouterResponse.ok) {
            const errorText = await openRouterResponse.text();
            console.error(`OpenRouter API error (${openRouterResponse.status}):`, errorText);
            
            // التحقق إذا كان الرد هو HTML (حدث أحيانًا مع OpenRouter)
            if (errorText.includes('<!DOCTYPE html>')) {
              console.warn('Received HTML response from OpenRouter, falling back to OpenAI');
              
              // استخدام OpenAI كخطة بديلة
              result = await openai.chat.completions.create({
                model: DEFAULT_MODEL, // استخدام النموذج الافتراضي من OpenAI
                messages: messages,
                temperature: aiSettings.temperature || scenario.temperature / 100,
                max_tokens: scenario.maxTokens,
              });
            } else {
              throw new Error(`OpenRouter API error: ${errorText}`);
            }
          } else {
            // تحويل الاستجابة إلى JSON
            const openRouterResult = await openRouterResponse.json();
            
            // محاكاة نفس بنية الاستجابة مثل OpenAI لتسهيل المعالجة
            result = {
              choices: [
                {
                  message: {
                    content: openRouterResult.choices[0].message.content
                  }
                }
              ],
              usage: {
                total_tokens: openRouterResult.usage?.total_tokens || 0
              }
            };
          }
        } else {
          // افتراضي: استخدام OpenAI API عندما المزود غير معروف
          console.log(`Using default OpenAI API with model: ${modelToUse}`);
          result = await openai.chat.completions.create({
            model: modelToUse,
            messages: messages,
            temperature: aiSettings.temperature || scenario.temperature / 100,
            max_tokens: scenario.maxTokens,
          });
        }
      } else {
        // استخدام OpenAI API بشكل افتراضي إذا لم يتم تحديد مزود
        console.log(`Using default OpenAI API with model: ${modelToUse}`);
        result = await openai.chat.completions.create({
          model: modelToUse,
          messages: messages,
          temperature: aiSettings.temperature || scenario.temperature / 100,
          max_tokens: scenario.maxTokens,
        });
      }
      
      // استخراج الرد
      const response = result.choices[0].message.content || "";
      
      // تسجيل استخدام الذكاء الاصطناعي
      await this.logAIUsage({
        scenarioKey: request.scenarioKey,
        userId: request.userId,
        agencyId: request.agencyId,
        tokensUsed: result.usage?.total_tokens || 0,
        model: modelToUse
      });
      
      // تسجيل المحادثة
      await this.logChat({
        scenarioKey: request.scenarioKey,
        userId: request.userId,
        agencyId: request.agencyId,
        messages: [...messages, { role: "assistant", content: response }]
      });
      
      return {
        response,
        tokensUsed: result.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error('Failed to generate response from AI service');
    }
  }
  
  // Process project creation request
  async processProjectCreation(
    projectName: string,
    projectDetails: string,
    aiSettings?: {
      persona: string;
      thinkingStyle: string;
      agencyContext: string;
      industryKnowledge: string;
      keyObjectives: string;
    },
    userId?: number,
    agencyId?: number
  ): Promise<{ response: string; result: ProjectAnalysisResult; tokensUsed: number }> {
    // Get the scenario
    const scenario = await this.getScenario("project-creation");
    
    // استخدام معرف الوكالة المقدم أو الافتراضي
    const agency = agencyId || 1;
    
    // الحصول على برومبت مخصص من إعدادات الذكاء الاصطناعي إذا كانت متوفرة
    let systemContent = await aiSettingsService.getFinalPromptForScenario(agency, "project-creation");
    
    // إذا لم يكن البرومبت المخصص متوفرًا، نستخدم البرومبت الافتراضي من السيناريو
    if (!systemContent) {
      systemContent = scenario.systemPrompt;
    }
    
    // إذا تم توفير إعدادات الذكاء الاصطناعي المخصصة للطلب الحالي، نقوم بتضمينها في رسالة النظام
    if (aiSettings) {
      // إضافة معلومات شخصية الذكاء الاصطناعي
      if (aiSettings.persona) {
        systemContent += `\n\nأنت تعمل كـ ${aiSettings.persona}`;
      }
      
      // إضافة معلومات أسلوب التفكير
      if (aiSettings.thinkingStyle) {
        systemContent += `\n\nيجب عليك استخدام ${aiSettings.thinkingStyle} في تحليلك وإنشاء خطة المشروع.`;
      }
      
      // إضافة معلومات سياق الوكالة
      if (aiSettings.agencyContext) {
        systemContent += `\n\nمعلومات عن الوكالة:\n${aiSettings.agencyContext}`;
      }
      
      // إضافة معلومات الصناعة والمجال
      if (aiSettings.industryKnowledge) {
        systemContent += `\n\nمعلومات عن الصناعة والمجال:\n${aiSettings.industryKnowledge}`;
      }
      
      // إضافة معلومات الأهداف الرئيسية
      if (aiSettings.keyObjectives) {
        systemContent += `\n\nالأهداف الرئيسية للمشروع:\n${aiSettings.keyObjectives}`;
      }
    }
    
    // إضافة تعليمات بنية JSON في نهاية رسالة النظام
    systemContent += `\n\nقم بتحليل المعلومات المقدمة وإنشاء خطة مشروع كاملة. قم بتحليل المشروع وتقسيمه إلى أهداف فرعية ومهام وجدول زمني. في النهاية، قدم النتيجة بتنسيق JSON بالهيكل التالي:
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
    }`;
    
    // إعداد الرسائل
    const messages: Message[] = [
      {
        role: "system",
        content: systemContent
      },
      {
        role: "user",
        content: `أريد إنشاء مشروع جديد باسم "${projectName}".\n\nفيما يلي المحادثة الكاملة بيننا حول المشروع:\n${projectDetails}\n\nقم بتحليل هذه المحادثة بشكل شامل واستخراج جميع المعلومات الهامة لإنشاء خطة مشروع متكاملة تشمل الأهداف والمهام والإطار الزمني.`
      }
    ];
    
    try {
      // Call OpenAI API with JSON response format
      const result = await openai.chat.completions.create({
        model: scenario.model || DEFAULT_MODEL,
        messages: messages,
        temperature: scenario.temperature / 100, // Convert from 0-100 to 0-1
        max_tokens: scenario.maxTokens,
        response_format: { type: "json_object" }
      });
      
      // Extract response
      const response = result.choices[0].message.content || "";
      
      // Parse JSON
      let parsedResult: ProjectAnalysisResult;
      try {
        parsedResult = JSON.parse(response);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Failed to parse AI response');
      }
      
      // Log AI usage
      await this.logAIUsage({
        scenarioKey: "project-creation",
        userId,
        agencyId,
        tokensUsed: result.usage?.total_tokens || 0,
        model: scenario.model || DEFAULT_MODEL
      });
      
      // Log chat
      await this.logChat({
        scenarioKey: "project-creation",
        userId,
        agencyId,
        messages
      });
      
      return {
        response,
        result: parsedResult,
        tokensUsed: result.usage?.total_tokens || 0
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate project plan from AI service');
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
    // GPT-4o pricing: $0.01 per 1K tokens = 1 cent per 1K tokens
    const costEstimate = Math.ceil(tokensUsed / 1000);
    
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
}

export const openAIService = new OpenAIService();
