import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  RiFolderLine, RiTrophyLine, RiTaskLine, RiTeamLine,
  RiPieChartLine, RiCalendarLine, RiBarChartLine, RiAddLine,
  RiUserLine, RiAlertLine, RiBuildingLine, RiTimeLine,
  RiFileWarningLine, RiLightbulbLine, RiPercentLine, RiMoneyDollarCircleLine
} from 'react-icons/ri';

const sampleProjects = [
  {
    id: 1,
    title: 'تطوير تطبيق الخدمات المصرفية',
    description: 'تطوير تطبيق لتسهيل الخدمات المصرفية للعملاء بما يتناسب مع المعايير الحديثة والتجارب السلسة',
    client: 'البنك الوطني',
    progress: 75,
    startDate: '2025-01-15',
    endDate: '2025-05-20',
    status: 'in-progress',
    subgoals: 8,
    completedSubgoals: 6,
    tasks: 42,
    completedTasks: 32
  },
  {
    id: 2,
    title: 'حملة تسويقية لمنتج جديد',
    description: 'تصميم وتنفيذ حملة تسويقية متكاملة لإطلاق منتج جديد في السوق المحلي والإقليمي',
    client: 'شركة الأغذية المتميزة',
    progress: 30,
    startDate: '2025-03-01',
    endDate: '2025-04-30',
    status: 'delayed',
    subgoals: 5,
    completedSubgoals: 1,
    tasks: 28,
    completedTasks: 8
  },
  {
    id: 3,
    title: 'إعادة تصميم الموقع الإلكتروني',
    description: 'إعادة تصميم كامل للموقع الإلكتروني وتحسين تجربة المستخدم مع تطبيق أحدث التقنيات',
    client: 'مؤسسة التعليم العالي',
    progress: 90,
    startDate: '2025-02-10',
    endDate: '2025-04-05',
    status: 'completed',
    subgoals: 6,
    completedSubgoals: 6,
    tasks: 35,
    completedTasks: 35
  }
];

const sampleTasks = [
  {
    id: 1,
    title: 'تصميم صفحة تسجيل الدخول',
    projectName: 'تطوير تطبيق الخدمات المصرفية',
    assignee: 'أحمد محمد',
    deadline: '2025-04-10',
    priority: 'عالي',
    status: 'مكتمل'
  },
  {
    id: 2,
    title: 'تطوير واجهة برمجة التطبيقات للمدفوعات',
    projectName: 'تطوير تطبيق الخدمات المصرفية',
    assignee: 'سارة أحمد',
    deadline: '2025-04-15',
    priority: 'عالي',
    status: 'قيد التنفيذ'
  },
  {
    id: 3,
    title: 'تصميم شعار الحملة',
    projectName: 'حملة تسويقية لمنتج جديد',
    assignee: 'يوسف علي',
    deadline: '2025-03-20',
    priority: 'متوسط',
    status: 'قيد المراجعة'
  },
  {
    id: 4,
    title: 'كتابة محتوى صفحة المنتجات',
    projectName: 'إعادة تصميم الموقع الإلكتروني',
    assignee: 'ليلى حسن',
    deadline: '2025-03-25',
    priority: 'منخفض',
    status: 'متأخر'
  },
  {
    id: 5,
    title: 'تطوير تصميم الصفحة الرئيسية',
    projectName: 'إعادة تصميم الموقع الإلكتروني',
    assignee: 'كريم محمود',
    deadline: '2025-03-28',
    priority: 'عالي',
    status: 'مكتمل'
  }
];

const taskColumns = [
  { key: 'title', title: 'المهمة', sortable: true },
  { key: 'projectName', title: 'المشروع', sortable: true },
  { key: 'assignee', title: 'المكلف', sortable: true },
  { key: 'deadline', title: 'الموعد النهائي', sortable: true },
  { 
    key: 'priority', 
    title: 'الأولوية', 
    sortable: true,
    render: (task: any) => {
      const colors: Record<string, string> = {
        'عالي': 'text-red-600 bg-red-50 border-red-200',
        'متوسط': 'text-amber-600 bg-amber-50 border-amber-200',
        'منخفض': 'text-green-600 bg-green-50 border-green-200'
      };
      
      return (
        <span className={`px-2 py-1 text-xs rounded-full border ${colors[task.priority]}`}>
          {task.priority}
        </span>
      );
    }
  },
  { 
    key: 'status', 
    title: 'الحالة', 
    sortable: true,
    render: (task: any) => {
      const colors: Record<string, string> = {
        'مكتمل': 'text-green-600 bg-green-50 border-green-200',
        'قيد التنفيذ': 'text-blue-600 bg-blue-50 border-blue-200',
        'قيد المراجعة': 'text-purple-600 bg-purple-50 border-purple-200',
        'متأخر': 'text-red-600 bg-red-50 border-red-200'
      };
      
      return (
        <span className={`px-2 py-1 text-xs rounded-full border ${colors[task.status]}`}>
          {task.status}
        </span>
      );
    }
  }
];

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

const EnhancedAgencyDashboard = () => {
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
  
  // معالج إنشاء مشروع جديد
  const handleCreateProject = () => {
    navigate('/dashboard/agency/create-project');
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
      message: 'المشروع "تطوير تطبيق الخدمات المصرفية" لم يُحدَّث منذ 5 أيام',
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
      message: 'العميل "شركة الأغذية المتميزة" لم يدفع الفاتورة المستحقة',
      actionText: 'عرض الفاتورة',
      actionRoute: '/dashboard/agency/invoices/5'
    }
  ];
  
  return (
    <DashboardLayout title="لوحة التحكم">
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
              icon={<RiTaskLine size={20} />}
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
        
        {/* Project Overview */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">المشاريع الحالية</h2>
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={handleCreateProject}
            >
              <RiAddLine size={18} />
              <span>إنشاء مشروع</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {sampleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                {...project}
                onClick={() => console.log(`Clicked project ${project.id}`)}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Recent Tasks */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-4">المهام الحالية</h2>
          <DataTable
            data={sampleTasks}
            columns={taskColumns}
            keyExtractor={(item) => item.id}
            searchPlaceholder="بحث في المهام..."
            emptyMessage="لا توجد مهام حالية"
          />
        </motion.div>
        
        {/* Activity Chart (Placeholder) */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-4">نشاط الفريق</h2>
          <div className="dashboard-card p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button className="btn btn-outline py-1 px-3 text-sm flex items-center gap-1">
                  <RiCalendarLine />
                  <span>هذا الشهر</span>
                </button>
                <button className="btn btn-outline py-1 px-3 text-sm flex items-center gap-1">
                  <RiBarChartLine />
                  <span>تقرير مفصل</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm">المهام المكتملة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary"></div>
                  <span className="text-sm">المهام المتأخرة</span>
                </div>
              </div>
            </div>
            
            {/* Placeholder for chart */}
            <div className="rounded-lg bg-gray-50 border border-gray-100 h-64 flex items-center justify-center">
              <div className="text-center">
                <RiPieChartLine size={48} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">بيانات الرسم البياني ستظهر هنا</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default EnhancedAgencyDashboard;