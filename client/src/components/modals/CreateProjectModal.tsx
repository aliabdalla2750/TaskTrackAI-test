import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AiChatBox } from '@/components/dashboard/AiChatBox';
import { apiRequest } from '@/lib/queryClient';
import useToast from '@/hooks/useToast';
import { useLocation } from 'wouter';

interface ProjectResult {
  title: string;
  description: string;
  subgoals: { title: string; description: string }[];
  tasks: { title: string; description: string; deadline: string }[];
  timeline: { startDate: string; endDate: string; duration: string };
}

export function CreateProjectModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'input' | 'ai-chat' | 'review'>('input');
  const [projectName, setProjectName] = useState('');
  const [clientId, setClientId] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [aiResult, setAiResult] = useState<ProjectResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const [, navigate] = useLocation();
  
  const handleAiResult = (result: ProjectResult) => {
    setAiResult(result);
    setStep('review');
  };
  
  const createProject = async () => {
    if (!aiResult) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/projects', {
        name: projectName || aiResult.title,
        description: projectDetails || aiResult.description,
        clientId: clientId || null,
        subgoals: aiResult.subgoals,
        tasks: aiResult.tasks,
        timeline: aiResult.timeline,
      });
      
      const data = await response.json();
      
      toast.success('تم بنجاح', 'تم إنشاء المشروع بنجاح');
      setOpen(false);
      setStep('input');
      setProjectName('');
      setClientId('');
      setProjectDetails('');
      setAiResult(null);
      
      // Navigate to projects page
      navigate('/dashboard/agency/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('خطأ', 'فشل في إنشاء المشروع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-animate bg-secondary hover:bg-opacity-90 text-white">
          <i className="fas fa-plus ml-2"></i>
          <span>إنشاء مشروع ذكي</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء مشروع ذكي جديد</DialogTitle>
        </DialogHeader>
        
        {step === 'input' && (
          <div className="space-y-4 py-4">
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
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">شركة السلام</SelectItem>
                  <SelectItem value="2">شركة النور</SelectItem>
                  <SelectItem value="3">شركة العالمية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>وصف المشروع أو العقد</Label>
              <div className="border border-gray-300 rounded-md p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm">
                      مرحباً! أنا مساعدك في إنشاء المشروع. يمكنك وصف تفاصيل المشروع أو نسخ نص العقد هنا،
                      وسأقوم بتحليله وتحويله إلى مشروع متكامل مع أهداف ومهام.
                    </p>
                  </div>
                </div>
                
                <Textarea
                  value={projectDetails}
                  onChange={(e) => setProjectDetails(e.target.value)}
                  placeholder="اكتب تفاصيل المشروع أو انسخ نص العقد هنا..."
                  className="h-32"
                />
                
                <div className="mt-4">
                  <Button
                    onClick={() => setStep('ai-chat')}
                    disabled={!projectDetails.trim()}
                    className="btn-animate bg-primary hover:bg-opacity-90 text-white w-full"
                  >
                    <i className="fas fa-magic ml-2"></i>
                    <span>إنشاء مشروع ذكي</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 'ai-chat' && (
          <div className="py-4">
            <AiChatBox
              title=""
              welcomeMessage={`مرحباً! سأساعدك في إنشاء مشروع جديد بناءً على المعلومات التي قدمتها. المشروع هو: "${projectName || 'مشروع جديد'}".\n\nالتفاصيل التي قدمتها: "${projectDetails}"\n\nدعني أسألك بعض الأسئلة الإضافية لفهم متطلبات المشروع بشكل أفضل.`}
              scenarioKey="project-creation"
              onResultGenerated={handleAiResult}
            />
          </div>
        )}
        
        {step === 'review' && aiResult && (
          <div className="py-4">
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
