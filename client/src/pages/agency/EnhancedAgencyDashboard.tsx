import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { DataTable } from '@/components/dashboard/DataTable';
import { motion } from 'framer-motion';
import {
  RiFolderLine, RiTrophyLine, RiTaskLine, RiTeamLine,
  RiPieChartLine, RiCalendarLine, RiBarChartLine
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

const EnhancedAgencyDashboard = () => {
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
  
  return (
    <DashboardLayout title="لوحة التحكم">
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold mb-4">نظرة عامة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<RiFolderLine size={20} />}
              title="المشاريع النشطة"
              value="12"
              change={{ value: 20, type: 'increase' }}
              color="primary"
            />
            <StatCard
              icon={<RiTrophyLine size={20} />}
              title="المشاريع المكتملة"
              value="24"
              change={{ value: 5, type: 'increase' }}
              color="success"
            />
            <StatCard
              icon={<RiTaskLine size={20} />}
              title="المهام المعلقة"
              value="38"
              change={{ value: 10, type: 'decrease' }}
              color="warning"
            />
            <StatCard
              icon={<RiTeamLine size={20} />}
              title="الفريق"
              value="8"
              color="info"
            />
          </div>
        </motion.div>
        
        {/* Project Overview */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">المشاريع الحالية</h2>
            <button className="btn btn-primary flex items-center gap-2">
              <span>إنشاء مشروع</span>
              <span>+</span>
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