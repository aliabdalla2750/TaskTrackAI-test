import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import useToast from '@/hooks/useToast';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  isTyping?: boolean;
  timestamp?: Date;
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
  const toast = useToast();
  
  useEffect(() => {
    // أضف رسالة الترحيب عند تحميل المكون إذا لم تكن هناك رسائل أولية
    if (initialMessages.length === 0) {
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'ai' as const,
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [welcomeMessage, initialMessages]);
  
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
      id: Date.now().toString(),
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
      });
      
      const data = await response.json();
      
      // استبدال مؤشر الكتابة بالاستجابة الفعلية
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId
            ? {
                id: typingId,
                sender: 'ai' as const,
                content: data.response,
                timestamp: new Date(),
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
      
      toast.error('خطأ في الاتصال', 'فشل في الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.');
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
