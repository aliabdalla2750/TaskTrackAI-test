import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';
import useToast from '@/hooks/useToast';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  isTyping?: boolean;
}

interface AiChatBoxProps {
  title: string;
  welcomeMessage?: string;
  scenarioKey?: string;
  onResultGenerated?: (result: any) => void;
}

export function AiChatBox({
  title,
  welcomeMessage = 'مرحباً بك! أنا المساعد الذكي الخاص بك في تاسكايا. كيف يمكنني مساعدتك اليوم؟',
  scenarioKey = 'general',
  onResultGenerated,
}: AiChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  
  useEffect(() => {
    // Add welcome message when component mounts
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        content: welcomeMessage,
      },
    ]);
  }, [welcomeMessage]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
    };
    
    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    
    // Add AI typing indicator
    const typingId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        sender: 'ai',
        content: '',
        isTyping: true,
      },
    ]);
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/ai/chat', {
        message: input,
        scenarioKey,
      });
      
      const data = await response.json();
      
      // Replace typing indicator with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId
            ? {
                id: typingId,
                sender: 'ai',
                content: data.response,
              }
            : msg
        )
      );
      
      // If there's a structured result to pass to parent
      if (data.result && onResultGenerated) {
        onResultGenerated(data.result);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Replace typing indicator with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId
            ? {
                id: typingId,
                sender: 'ai',
                content: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
              }
            : msg
        )
      );
      
      toast.error('خطأ في الاتصال', 'فشل في الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
      )}
      
      <div className="flex flex-col gap-4 max-h-80 overflow-y-auto mb-4">
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
              className={`rounded-lg p-3 max-w-md ${
                message.sender === 'ai'
                  ? 'bg-gray-100'
                  : 'bg-primary bg-opacity-10'
              }`}
            >
              {message.isTyping ? (
                <p className="text-sm typing-effect">جاري الكتابة...</p>
              ) : (
                <p className="text-sm">{message.content}</p>
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
      
      <div className="flex">
        <input
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
          className="btn-animate bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-l-md disabled:opacity-50"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}
