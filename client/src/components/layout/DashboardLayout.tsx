import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastNotification } from '@/components/ui/toast-notification';
import { useToastContext } from '@/context/ToastContext';
import useDashboardType from '@/hooks/useDashboardType';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const { toasts, removeToast } = useToastContext();
  
  // Set dashboard type based on current route
  useDashboardType();

  useEffect(() => {
    // تطبيق تأثير ظهور المحتوى بعد التحميل
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden lg:mr-64 transition-all duration-300">
        {/* Header */}
        <Header 
          title={title} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        {/* Page Content */}
        <div 
          className={`flex-1 overflow-y-auto p-6 transition-opacity duration-500 ${
            pageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="container max-w-7xl mx-auto">
            {children}
          </div>
        </div>
        
        {/* Toast Notifications */}
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
          {toasts.map((toast) => (
            <ToastNotification
              key={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
