import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// أنواع المساعدين الذكية التي يمكن للمستخدم الاختيار منها
const AI_PERSONALITIES = [
  { 
    id: 'professional', 
    name: 'محترف', 
    description: 'مساعد محترف ورسمي يعطي إجابات دقيقة وموضوعية',
    systemPrompt: 'أنت مساعد محترف ودقيق تقدم إجابات واضحة وموجزة. تتحدث بأسلوب رسمي وتعطي معلومات موثوقة.'
  },
  { 
    id: 'friendly_egyptian', 
    name: 'ودود مصري', 
    description: 'مساعد ودود يتحدث باللهجة المصرية ويشرح الأمور التقنية بطريقة مبسطة',
    systemPrompt: 'انت مساعد ودود بتتكلم باللهجة المصرية وبتشرح الحاجات التقنية بطريقة سهلة ومبسطة. بتفضل تسأل أسئلة لفهم احتياجات العميل بشكل أفضل، وبتستخدم أمثلة عملية للتوضيح. على الرغم من لهجتك المصرية، بتحافظ على المصطلحات التقنية الصحيحة.'
  },
  { 
    id: 'marketing_expert', 
    name: 'خبير تسويق', 
    description: 'مساعد متخصص في التسويق والترويج للمشاريع واستراتيجيات الأعمال',
    systemPrompt: 'أنت خبير تسويق ذو خبرة واسعة في استراتيجيات التسويق الرقمي وتطوير الأعمال. تقدم نصائح عملية وتحليلات استراتيجية لمساعدة العملاء في تحقيق أهدافهم التسويقية.'
  },
  { 
    id: 'technical_expert', 
    name: 'خبير تقني', 
    description: 'مساعد متخصص في الجوانب التقنية والتكنولوجيا والبرمجة',
    systemPrompt: 'أنت خبير تقني متخصص في مجالات البرمجة وتطوير الويب والتكنولوجيا. تقدم حلولًا تقنية وشرحًا دقيقًا للمفاهيم التقنية المعقدة بطريقة واضحة ومفهومة.'
  },
  { 
    id: 'custom', 
    name: 'تخصيص', 
    description: 'تخصيص المساعد الذكي بالكامل بما يناسب احتياجاتك',
    systemPrompt: ''
  }
];

// أنواع التفكير التي يمكن للمساعد استخدامها
const THINKING_STYLES = [
  { id: 'analytical', name: 'تحليلي', description: 'يفكر بعمق ويحلل الخيارات المختلفة' },
  { id: 'creative', name: 'إبداعي', description: 'يقدم أفكارًا جديدة وحلولًا إبداعية' },
  { id: 'practical', name: 'عملي', description: 'يركز على الحلول العملية والواقعية' },
  { id: 'strategic', name: 'استراتيجي', description: 'يفكر على المدى الطويل ويضع الخطط الاستراتيجية' }
];

