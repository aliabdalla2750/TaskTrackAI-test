import { Link, useLocation } from 'wouter';
import { useDashboardContext } from '@/context/DashboardContext';
import { motion } from 'framer-motion';
import {
  RiDashboardLine, RiFolderOpenLine, RiMagicLine, RiTaskLine,
  RiTeamLine, RiUser3Line, RiFileTextLine, RiRobot2Line,
  RiSettings3Line, RiBrainLine, RiBuildingLine, RiUserStarLine,
  RiShieldUserLine, RiUserLine, RiCloseLine, RiMenuLine,
  RiCodeSSlashLine, RiServerLine, RiChat1Line, RiClipboardLine, RiLineChartLine,
  RiFileList2Line, RiFilePaper2Line, RiBarChartBoxLine, RiCalendarCheckLine, RiFileChartLine,
  RiMoneyDollarCircleLine
} from 'react-icons/ri';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const sideVariants = {
  closed: {
    x: '100%',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40
    }
  },
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  closed: { opacity: 0, x: 20 },
  open: { opacity: 1, x: 0 }
};

interface SidebarLinkProps {
  path: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const SidebarLink = ({ path, icon, label, active }: SidebarLinkProps) => {
  // Check if this is a new link that should be highlighted
  const isNewFeature = label.includes('🆕');
  
  return (
    <motion.li variants={itemVariants} className="mb-2 relative">
      <Link 
        href={path}
        className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-300 ${
          active
            ? 'text-white bg-primary shadow-md'
            : 'text-gray-700 hover:bg-accent hover:text-primary'
        } ${isNewFeature && !active ? 'border-2 border-secondary' : ''}`}
      >
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
        {isNewFeature && !active && (
          <div className="absolute right-1 top-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        )}
        {active && <div className="absolute -right-1 w-1.5 h-7 bg-secondary rounded-l-md"></div>}
      </Link>
    </motion.li>
  );
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { dashboardType } = useDashboardContext();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const agencyLinks = [
    { path: '/', icon: <RiDashboardLine />, label: 'لوحة التحكم المحسنة' },
    { path: '/dashboard/agency/overview', icon: <RiDashboardLine />, label: 'نظرة عامة' },
    { path: '/dashboard/agency/projects', icon: <RiFolderOpenLine />, label: 'المشاريع' },
    { path: '/dashboard/agency/create-smart-project', icon: <RiMagicLine />, label: 'إنشاء مشروع ذكي' },
    { path: '/dashboard/agency/create-manual-project', icon: <RiFileList2Line />, label: 'إنشاء مشروع يدوي' },
    { path: '/dashboard/agency/tasks', icon: <RiTaskLine />, label: 'المهام' },
    { path: '/dashboard/agency/daily-standup', icon: <RiClipboardLine />, label: 'خطة العمل اليومية' },
    { path: '/dashboard/agency/daily-review', icon: <RiLineChartLine />, label: 'مراجعة التقارير اليومية 🆕' },
    
    // Reports section
    { path: '/dashboard/agency/weekly-reports', icon: <RiFilePaper2Line />, label: 'التقارير الأسبوعية 🆕' },
    { path: '/dashboard/agency/monthly-report', icon: <RiBarChartBoxLine />, label: 'التقرير الشهري 🆕' },
    { path: '/dashboard/agency/billing', icon: <RiMoneyDollarCircleLine />, label: 'الفواتير والمدفوعات 🆕' },
    
    { path: '/dashboard/agency/team', icon: <RiTeamLine />, label: 'فريق العمل' },
    { path: '/dashboard/agency/clients', icon: <RiUser3Line />, label: 'العملاء' },
    { path: '/dashboard/agency/files', icon: <RiFileTextLine />, label: 'الملفات' },
    { path: '/dashboard/agency/ai-assistant', icon: <RiRobot2Line />, label: 'المساعد الذكي' },
  ];
  
  const clientLinks = [
    { path: '/dashboard/client/overview', icon: <RiDashboardLine />, label: 'نظرة عامة' },
    { path: '/dashboard/client/projects', icon: <RiFolderOpenLine />, label: 'المشاريع' },
    { path: '/dashboard/client/tasks', icon: <RiTaskLine />, label: 'المهام' },
    { path: '/dashboard/client/files', icon: <RiFileTextLine />, label: 'الملفات' },
  ];
  
  const adminLinks = [
    { path: '/dashboard/admin/overview', icon: <RiDashboardLine />, label: 'نظرة عامة' },
    { path: '/dashboard/admin/users', icon: <RiTeamLine />, label: 'المستخدمين' },
    { path: '/dashboard/admin/ai-scenarios', icon: <RiRobot2Line />, label: 'سيناريوهات الذكاء الاصطناعي' },
    { path: '/dashboard/admin/ai-providers', icon: <RiServerLine />, label: 'مزودي الذكاء الاصطناعي' },
    { path: '/dashboard/admin/ai-chat-test', icon: <RiChat1Line />, label: 'اختبار الذكاء الاصطناعي' },
  ];
  
  const employeeLinks = [
    { path: '/dashboard/employee/overview', icon: <RiDashboardLine />, label: 'نظرة عامة' },
    { path: '/dashboard/employee/tasks', icon: <RiTaskLine />, label: 'المهام' },
    { path: '/dashboard/employee/daily-tasks', icon: <RiClipboardLine />, label: 'المهام اليومية' },
    { path: '/dashboard/employee/daily-standup', icon: <RiClipboardLine />, label: 'التقرير اليومي 🆕' },
    { path: '/dashboard/employee/submissions', icon: <RiFileTextLine />, label: 'التسليمات' },
    { path: '/dashboard/employee/performance', icon: <RiLineChartLine />, label: 'الأداء' },
    { path: '/dashboard/employee/files', icon: <RiFileTextLine />, label: 'الملفات' },
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
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <motion.aside 
        variants={sideVariants}
        initial={{ x: 0 }}  
        animate={open ? "open" : { x: "100%" }}
        className="w-72 bg-white shadow-xl fixed h-full z-30 overflow-hidden lg:translate-x-0 overflow-y-auto lg:relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-l from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg w-10 h-10 flex items-center justify-center shadow-md">
              <span className="text-white text-xl font-bold">ت</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">تاسكايا</h1>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <RiCloseLine size={24} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-4">
          <motion.div variants={itemVariants}>
            <h2 className="text-sm font-bold text-gray-500 mb-3 px-3">{dashboardTitle}</h2>
          </motion.div>
          
          <motion.ul className="space-y-1">
            {links.map((link) => (
              <SidebarLink 
                key={link.path}
                path={link.path}
                icon={link.icon}
                label={link.label}
                active={isActive(link.path)}
              />
            ))}
          </motion.ul>
          
          <motion.div variants={itemVariants} className="mt-8">
            <h2 className="text-sm font-bold text-gray-500 mb-3 px-3">الإعدادات</h2>
          </motion.div>
          
          <motion.ul className="space-y-1">
            <SidebarLink 
              path="#"
              icon={<RiSettings3Line />}
              label="الإعدادات العامة"
              active={false}
            />
            <SidebarLink 
              path="/dashboard/agency/ai-settings"
              icon={<RiBrainLine />}
              label="إعدادات الذكاء الاصطناعي"
              active={isActive('/dashboard/agency/ai-settings')}
            />
          </motion.ul>
          
          {/* Dashboard Type Switcher */}
          <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-gray-100">
            <h2 className="text-sm font-bold text-gray-500 mb-3 px-3">تبديل لوحة التحكم</h2>
            <div className="bg-accent rounded-lg p-3">
              <motion.ul className="space-y-1">
                <SidebarLink 
                  path="/dashboard/agency/overview"
                  icon={<RiBuildingLine />}
                  label="لوحة الوكالة"
                  active={dashboardType === 'agency'}
                />
                <SidebarLink 
                  path="/dashboard/client/overview"
                  icon={<RiUserStarLine />}
                  label="لوحة العميل"
                  active={dashboardType === 'client'}
                />
                <SidebarLink 
                  path="/dashboard/admin/overview"
                  icon={<RiShieldUserLine />}
                  label="لوحة المدير"
                  active={dashboardType === 'admin'}
                />
                <SidebarLink 
                  path="/dashboard/employee/overview"
                  icon={<RiUserLine />}
                  label="لوحة الموظف"
                  active={dashboardType === 'employee'}
                />
              </motion.ul>
            </div>
          </motion.div>
        </nav>
      </motion.aside>
    </>
  );
}
