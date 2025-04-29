import { Link, useLocation } from 'wouter';
import { useDashboardContext } from '@/context/DashboardContext';
import { useState, useEffect } from 'react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { dashboardType } = useDashboardContext();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // تطبيق تأثير الظهور (fade-in) عند التحميل
    setMounted(true);
  }, []);
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const agencyLinks = [
    { path: '/dashboard/agency/overview', icon: 'fa-tachometer-alt', label: 'نظرة عامة' },
    { path: '/dashboard/agency/projects', icon: 'fa-folder-open', label: 'المشاريع' },
    { path: '/dashboard/agency/create-smart-project', icon: 'fa-magic', label: 'إنشاء مشروع ذكي' },
    { path: '/dashboard/agency/tasks', icon: 'fa-tasks', label: 'المهام' },
    { path: '/dashboard/agency/team', icon: 'fa-users', label: 'فريق العمل' },
    { path: '/dashboard/agency/clients', icon: 'fa-user-tie', label: 'العملاء' },
    { path: '/dashboard/agency/files', icon: 'fa-file-alt', label: 'الملفات' },
    { path: '/dashboard/agency/ai-assistant', icon: 'fa-robot', label: 'المساعد الذكي' },
  ];
  
  const clientLinks = [
    { path: '/dashboard/client/overview', icon: 'fa-tachometer-alt', label: 'نظرة عامة' },
    { path: '/dashboard/client/projects', icon: 'fa-folder-open', label: 'المشاريع' },
    { path: '/dashboard/client/tasks', icon: 'fa-tasks', label: 'المهام' },
    { path: '/dashboard/client/files', icon: 'fa-file-alt', label: 'الملفات' },
  ];
  
  const adminLinks = [
    { path: '/dashboard/admin/overview', icon: 'fa-tachometer-alt', label: 'نظرة عامة' },
    { path: '/dashboard/admin/users', icon: 'fa-users', label: 'المستخدمين' },
    { path: '/dashboard/admin/ai-scenarios', icon: 'fa-robot', label: 'سيناريوهات الذكاء الاصطناعي' },
    { path: '/dashboard/admin/ai-providers', icon: 'fa-server', label: 'مزودي الذكاء الاصطناعي' },
    { path: '/dashboard/admin/ai-chat-test', icon: 'fa-comment-dots', label: 'اختبار الذكاء الاصطناعي' },
  ];
  
  const employeeLinks = [
    { path: '/dashboard/employee/overview', icon: 'fa-tachometer-alt', label: 'نظرة عامة' },
    { path: '/dashboard/employee/tasks', icon: 'fa-tasks', label: 'المهام' },
    { path: '/dashboard/employee/submissions', icon: 'fa-clipboard-check', label: 'التسليمات' },
    { path: '/dashboard/employee/performance', icon: 'fa-chart-line', label: 'الأداء' },
    { path: '/dashboard/employee/files', icon: 'fa-file-alt', label: 'الملفات' },
  ];
  
  let links;
  let dashboardTitle;
  
  switch (dashboardType) {
    case 'client':
      links = clientLinks;
      dashboardTitle = 'لوحة العميل';
      break;
    case 'admin':
      links = adminLinks;
      dashboardTitle = 'لوحة المدير';
      break;
    case 'employee':
      links = employeeLinks;
      dashboardTitle = 'لوحة الموظف';
      break;
    default: // 'agency'
      links = agencyLinks;
      dashboardTitle = 'لوحة الوكالة';
  }
  
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`w-64 bg-white border-l border-gray-200 shadow-md fixed h-full z-30 transition-all duration-300 lg:translate-x-0 overflow-y-auto ${
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      >
        {/* رأس الشريط الجانبي */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-xl w-9 h-9 flex items-center justify-center shadow-button transition-all hover:bg-primary-hover">
              <span className="text-white text-lg font-bold font-arabic">ت</span>
            </div>
            <h1 className="text-xl font-arabic font-bold text-primary">تاسكايا</h1>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* قائمة التنقل */}
        <nav className="p-4">
          <h2 className="text-sm font-semibold text-gray-600 mb-3 mr-2 font-arabic">{dashboardTitle}</h2>
          <ul className="space-y-1">
            {links.map((link, index) => (
              <li key={link.path} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <Link 
                  href={link.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    isActive(link.path)
                      ? 'text-white bg-primary shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className={`fas ${link.icon} ${isActive(link.path) ? 'text-white' : 'text-accent'}`}></i>
                  <span className="font-arabic">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          {/* قسم الإعدادات */}
          <h2 className="text-sm font-semibold text-gray-600 mt-8 mb-3 mr-2 font-arabic">الإعدادات</h2>
          <ul className="space-y-1">
            <li className="animate-fade-in" style={{ animationDelay: `${links.length * 0.05}s` }}>
              <a
                href="#"
                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium"
              >
                <i className="fas fa-cog text-accent"></i>
                <span className="font-arabic">الإعدادات العامة</span>
              </a>
            </li>
            <li className="animate-fade-in" style={{ animationDelay: `${(links.length + 1) * 0.05}s` }}>
              <Link
                href="/dashboard/agency/ai-settings"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  isActive('/dashboard/agency/ai-settings')
                    ? 'text-white bg-primary shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className={`fas fa-brain ${isActive('/dashboard/agency/ai-settings') ? 'text-white' : 'text-accent'}`}></i>
                <span className="font-arabic">إعدادات الذكاء الاصطناعي</span>
              </Link>
            </li>
          </ul>
          
          {/* مبدل لوحة التحكم (لأغراض التطوير) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 mb-3 mr-2 font-arabic">تبديل لوحة التحكم</h2>
            <ul className="space-y-1">
              <li className="animate-fade-in" style={{ animationDelay: `${(links.length + 2) * 0.05}s` }}>
                <Link 
                  href="/dashboard/agency/overview"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium"
                >
                  <i className="fas fa-building text-secondary"></i>
                  <span className="font-arabic">لوحة الوكالة</span>
                </Link>
              </li>
              <li className="animate-fade-in" style={{ animationDelay: `${(links.length + 3) * 0.05}s` }}>
                <Link 
                  href="/dashboard/client/overview"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium"
                >
                  <i className="fas fa-user-tie text-secondary"></i>
                  <span className="font-arabic">لوحة العميل</span>
                </Link>
              </li>
              <li className="animate-fade-in" style={{ animationDelay: `${(links.length + 4) * 0.05}s` }}>
                <Link 
                  href="/dashboard/admin/overview"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium"
                >
                  <i className="fas fa-user-shield text-secondary"></i>
                  <span className="font-arabic">لوحة المدير</span>
                </Link>
              </li>
              <li className="animate-fade-in" style={{ animationDelay: `${(links.length + 5) * 0.05}s` }}>
                <Link 
                  href="/dashboard/employee/overview"
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium"
                >
                  <i className="fas fa-user text-secondary"></i>
                  <span className="font-arabic">لوحة الموظف</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* معلومات المستخدم */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between animate-fade-in" style={{ animationDelay: `${(links.length + 6) * 0.05}s` }}>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                  <i className="fas fa-user"></i>
                </div>
                <div>
                  <div className="font-arabic font-medium text-gray-800">أحمد محمد</div>
                  <div className="text-xs text-gray-500">مدير الوكالة</div>
                </div>
              </div>
              <button className="text-gray-500 hover:text-primary transition-colors">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
