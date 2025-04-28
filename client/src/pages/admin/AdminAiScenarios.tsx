import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { AiChatBox } from '@/components/dashboard/AiChatBox';
import useToast from '@/hooks/useToast';

interface AiScenario {
  id: number;
  scenarioKey: string;
  title: string;
  description: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAiScenarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [testScenarioId, setTestScenarioId] = useState<number | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [testTokens, setTestTokens] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Form state for new scenario
  const [newScenario, setNewScenario] = useState({
    scenarioKey: '',
    title: '',
    description: '',
    systemPrompt: '',
    model: 'gpt-4o',
    temperature: 70,
    maxTokens: 4000,
    isActive: true
  });

  // Fetch scenarios
  const { data, isLoading: isFetchingScenarios } = useQuery<{ scenarios: AiScenario[] }>({
    queryKey: ['/api/admin/ai-scenarios'],
  });

  // Create scenario mutation
  const createScenario = useMutation({
    mutationFn: (scenarioData: typeof newScenario) => 
      apiRequest('POST', '/api/admin/ai-scenarios', scenarioData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-scenarios'] });
      toast.success('تم بنجاح', 'تمت إضافة السيناريو بنجاح');
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('خطأ', 'فشل في إضافة السيناريو');
      console.error('Failed to create scenario:', error);
    }
  });

