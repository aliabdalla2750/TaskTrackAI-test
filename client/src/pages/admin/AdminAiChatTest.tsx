import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AiProvider {
  id: number;
  name: string;
  displayName: string;
  baseUrl: string;
  apiKey: string;
  isEnabled: boolean;
}

interface AiModel {
  id: number;
  providerId: number;
  name: string;
  displayName: string;
  maxTokens: number;
  isDefault: boolean;
  isEnabled: boolean;
}

export default function AdminAiChatTest() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const { toast } = useToast();

  // استعلام لقائمة مزودي الذكاء الإصطناعي
  const providersQuery = useQuery({
    queryKey: ['/api/admin/ai-providers'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // استعلام لقائمة نماذج الذكاء الإصطناعي بناءً على المزود المحدد
  const modelsQuery = useQuery({
    queryKey: ['/api/admin/ai-models', selectedProvider],
    enabled: !!selectedProvider,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      if (!selectedProvider) return [];
      const providers = (providersQuery.data || []) as AiProvider[];
      const provider = providers.find((p) => p.id.toString() === selectedProvider);
      if (!provider) return [];
      const response = await apiRequest(
        'GET', 
        `/api/admin/ai-providers/${provider.id}/models`
      );
      return response.json();
    }
  });

  const providers = (providersQuery.data || []) as AiProvider[];
  const models = (modelsQuery.data || []) as AiModel[];

  // إضافة رسالة نظام افتراضية عند تحميل الصفحة
  useEffect(() => {
    setMessages([
      {
        role: 'system',
        content: 'أنت مساعد ذكي من تاسكايا، تساعد في إدارة المشاريع وإنشاء محتوى احترافي.'
      }
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    if (!selectedProvider || !selectedModel) {
      toast({
        title: 'تنبيه',
        description: 'يرجى اختيار مزود ونموذج الذكاء الاصطناعي أولاً',
        variant: 'destructive',
      });
      return;
    }
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await apiRequest(
        'POST',
        '/api/admin/ai-chat/test',
        {
          providerId: parseInt(selectedProvider),
          modelId: parseInt(selectedModel),
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في الحصول على رد من الذكاء الاصطناعي');
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      console.error('خطأ في استدعاء الذكاء الاصطناعي:', error);
      toast({
        title: 'خطأ',
        description: `فشل في الاتصال بالذكاء الاصطناعي: ${error?.message || 'حدث خطأ غير معروف'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="اختبار الذكاء الاصطناعي">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold mb-2">اختبار محادثة الذكاء الاصطناعي</CardTitle>
            <p className="text-sm text-gray-500">
              اختبر محادثة الذكاء الاصطناعي مع مختلف المزودين والنماذج قبل تطبيقها على المنصة
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium mb-2">مزود الذكاء الاصطناعي</label>
                <Select
                  value={selectedProvider}
                  onValueChange={setSelectedProvider}
                  disabled={providersQuery.isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مزود الذكاء الاصطناعي" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider: AiProvider) => (
                      <SelectItem key={provider.id} value={provider.id.toString()}>
                        {provider.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium mb-2">نموذج الذكاء الاصطناعي</label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  disabled={!selectedProvider || modelsQuery.isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نموذج الذكاء الاصطناعي" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model: AiModel) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 mb-4 h-[400px] overflow-y-auto bg-gray-50">
              {messages.slice(1).map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 p-3 rounded-lg max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-primary text-white mr-auto'
                      : 'bg-white border border-gray-200 shadow-sm ml-auto'
                  }`}
                >
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              ))}
              {loading && (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="اكتب رسالتك هنا..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={loading}
                className="flex-grow"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={loading || !input.trim()}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                إرسال
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}