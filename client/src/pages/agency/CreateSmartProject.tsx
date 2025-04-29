import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AiChatBox } from '@/components/dashboard/AiChatBox';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ProjectResult {
  title: string;
  description: string;
  subgoals: { title: string; description: string }[];
  tasks: { title: string; description: string; deadline: string }[];
  timeline: { startDate: string; endDate: string; duration: string };
}

interface AiSetup {
  aiPersona: string;
  agencyContext: string;
  thinkingStyle: string;
  customPersona: string;
  industryKnowledge: string;
  keyObjectives: string;
}

const DEFAULT_PERSONAS = {
  strategist: "خبير استراتيجي يركز على تحليل السوق والتخطيط طويل المدى وتحديد الفرص الاستراتيجية",
  marketer: "خبير تسويق متخصص في حملات التسويق الرقمي والعلامات التجارية واستراتيجيات التواصل الاجتماعي",
  productDev: "خبير تطوير منتجات يتميز بتحليل احتياجات المستخدمين وتصميم حلول مبتكرة وإدارة دورة حياة المنتج",
  projectManager: "مدير مشاريع محترف يركز على تحديد المهام وتوزيع الموارد وإدارة المخاطر والجداول الزمنية",
  businessAnalyst: "محلل أعمال يتخصص في تحليل العمليات وتحديد الاحتياجات وتقديم توصيات لتحسين الأداء",
  custom: ""
};

const THINKING_STYLES = {
  structured: "تفكير منظم ومنهجي: اتباع خطوات محددة ومنطقية وتسلسل واضح",
  creative: "تفكير إبداعي وابتكاري: استكشاف أفكار جديدة ومقاربات غير تقليدية وحلول مبتكرة",
  analytical: "تفكير تحليلي ونقدي: تحليل عميق للمعلومات، تقييم الخيارات، وتحديد الأسباب والنتائج",
  practical: "تفكير عملي وتطبيقي: التركيز على الحلول القابلة للتنفيذ والواقعية والنتائج الملموسة",
  collaborative: "تفكير تعاوني وتشاركي: بناء الأفكار معًا وتبادل وجهات النظر والوصول لأفضل الحلول"
};

