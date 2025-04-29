import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { useParams, Link } from 'wouter';
import { 
  RiArrowRightSLine, RiCalendarLine, RiUser3Line, 
  RiCheckLine, RiTimeLine, RiAddLine, RiEdit2Line, 
  RiDeleteBinLine, RiFilePdfLine, RiFileExcelLine 
} from 'react-icons/ri';

// UI Components
import { DataTable } from '@/components/dashboard/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// For demo
const projectData = {
  id: 1,
  title: 'تطوير تطبيق الخدمات المصرفية',
  description: 'تطوير تطبيق لتسهيل الخدمات المصرفية للعملاء بما يتناسب مع المعايير الحديثة والتجارب السلسة. يتضمن المشروع تطوير واجهات المستخدم، وإدارة المدفوعات، والتكامل مع الأنظمة البنكية الأخرى.',
  client: 'البنك الوطني',
  progress: 75,
  startDate: '2025-01-15',
  endDate: '2025-05-20',
  status: 'in-progress',
  subgoals: [
    { id: 1, title: 'تصميم واجهات المستخدم', progress: 100, status: 'completed' },
    { id: 2, title: 'تطوير خدمات API للمدفوعات', progress: 80, status: 'in-progress' },
    { id: 3, title: 'تكامل مع الأنظمة الداخلية', progress: 60, status: 'in-progress' },
    { id: 4, title: 'اختبار وضمان الجودة', progress: 30, status: 'in-progress' },
    { id: 5, title: 'إطلاق النسخة التجريبية', progress: 0, status: 'upcoming' }
  ],
  tasks: [
    { id: 1, title: 'تصميم صفحة تسجيل الدخول', subgoal: 'تصميم واجهات المستخدم', assignee: 'سارة أحمد', progress: 100, status: 'completed', dueDate: '2025-02-10' },
    { id: 2, title: 'تصميم الصفحة الرئيسية', subgoal: 'تصميم واجهات المستخدم', assignee: 'سارة أحمد', progress: 100, status: 'completed', dueDate: '2025-02-15' },
    { id: 3, title: 'تطوير واجهة برمجية للمدفوعات', subgoal: 'تطوير خدمات API للمدفوعات', assignee: 'محمد خالد', progress: 80, status: 'in-progress', dueDate: '2025-03-20' },
    { id: 4, title: 'تكامل مع بوابة الدفع', subgoal: 'تطوير خدمات API للمدفوعات', assignee: 'أحمد علي', progress: 70, status: 'in-progress', dueDate: '2025-03-25' },
    { id: 5, title: 'ربط مع نظام العملاء', subgoal: 'تكامل مع الأنظمة الداخلية', assignee: 'محمد خالد', progress: 60, status: 'in-progress', dueDate: '2025-04-05' },
    { id: 6, title: 'اختبار أمان البيانات', subgoal: 'اختبار وضمان الجودة', assignee: 'ليلى حسن', progress: 40, status: 'in-progress', dueDate: '2025-04-15' },
    { id: 7, title: 'تحضير بيئة الإطلاق', subgoal: 'إطلاق النسخة التجريبية', assignee: 'أحمد علي', progress: 0, status: 'upcoming', dueDate: '2025-05-10' },
  ],
  team: [
    { id: 1, name: 'سارة أحمد', role: 'مصمم واجهات المستخدم', avatar: 'https://ui-avatars.com/api/?name=سارة+أحمد&background=00BFA6&color=fff' },
    { id: 2, name: 'محمد خالد', role: 'مطور خلفية', avatar: 'https://ui-avatars.com/api/?name=محمد+خالد&background=5A47FF&color=fff' },
    { id: 3, name: 'أحمد علي', role: 'مدير مشروع', avatar: 'https://ui-avatars.com/api/?name=أحمد+علي&background=F59E0B&color=fff' },
    { id: 4, name: 'ليلى حسن', role: 'مختبر جودة', avatar: 'https://ui-avatars.com/api/?name=ليلى+حسن&background=EF4444&color=fff' }
  ],
  files: [
    { id: 1, name: 'وثيقة متطلبات المشروع.pdf', type: 'pdf', size: '2.5MB', uploadedBy: 'أحمد علي', uploadDate: '2025-01-18' },
    { id: 2, title: 'مخططات واجهات المستخدم.pdf', type: 'pdf', size: '4.1MB', uploadedBy: 'سارة أحمد', uploadDate: '2025-01-25' },
    { id: 3, title: 'جدول المهام والتسليمات.xlsx', type: 'excel', size: '1.2MB', uploadedBy: 'أحمد علي', uploadDate: '2025-02-01' }
  ]
};