export default function AiSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState('professional');
  const [customPrompt, setCustomPrompt] = useState('');
  const [agencyContext, setAgencyContext] = useState('');
  const [thinkingStyle, setThinkingStyle] = useState('analytical');
  const [temperature, setTemperature] = useState(0.7);
  const [speakEgyptian, setSpeakEgyptian] = useState(false);
  const [useTechnicalTerms, setUseTechnicalTerms] = useState(true);
  
  // متغيرات اختبار البرومبت
  const [testMessage, setTestMessage] = useState('');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testMessages, setTestMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'مرحبًا! أنا المساعد الذكي الخاص بك. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // تحميل الإعدادات المحفوظة عند تحميل الصفحة
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await apiRequest('GET', '/api/ai/settings');
        if (response.ok) {
          const settings = await response.json();
          setSelectedPersonality(settings.personality || 'professional');
          setCustomPrompt(settings.customPrompt || '');
          setAgencyContext(settings.agencyContext || '');
          setThinkingStyle(settings.thinkingStyle || 'analytical');
          setTemperature(settings.temperature || 0.7);
          setSpeakEgyptian(settings.speakEgyptian || false);
          setUseTechnicalTerms(settings.useTechnicalTerms || true);
        }
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      }
    };

    loadSettings();
  }, []);

  // متغير جديد لتخزين البرومبت النهائي المعدل يدويًا
  const [manualFinalPrompt, setManualFinalPrompt] = useState<string>('');
  
  // علامة لتحديد ما إذا كان البرومبت النهائي معدل يدويًا
  const [isPromptManuallyEdited, setIsPromptManuallyEdited] = useState<boolean>(false);
  
  // إعداد البرومبت النهائي بناءً على الاختيارات
  const generateFinalPrompt = () => {
    // إذا كان البرومبت معدلًا يدويًا، نعيد البرومبت المعدل
    if (isPromptManuallyEdited) {
      return manualFinalPrompt;
    }
    
    let finalPrompt = '';
    
    // إضافة برومبت الشخصية المختارة
    if (selectedPersonality === 'custom') {
      finalPrompt = customPrompt;
    } else {
      const personality = AI_PERSONALITIES.find(p => p.id === selectedPersonality);
      finalPrompt = personality ? personality.systemPrompt : '';
    }
    
    // إضافة سياق الوكالة إذا تم توفيره
    if (agencyContext.trim()) {
      finalPrompt += `\n\nمعلومات عن الوكالة والسياق: ${agencyContext}`;
    }
    
    // إضافة أسلوب التفكير
    const style = THINKING_STYLES.find(s => s.id === thinkingStyle);
    if (style) {
      finalPrompt += `\n\nأسلوب تفكيرك: ${style.name}. ${style.description}.`;
    }
    
    // إضافة تفضيلات اللغة
    if (speakEgyptian && selectedPersonality !== 'friendly_egyptian') {
      finalPrompt += '\n\nتحدث باللهجة المصرية العامية مع الحفاظ على المصطلحات التقنية.';
    }
    
    if (useTechnicalTerms) {
      finalPrompt += '\n\nاستخدم المصطلحات التقنية المناسبة في مجال التسويق وتطوير المشاريع.';
    } else {
      finalPrompt += '\n\nبسط المصطلحات التقنية واشرحها بطريقة سهلة الفهم.';
    }

    // إضافة تعليمات عامة للسلوك
    finalPrompt += `
\n\nإرشادات إضافية:
1. كن استباقيًا واسأل أسئلة ذكية للحصول على مزيد من المعلومات عندما تكون بحاجة لها.
2. حاول استخلاص الحقائق المهمة من إجابات العميل واستخدمها في الحوار لاحقًا.
3. قدم اقتراحات قيمة وأفكارًا إبداعية تساعد في تطوير المشروع.
4. كن مهتمًا ومتفاعلًا وحاول فهم احتياجات العميل الحقيقية.
5. عندما تكتشف شيئًا ذا قيمة في كلام العميل، أشر إليه واستخدمه في تقديم مقترحات إضافية.`;

    return finalPrompt;
  };
  
  // التعامل مع تغييرات البرومبت اليدوية
  const handleManualPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualFinalPrompt(e.target.value);
    setIsPromptManuallyEdited(true);
  }
  
  // تحديث البرومبت النهائي المعدل عند تغيير الإعدادات
  useEffect(() => {
    if (!isPromptManuallyEdited) {
      setManualFinalPrompt(generateFinalPrompt());
    }
  }, [selectedPersonality, customPrompt, agencyContext, thinkingStyle, speakEgyptian, useTechnicalTerms]);

  // حفظ الإعدادات
  const saveSettings = async () => {
    setLoading(true);
    
    try {
      // استخدام البرومبت المحرر يدويًا إذا كان موجودًا
      const finalPrompt = isPromptManuallyEdited ? manualFinalPrompt : generateFinalPrompt();
      
      const settings = {
        personality: selectedPersonality,
        customPrompt,
        agencyContext,
        thinkingStyle,
        temperature,
        speakEgyptian,
        useTechnicalTerms,
        finalPrompt,
        isManuallyEdited: isPromptManuallyEdited
      };
      
      const response = await apiRequest('POST', '/api/ai/settings', settings);
      
      if (response.ok) {
        toast({
          title: 'تم الحفظ بنجاح',
          description: 'تم حفظ إعدادات المساعد الذكي بنجاح',
        });
      } else {
        throw new Error('فشل في حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving AI settings:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // التبديل بين الشخصيات
  const handlePersonalityChange = (value: string) => {
    setSelectedPersonality(value);
    
    // إذا تم اختيار "friendly_egyptian"، تلقائيًا نضبط اللهجة المصرية
    if (value === 'friendly_egyptian') {
      setSpeakEgyptian(true);
    }
    
    // إذا تم اختيار "custom"، نعرض الخيارات المخصصة
    if (value === 'custom' && !customPrompt) {
      setCustomPrompt('أنت مساعد ذكي متخصص في مساعدة وكالات التسويق على إدارة مشاريعهم. قم بتوفير معلومات دقيقة وشاملة، واسأل أسئلة ذكية للمساعدة في تطوير المشاريع.');
    }
  };

  // تمرير رسالة جديدة وتلقي الرد من المساعد الذكي
  const handleTestChat = async () => {
    if (!testMessage.trim()) return;

    // إضافة رسالة المستخدم إلى المحادثة
    const userMessage = { role: 'user', content: testMessage };
    setTestMessages([...testMessages, userMessage]);
    setTestMessage('');
    setIsTestLoading(true);

    // جعل التمرير التلقائي إلى أسفل
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);

    try {
      // استخدام البرومبت المعدل يدويًا إذا كان موجودًا
      const finalPromptToUse = isPromptManuallyEdited ? manualFinalPrompt : generateFinalPrompt();
      
      // إرسال طلب إلى API مع البرومبت المخصص
      const response = await apiRequest('POST', '/api/ai/chat/test', {
        message: testMessage,
        systemPrompt: finalPromptToUse,
        temperature
      });

      if (response.ok) {
        const data = await response.json();
        setTestMessages([...testMessages, userMessage, { role: 'assistant', content: data.content }]);
      } else {
        throw new Error('فشل في الاتصال بالمساعد الذكي');
      }
    } catch (error) {
      console.error('Error in test chat:', error);
      setTestMessages([
        ...testMessages, 
        userMessage, 
        { role: 'assistant', content: 'عذراً، حدث خطأ أثناء محاولة الاتصال. يرجى المحاولة مرة أخرى.' }
      ]);
    } finally {
      setIsTestLoading(false);
      
      // جعل التمرير التلقائي إلى أسفل بعد تلقي الرد
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  // حفظ الإعدادات وتطبيقها على المنصة بالكامل
  const saveAndApplySettings = async () => {
    setLoading(true);
    
    try {
      // استخدام البرومبت المحرر يدويًا إذا كان موجودًا
      const finalPrompt = isPromptManuallyEdited ? manualFinalPrompt : generateFinalPrompt();
      
      const settings = {
        personality: selectedPersonality,
        customPrompt,
        agencyContext,
        thinkingStyle,
        temperature,
        speakEgyptian,
        useTechnicalTerms,
        finalPrompt,
        isManuallyEdited: isPromptManuallyEdited,
        isGlobalApplied: true // علامة لتطبيق الإعدادات على كل المنصة
      };
      
      const response = await apiRequest('POST', '/api/ai/settings/apply', settings);
      
      if (response.ok) {
        toast({
          title: 'تم التطبيق بنجاح',
          description: 'تم تطبيق إعدادات المساعد الذكي على المنصة بالكامل',
        });
      } else {
        throw new Error('فشل في تطبيق الإعدادات');
      }
    } catch (error) {
      console.error('Error applying AI settings:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تطبيق الإعدادات على المنصة',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="إعدادات المساعد الذكي">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">إعدادات المساعد الذكي</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>تخصيص المساعد الذكي</CardTitle>
            <CardDescription>قم بضبط إعدادات المساعد الذكي الخاص بك ليلائم احتياجاتك</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personality" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="personality">الشخصية والسلوك</TabsTrigger>
                <TabsTrigger value="context">السياق والمعلومات</TabsTrigger>
                <TabsTrigger value="advanced">إعدادات متقدمة</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personality" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="personality">شخصية المساعد</Label>
                    <Select 
                      value={selectedPersonality} 
                      onValueChange={handlePersonalityChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر شخصية المساعد" />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_PERSONALITIES.map((personality) => (
                          <SelectItem key={personality.id} value={personality.id}>
                            {personality.name} - {personality.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedPersonality === 'custom' && (
                    <div>
                      <Label htmlFor="customPrompt">برومبت مخصص</Label>
                      <Textarea
                        id="customPrompt"
                        placeholder="أدخل البرومبت المخصص هنا..."
                        className="h-32"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        حدد تعليمات واضحة وشاملة للمساعد الذكي ليتبعها في المحادثات.
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="thinkingStyle">أسلوب التفكير</Label>
                    <Select value={thinkingStyle} onValueChange={setThinkingStyle}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر أسلوب التفكير" />
                      </SelectTrigger>
                      <SelectContent>
                        {THINKING_STYLES.map((style) => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name} - {style.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="context" className="space-y-6">
                <div>
                  <Label htmlFor="agencyContext">معلومات عن الوكالة والسياق</Label>
                  <Textarea
                    id="agencyContext"
                    placeholder="أدخل معلومات عن وكالتك، تخصصها، عملائها، وأي سياق مهم للمشاريع..."
                    className="h-32"
                    value={agencyContext}
                    onChange={(e) => setAgencyContext(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    قدم معلومات عن وكالتك لمساعدة الذكاء الاصطناعي على فهم سياق عملك بشكل أفضل.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <Label htmlFor="temperature">مستوى الإبداعية (درجة الحرارة)</Label>
                      <span className="text-sm text-gray-500">{temperature}</span>
                    </div>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[temperature]}
                      onValueChange={(values) => setTemperature(values[0])}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>دقيق ومحدد</span>
                      <span>إبداعي ومتنوع</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse justify-between border p-4 rounded-md">
                    <div>
                      <Label htmlFor="egyptianDialect" className="text-base">التحدث باللهجة المصرية</Label>
                      <p className="text-sm text-gray-500">جعل المساعد يتحدث باللهجة المصرية العامية</p>
                    </div>
                    <Switch
                      id="egyptianDialect"
                      checked={speakEgyptian}
                      onCheckedChange={setSpeakEgyptian}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse justify-between border p-4 rounded-md">
                    <div>
                      <Label htmlFor="technicalTerms" className="text-base">استخدام المصطلحات التقنية</Label>
                      <p className="text-sm text-gray-500">السماح باستخدام المصطلحات التقنية المتخصصة</p>
                    </div>
                    <Switch
                      id="technicalTerms"
                      checked={useTechnicalTerms}
                      onCheckedChange={setUseTechnicalTerms}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => window.history.back()}>إلغاء</Button>
            <Button onClick={saveSettings} disabled={loading}>
              {loading ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>معاينة البرومبت النهائي</CardTitle>
            <CardDescription>هذا هو البرومبت الذي سيتم استخدامه لتوجيه المساعد الذكي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Textarea
                className="h-64 font-mono text-sm mb-2 relative"
                value={isPromptManuallyEdited ? manualFinalPrompt : generateFinalPrompt()}
                onChange={handleManualPromptChange}
              />
              {isPromptManuallyEdited && (
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setIsPromptManuallyEdited(false);
                      setManualFinalPrompt(generateFinalPrompt());
                      toast({
                        title: "تم إعادة التعيين",
                        description: "تم إعادة تعيين البرومبت إلى النسخة المولدة تلقائيًا",
                      });
                    }}
                  >
                    إعادة التوليد التلقائي
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>ملاحظة:</strong> يمكنك تعديل البرومبت مباشرة حسب احتياجاتك، ثم اختباره في المحادثة أدناه قبل تطبيقه على المنصة بالكامل.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>تلميح:</strong> أضف تعليمات وأمثلة محددة للحصول على أفضل النتائج من المساعد الذكي.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>اختبار البرومبت</CardTitle>
            <CardDescription>جرب محادثة مع المساعد الذكي باستخدام البرومبت الذي قمت بإنشائه</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              ref={chatContainerRef} 
              className="border rounded-md p-4 mb-4 h-80 overflow-y-auto"
            >
              <div className="space-y-4">
                {/* عرض المحادثة التجريبية */}
                {testMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`rounded-lg p-3 max-w-3/4 ${message.role === 'assistant' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {isTestLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg p-3 bg-muted">
                      <div className="flex space-x-2 space-x-reverse">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                placeholder="اكتب رسالة لاختبار المساعد الذكي..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTestChat();
                  }
                }}
                disabled={isTestLoading}
              />
              <Button 
                size="sm" 
                onClick={handleTestChat} 
                disabled={!testMessage.trim() || isTestLoading}
              >
                <i className="fas fa-paper-plane ml-1"></i>
                إرسال
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>تطبيق البرومبت</CardTitle>
            <CardDescription>بعد الانتهاء من اختبار وتعديل البرومبت، يمكنك تطبيقه على المنصة بالكامل</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              بعد تطبيق البرومبت، سيتم استخدامه في جميع المحادثات المستقبلية مع المساعد الذكي في أنحاء المنصة المختلفة.
            </p>
            <div className="flex justify-end">
              <Button onClick={saveAndApplySettings} disabled={loading}>
                {loading ? 'جارٍ التطبيق...' : 'تطبيق على المنصة بالكامل'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}