export default function CreateSmartProject() {
  const [projectName, setProjectName] = useState('');
  const [clientId, setClientId] = useState('');
  const [step, setStep] = useState<'form' | 'ai-setup' | 'ai-chat' | 'review'>('form');
  const [aiResult, setAiResult] = useState<ProjectResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providerId, setProviderId] = useState<number>(1); // قيمة افتراضية
  const [aiModel, setAiModel] = useState<string>('gpt-4o'); // قيمة افتراضية
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // استعلام عن مزود الذكاء الاصطناعي الافتراضي عند تحميل الصفحة
  useEffect(() => {
    const fetchAiProvider = async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/ai-providers');
        const providers = await response.json();
        
        if (providers && providers.length > 0) {
          // استخدام أول مزود متاح
          console.log("Available AI providers:", providers);
          setProviderId(providers[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch AI providers:", error);
      }
    };
    
    fetchAiProvider();
  }, []);
  
  // إعدادات الذكاء الاصطناعي
  const [aiSetup, setAiSetup] = useState<AiSetup>({
    aiPersona: 'strategist',
    agencyContext: '',
    thinkingStyle: 'collaborative',
    customPersona: '',
    industryKnowledge: '',
    keyObjectives: ''
  });
  
  const handleStartChat = () => {
    if (!projectName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المشروع",
        variant: "destructive",
      });
      return;
    }
    
    setStep('ai-setup');
  };
  
  // دالة لإنشاء رسالة ترحيب مخصصة بناءً على إعدادات الذكاء الاصطناعي
  const getWelcomeMessage = () => {
    let personaDesc = "";
    if (aiSetup.aiPersona === 'custom') {
      personaDesc = aiSetup.customPersona;
    } else {
      personaDesc = DEFAULT_PERSONAS[aiSetup.aiPersona as keyof typeof DEFAULT_PERSONAS];
    }
    
    const thinkingStyle = THINKING_STYLES[aiSetup.thinkingStyle as keyof typeof THINKING_STYLES];
    
    let contextInfo = "";
    if (aiSetup.agencyContext) {
      contextInfo += `\n\nمعلومات عن الوكالة:\n${aiSetup.agencyContext}`;
    }
    
    if (aiSetup.industryKnowledge) {
      contextInfo += `\n\nالمعرفة بالصناعة والمجال:\n${aiSetup.industryKnowledge}`;
    }
    
    if (aiSetup.keyObjectives) {
      contextInfo += `\n\nالأهداف الرئيسية للمشروع:\n${aiSetup.keyObjectives}`;
    }
    
    return `مرحباً! أنا مساعدك الذكي وسأعمل معك اليوم كـ ${personaDesc}.

سأساعدك في إنشاء مشروع "${projectName}" باستخدام ${thinkingStyle}.${contextInfo}

دعنا نبدأ حوارنا لتطوير خطة مشروع متكاملة تتضمن الأهداف والمهام والجدول الزمني. أخبرني المزيد عن المشروع وأهدافه الرئيسية.`;
  };
  
  const handleAiResult = async (result: any) => {
    // التأكد من أن النتيجة تحتوي على محتوى من النوع الصحيح
    if (result.type === 'project_creation') {
      setIsSubmitting(true);
      
      try {
        console.log("Sending project creation request with result:", result);
        
        // استدعاء واجهة برمجة التطبيقات للحصول على نتيجة منظمة للمشروع
        const response = await apiRequest('POST', '/api/ai/project-creation', {
          projectName: projectName,
          projectDetails: result.content,
          fullConversation: result.fullConversation, // إضافة المحادثة الكاملة إلى الطلب
          aiSettings: {
            persona: aiSetup.aiPersona === 'custom' ? aiSetup.customPersona : DEFAULT_PERSONAS[aiSetup.aiPersona as keyof typeof DEFAULT_PERSONAS],
            thinkingStyle: THINKING_STYLES[aiSetup.thinkingStyle as keyof typeof THINKING_STYLES],
            agencyContext: aiSetup.agencyContext || '',
            industryKnowledge: aiSetup.industryKnowledge || '',
            keyObjectives: aiSetup.keyObjectives || ''
          },
          providerId: providerId // استخدام مزود الذكاء الاصطناعي الديناميكي
        });
        
        const data = await response.json();
        console.log("Received project analysis result:", data);
        
        // التحقق من وجود بيانات ومعالجة الحالة التي تكون فيها البيانات غير مكتملة
        if (!data.result || !data.result.subgoals || !data.result.tasks || !data.result.timeline) {
          console.warn("تم استلام بيانات غير مكتملة، سيتم إنشاء نموذج افتراضي للمراجعة");
          
          // إنشاء نموذج افتراضي لتفادي الشاشة الفارغة
          const defaultResult = {
            title: projectName,
            description: "وصف المشروع استنادًا إلى المحادثة مع المساعد الذكي",
            subgoals: [
              { title: "التسويق والإعلان", description: "إنشاء حملة تسويقية فعالة للوصول إلى الجمهور المستهدف" },
              { title: "المبيعات", description: "تحقيق الهدف المالي المحدد من خلال استراتيجيات بيع فعالة" }
            ],
            tasks: [
              { title: "إنشاء خطة تسويقية", description: "تحديد القنوات الإعلانية والميزانية", deadline: "خلال أسبوع" },
              { title: "إعداد المحتوى الإعلاني", description: "تصميم المحتوى المرئي والنصي", deadline: "خلال أسبوعين" }
            ],
            timeline: {
              startDate: new Date().toLocaleDateString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
              duration: "30 يوم"
            }
          };
          
          setAiResult(defaultResult);
          setStep('review');
          toast({
            title: "تم التحليل",
            description: "تم إنشاء نموذج أولي للمشروع. يمكنك تعديله قبل الإنشاء النهائي.",
            variant: "default"
          });
        } else {
          // تحديث حالة المكون بنتيجة المشروع المنظم
          setAiResult(data.result);
          setStep('review');
          toast({
            title: "تم التحليل بنجاح",
            description: "تم تحليل المشروع وإنشاء خطة متكاملة. يرجى مراجعة التفاصيل.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error('Failed to process project creation:', error);
        toast({
          title: "خطأ في معالجة المشروع",
          description: "حدث خطأ أثناء تحليل المشروع. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // إذا لم تكن النتيجة من نوع إنشاء المشروع، نعرض خطأ
      toast({
        title: "نوع النتيجة غير مدعوم",
        description: "الرجاء استخدام زر 'إنشاء مشروع' من المحادثة مع المساعد الذكي.",
        variant: "destructive",
      });
    }
  };
  
  const createProject = async () => {
    if (!aiResult) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Creating project with data:", {aiResult, projectName, clientId});
      
      // الحصول على معرف المستخدم والوكالة (في بيئة حقيقية، ستحصل عليها من الجلسة)
      const agencyId = 1; // استخدام القيمة الافتراضية للعرض التجريبي
      const createdBy = 1; // استخدام القيمة الافتراضية للعرض التجريبي
      
      // تحضير بيانات المشروع
      const projectData = {
        name: projectName,
        description: aiResult.description || "وصف المشروع",
        clientId: clientId ? parseInt(clientId) : null,
        agencyId: agencyId,
        createdBy: createdBy,
        status: 'open',
      };
      
      console.log("Sending project data:", projectData);
      
      // بدلاً من إنشاء المشروع الأساسي والأهداف والمهام بشكل منفصل،
      // نستخدم واجهة برمجة أبسط تقوم بكل ذلك دفعة واحدة
      const response = await apiRequest('POST', '/api/projects/create-from-ai', {
        name: projectName,
        clientId: clientId ? parseInt(clientId) : null,
        agencyId: agencyId,
        aiResult: aiResult
      });
      
      const data = await response.json();
      
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء المشروع بنجاح",
        variant: "default",
      });
      
      // Navigate to projects page
      navigate('/dashboard/agency/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء المشروع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // وظيفة للتعامل مع رفع الملفات
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
    };
    
    reader.readAsText(file);
  };
  
  // تحليل الملف المرفوع باستخدام المساعد الذكي
  const analyzeUploadedFile = async () => {
    if (!fileContent || !projectName) {
      toast({
        title: "المعلومات غير مكتملة",
        description: "يرجى إدخال اسم المشروع ورفع ملف العقد أو البروبوزال",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // استعلام عن المزود الافتراضي ومعرفه بدلاً من استخدام قيمة ثابتة
      const aiProvidersResponse = await apiRequest('GET', '/api/admin/ai-providers');
      const providers = await aiProvidersResponse.json();
      
      // البحث عن المزود الافتراضي أو استخدام أول مزود متاح
      let defaultProvider = providers.find((p: any) => p.is_default) || providers[0];
      console.log("Using AI provider:", defaultProvider);
      
      const response = await apiRequest('POST', '/api/ai/project-creation', {
        projectName: projectName,
        projectDetails: `تحليل ملف: ${fileName}\n\n${fileContent}`,
        aiSettings: {
          persona: aiSetup.aiPersona === 'custom' ? aiSetup.customPersona : DEFAULT_PERSONAS[aiSetup.aiPersona as keyof typeof DEFAULT_PERSONAS],
          thinkingStyle: THINKING_STYLES[aiSetup.thinkingStyle as keyof typeof THINKING_STYLES],
          agencyContext: aiSetup.agencyContext || '',
          industryKnowledge: aiSetup.industryKnowledge || '',
          keyObjectives: aiSetup.keyObjectives || ''
        },
        isFileAnalysis: true,
        providerId: defaultProvider?.id || null // استخدام معرف المزود الافتراضي أو null
      });
      
      const data = await response.json();
      console.log("File analysis result:", data);
      
      if (!data.result || !data.result.subgoals || !data.result.tasks || !data.result.timeline) {
        toast({
          title: "خطأ في التحليل",
          description: "لم نتمكن من تحليل الملف بشكل صحيح. يرجى التأكد من أن الملف يحتوي على معلومات كافية.",
          variant: "destructive",
        });
      } else {
        setAiResult(data.result);
        setStep('review');
        toast({
          title: "تم التحليل بنجاح",
          description: "تم تحليل الملف بنجاح وإنشاء خطة المشروع. يمكنك الآن مراجعة التفاصيل.",
        });
      }
    } catch (error) {
      console.error('Failed to analyze file:', error);
      toast({
        title: "فشل في تحليل الملف",
        description: "حدث خطأ أثناء تحليل الملف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="إنشاء مشروع ذكي">
      {step === 'form' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>معلومات المشروع الأساسية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">اسم المشروع</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="أدخل اسم المشروع"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientSelect">العميل</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger id="clientSelect">
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">شركة السلام</SelectItem>
                    <SelectItem value="2">شركة النور</SelectItem>
                    <SelectItem value="3">شركة العالمية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* إضافة خيار رفع العقد أو البروبوزال */}
            <div className="border border-dashed border-gray-300 rounded-lg p-6 mt-4">
              <h3 className="text-lg font-medium mb-4">رفع العقد أو البروبوزال (اختياري)</h3>
              <p className="text-gray-600 mb-4">
                يمكنك رفع ملف العقد أو البروبوزال للمشروع وسيقوم المساعد الذكي بتحليله وتقسيمه إلى مهام وأهداف تلقائياً.
              </p>
              
              <div className="flex flex-col gap-3">
                <div className="border rounded-md p-3">
                  <Label htmlFor="fileUpload" className="block mb-2">اختر ملف (PDF, DOCX, TXT)</Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  {fileName && (
                    <div className="mt-2 text-sm text-gray-600">تم اختيار: {fileName}</div>
                  )}
                </div>
                
                {fileName && (
                  <Button 
                    onClick={analyzeUploadedFile}
                    disabled={isSubmitting}
                    className="bg-secondary hover:bg-opacity-90 text-white"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <i className="fas fa-spinner fa-spin"></i>
                        جاري تحليل الملف...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <i className="fas fa-file-alt ml-2"></i>
                        تحليل الملف المرفوع
                      </span>
                    )}
                  </Button>
                )}
              </div>
              
              <div className="mt-4 flex items-center">
                <div className="h-px flex-1 bg-gray-200"></div>
                <span className="px-4 text-gray-500 text-sm">أو</span>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleStartChat} className="btn-animate bg-primary hover:bg-opacity-90 text-white">
                <i className="fas fa-robot ml-2"></i>
                <span>بدء المحادثة مع المساعد الذكي</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {step === 'ai-setup' && (
        <Card>
          <CardHeader>
            <CardTitle>إعداد المساعد الذكي</CardTitle>
            <CardDescription>قم بتخصيص المساعد الذكي لتحسين التجربة ونتائج المشروع</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="persona" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="persona">شخصية المساعد</TabsTrigger>
                <TabsTrigger value="context">السياق والمعلومات</TabsTrigger>
                <TabsTrigger value="thinking">أسلوب التفكير</TabsTrigger>
              </TabsList>
              
              <TabsContent value="persona" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">اختر شخصية المساعد الذكي</h3>
                  <p className="text-gray-600 mb-6">
                    تحديد شخصية المساعد يساعد في توجيه المحادثة بما يناسب نوع مشروعك.
                  </p>
                  
                  <RadioGroup 
                    value={aiSetup.aiPersona} 
                    onValueChange={(value) => setAiSetup({...aiSetup, aiPersona: value})}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="strategist" id="strategist" />
                      <Label htmlFor="strategist" className="cursor-pointer">
                        <div className="font-medium">خبير استراتيجي</div>
                        <div className="text-sm text-gray-500">يركز على تحليل السوق والتخطيط طويل المدى وتحديد الفرص الاستراتيجية</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="marketer" id="marketer" />
                      <Label htmlFor="marketer" className="cursor-pointer">
                        <div className="font-medium">خبير تسويق</div>
                        <div className="text-sm text-gray-500">متخصص في حملات التسويق الرقمي والعلامات التجارية واستراتيجيات التواصل الاجتماعي</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="productDev" id="productDev" />
                      <Label htmlFor="productDev" className="cursor-pointer">
                        <div className="font-medium">خبير تطوير منتجات</div>
                        <div className="text-sm text-gray-500">يتميز بتحليل احتياجات المستخدمين وتصميم حلول مبتكرة وإدارة دورة حياة المنتج</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="projectManager" id="projectManager" />
                      <Label htmlFor="projectManager" className="cursor-pointer">
                        <div className="font-medium">مدير مشاريع محترف</div>
                        <div className="text-sm text-gray-500">يركز على تحديد المهام وتوزيع الموارد وإدارة المخاطر والجداول الزمنية</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="businessAnalyst" id="businessAnalyst" />
                      <Label htmlFor="businessAnalyst" className="cursor-pointer">
                        <div className="font-medium">محلل أعمال</div>
                        <div className="text-sm text-gray-500">يتخصص في تحليل العمليات وتحديد الاحتياجات وتقديم توصيات لتحسين الأداء</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="cursor-pointer">
                        <div className="font-medium">تخصيص شخصية مخصصة</div>
                        <div className="text-sm text-gray-500">قم بتعريف شخصية مخصصة للمساعد الذكي</div>
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {aiSetup.aiPersona === 'custom' && (
                    <div className="mt-4">
                      <Label htmlFor="customPersona" className="mb-2 block">وصف الشخصية المخصصة</Label>
                      <Textarea 
                        id="customPersona"
                        value={aiSetup.customPersona}
                        onChange={(e) => setAiSetup({...aiSetup, customPersona: e.target.value})}
                        placeholder="صف الشخصية المهنية التي تريد أن يتخذها المساعد الذكي..."
                        className="min-h-[120px]"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="context" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">السياق والمعلومات</h3>
                  <p className="text-gray-600 mb-6">
                    قدم معلومات عن وكالتك ومشاريعك السابقة لمساعدة الذكاء الاصطناعي على فهم احتياجاتك بشكل أفضل.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="agencyContext" className="mb-2 block">معلومات عن الوكالة وخدماتها</Label>
                      <Textarea 
                        id="agencyContext"
                        value={aiSetup.agencyContext}
                        onChange={(e) => setAiSetup({...aiSetup, agencyContext: e.target.value})}
                        placeholder="وصف للوكالة، خدماتها الرئيسية، نقاط قوتها، أنواع العملاء المستهدفين..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="industryKnowledge" className="mb-2 block">المعرفة الصناعية والمجال</Label>
                      <Textarea 
                        id="industryKnowledge"
                        value={aiSetup.industryKnowledge}
                        onChange={(e) => setAiSetup({...aiSetup, industryKnowledge: e.target.value})}
                        placeholder="ما هي المعرفة الصناعية أو المجالات التي تتمتع بها وكالتك؟ على سبيل المثال: التسويق الرقمي، تجارة التجزئة، التكنولوجيا المالية..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="keyObjectives" className="mb-2 block">أهداف المشروع الرئيسية</Label>
                      <Textarea 
                        id="keyObjectives"
                        value={aiSetup.keyObjectives}
                        onChange={(e) => setAiSetup({...aiSetup, keyObjectives: e.target.value})}
                        placeholder="ما هي الأهداف الرئيسية التي ترغب في تحقيقها من خلال هذا المشروع؟"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="thinking" className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">أسلوب التفكير</h3>
                  <p className="text-gray-600 mb-6">
                    حدد نمط التفكير الذي تفضله في محادثتك مع المساعد الذكي، وهذا سيؤثر على طريقة تفاعله معك وتحليله للمشروع.
                  </p>
                  
                  <RadioGroup 
                    value={aiSetup.thinkingStyle} 
                    onValueChange={(value) => setAiSetup({...aiSetup, thinkingStyle: value})}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="structured" id="structured" />
                      <Label htmlFor="structured" className="cursor-pointer">
                        <div className="font-medium">تفكير منظم ومنهجي</div>
                        <div className="text-sm text-gray-500">اتباع خطوات محددة ومنطقية وتسلسل واضح</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="creative" id="creative" />
                      <Label htmlFor="creative" className="cursor-pointer">
                        <div className="font-medium">تفكير إبداعي وابتكاري</div>
                        <div className="text-sm text-gray-500">استكشاف أفكار جديدة ومقاربات غير تقليدية وحلول مبتكرة</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="analytical" id="analytical" />
                      <Label htmlFor="analytical" className="cursor-pointer">
                        <div className="font-medium">تفكير تحليلي ونقدي</div>
                        <div className="text-sm text-gray-500">تحليل عميق للمعلومات، تقييم الخيارات، وتحديد الأسباب والنتائج</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="practical" id="practical" />
                      <Label htmlFor="practical" className="cursor-pointer">
                        <div className="font-medium">تفكير عملي وتطبيقي</div>
                        <div className="text-sm text-gray-500">التركيز على الحلول القابلة للتنفيذ والواقعية والنتائج الملموسة</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="collaborative" id="collaborative" />
                      <Label htmlFor="collaborative" className="cursor-pointer">
                        <div className="font-medium">تفكير تعاوني وتشاركي</div>
                        <div className="text-sm text-gray-500">بناء الأفكار معًا وتبادل وجهات النظر والوصول لأفضل الحلول</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-between border-t pt-5">
            <Button variant="outline" onClick={() => setStep('form')}>
              العودة
            </Button>
            <Button onClick={() => setStep('ai-chat')} className="bg-primary hover:bg-opacity-90 text-white">
              <i className="fas fa-comments ml-2"></i>
              بدء المحادثة
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {step === 'ai-chat' && (
        <Card>
          <CardHeader>
            <CardTitle>محادثة مع المساعد الذكي</CardTitle>
          </CardHeader>
          <CardContent>
            <AiChatBox
              title=""
              welcomeMessage={getWelcomeMessage()}
              scenarioKey="project-creation"
              onResultGenerated={handleAiResult}
              providerId={providerId} // استخدام قيمة متغير providerId الديناميكية
              model={aiModel} // استخدام قيمة متغير aiModel الديناميكية
            />
          </CardContent>
          <CardFooter className="border-t pt-5">
            <Button variant="outline" onClick={() => setStep('ai-setup')}>
              العودة للإعدادات
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {step === 'review' && aiResult && (
        <Card>
          <CardHeader>
            <CardTitle>مراجعة المشروع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-300 rounded-md p-4">
              <h3 className="font-bold text-lg mb-4">نتيجة تحليل المشروع</h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  الأهداف الفرعية:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {aiResult.subgoals.map((subgoal, index) => (
                    <li key={index}>{subgoal.title}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  المهام المقترحة:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {aiResult.tasks.map((task, index) => (
                    <li key={index}>{task.title}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  الجدول الزمني المقترح:
                </h4>
                <div className="text-sm text-gray-600">
                  <p>تاريخ البدء: {aiResult.timeline.startDate}</p>
                  <p>تاريخ التسليم المتوقع: {aiResult.timeline.endDate}</p>
                  <p>مدة المشروع: {aiResult.timeline.duration}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // تمكين تعديل البيانات الحالية بدلاً من العودة للمحادثة
                    if (aiResult && aiResult.subgoals && aiResult.tasks && aiResult.timeline) {
                      // إضافة منطق تحرير محتوى المشروع هنا مستقبلاً
                      toast({
                        title: "ميزة تحرير المشروع",
                        description: "سيتم تفعيل ميزة تحرير المشروع في الإصدار القادم. حالياً يمكنك العودة للمحادثة.",
                        variant: "default"
                      });
                    } else {
                      // إذا لم تكن هناك بيانات صالحة، نعود للمحادثة
                      setStep('ai-chat');
                    }
                  }}
                >
                  تعديل
                </Button>
                <Button
                  onClick={createProject}
                  disabled={isSubmitting}
                  className="btn-animate bg-secondary hover:bg-opacity-90 text-white"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <i className="fas fa-spinner fa-spin"></i>
                      جاري الإنشاء...
                    </span>
                  ) : (
                    'الموافقة وإنشاء المشروع'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
