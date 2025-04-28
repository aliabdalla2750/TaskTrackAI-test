// خدمة إدارة إعدادات الذكاء الاصطناعي
import { storage } from '../storage';

// نوع بيانات إعدادات الذكاء الاصطناعي
export interface AiSettings {
  personality: string;
  customPrompt: string;
  agencyContext: string;
  thinkingStyle: string;
  temperature: number;
  speakEgyptian: boolean;
  useTechnicalTerms: boolean;
  finalPrompt: string;
  agencyId?: number;
  userId?: number;
}

// خدمة إعدادات الذكاء الاصطناعي
export class AiSettingsService {
  private static instance: AiSettingsService;
  
  // تخزين مؤقت للإعدادات حسب معرف الوكالة
  private settingsCache: Map<number, AiSettings> = new Map();
  
  // الإعدادات الافتراضية
  private defaultSettings: AiSettings = {
    personality: 'professional',
    customPrompt: '',
    agencyContext: '',
    thinkingStyle: 'analytical',
    temperature: 0.7,
    speakEgyptian: false,
    useTechnicalTerms: true,
    finalPrompt: 'أنت مساعد محترف ودقيق تقدم إجابات واضحة وموجزة. تتحدث بأسلوب رسمي وتعطي معلومات موثوقة.' +
    '\n\nإرشادات إضافية:' +
    '\n1. كن استباقيًا واسأل أسئلة ذكية للحصول على مزيد من المعلومات عندما تكون بحاجة لها.' +
    '\n2. حاول استخلاص الحقائق المهمة من إجابات العميل واستخدمها في الحوار لاحقًا.' +
    '\n3. قدم اقتراحات قيمة وأفكارًا إبداعية تساعد في تطوير المشروع.' +
    '\n4. كن مهتمًا ومتفاعلًا وحاول فهم احتياجات العميل الحقيقية.' +
    '\n5. عندما تكتشف شيئًا ذا قيمة في كلام العميل، أشر إليه واستخدمه في تقديم مقترحات إضافية.'
  };
  
  private constructor() {}
  
  // الحصول على نسخة الخدمة (Singleton pattern)
  public static getInstance(): AiSettingsService {
    if (!AiSettingsService.instance) {
      AiSettingsService.instance = new AiSettingsService();
    }
    return AiSettingsService.instance;
  }
  
  // الحصول على إعدادات وكالة معينة
  public async getSettings(agencyId: number): Promise<AiSettings> {
    // التحقق من وجود الإعدادات في التخزين المؤقت
    if (this.settingsCache.has(agencyId)) {
      return this.settingsCache.get(agencyId) as AiSettings;
    }
    
    try {
      // البحث عن الإعدادات في قاعدة البيانات (إذا تم تنفيذ ذلك في المستقبل)
      // حاليًا سنستخدم الإعدادات الافتراضية
      
      // تخزين الإعدادات في التخزين المؤقت
      this.settingsCache.set(agencyId, { ...this.defaultSettings, agencyId });
      
      return { ...this.defaultSettings, agencyId };
    } catch (error) {
      console.error('خطأ في الحصول على إعدادات الذكاء الاصطناعي:', error);
      return { ...this.defaultSettings, agencyId };
    }
  }
  
  // حفظ إعدادات وكالة معينة
  public async saveSettings(agencyId: number, settings: AiSettings): Promise<AiSettings> {
    try {
      // تحديث الإعدادات مع معرف الوكالة
      const updatedSettings = { ...settings, agencyId };
      
      // حفظ الإعدادات في قاعدة البيانات (إذا تم تنفيذ ذلك في المستقبل)
      
      // تحديث التخزين المؤقت
      this.settingsCache.set(agencyId, updatedSettings);
      
      return updatedSettings;
    } catch (error) {
      console.error('خطأ في حفظ إعدادات الذكاء الاصطناعي:', error);
      throw error;
    }
  }
  
  // الحصول على البرومبت النهائي لسيناريو محدد
  public async getFinalPromptForScenario(agencyId: number, scenarioKey: string): Promise<string> {
    const settings = await this.getSettings(agencyId);
    
    // إذا كان السيناريو هو إنشاء المشروع، نضيف تعليمات خاصة
    if (scenarioKey === 'project-creation') {
      return settings.finalPrompt + `
\n\nأنت الآن في سيناريو إنشاء المشروع. مهمتك هي مساعدة العميل في تحديد متطلبات المشروع وأهدافه وتفاصيله.
اطرح أسئلة ذكية لفهم طبيعة المشروع، واقترح أفكارًا قيمة، وساعد في تنظيم المشروع إلى أهداف فرعية ومهام محددة.
في نهاية المحادثة، ستقوم بتوليد خطة مشروع منظمة تتضمن وصف المشروع، والأهداف، والجدول الزمني، والمهام.`;
    }
    
    // إضافة تعليمات حسب نوع السيناريو
    switch (scenarioKey) {
      case 'content-creation':
        return settings.finalPrompt + `
\n\nأنت الآن في سيناريو إنشاء المحتوى. ساعد العميل في إنشاء محتوى إبداعي وجذاب للمشروع.`;
      case 'marketing-strategy':
        return settings.finalPrompt + `
\n\nأنت الآن في سيناريو استراتيجية التسويق. ساعد العميل في تطوير استراتيجية تسويق فعالة للمشروع.`;
      default:
        return settings.finalPrompt;
    }
  }
}

// تصدير نسخة واحدة من الخدمة
export const aiSettingsService = AiSettingsService.getInstance();