const taskColumns = [
  { key: 'title', title: 'المهمة', sortable: true },
  { key: 'subgoal', title: 'الهدف الفرعي', sortable: true },
  { key: 'assignee', title: 'المسؤول', sortable: true },
  { key: 'dueDate', title: 'تاريخ التسليم', sortable: true },
  { 
    key: 'progress',
    title: 'التقدم',
    sortable: true,
    render: (task: any) => (
      <div className="w-full max-w-32">
        <div className="flex justify-between items-center mb-1 text-xs">
          <span>{task.progress}%</span>
        </div>
        <Progress value={task.progress} className="h-2" />
      </div>
    )
  },
  { 
    key: 'status', 
    title: 'الحالة', 
    sortable: true,
    render: (task: any) => {
      const statusStyles: Record<string, string> = {
        'completed': 'bg-green-100 text-green-800 border-green-200',
        'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
        'upcoming': 'bg-amber-100 text-amber-800 border-amber-200'
      };
      
      const statusLabels: Record<string, string> = {
        'completed': 'مكتمل',
        'in-progress': 'قيد التنفيذ',
        'upcoming': 'قادم'
      };
      
      return (
        <span className={`px-2 py-1 text-xs rounded-full border ${statusStyles[task.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
          {statusLabels[task.status] || task.status}
        </span>
      );
    }
  }
];

export default function ProjectDetail() {
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // In a real application, you would fetch the project data based on the ID
  // For demo, we're just using a hard-coded project
  const project = projectData;
  
  // Animation variants
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
  
  // Calculate overall progress
  const overallProgress = Math.round(
    project.subgoals.reduce((sum, subgoal) => sum + subgoal.progress, 0) / project.subgoals.length
  );
  
  // Group tasks by status for quick overview
  const taskStats = {
    completed: project.tasks.filter(task => task.status === 'completed').length,
    inProgress: project.tasks.filter(task => task.status === 'in-progress').length,
    upcoming: project.tasks.filter(task => task.status === 'upcoming').length,
    total: project.tasks.length
  };
  
  return (
    <DashboardLayout title={project.title}>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Breadcrumbs */}
        <motion.div variants={itemVariants} className="flex items-center text-sm text-gray-500 mb-4">
          <Link href="/dashboard/agency/projects" className="hover:text-primary">
            المشاريع
          </Link>
          <RiArrowRightSLine className="mx-2" />
          <span className="text-gray-700 font-medium">{project.title}</span>
        </motion.div>
        
        {/* Project header with key information */}
        <motion.div variants={itemVariants} className="dashboard-card">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                  project.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  'bg-amber-100 text-amber-800'
                }`}>
                  {project.status === 'in-progress' ? 'قيد التنفيذ' : 
                   project.status === 'completed' ? 'مكتمل' : 'قادم'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{project.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <RiUser3Line className="ml-1" />
                  <span>العميل: {project.client}</span>
                </div>
                
                <div className="flex items-center">
                  <RiCalendarLine className="ml-1" />
                  <span>{project.startDate} - {project.endDate}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg min-w-36">
              <div className="text-3xl font-bold text-primary mb-2">{overallProgress}%</div>
              <div className="text-sm text-gray-500">نسبة الإنجاز</div>
              <div className="w-full mt-2">
                <Progress value={overallProgress} className="h-2" />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Tabs for different sections */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="overview" className="w-full" onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="tasks">المهام</TabsTrigger>
              <TabsTrigger value="team">الفريق</TabsTrigger>
              <TabsTrigger value="files">الملفات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Quick stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="dashboard-card p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{taskStats.total}</div>
                  <div className="text-sm text-gray-500">إجمالي المهام</div>
                </div>
                <div className="dashboard-card p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                  <div className="text-sm text-gray-500">المهام المكتملة</div>
                </div>
                <div className="dashboard-card p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                  <div className="text-sm text-gray-500">المهام الجارية</div>
                </div>
                <div className="dashboard-card p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">{taskStats.upcoming}</div>
                  <div className="text-sm text-gray-500">المهام القادمة</div>
                </div>
              </div>
              
              {/* Subgoals */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">الأهداف الفرعية</h2>
                  <button className="btn btn-outline py-1 px-3 text-sm flex items-center gap-1">
                    <RiAddLine />
                    <span>إضافة هدف فرعي</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {project.subgoals.map((subgoal) => (
                    <div key={subgoal.id} className="dashboard-card p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {subgoal.status === 'completed' ? (
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <RiCheckLine className="text-white text-sm" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                          )}
                          <h3 className="font-medium">{subgoal.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{subgoal.progress}%</span>
                          <div className="flex">
                            <button className="p-1 text-gray-500 hover:text-primary" title="تعديل">
                              <RiEdit2Line size={18} />
                            </button>
                            <button className="p-1 text-gray-500 hover:text-red-500" title="حذف">
                              <RiDeleteBinLine size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <Progress value={subgoal.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recent activity - simplified for demo */}
              <div>
                <h2 className="text-lg font-bold mb-4">النشاط الأخير</h2>
                <div className="dashboard-card p-4">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <RiCheckLine />
                      </div>
                      <div>
                        <div className="font-medium">تم إكمال مهمة "تصميم الصفحة الرئيسية"</div>
                        <div className="text-sm text-gray-500">بواسطة سارة أحمد - منذ 2 ساعة</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <RiAddLine />
                      </div>
                      <div>
                        <div className="font-medium">تم إضافة مهمة جديدة "اختبار أمان البيانات"</div>
                        <div className="text-sm text-gray-500">بواسطة أحمد علي - منذ 5 ساعات</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                        <RiTimeLine />
                      </div>
                      <div>
                        <div className="font-medium">تم تحديث موعد تسليم "تكامل مع بوابة الدفع"</div>
                        <div className="text-sm text-gray-500">بواسطة محمد خالد - منذ يوم</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tasks">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">مهام المشروع</h2>
                <button className="btn btn-primary py-1 px-3 text-sm flex items-center gap-1">
                  <RiAddLine />
                  <span>إضافة مهمة</span>
                </button>
              </div>
              
              <DataTable
                data={project.tasks}
                columns={taskColumns}
                keyExtractor={(item) => item.id}
                searchPlaceholder="بحث في المهام..."
                emptyMessage="لا توجد مهام لهذا المشروع"
              />
            </TabsContent>
            
            <TabsContent value="team">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">فريق المشروع</h2>
                <button className="btn btn-outline py-1 px-3 text-sm flex items-center gap-1">
                  <RiAddLine />
                  <span>إضافة عضو</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.team.map((member) => (
                  <div key={member.id} className="dashboard-card p-4 flex items-center gap-4">
                    <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="files">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">ملفات المشروع</h2>
                <button className="btn btn-outline py-1 px-3 text-sm flex items-center gap-1">
                  <RiAddLine />
                  <span>رفع ملف</span>
                </button>
              </div>
              
              <div className="dashboard-card overflow-hidden">
                <div className="divide-y">
                  {project.files.map((file) => (
                    <div key={file.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {file.type === 'pdf' ? (
                          <RiFilePdfLine className="text-red-500 text-xl" />
                        ) : file.type === 'excel' ? (
                          <RiFileExcelLine className="text-green-500 text-xl" />
                        ) : (
                          <RiFilePdfLine className="text-gray-500 text-xl" />
                        )}
                        <div>
                          <div className="font-medium">{file.title || file.name}</div>
                          <div className="text-xs text-gray-500">
                            {file.size} • رفع بواسطة {file.uploadedBy} • {file.uploadDate}
                          </div>
                        </div>
                      </div>
                      <button className="btn btn-outline py-1 px-3 text-xs">تنزيل</button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}