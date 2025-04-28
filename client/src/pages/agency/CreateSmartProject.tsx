import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AiChatBox } from '@/components/dashboard/AiChatBox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface ProjectResult {
  title: string;
  description: string;
  subgoals: { title: string; description: string }[];
  tasks: { title: string; description: string; deadline: string }[];
  timeline: { startDate: string; endDate: string; duration: string };
}

export default function CreateSmartProject() {
  const [projectName, setProjectName] = useState('');
  const [clientId, setClientId] = useState('');
  const [step, setStep] = useState<'form' | 'ai-chat' | 'review'>('form');
  const [aiResult, setAiResult] = useState<ProjectResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const handleStartChat = () => {
    if (!projectName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المشروع",
        variant: "destructive",
      });
      return;
    }
    
    setStep('ai-chat');
  };
  
  const handleAiResult = async (result: any) => {
    // التأكد من أن النتيجة تحتوي على محتوى من النوع الصحيح
    if (result.type === 'project_creation') {
      setIsSubmitting(true);
      
      try {
        // استدعاء واجهة برمجة التطبيقات للحصول على نتيجة منظمة للمشروع
        const response = await apiRequest('POST', '/api/ai/project-creation', {
          projectName: projectName,
          projectDetails: result.content
        });
        
        const data = await response.json();
        
        // تحديث حالة المكون بنتيجة المشروع المنظم
        if (data.result) {
          setAiResult(data.result);
          setStep('review');
          toast({
            title: "تم التحليل بنجاح",
            description: "تم تحليل المشروع وإنشاء خطة متكاملة. يرجى مراجعة التفاصيل.",
            variant: "default",
          });
        } else {
          throw new Error('لم يتم العثور على بيانات المشروع');
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
      const response = await apiRequest('POST', '/api/projects', {
        name: projectName,
        description: aiResult.description,
        clientId: clientId || null,
        subgoals: aiResult.subgoals,
        tasks: aiResult.tasks,
        timeline: aiResult.timeline,
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
            
            <div className="flex justify-end">
              <Button onClick={handleStartChat} className="btn-animate bg-primary hover:bg-opacity-90 text-white">
                <i className="fas fa-robot ml-2"></i>
                <span>بدء المحادثة مع المساعد الذكي</span>
              </Button>
            </div>
          </CardContent>
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
              welcomeMessage={`مرحباً! سأساعدك في إنشاء مشروع جديد. اسم المشروع هو: "${projectName}".\n\nدعني أسألك بعض الأسئلة لفهم متطلبات المشروع بشكل أفضل.`}
              scenarioKey="project-creation"
              onResultGenerated={handleAiResult}
            />
          </CardContent>
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
                  onClick={() => setStep('ai-chat')}
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
