import { Link, useLocation } from 'wouter';
import { useDashboardContext } from '@/context/DashboardContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { dashboardType } = useDashboardContext();
  
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
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`w-64 bg-white shadow-md fixed h-full z-30 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-md w-8 h-8 flex items-center justify-center">
              <span className="text-white text-lg font-bold">ت</span>
            </div>
            <h1 className="text-xl font-bold text-darkText">تاسكايا</h1>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-800">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <nav className="p-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">{dashboardTitle}</h2>
          <ul>
            {links.map((link) => (
              <li key={link.path} className="mb-1">
                <Link 
                  href={link.path}
                  className={`flex items-center gap-2 p-2 rounded-md font-medium ${
                    isActive(link.path)
                      ? 'text-primary bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <i className={`fas ${link.icon}`}></i>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <h2 className="text-sm font-semibold text-gray-500 mt-6 mb-2">الإعدادات</h2>
          <ul>
            <li className="mb-1">
              <a
                href="#"
                className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <i className="fas fa-cog"></i>
                <span>الإعدادات العامة</span>
              </a>
            </li>
            <li className="mb-1">
              <Link
                href="/dashboard/agency/ai-settings"
                className={`flex items-center gap-2 p-2 rounded-md font-medium ${
                  isActive('/dashboard/agency/ai-settings')
                    ? 'text-primary bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-brain"></i>
                <span>إعدادات الذكاء الاصطناعي</span>
              </Link>
            </li>
          </ul>
          
          {/* Dashboard Type Switcher (for development purposes) */}
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">تبديل لوحة التحكم</h2>
            <ul>
              <li className="mb-1">
                <Link 
                  href="/dashboard/agency/overview"
                  className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <i className="fas fa-building"></i>
                  <span>لوحة الوكالة</span>
                </Link>
              </li>
              <li className="mb-1">
                <Link 
                  href="/dashboard/client/overview"
                  className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <i className="fas fa-user-tie"></i>
                  <span>لوحة العميل</span>
                </Link>
              </li>
              <li className="mb-1">
                <Link 
                  href="/dashboard/admin/overview"
                  className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <i className="fas fa-user-shield"></i>
                  <span>لوحة المدير</span>
                </Link>
              </li>
              <li className="mb-1">
                <Link 
                  href="/dashboard/employee/overview"
                  className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <i className="fas fa-user"></i>
                  <span>لوحة الموظف</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}
