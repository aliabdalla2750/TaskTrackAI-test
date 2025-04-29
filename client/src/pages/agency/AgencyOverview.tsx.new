import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { TaskTable } from '@/components/dashboard/TaskTable';
import { AiChatBox } from '@/components/dashboard/AiChatBox';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  RiFolderLine, RiTrophyLine, RiTaskLine, RiTeamLine,
  RiPieChartLine, RiCalendarLine, RiBarChartLine, RiAddLine,
  RiUserLine, RiAlertLine, RiBuildingLine, RiTimeLine,
  RiFileWarningLine, RiLightbulbLine, RiPercentLine, RiMoneyDollarCircleLine,
  RiArrowLeftLine
} from 'react-icons/ri';

// نموذج بيانات للتنبيهات الذكية
interface AIAlert {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  actionText: string;
  actionRoute: string;
}

// مكون التنبيهات الذكية
const AIAlerts = ({ alerts }: { alerts: AIAlert[] }) => {
  const [, navigate] = useLocation();
  
  if (alerts.length === 0) return null;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <RiLightbulbLine size={24} className="text-secondary" />
        <h2 className="text-lg font-bold">اقتراحات ذكية</h2>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert) => {
          const bgColor = {
            'warning': 'bg-red-50 border-red-100',
            'info': 'bg-blue-50 border-blue-100',
            'success': 'bg-green-50 border-green-100'
          }[alert.type];
          
          const iconColor = {
            'warning': 'text-red-500',
            'info': 'text-blue-500',
            'success': 'text-green-500'
          }[alert.type];
          
          const Icon = {
            'warning': RiAlertLine,
            'info': RiFileWarningLine,
            'success': RiLightbulbLine
          }[alert.type];
          
          return (
            <div 
              key={alert.id}
              className={`flex items-center justify-between p-3 rounded-xl border ${bgColor}`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={iconColor} />
                <p className="text-sm text-gray-700">{alert.message}</p>
              </div>
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => navigate(alert.actionRoute)}
              >
                {alert.actionText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// مكون Smart Header للشريط العلوي الذكي
const SmartHeader = ({ agencyName, overallProgress, clientsCount }: { 
  agencyName: string, 
  overallProgress: number, 
  clientsCount: number 
}) => {
  const [, navigate] = useLocation();
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 flex flex-col md:flex-row justify-between items-center">
      <div className="welcome-message mb-4 md:mb-0">
        <h2 className="text-xl font-bold text-primary">
          مرحبًا بك في <span className="text-secondary">{agencyName}</span>
        </h2>
        <p className="text-gray-500 text-sm">
          إليك نظرة عامة على المشاريع والمهام الخاصة بوكالتك
        </p>
      </div>
      
      <div className="flex items-center gap-6">
        {/* نسبة التقدم العامة */}
        <div className="flex items-center gap-2 group relative">
          <div className="relative w-12 h-12">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="stroke-gray-200"
                fill="none"
                strokeWidth="3"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-primary"
                fill="none"
                strokeWidth="3"
                strokeDasharray={`${overallProgress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="text-sm font-medium text-center fill-primary" textAnchor="middle">{overallProgress}%</text>
            </svg>
          </div>
          <div className="hidden group-hover:block absolute top-full mt-2 bg-white shadow-lg rounded-lg p-2 z-10 w-48 right-0">
            <p className="text-xs text-gray-600">نسبة الإنجاز عبر كل المشاريع الجارية</p>
          </div>
          <span className="text-sm font-medium text-gray-700">التقدم العام</span>
        </div>
        
        {/* عدد العملاء */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/dashboard/agency/clients')}
        >
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
            <RiUserLine size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">العملاء</p>
            <p className="text-lg font-bold">{clientsCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AgencyOverview() {
  // استخدام التنقل
  const [, navigate] = useLocation();
  
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  // بيانات نموذجية للشريط العلوي
  const agencyData = {
    name: "وكالة الإبداع الرقمي",
    overallProgress: 65,
    clientsCount: 18
  };
  
  // بيانات نموذجية للتنبيهات الذكية
  const aiAlerts: AIAlert[] = [
    {
      id: '1',
      type: 'warning',
      message: 'المشروع "تطوير موقع شركة السلام" لم يُحدَّث منذ 5 أيام',
      actionText: 'متابعة',
      actionRoute: '/dashboard/agency/projects/1'
    },
    {
      id: '2',
      type: 'info',
      message: 'الموظف "سارة أحمد" تأخر في تسليم 3 مهام',
      actionText: 'عرض المهام',
      actionRoute: '/dashboard/agency/employees/2/tasks'
    },
    {
      id: '3',
      type: 'warning',
      message: 'العميل "شركة النور الجديد" لم يدفع الفاتورة المستحقة',
      actionText: 'عرض الفاتورة',
      actionRoute: '/dashboard/agency/invoices/5'
    }
  ];
  
  // بيانات المشاريع
  const recentProjects = [
    {
      id: '1',
      title: 'تطوير موقع شركة السلام',
      description: 'تطوير موقع إلكتروني متجاوب لشركة السلام للاستشارات الهندسية',
      status: 'active' as const,
      progress: 75,
      dueDate: '15/10/2023',
      team: [
        { name: 'علي محمد', avatarColor: '5A47FF' },
        { name: 'سارة أحمد', avatarColor: '00BFA6' },
        { name: 'محمد خالد', avatarColor: 'F59E0B' },
      ],
    },
    {
      id: '2',
      title: 'حملة تسويقية لمنتج جديد',
      description: 'تصميم وتنفيذ حملة تسويقية شاملة للترويج لمنتج شركة النور الجديد',
      status: 'completed' as const,
      progress: 100,
      dueDate: '05/09/2023',
      team: [
        { name: 'فاطمة علي', avatarColor: '5A47FF' },
        { name: 'عمر خالد', avatarColor: '00BFA6' },
      ],
    },
    {
      id: '3',
      title: 'تطوير تطبيق الهاتف',
      description: 'تطوير تطبيق للهواتف الذكية لشركة العالمية للخدمات الإلكترونية',
      status: 'paused' as const,
      progress: 45,
      dueDate: '30/11/2023',
      team: [
        { name: 'أحمد إبراهيم', avatarColor: '5A47FF' },
        { name: 'ليلى أحمد', avatarColor: '00BFA6' },
        { name: 'خالد محمد', avatarColor: 'F59E0B' },
      ],
    },
  ];
  
  // بيانات المهام
  const recentTasks = [
    {
      id: '1',
      title: 'تصميم الصفحة الرئيسية',
      project: 'تطوير موقع شركة السلام',
      assignee: {
        name: 'سارة أحمد',
        avatar: 'https://ui-avatars.com/api/?name=سارة+أحمد&background=00BFA6&color=fff',
      },
      dueDate: '10/10/2023',
      status: 'completed' as const,
    },
    {
      id: '2',
      title: 'برمجة وظائف التسجيل',
      project: 'تطوير موقع شركة السلام',
      assignee: {
        name: 'علي محمد',
        avatar: 'https://ui-avatars.com/api/?name=علي+محمد&background=5A47FF&color=fff',
      },
      dueDate: '12/10/2023',
      status: 'in-progress' as const,
    },
    {
      id: '3',
      title: 'تصميم بانرات الحملة',
      project: 'حملة تسويقية لمنتج جديد',
      assignee: {
        name: 'فاطمة علي',
        avatar: 'https://ui-avatars.com/api/?name=فاطمة+علي&background=5A47FF&color=fff',
      },
      dueDate: '03/09/2023',
      status: 'completed' as const,
    },
    {
      id: '4',
      title: 'تطوير واجهة المستخدم',
      project: 'تطوير تطبيق الهاتف',
      assignee: {
        name: 'أحمد إبراهيم',
        avatar: 'https://ui-avatars.com/api/?name=أحمد+إبراهيم&background=5A47FF&color=fff',
      },
      dueDate: '15/09/2023',
      status: 'overdue' as const,
    },
  ];
  
  return (
    <DashboardLayout title="نظرة عامة">
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Smart Header */}
        <motion.div variants={itemVariants}>
          <SmartHeader 
            agencyName={agencyData.name} 
            overallProgress={agencyData.overallProgress} 
            clientsCount={agencyData.clientsCount} 
          />
        </motion.div>
        
        {/* AI Alerts */}
        <motion.div variants={itemVariants}>
          <AIAlerts alerts={aiAlerts} />
        </motion.div>
        
        {/* Stats Cards - Grid 2x2 */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-4">نظرة سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              icon={<RiFolderLine size={20} />}
              title="المشاريع النشطة"
              value="12"
              progress={75}
              detailText="تقدم جيد في معظم المشاريع"
              actionLabel="عرض التفاصيل"
              color="primary"
              route="/dashboard/agency/projects"
            />
            <StatCard
              icon={<RiTaskLine size={20} />}
              title="المهام النشطة"
              value="38"
              progress={45}
              detailText="متبقي 21 مهمة للإكمال"
              actionLabel="عرض التفاصيل"
              color="info"
              route="/dashboard/agency/tasks"
            />
            <StatCard
              icon={<RiTrophyLine size={20} />}
              title="المهام المكتملة"
              value="67"
              progress={100}
              detailText="تم إنجاز 15 مهمة هذا الأسبوع"
              actionLabel="عرض التفاصيل"
              color="success"
              route="/dashboard/agency/tasks?status=completed"
            />
            <StatCard
              icon={<RiTimeLine size={20} />}
              title="المهام المتأخرة"
              value="7"
              detailText="تحتاج متابعة عاجلة"
              actionLabel="متابعة"
              color="danger"
              route="/dashboard/agency/tasks?status=late"
            />
          </div>
        </motion.div>
      
        {/* Recent Projects Section */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">المشاريع الأخيرة</h2>
            <Link href="/dashboard/agency/projects" className="text-primary text-sm flex items-center gap-1 hover:underline">
              <span>عرض الكل</span>
              <RiArrowLeftLine className="text-xs" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <div key={project.id} onClick={() => navigate(`/dashboard/agency/projects/${project.id}`)}>
                <ProjectCard
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  status={project.status}
                  progress={project.progress}
                  dueDate={project.dueDate}
                  team={project.team}
                />
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Recent Tasks Section */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">المهام الأخيرة</h2>
            <Link href="/dashboard/agency/tasks" className="text-primary text-sm flex items-center gap-1 hover:underline">
              <span>عرض الكل</span>
              <RiArrowLeftLine className="text-xs" />
            </Link>
          </div>
          
          <div className="dashboard-card">
            <TaskTable tasks={recentTasks} />
          </div>
        </motion.div>
        
        {/* AI Assistant Preview */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">المساعد الذكي</h2>
            <Link href="/dashboard/agency/ai-assistant" className="text-primary text-sm flex items-center gap-1 hover:underline">
              <span>فتح المساعد</span>
              <RiArrowLeftLine className="text-xs" />
            </Link>
          </div>
          
          <div className="dashboard-card p-0 overflow-hidden">
            <AiChatBox
              title=""
              welcomeMessage="مرحباً بك! أنا المساعد الذكي الخاص بك في تاسكايا. كيف يمكنني مساعدتك اليوم؟"
            />
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}