  // Toggle scenario status mutation
  const toggleScenarioStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: number, isActive: boolean }) => 
      apiRequest('PUT', `/api/admin/ai-scenarios/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-scenarios'] });
      toast.success('تم بنجاح', 'تم تحديث حالة السيناريو بنجاح');
    },
    onError: (error) => {
      toast.error('خطأ', 'فشل في تحديث حالة السيناريو');
      console.error('Failed to update scenario status:', error);
    }
  });

  // Reset form
  const resetForm = () => {
    setNewScenario({
      scenarioKey: '',
      title: '',
      description: '',
      systemPrompt: '',
      model: 'gpt-4o',
      temperature: 70,
      maxTokens: 4000,
      isActive: true
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createScenario.mutate(newScenario);
  };

  // Test scenario
  const testScenario = async (id: number, message: string) => {
    setIsLoading(true);
    setTestResponse('');
    setTestTokens(0);
    
    try {
      const response = await apiRequest('POST', `/api/admin/ai-scenarios/${id}/test`, { message });
      const data = await response.json();
      setTestResponse(data.response);
      setTestTokens(data.tokensUsed);
      toast.success('تم بنجاح', 'تم اختبار السيناريو بنجاح');
    } catch (error) {
      toast.error('خطأ', 'فشل في اختبار السيناريو');
      console.error('Failed to test scenario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter scenarios
  const filteredScenarios = data?.scenarios.filter(scenario => 
    scenario.title.includes(searchTerm) || 
    scenario.description.includes(searchTerm) || 
    scenario.scenarioKey.includes(searchTerm)
  ) || [];

  return (
    <DashboardLayout title="سيناريوهات الذكاء الاصطناعي">
      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">سيناريوهات الذكاء الاصطناعي</h2>
            <p className="text-gray-600">إدارة وتخصيص سيناريوهات الذكاء الاصطناعي المستخدمة في المنصة</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-animate bg-secondary hover:bg-opacity-90 text-white">
                <i className="fas fa-plus ml-2"></i>
                <span>إضافة سيناريو جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة سيناريو ذكاء اصطناعي جديد</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان السيناريو</Label>
                    <Input 
                      id="title" 
                      value={newScenario.title}
                      onChange={(e) => setNewScenario({...newScenario, title: e.target.value})}
                      placeholder="أدخل عنوان السيناريو" 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scenarioKey">مفتاح السيناريو (بالإنجليزية)</Label>
                    <Input 
                      id="scenarioKey" 
                      value={newScenario.scenarioKey}
                      onChange={(e) => setNewScenario({...newScenario, scenarioKey: e.target.value})}
                      placeholder="مثال: project-creation" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">وصف السيناريو</Label>
                  <Input 
                    id="description" 
                    value={newScenario.description}
                    onChange={(e) => setNewScenario({...newScenario, description: e.target.value})}
                    placeholder="أدخل وصف السيناريو" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">تعليمات النظام (System Prompt)</Label>
                  <Textarea 
                    id="systemPrompt" 
                    value={newScenario.systemPrompt}
                    onChange={(e) => setNewScenario({...newScenario, systemPrompt: e.target.value})}
                    placeholder="أدخل تعليمات النظام للذكاء الاصطناعي..." 
                    className="min-h-32"
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">نموذج الذكاء الاصطناعي</Label>
                    <Select 
                      value={newScenario.model} 
                      onValueChange={(value) => setNewScenario({...newScenario, model: value})}
                    >
                      <SelectTrigger id="model">
                        <SelectValue placeholder="اختر النموذج" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="temperature">
                      درجة الإبداع (Temperature): {newScenario.temperature / 100}
                    </Label>
                    <Slider 
                      id="temperature" 
                      min={0} 
                      max={100} 
                      step={1} 
                      value={[newScenario.temperature]}
                      onValueChange={(value) => setNewScenario({...newScenario, temperature: value[0]})}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>دقيق (0)</span>
                      <span>متوازن (0.7)</span>
                      <span>إبداعي (1)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">الحد الأقصى للتوكنز</Label>
                    <Select 
                      value={newScenario.maxTokens.toString()} 
                      onValueChange={(value) => setNewScenario({...newScenario, maxTokens: parseInt(value)})}
                    >
                      <SelectTrigger id="maxTokens">
                        <SelectValue placeholder="اختر الحد الأقصى" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000">1000</SelectItem>
                        <SelectItem value="2000">2000</SelectItem>
                        <SelectItem value="4000">4000</SelectItem>
                        <SelectItem value="8000">8000</SelectItem>
                        <SelectItem value="16000">16000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    id="isActive" 
                    checked={newScenario.isActive}
                    onCheckedChange={(checked) => setNewScenario({...newScenario, isActive: checked})}
                  />
                  <Label htmlFor="isActive">تفعيل السيناريو</Label>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="btn-animate bg-primary hover:bg-opacity-90 text-white"
                    disabled={createScenario.isPending}
                  >
                    {createScenario.isPending ? (
                      <span className="flex items-center gap-2">
                        <i className="fas fa-spinner fa-spin"></i>
                        جاري الإضافة...
                      </span>
                    ) : (
                      'إضافة السيناريو'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <Input
          placeholder="البحث عن سيناريو..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>
      
      {/* Scenarios List */}
      {isFetchingScenarios ? (
        <div className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
          <p>جاري تحميل البيانات...</p>
        </div>
      ) : filteredScenarios.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <i className="fas fa-robot text-4xl text-gray-300 mb-2"></i>
          <p className="text-gray-500">لا توجد سيناريوهات تطابق معايير البحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredScenarios.map((scenario) => (
            <Card key={scenario.id} className="overflow-hidden">
              <CardHeader className="border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {scenario.title}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        scenario.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {scenario.isActive ? 'مفعل' : 'غير مفعل'}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">مفتاح السيناريو: {scenario.scenarioKey}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={scenario.isActive}
                      onCheckedChange={(checked) => toggleScenarioStatus.mutate({
                        id: scenario.id,
                        isActive: checked
                      })}
                    />
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="ml-2"
                      onClick={() => setTestScenarioId(testScenarioId === scenario.id ? null : scenario.id)}
                    >
                      <i className="fas fa-vial ml-2"></i>
                      <span>اختبار</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">التفاصيل</TabsTrigger>
                    <TabsTrigger value="system-prompt">تعليمات النظام</TabsTrigger>
                    {testScenarioId === scenario.id && (
                      <TabsTrigger value="test">اختبار السيناريو</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="details">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold mb-1">الوصف</h3>
                        <p className="text-sm text-gray-600">{scenario.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="text-sm font-semibold mb-1">النموذج</h3>
                          <p className="text-sm text-gray-600">{scenario.model}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-semibold mb-1">درجة الإبداع</h3>
                          <p className="text-sm text-gray-600">{scenario.temperature / 100}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-semibold mb-1">الحد الأقصى للتوكنز</h3>
                          <p className="text-sm text-gray-600">{scenario.maxTokens}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h3 className="font-semibold mb-1">تاريخ الإنشاء</h3>
                          <p className="text-gray-600">
                            {new Date(scenario.createdAt).toLocaleDateString('ar-AE')}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-1">آخر تحديث</h3>
                          <p className="text-gray-600">
                            {new Date(scenario.updatedAt).toLocaleDateString('ar-AE')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="system-prompt">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="text-sm font-semibold mb-2">تعليمات النظام (System Prompt)</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{scenario.systemPrompt}</p>
                    </div>
                  </TabsContent>
                  
                  {testScenarioId === scenario.id && (
                    <TabsContent value="test">
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h3 className="text-sm font-semibold mb-2">اختبار السيناريو</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            يمكنك اختبار هذا السيناريو عن طريق إدخال رسالة وإرسالها ليتم معالجتها بواسطة النموذج.
                          </p>
                          
                          <div className="flex gap-2 mb-4">
                            <Input 
                              placeholder="اكتب رسالة الاختبار هنا..."
                              value={testMessage}
                              onChange={(e) => setTestMessage(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              onClick={() => testScenario(scenario.id, testMessage)}
                              disabled={isLoading || !testMessage.trim()}
                              className="btn-animate bg-primary hover:bg-opacity-90 text-white"
                            >
                              {isLoading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <span>اختبار</span>
                              )}
                            </Button>
                          </div>
                          
                          {testResponse && (
                            <div className="mt-4">
                              <h3 className="text-sm font-semibold mb-2">نتيجة الاختبار</h3>
                              <div className="bg-white border rounded-md p-4">
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{testResponse}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                عدد التوكنز المستخدمة: {testTokens}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
