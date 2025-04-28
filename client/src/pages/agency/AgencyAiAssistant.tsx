import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AiChatBox } from '@/components/dashboard/AiChatBox';
import useToast from '@/hooks/useToast';

export default function AgencyAiAssistant() {
  const [activeTab, setActiveTab] = useState('general');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const toast = useToast();
  
  // AI assistant scenarios
  const scenarios = [
    {
      id: 'general',
      title: 'المساعد العام',
      description: 'مساعد ذكي عام يمكنه الإجابة على الأسئلة وتقديم المساعدة في مختلف المجالات.',
      welcomeMessage: 'مرحباً بك! أنا المساعد الذكي العام الخاص بك في تاسكايا. كيف يمكنني مساعدتك اليوم؟',
    },
    {
      id: 'project',
      title: 'إنشاء مشروع',
      description: 'مساعد متخصص في إنشاء وتخطيط المشاريع وتقسيمها إلى مهام وأهداف.',
      welcomeMessage: 'مرحباً! أنا مساعدك في إنشاء المشاريع. يمكنني مساعدتك في تحويل فكرة المشروع أو نص العقد إلى خطة عمل متكاملة. كيف يمكنني مساعدتك اليوم؟',
    },
    {
      id: 'content',
      title: 'إنشاء محتوى',
      description: 'مساعد متخصص في كتابة وتحرير المحتوى التسويقي والإعلاني.',
      welcomeMessage: 'مرحباً! أنا مساعدك في إنشاء المحتوى. يمكنني مساعدتك في كتابة محتوى جذاب ومقنع لمختلف الأغراض التسويقية. ما نوع المحتوى الذي تحتاج إلى إنشائه؟',
    },
    {
      id: 'marketing',
      title: 'استراتيجيات التسويق',
      description: 'مساعد متخصص في وضع وتطوير استراتيجيات التسويق وخطط الحملات الإعلانية.',
      welcomeMessage: 'مرحباً! أنا مساعدك في استراتيجيات التسويق. يمكنني مساعدتك في تطوير خطط تسويقية فعالة وتحليل الأسواق والمنافسين. ما هو التحدي التسويقي الذي تواجهه حالياً؟',
    },
  ];
  
  const currentScenario = scenarios.find(s => s.id === activeTab) || scenarios[0];
  
  return (
    <DashboardLayout title="المساعد الذكي">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">المساعد الذكي</h2>
            <p className="text-gray-600">تفاعل مع الذكاء الاصطناعي للحصول على المساعدة في مختلف المهام</p>
          </div>
          
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">نموذج الذكاء:</span>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="اختر النموذج" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">OpenAI GPT-4o</SelectItem>
                <SelectItem value="claude-3-7-sonnet-20250219">Claude Sonnet 3.7</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Scenario Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-white shadow-sm grid grid-cols-1 sm:grid-cols-4">
          {scenarios.map(scenario => (
            <TabsTrigger key={scenario.id} value={scenario.id} className="data-[state=active]:bg-primary data-[state=active]:text-white">
              {scenario.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {/* Current Scenario Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{currentScenario.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{currentScenario.description}</p>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1">
              <i className="fas fa-robot text-primary"></i>
              <span>النموذج: {selectedModel}</span>
            </div>
            <div className="flex items-center gap-1">
              <i className="fas fa-temperature-low text-secondary"></i>
              <span>درجة الإبداع: متوسطة</span>
            </div>
            <div className="flex items-center gap-1">
              <i className="fas fa-history text-primary"></i>
              <span>المحادثات محفوظة</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <AiChatBox
          title=""
          welcomeMessage={currentScenario.welcomeMessage}
          scenarioKey={currentScenario.id}
        />
      </div>
      
      {/* Usage Stats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">إحصائيات الاستخدام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500 mb-1">الطلبات هذا الشهر</p>
              <p className="font-bold text-lg">157 <span className="text-xs font-normal text-gray-500">من أصل 500</span></p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-primary rounded-full h-2" style={{ width: '31%' }}></div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500 mb-1">عدد التوكنز</p>
              <p className="font-bold text-lg">205,482</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-secondary rounded-full h-2" style={{ width: '41%' }}></div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500 mb-1">عدد المحادثات</p>
              <p className="font-bold text-lg">24</p>
              <div className="text-xs text-gray-500 mt-1">آخر محادثة: منذ 35 دقيقة</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
