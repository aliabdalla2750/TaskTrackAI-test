import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { FixedSidebar } from './FixedSidebar';
import { Header } from './HeaderNew';
import { ToastNotification } from '@/components/ui/toast-notification';
import { useToastContext } from '@/context/ToastContext';
import useDashboardType from '@/hooks/useDashboardType';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Fixed Sidebar for larger screens */}
      <div className="hidden lg:block"> 
        <FixedSidebar />
      </div>
      
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <Header 
          title={title} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        {/* Page Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="p-5 sm:p-7"
        >
          {children}
        </motion.div>
        
        {/* Toast Notifications */}
        <AnimatePresence>
          <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <ToastNotification
                  type={toast.type}
                  title={toast.title}
                  message={toast.message}
                  onClose={() => removeToast(toast.id)}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
}
