import React, { useState } from 'react';
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
  const { toasts, removeToast } = useToastContext();
  
  // Set dashboard type based on current route
  useDashboardType();

  return (
    <div className="flex h-screen overflow-hidden bg-lightBg">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:mr-64">
        {/* Header */}
        <Header 
          title={title} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        {/* Page Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
        
        {/* Toast Notifications */}
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
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
