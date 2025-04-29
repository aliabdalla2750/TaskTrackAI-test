import { Link, useLocation } from 'wouter';
import { useDashboardContext } from '@/context/DashboardContext';
import { motion } from 'framer-motion';
import {
  RiDashboardLine, RiFolderOpenLine, RiMagicLine, RiTaskLine,
  RiTeamLine, RiUser3Line, RiFileTextLine, RiRobot2Line,
  RiSettings3Line, RiBrainLine, RiBuildingLine, RiUserStarLine,
  RiShieldUserLine, RiUserLine, RiCloseLine, RiMenuLine,
  RiCodeSSlashLine, RiServerLine, RiChat1Line, RiClipboardLine, RiLineChartLine
} from 'react-icons/ri';

interface SidebarLinkProps {
  path: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

const SidebarLink = ({ path, icon, label, active }: SidebarLinkProps) => {
  return (
    <motion.li 
      variants={itemVariants}
      initial="initial"
      animate="animate"
      className="mb-2"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <Link 
          href={path}
          className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-300 ${
            active
              ? 'text-white bg-primary shadow-md'
              : 'text-gray-700 hover:bg-accent hover:text-primary'
          }`}
        >
          <span className="text-lg">{icon}</span>
          <span>{label}</span>
        </Link>
        {active && (
          <motion.div 
            className="absolute top-1/2 -right-1 w-1.5 h-7 bg-secondary rounded-l-md" 
            style={{ transform: 'translateY(-50%)' }}
            layoutId="activeIndicator"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </div>
    </motion.li>
  );
};

export function FixedSidebar() {
  const [location] = useLocation();
  const { dashboardType } = useDashboardContext();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const agencyLinks = [
    { path: '/dashboard/agency/overview', icon: <RiDashboardLine />, label: 'نظرة عامة' },
    { path: '/dashboard/agency/projects', icon: <RiFolderOpenLine />, label: 'المشاريع' },
    { path: '/dashboard/agency/create-smart-project', icon: <RiMagicLine />, label: 'إنشاء مشروع ذكي' },
    { path: '/dashboard/agency/tasks', icon: <RiTaskLine />, label: 'المهام' },
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
    { path: '/dashboard/employee/submissions', icon: <RiClipboardLine />, label: 'التسليمات' },
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
    <div className="w-72 bg-white shadow-xl h-full overflow-y-auto border-l">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b bg-gradient-to-l from-primary/5 to-primary/10">
        <div className="flex items-center gap-3">
          <div className="bg-primary rounded-lg w-10 h-10 flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-bold">ت</span>
          </div>
          <h1 className="text-2xl font-bold text-primary">تاسكايا</h1>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-4">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-sm font-bold text-gray-500 mb-3 px-3">{dashboardTitle}</h2>
        </motion.div>
        
        <motion.ul 
          className="space-y-1"
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.1 }}
        >
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
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-sm font-bold text-gray-500 mb-3 px-3">الإعدادات</h2>
        </motion.div>
        
        <motion.ul 
          className="space-y-1"
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.1, delayChildren: 0.4 }}
        >
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
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-gray-100"
        >
          <h2 className="text-sm font-bold text-gray-500 mb-3 px-3">تبديل لوحة التحكم</h2>
          <div className="bg-accent rounded-lg p-3">
            <motion.ul 
              className="space-y-1"
              initial="initial"
              animate="animate"
              transition={{ staggerChildren: 0.1, delayChildren: 0.5 }}
            >
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
    </div>
  );
}