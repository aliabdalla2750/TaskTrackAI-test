import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  RiInformationLine, RiQuillPenLine, RiCalendarLine, 
  RiArrowRightLine, RiArrowLeftLine, RiBuildingLine,
  RiPriceTag3Line, RiMagicLine, RiListCheck, RiTimeLine,
  RiLineChartLine, RiFileListLine, RiCheckLine, RiFilePdfLine
} from 'react-icons/ri';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Types for AI Generated Content
interface SubgoalWithTasks {
  title: string;
  description: string;
  tasks: {
    title: string;
    description: string;
  }[];
}

interface KPI {
  title: string;
  description: string;
  targetValue?: string;
}

interface Milestone {
  week: string;
  title: string;
  description: string;
}

interface AIGeneratedProjectPlan {
  subgoals: SubgoalWithTasks[];
  kpis: KPI[];
  timeline: Milestone[];
}

// Types for Form Data
interface ProjectFormData {
  name: string;
  description: string;
  client: string;
  startDate: Date | null;
  endDate: Date | null;
  projectType: string;
  budget?: string;
  priority?: string;
}

export default function CreateManualProject() {
  // State variables
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    client: '',
    startDate: null,
    endDate: null,
    projectType: '',
    budget: '',
    priority: 'medium'
  });
  
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAIPlan, setIsGeneratingAIPlan] = useState(false);
  const [aiPlan, setAIPlan] = useState<AIGeneratedProjectPlan | null>(null);
  const [activeAITab, setActiveAITab] = useState('subgoals');
  
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch clients when component mounts
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await apiRequest('GET', '/api/clients');
        const data = await response.json();
        if (data && Array.isArray(data.clients)) {
          setClients(data.clients);
        } else {
          // إذا لم تكن البيانات قائمة، نستخدم مصفوفة فارغة
          setClients([]);
          console.warn("تم استلام بيانات العملاء بتنسيق غير متوقع:", data);
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
        toast({
          title: "خطأ",
          description: "فشل في جلب قائمة العملاء",
          variant: "destructive",
        });
      }
    };
    
    fetchClients();
  }, [toast]);
  
  // Project type options
  const projectTypes = [
    { value: 'web', label: 'تطوير مواقع ويب' },
    { value: 'mobile', label: 'تطوير تطبيقات موبايل' },
    { value: 'ui-ux', label: 'تصميم واجهة المستخدم' },
    { value: 'marketing', label: 'تسويق رقمي' },
    { value: 'content', label: 'إنتاج محتوى' },
    { value: 'other', label: 'أخرى' }
  ];
  
  // Form change handlers
  const handleChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4 } 
    }
  };
  
  // Helper function to validate the first step form
  const validateStepOne = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "حقل مطلوب",
        description: "يرجى إدخال اسم المشروع",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.description.trim()) {
      toast({
        title: "حقل مطلوب",
        description: "يرجى إدخال وصف المشروع",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.client) {
      toast({
        title: "حقل مطلوب",
        description: "يرجى اختيار العميل",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // Function to proceed to the next step
  const proceedToNextStep = () => {
    if (validateStepOne()) {
      setCurrentStep(2);
    }
  };
  
  // Function to get AI assistance for a form field
  const getAIAssistance = async (field: keyof ProjectFormData) => {
    // Prepare the current context to send to AI
    const projectContext = {
      fieldToAssist: field,
      currentFormData: formData
    };
    
    try {
      setIsLoading(true);
      
      // استخدم السيناريو العام بدلاً من سيناريو مخصص
      const response = await apiRequest('POST', '/api/ai/chat', {
        message: `أنا مدير وكالة أحتاج مساعدة في ملء حقل "${getFieldLabel(field)}" لمشروع جديد. 
        المعلومات المتوفرة حاليًا: 
        ${formData.name ? `اسم المشروع: ${formData.name}` : ''}
        ${formData.projectType ? `نوع المشروع: ${getProjectTypeName(formData.projectType)}` : ''}
        ${formData.description ? `وصف المشروع: ${formData.description}` : ''}
        
        من فضلك اقترح محتوى مناسب لحقل "${getFieldLabel(field)}" بناءً على هذه المعلومات. اجعل اقتراحك محددًا وعمليًا.`,
        // استخدام سيناريو مساعد عام متوفر افتراضيًا
        scenarioKey: 'assistant'
      });
      
      const data = await response.json();
      
      if (data && data.response) {
        // Show the AI suggestion in a toast
        toast({
          title: `اقتراح لحقل "${getFieldLabel(field)}"`,
          description: data.response,
          duration: 10000, // إظهار لمدة أطول
        });
      } else {
        throw new Error('لم يتم استلام استجابة صحيحة من الخادم');
      }
    } catch (error) {
      console.error('AI assistance error:', error);
      toast({
        title: "خطأ في المساعدة",
        description: "حدث خطأ أثناء طلب المساعدة من الذكاء الاصطناعي. يرجى التحقق من إعدادات الذكاء الاصطناعي.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to generate a complete project plan with AI
  const generateAIProjectPlan = async () => {
    if (!validateStepOne()) return;
    
    try {
      setIsGeneratingAIPlan(true);
      
      const response = await apiRequest('POST', '/api/ai/project-creation', {
        projectName: formData.name,
        projectDetails: `
          وصف المشروع: ${formData.description}
          نوع المشروع: ${getProjectTypeName(formData.projectType)}
          تاريخ البدء: ${formData.startDate ? formData.startDate.toLocaleDateString() : 'غير محدد'}
          تاريخ الانتهاء: ${formData.endDate ? formData.endDate.toLocaleDateString() : 'غير محدد'}
          الميزانية: ${formData.budget || 'غير محددة'}
        `,
        isManualCreation: true
      });
      
      const data = await response.json();
      
      if (data && data.result) {
        setAIPlan({
          subgoals: data.result.subgoals.map((sg: any) => ({
            title: sg.title,
            description: sg.description || '',
            tasks: sg.tasks || []
          })),
          kpis: data.result.kpis || [],
          timeline: data.result.timeline || []
        });
        
        toast({
          title: "تم إنشاء خطة المشروع",
          description: "تم توليد خطة المشروع بنجاح باستخدام الذكاء الاصطناعي",
          variant: "default",
        });
      } else {
        throw new Error('لم يتم استلام بيانات صحيحة من الخادم');
      }
    } catch (error) {
      console.error('Error generating AI plan:', error);
      toast({
        title: "خطأ في توليد الخطة",
        description: "حدث خطأ أثناء توليد خطة المشروع باستخدام الذكاء الاصطناعي",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAIPlan(false);
    }
  };
  
  // Function to create the project
  const createProject = async () => {
    if (!validateStepOne()) return;
    
    try {
      setIsLoading(true);
      
      // Prepare project data for creation
      const projectData = {
        name: formData.name,
        description: formData.description,
        clientId: parseInt(formData.client),
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
        projectType: formData.projectType,
        priority: formData.priority,
        budget: formData.budget,
        // If we have AI generated plan, include it
        aiPlan: aiPlan ? {
          subgoals: aiPlan.subgoals,
          kpis: aiPlan.kpis,
          timeline: aiPlan.timeline
        } : null
      };
      
      const response = await apiRequest('POST', '/api/projects', projectData);
      const result = await response.json();
      
      toast({
        title: "تم الإنشاء بنجاح",
        description: "تم إنشاء المشروع بنجاح",
        variant: "default",
      });
      
      // Redirect to project details
      navigate(`/dashboard/agency/projects/${result.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "خطأ في إنشاء المشروع",
        description: "حدث خطأ أثناء إنشاء المشروع",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper functions
  const getFieldLabel = (field: keyof ProjectFormData): string => {
    const labels: Record<keyof ProjectFormData, string> = {
      name: "اسم المشروع",
      description: "وصف المشروع",
      client: "العميل",
      startDate: "تاريخ البدء",
      endDate: "تاريخ الانتهاء",
      projectType: "نوع المشروع",
      budget: "الميزانية",
      priority: "الأولوية"
    };
    return labels[field];
  };
  
  const getProjectTypeName = (typeValue: string): string => {
    const type = projectTypes.find(t => t.value === typeValue);
    return type ? type.label : 'غير محدد';
  };
  
  return (
    <DashboardLayout title="إنشاء مشروع يدوي">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Steps Indicator */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <div className={`h-1 ${currentStep >= 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className="absolute top-0 left-0 transform -translate-y-1/2 -translate-x-1/2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className={`h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
              <div className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between max-w-3xl mx-auto mt-2 text-sm">
            <div className={`text-center ${currentStep >= 1 ? 'text-primary font-medium' : 'text-gray-500'}`}>
              معلومات المشروع
            </div>
            <div className={`text-center ${currentStep >= 2 ? 'text-primary font-medium' : 'text-gray-500'}`}>
              خطة المشروع المفصلة
            </div>
          </div>
        </motion.div>
        
        {/* Step 1 - Basic Project Information */}
        {currentStep === 1 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">معلومات المشروع الأساسية</CardTitle>
                <CardDescription>أدخل المعلومات الأساسية للمشروع الجديد</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Project Name */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="name">اسم المشروع</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => getAIAssistance('name')}
                      className="text-xs h-6 px-2 text-primary"
                      disabled={isLoading}
                    >
                      <RiMagicLine className="mr-1" /> مساعدة الذكاء الاصطناعي
                    </Button>
                  </div>
                  <Input
                    id="name"
                    placeholder="أدخل اسم المشروع"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                
                {/* Project Description */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="description">وصف المشروع</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => getAIAssistance('description')}
                      className="text-xs h-6 px-2 text-primary"
                      disabled={isLoading}
                    >
                      <RiMagicLine className="mr-1" /> مساعدة الذكاء الاصطناعي
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    placeholder="أدخل وصف تفصيلي للمشروع وأهدافه"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Selection */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="client">العميل</Label>
                      {clients.length === 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "إنشاء عميل جديد",
                              description: "سيتم توجيهك إلى صفحة إنشاء عميل جديد بعد النقر على 'موافق'",
                              action: (
                                <Button
                                  onClick={() => navigate('/dashboard/agency/clients')}
                                  className="bg-primary text-white"
                                  size="sm"
                                >
                                  موافق
                                </Button>
                              )
                            });
                          }}
                          className="text-xs h-6 px-2 text-primary"
                        >
                          + إنشاء عميل
                        </Button>
                      )}
                    </div>
                    <Select
                      value={formData.client}
                      onValueChange={(value) => handleChange('client', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={clients.length === 0 ? "لا يوجد عملاء - أضف عميلاً أولاً" : "اختر العميل"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.length > 0 ? (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-4 text-center text-sm text-gray-500">
                            لا يوجد عملاء. يرجى إنشاء عميل أولاً.
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    {/* في حالة عدم وجود عملاء، إضافة تنبيه */}
                    {clients.length === 0 && (
                      <div className="flex items-center mt-2 text-xs text-amber-600 gap-1">
                        <RiInformationLine className="flex-shrink-0" />
                        <span>يجب إنشاء عميل واحد على الأقل قبل إنشاء المشروع</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Project Type */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="projectType">نوع المشروع</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => getAIAssistance('projectType')}
                        className="text-xs h-6 px-2 text-primary"
                        disabled={isLoading}
                      >
                        <RiMagicLine className="mr-1" /> مساعدة
                      </Button>
                    </div>
                    <Select
                      value={formData.projectType}
                      onValueChange={(value) => handleChange('projectType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع المشروع" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="startDate">تاريخ البدء</Label>
                    <DatePicker
                      date={formData.startDate || undefined}
                      setDate={(date: Date | undefined) => handleChange('startDate', date)}
                      placeholder="اختر تاريخ البدء"
                    />
                  </div>
                  
                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="endDate">تاريخ الانتهاء المتوقع</Label>
                    <DatePicker
                      date={formData.endDate || undefined}
                      setDate={(date: Date | undefined) => handleChange('endDate', date)}
                      placeholder="اختر تاريخ الانتهاء"
                    />
                  </div>
                  
                  {/* Budget */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="budget">الميزانية</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => getAIAssistance('budget')}
                        className="text-xs h-6 px-2 text-primary"
                        disabled={isLoading}
                      >
                        <RiMagicLine className="mr-1" /> مساعدة
                      </Button>
                    </div>
                    <Input
                      id="budget"
                      placeholder="أدخل ميزانية المشروع التقديرية"
                      value={formData.budget || ''}
                      onChange={(e) => handleChange('budget', e.target.value)}
                    />
                  </div>
                  
                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">الأولوية</Label>
                    <Select
                      value={formData.priority || 'medium'}
                      onValueChange={(value) => handleChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="حدد أولوية المشروع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">عالية</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="low">منخفضة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t pt-6 flex justify-between">
                <div className="text-sm text-gray-500 max-w-xs">
                  بعد إدخال المعلومات الأساسية، يمكنك الانتقال للخطوة الثانية لإضافة خطة المشروع التفصيلية
                </div>
                <Button 
                  onClick={proceedToNextStep}
                  className="gap-1"
                >
                  الخطوة التالية <RiArrowLeftLine />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
        
        {/* Step 2 - Detailed Project Plan */}
        {currentStep === 2 && (
          <motion.div variants={itemVariants} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">خطة المشروع المفصلة</CardTitle>
                <CardDescription>أضف أهداف فرعية ومهام للمشروع أو استخدم الذكاء الاصطناعي لتوليدها</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {!aiPlan ? (
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto mb-4 flex items-center justify-center">
                      <RiMagicLine size={24} />
                    </div>
                    <h3 className="text-lg font-medium mb-2">استخدم الذكاء الاصطناعي</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      يمكن للذكاء الاصطناعي تحليل معلومات المشروع وتوليد خطة متكاملة تتضمن الأهداف الفرعية والمهام ومؤشرات الأداء والجدول الزمني.
                    </p>
                    <Button 
                      variant="default"
                      size="lg"
                      onClick={generateAIProjectPlan}
                      disabled={isGeneratingAIPlan}
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      {isGeneratingAIPlan ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>جاري توليد خطة المشروع...</span>
                        </>
                      ) : (
                        <>
                          <RiMagicLine size={18} />
                          <span>توليد خطة المشروع الذكية</span>
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Tabs defaultValue="subgoals" value={activeAITab} onValueChange={setActiveAITab}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="subgoals">الأهداف الفرعية والمهام</TabsTrigger>
                        <TabsTrigger value="kpis">مؤشرات الأداء</TabsTrigger>
                        <TabsTrigger value="timeline">الجدول الزمني</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="subgoals" className="space-y-4">
                        <div className="flex justify-between mb-3">
                          <h3 className="text-lg font-medium">
                            الأهداف الفرعية والمهام
                            <Badge className="mr-2 bg-primary/10 text-primary border-primary/20">
                              {aiPlan.subgoals.length}
                            </Badge>
                          </h3>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveAITab('kpis')}
                            className="gap-1"
                          >
                            مؤشرات الأداء <RiArrowLeftLine />
                          </Button>
                        </div>
                        
                        <Accordion type="multiple" className="space-y-3">
                          {aiPlan.subgoals.map((subgoal, index) => (
                            <AccordionItem 
                              key={`subgoal-${index}`} 
                              value={`subgoal-${index}`}
                              className="border border-gray-200 rounded-lg"
                            >
                              <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:bg-gray-50">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                    <RiListCheck size={14} />
                                  </div>
                                  <span>{subgoal.title}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4 pt-2">
                                <div className="mb-3">
                                  <p className="text-gray-600">{subgoal.description}</p>
                                </div>
                                
                                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                                  <RiCheckLine size={16} className="text-green-600" />
                                  المهام ({subgoal.tasks.length})
                                </h4>
                                <div className="space-y-2 pr-2">
                                  {subgoal.tasks.map((task, taskIndex) => (
                                    <div 
                                      key={`task-${index}-${taskIndex}`}
                                      className="border-r-2 border-primary/30 pr-3 py-1"
                                    >
                                      <div className="font-medium text-sm">{task.title}</div>
                                      {task.description && (
                                        <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </TabsContent>
                      
                      <TabsContent value="kpis" className="space-y-4">
                        <div className="flex justify-between mb-3">
                          <h3 className="text-lg font-medium">
                            مؤشرات الأداء (KPIs)
                            <Badge className="mr-2 bg-primary/10 text-primary border-primary/20">
                              {aiPlan.kpis.length}
                            </Badge>
                          </h3>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setActiveAITab('subgoals')}
                              className="gap-1"
                            >
                              <RiArrowRightLine /> الأهداف الفرعية
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setActiveAITab('timeline')}
                              className="gap-1"
                            >
                              الجدول الزمني <RiArrowLeftLine />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {aiPlan.kpis.map((kpi, index) => (
                            <Card key={`kpi-${index}`} className="overflow-hidden">
                              <CardHeader className="bg-gray-50 py-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <RiLineChartLine size={14} />
                                  </div>
                                  {kpi.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="py-3">
                                <p className="text-sm text-gray-600">
                                  {kpi.description}
                                </p>
                                {kpi.targetValue && (
                                  <div className="mt-2 text-sm">
                                    <span className="font-medium">القيمة المستهدفة:</span> {kpi.targetValue}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="timeline" className="space-y-4">
                        <div className="flex justify-between mb-3">
                          <h3 className="text-lg font-medium">
                            الجدول الزمني
                            <Badge className="mr-2 bg-primary/10 text-primary border-primary/20">
                              {aiPlan.timeline.length}
                            </Badge>
                          </h3>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveAITab('kpis')}
                            className="gap-1"
                          >
                            <RiArrowRightLine /> مؤشرات الأداء
                          </Button>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute top-0 bottom-0 right-4 w-0.5 bg-gray-200"></div>
                          
                          {aiPlan.timeline.map((milestone, index) => (
                            <div 
                              key={`milestone-${index}`}
                              className="relative mb-6 mr-10"
                            >
                              <div className="absolute top-1 right-[-1.65rem]">
                                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                  <RiTimeLine />
                                </div>
                              </div>
                              <div className="pr-2">
                                <div className="flex items-center">
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                    الأسبوع {milestone.week}
                                  </Badge>
                                  <h4 className="font-medium mr-2">{milestone.title}</h4>
                                </div>
                                {milestone.description && (
                                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <div className="text-amber-500">
                          <RiInformationLine size={18} />
                        </div>
                        <p>
                          يمكنك تعديل الخطة المقترحة بعد إنشاء المشروع، أو يمكنك إعادة توليد خطة جديدة.
                        </p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={generateAIProjectPlan}
                        disabled={isGeneratingAIPlan}
                        className="gap-1"
                      >
                        <RiMagicLine /> إعادة توليد الخطة
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="border-t pt-6 flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="gap-1"
                >
                  <RiArrowRightLine /> العودة للخطوة السابقة
                </Button>
                <Button 
                  onClick={createProject}
                  disabled={isLoading}
                  className="gap-1 bg-secondary hover:bg-secondary/90"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>جاري إنشاء المشروع...</span>
                    </>
                  ) : (
                    <>
                      <RiFileListLine /> إنشاء المشروع
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Sharing Options */}
            <motion.div 
              variants={itemVariants}
              className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <RiFilePdfLine size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">مشاركة مخطط المشروع مع العميل</h3>
                <p className="text-sm text-gray-500">
                  يمكنك مشاركة خطة المشروع المقترحة مع العميل كملف PDF بتنسيق احترافي
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "ميزة قادمة قريبًا",
                    description: "ستتوفر هذه الميزة في التحديث القادم",
                    variant: "default",
                  });
                }}
                className="flex-shrink-0"
              >
                توليد PDF
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}