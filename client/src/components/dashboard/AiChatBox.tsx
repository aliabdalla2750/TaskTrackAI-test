import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  isTyping?: boolean;
  timestamp?: Date;
  actions?: Action[];
}

interface Action {
  id: string;
  label: string;
  actionType: 'create_project' | 'generate_content' | 'copy' | 'save' | 'download';
  data?: any;
}

interface AiChatBoxProps {
  title: string;
  welcomeMessage?: string;
  scenarioKey?: string;
  onResultGenerated?: (result: any) => void;
  initialMessages?: Message[];
  height?: string;
  model?: string;
}

export function AiChatBox({
  title,
  welcomeMessage = 'مرحباً بك! أنا المساعد الذكي الخاص بك في تاسكايا. كيف يمكنني مساعدتك اليوم؟',
  scenarioKey = 'general',
  onResultGenerated,
  initialMessages = [],
  height = 'max-h-80',
  model = 'gpt-4o',
}: AiChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // إضافة رسالة الترحيب عند التحميل الأولي فقط
  const welcomeMessageShownRef = useRef(false);
  
  useEffect(() => {
    // فقط إذا لم يتم عرض رسالة الترحيب بعد ولا توجد رسائل أولية
    if (!welcomeMessageShownRef.current && initialMessages.length === 0 && messages.length === 0) {
      welcomeMessageShownRef.current = true;
      setMessages([
        {
          id: `welcome-${Date.now().toString()}`,
          sender: 'ai' as const,
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);
  
  useEffect(() => {
    // انتقل إلى أسفل عند تغيير الرسائل
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // تأثير تشغيل المؤشر عند التفكير
  useEffect(() => {
    if (!isThinking) return;
    
    // تركيز مؤشر الإدخال عند إنهاء الكتابة
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isThinking, isLoading]);
  
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      id: `user-${Date.now().toString()}`,
      sender: 'user' as const,
      content: input,
      timestamp: new Date(),
    };
    
    // إضافة رسالة المستخدم إلى المحادثة
    setMessages((prev) => [...prev, userMessage as Message]);
    setInput('');
    
    // إضافة مؤشر الكتابة للذكاء الاصطناعي
    const typingId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        sender: 'ai' as const,
        content: '',
        isTyping: true,
        timestamp: new Date(),
      },
    ]);
    
    setIsLoading(true);
    setIsThinking(true);
    
    try {
      // محاكاة تأخير قصير ليكون تحميل الكتابة أكثر واقعية
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // إرسال الرسالة إلى واجهة API
      const response = await apiRequest('POST', '/api/ai/chat', {
        message: input,
        scenarioKey,
        model,
      });
      
      const data = await response.json();
      
      // استبدال مؤشر الكتابة بالاستجابة الفعلية مع إضافة الإجراءات حسب السيناريو
      let actions: Action[] = [];
      
      // إضافة إجراءات حسب نوع السيناريو
      if (scenarioKey === 'project') {
        actions = [
          {
            id: 'create-project-' + Date.now(),
            label: 'إنشاء مشروع',
            actionType: 'create_project',
            data: { content: data.response },
          },
          {
            id: 'copy-' + Date.now(),
            label: 'نسخ',
            actionType: 'copy',
            data: { content: data.response },
          },
        ];
      } else if (scenarioKey === 'content') {
        actions = [
          {
            id: 'save-content-' + Date.now(),
            label: 'حفظ المحتوى',
            actionType: 'save',
            data: { content: data.response },
          },
          {
            id: 'copy-' + Date.now(),
            label: 'نسخ',
            actionType: 'copy',
            data: { content: data.response },
          },
        ];
      } else if (scenarioKey === 'marketing') {
        actions = [
          {
            id: 'save-strategy-' + Date.now(),
            label: 'حفظ الاستراتيجية',
            actionType: 'save',
            data: { content: data.response },
          },
          {
            id: 'copy-' + Date.now(),
            label: 'نسخ',
            actionType: 'copy',
            data: { content: data.response },
          },
        ];
      } else {
        // إضافة إجراء النسخ لكل الردود
        actions = [
          {
            id: 'copy-' + Date.now(),
            label: 'نسخ',
            actionType: 'copy',
            data: { content: data.response },
          },
        ];
      }
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId
            ? {
                id: typingId,
                sender: 'ai' as const,
                content: data.response,
                timestamp: new Date(),
                actions: actions,
              }
            : msg
        )
      );
      
      // إذا كانت هناك نتيجة منظمة لتمريرها إلى الأب
      if (data.result && onResultGenerated) {
        onResultGenerated(data.result);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // استبدال مؤشر الكتابة برسالة خطأ
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId
            ? {
                id: typingId,
                sender: 'ai' as const,
                content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
                timestamp: new Date(),
              }
            : msg
        )
      );
      
      // عرض رسالة خطأ باستخدام toast
      console.error("خطأ في الاتصال بالذكاء الاصطناعي");
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // تنسيق الوقت
  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };
  
  // معالجة النقر على الإجراءات
  const handleActionClick = (action: Action) => {
    switch (action.actionType) {
      case 'copy':
        // نسخ المحتوى إلى الحافظة
        if (action.data?.content) {
          navigator.clipboard.writeText(action.data.content)
            .then(() => {
              toast({
                title: "تم النسخ بنجاح",
                description: "تم نسخ المحتوى إلى الحافظة",
              });
            })
            .catch((error) => {
              console.error('فشل نسخ النص:', error);
              toast({
                title: "فشل النسخ",
                description: "لم نتمكن من نسخ المحتوى إلى الحافظة",
                variant: "destructive",
              });
            });
        }
        break;
        
      case 'create_project':
        // استدعاء الدالة إذا تم توفيرها من المكون الأب
        if (onResultGenerated) {
          onResultGenerated({
            type: 'project_creation',
            content: action.data?.content,
          });
          toast({
            title: "جاري إنشاء المشروع",
            description: "تم إرسال طلب إنشاء المشروع",
          });
        }
        break;
        
      case 'save':
        // حفظ المحتوى
        if (onResultGenerated) {
          onResultGenerated({
            type: 'save_content',
            content: action.data?.content,
          });
          toast({
            title: "تم الحفظ",
            description: "تم حفظ المحتوى بنجاح",
          });
        }
        break;
        
      case 'generate_content':
        // توليد محتوى جديد
        if (onResultGenerated) {
          onResultGenerated({
            type: 'generate_content',
            parameters: action.data,
          });
          toast({
            title: "جاري توليد المحتوى",
            description: "تم إرسال طلب توليد المحتوى",
          });
        }
        break;
        
      case 'download':
        // تنزيل المحتوى كملف نصي
        if (action.data?.content) {
          const blob = new Blob([action.data.content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `taskaaya-content-${new Date().toISOString().slice(0, 10)}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast({
            title: "تم التنزيل",
            description: "تم تنزيل المحتوى بنجاح",
          });
        }
        break;
        
      default:
        console.warn('نوع الإجراء غير معروف:', action.actionType);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
      )}
      
      <div className={`flex flex-col gap-4 ${height} overflow-y-auto mb-4 flex-grow`}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <i className="fas fa-robot"></i>
              </div>
            )}
            
            <div
              className={`rounded-lg p-3 max-w-md relative ${
                message.sender === 'ai'
                  ? 'bg-gray-100'
                  : 'bg-primary bg-opacity-10'
              }`}
            >
              {message.isTyping ? (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* عرض الإجراءات إذا كانت متاحة */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.actions.map(action => (
                        <button
                          key={action.id}
                          onClick={() => handleActionClick(action)}
                          className="text-xs py-1 px-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                        >
                          {action.actionType === 'copy' && <i className="fas fa-copy ml-1"></i>}
                          {action.actionType === 'create_project' && <i className="fas fa-project-diagram ml-1"></i>}
                          {action.actionType === 'generate_content' && <i className="fas fa-file-alt ml-1"></i>}
                          {action.actionType === 'save' && <i className="fas fa-save ml-1"></i>}
                          {action.actionType === 'download' && <i className="fas fa-download ml-1"></i>}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {message.timestamp && (
                    <div className="text-[10px] text-gray-400 mt-1 text-right">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {message.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex mt-auto">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالتك هنا..."
          className="flex-1 border border-gray-300 rounded-r-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="btn-animate bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-l-md disabled:opacity-50 flex items-center justify-center min-w-[48px]"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
      </div>
    </div>
  );
}
