import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'wouter';
import { 
  RiArrowRightSLine, RiCalendarLine, RiUser3Line, 
  RiCheckLine, RiTimeLine, RiAddLine, RiEdit2Line, 
  RiDeleteBinLine, RiFilePdfLine, RiFileExcelLine,
  RiArrowDownSLine, RiArrowUpSLine, RiInformationLine,
  RiShieldLine, RiLineChartLine, RiTaskLine, RiBuildingLine
} from 'react-icons/ri';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable } from '@/components/dashboard/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from '@/hooks/use-toast';

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
        <motion.div 
          variants={itemVariants} 
          className="dashboard-card overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-5">
              <div className="flex flex-wrap gap-2 items-center mb-3">
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <Badge 
                  variant="outline"
                  className={`${
                    project.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                    project.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : 
                    'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {project.status === 'in-progress' ? 'قيد التنفيذ' : 
                   project.status === 'completed' ? 'مكتمل' : 'قادم'}
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-5 max-w-3xl leading-relaxed">{project.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-1">
                <div className="flex gap-2 items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <RiBuildingLine size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">العميل</div>
                    <div className="font-medium">{project.client}</div>
                  </div>
                </div>
                
                <div className="flex gap-2 items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <RiUser3Line size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">فريق العمل</div>
                    <div className="font-medium">{project.team.length} عضو</div>
                  </div>
                </div>
                
                <div className="flex gap-2 items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <RiCalendarLine size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">المدة الزمنية</div>
                    <div className="font-medium">{project.startDate} - {project.endDate}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-5 flex flex-col items-center justify-center lg:w-64 border-t lg:border-t-0 lg:border-r">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Progress Circle */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  
                  {/* Progress Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={overallProgress === 100 ? '#10b981' : '#7c3aed'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallProgress / 100)}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                
                {/* Percentage Text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
                  <div className="text-xs text-gray-500">نسبة الإنجاز</div>
                </div>
              </div>
              
              <div className="mt-4 w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">أهداف فرعية:</span>
                  <span className="font-medium">{project.subgoals.length}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">مهام:</span>
                  <span className="font-medium">{project.tasks.length}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">المهام المنجزة:</span>
                  <span className="font-medium">{taskStats.completed} / {taskStats.total}</span>
                </div>
              </div>
              
              <div className="mt-5 w-full">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "تصدير التقرير",
                      description: "جاري إعداد تقرير PDF... ستتوفر هذه الميزة قريبًا"
                    });
                  }}
                >
                  <RiFilePdfLine className="ml-2" />
                  تصدير تقرير PDF
                </Button>
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
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => {
                      toast({
                        title: "جاري إضافة هدف فرعي جديد",
                        description: "ستتوفر هذه الميزة قريبًا"
                      });
                    }}
                  >
                    <RiAddLine />
                    <span>إضافة هدف فرعي</span>
                  </Button>
                </div>
                
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.07 }}
                >
                  <Accordion type="multiple" className="space-y-4">
                    {project.subgoals.map((subgoal) => {
                      // Get tasks for this subgoal
                      const subgoalTasks = project.tasks.filter(
                        task => task.subgoal === subgoal.title
                      );
                      
                      // Calculate completion stats
                      const completedTasks = subgoalTasks.filter(task => task.status === 'completed').length;
                      const totalTasks = subgoalTasks.length;
                      const taskCompletionText = `${completedTasks}/${totalTasks} مهام مكتملة`;
                      
                      return (
                        <motion.div 
                          key={subgoal.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <AccordionItem 
                            value={`subgoal-${subgoal.id}`} 
                            className="dashboard-card border-0 shadow-sm overflow-hidden"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                              <div className="flex flex-1 justify-between items-start">
                                <div className="flex items-center gap-2">
                                  {subgoal.status === 'completed' ? (
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                      <RiCheckLine className="text-white" />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                                  )}
                                  <div>
                                    <h3 className="font-medium text-lg text-right">{subgoal.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <RiTaskLine size={14} />
                                        {taskCompletionText}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col items-end">
                                    <span className="text-sm font-medium">{subgoal.progress}%</span>
                                    <Badge 
                                      variant="outline"
                                      className={`${
                                        subgoal.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : 
                                        subgoal.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                                        'bg-amber-100 text-amber-800 border-amber-200'
                                      }`}
                                    >
                                      {subgoal.status === 'completed' ? 'مكتمل' : 
                                      subgoal.status === 'in-progress' ? 'قيد التنفيذ' : 'قادم'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            
                            <AccordionContent>
                              <div className="pb-2 px-4">
                                <Progress value={subgoal.progress} className="h-2 mb-4" />
                                
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="font-medium">مهام الهدف الفرعي</h4>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="flex items-center gap-1 text-xs"
                                    onClick={() => {
                                      toast({
                                        title: "إضافة مهمة جديدة",
                                        description: "ستتوفر هذه الميزة قريبًا"
                                      });
                                    }}
                                  >
                                    <RiAddLine />
                                    <span>إضافة مهمة</span>
                                  </Button>
                                </div>
                                
                                <div className="space-y-3 mb-2">
                                  {subgoalTasks.length > 0 ? (
                                    subgoalTasks.map(task => (
                                      <Card key={task.id} className="overflow-hidden">
                                        <div className="flex items-start p-3 gap-3">
                                          <div className="pt-1">
                                            {task.status === 'completed' ? (
                                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                <RiCheckLine className="text-white text-sm" />
                                              </div>
                                            ) : (
                                              <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                            )}
                                          </div>
                                          
                                          <div className="flex-1">
                                            <div className="flex justify-between">
                                              <h5 className="font-medium">{task.title}</h5>
                                              <Badge 
                                                variant="outline"
                                                className={`${
                                                  task.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' : 
                                                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                                                  'bg-amber-100 text-amber-800 border-amber-200'
                                                }`}
                                              >
                                                {task.status === 'completed' ? 'مكتمل' : 
                                                task.status === 'in-progress' ? 'قيد التنفيذ' : 'قادم'}
                                              </Badge>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-x-4 text-sm text-gray-500 mt-1">
                                              <div className="flex items-center gap-1">
                                                <RiUser3Line size={14} />
                                                <span>{task.assignee}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <RiCalendarLine size={14} />
                                                <span>{task.dueDate}</span>
                                              </div>
                                            </div>
                                            
                                            <div className="mt-2">
                                              <Progress value={task.progress} className="h-1.5" />
                                              <div className="flex justify-end mt-1">
                                                <span className="text-xs text-gray-500">{task.progress}%</span>
                                              </div>
                                            </div>
                                            
                                            <div className="flex justify-end mt-2">
                                              <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => {
                                                  toast({
                                                    title: "عرض تفاصيل المهمة",
                                                    description: "ستتوفر هذه الميزة قريبًا"
                                                  });
                                                }}
                                              >
                                                عرض التفاصيل
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </Card>
                                    ))
                                  ) : (
                                    <div className="text-center p-4 text-gray-500 bg-gray-50 rounded-lg">
                                      لا توجد مهام مسجلة لهذا الهدف الفرعي
                                    </div>
                                  )}
                                </div>
                                
                                {/* AI Task Suggestion */}
                                <div className="mt-4 p-3 border border-blue-100 bg-blue-50 rounded-lg">
                                  <div className="flex items-start gap-3">
                                    <div className="text-blue-500">
                                      <RiInformationLine size={20} />
                                    </div>
                                    <div>
                                      <p className="text-sm text-blue-700 font-medium">اقتراح من الذكاء الاصطناعي</p>
                                      <p className="text-sm text-blue-600 mt-1">
                                        هل ترغب في اقتراح مهام جديدة لهذا الهدف الفرعي بناءً على تحليل المشروع؟
                                      </p>
                                      <div className="mt-2">
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="bg-white"
                                          onClick={() => {
                                            toast({
                                              title: "اقتراح مهمة جديدة",
                                              description: "جاري تحليل المشروع... هذه الميزة ستتوفر قريبًا"
                                            });
                                          }}
                                        >
                                          توليد مهام مقترحة
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </motion.div>
                      );
                    })}
                  </Accordion>
                </motion.div>
              </div>
              
              {/* Project Progress & KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">تقدم المشروع</CardTitle>
                    <CardDescription>مراقبة المراحل والتقدم الزمني للمشروع</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Project Timeline */}
                    <div className="relative pb-4">
                      <div className="absolute top-0 bottom-0 right-4 w-0.5 bg-gray-200"></div>
                      
                      {project.subgoals.map((subgoal, index) => (
                        <div key={subgoal.id} className="relative mb-6 mr-6">
                          <div className="absolute top-1 right-[-1.65rem]">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                              subgoal.status === 'completed' ? 'bg-green-500' : 
                              subgoal.status === 'in-progress' ? 'bg-blue-500' : 
                              'bg-gray-200'
                            }`}>
                              {subgoal.status === 'completed' ? (
                                <RiCheckLine className="text-white" />
                              ) : subgoal.status === 'in-progress' ? (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              ) : (
                                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                              )}
                            </div>
                          </div>
                          <div className={`mr-2 ${
                            subgoal.status === 'completed' ? 'text-green-700' : 
                            subgoal.status === 'in-progress' ? 'text-blue-700' : 
                            'text-gray-500'
                          }`}>
                            <h4 className="font-medium">{subgoal.title}</h4>
                            <div className="text-sm flex items-center gap-2 mt-1">
                              <RiCalendarLine size={14} />
                              {index === 0 ? project.startDate : 
                               index === project.subgoals.length - 1 ? project.endDate : 
                               `المرحلة ${index + 1}`}
                            </div>
                            <Progress 
                              value={subgoal.progress} 
                              className={`h-1.5 mt-2 w-full max-w-64 ${
                                subgoal.status === 'completed' ? 'bg-green-100' : 
                                subgoal.status === 'in-progress' ? 'bg-blue-100' : 
                                'bg-gray-100'
                              }`} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">مؤشرات الأداء</CardTitle>
                    <CardDescription>KPIs ومقاييس نجاح المشروع</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span className="text-gray-600">تقدم المشروع الإجمالي</span>
                          <span className="font-medium">{overallProgress}%</span>
                        </div>
                        <Progress value={overallProgress} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span className="text-gray-600">التزام بالمواعيد</span>
                          <span className="font-medium">80%</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span className="text-gray-600">رضا العميل</span>
                          <span className="font-medium">95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1 text-sm">
                          <span className="text-gray-600">الالتزام بالميزانية</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            toast({
                              title: "تقرير مفصل",
                              description: "ستتوفر هذه الميزة قريبًا"
                            });
                          }}
                        >
                          <RiLineChartLine className="ml-1" />
                          عرض التقرير المفصل
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent activity */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">النشاط الأخير</h2>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "سجل النشاط",
                        description: "ستتوفر هذه الميزة الكاملة قريبًا"
                      });
                    }}
                  >
                    عرض الكل
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Avatar className="w-9 h-9 bg-blue-100 text-blue-600">
                          <AvatarFallback><RiCheckLine /></AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">تم إكمال مهمة "تصميم الصفحة الرئيسية"</div>
                          <div className="text-sm text-gray-500">بواسطة سارة أحمد - منذ 2 ساعة</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Avatar className="w-9 h-9 bg-green-100 text-green-600">
                          <AvatarFallback><RiAddLine /></AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">تم إضافة مهمة جديدة "اختبار أمان البيانات"</div>
                          <div className="text-sm text-gray-500">بواسطة أحمد علي - منذ 5 ساعات</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Avatar className="w-9 h-9 bg-amber-100 text-amber-600">
                          <AvatarFallback><RiTimeLine /></AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">تم تحديث موعد تسليم "تكامل مع بوابة الدفع"</div>
                          <div className="text-sm text-gray-500">بواسطة محمد خالد - منذ يوم</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Avatar className="w-9 h-9 bg-purple-100 text-purple-600">
                          <AvatarFallback><RiUser3Line /></AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">تم إضافة ليلى حسن إلى فريق المشروع</div>
                          <div className="text-sm text-gray-500">بواسطة أحمد علي - منذ 3 أيام</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="tasks">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">مهام المشروع</h2>
                <Button 
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    toast({
                      title: "إضافة مهمة جديدة",
                      description: "ستتوفر هذه الميزة قريبًا"
                    });
                  }}
                >
                  <RiAddLine />
                  <span>إضافة مهمة</span>
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0 pb-0">
                  <DataTable
                    data={project.tasks}
                    columns={taskColumns}
                    keyExtractor={(item) => item.id}
                    searchPlaceholder="بحث في المهام..."
                    emptyMessage="لا توجد مهام لهذا المشروع"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="team">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">فريق المشروع</h2>
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    toast({
                      title: "إضافة عضو للفريق",
                      description: "ستتوفر هذه الميزة قريبًا"
                    });
                  }}
                >
                  <RiAddLine />
                  <span>إضافة عضو</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.team.map((member) => (
                  <Card key={member.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            toast({
                              title: "عرض ملف عضو الفريق",
                              description: "ستتوفر هذه الميزة قريبًا"
                            });
                          }}
                        >
                          عرض المهام
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="files">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">ملفات المشروع</h2>
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    toast({
                      title: "رفع ملفات جديدة",
                      description: "ستتوفر هذه الميزة قريبًا"
                    });
                  }}
                >
                  <RiAddLine />
                  <span>رفع ملف</span>
                </Button>
              </div>
              
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {project.files.map((file) => (
                      <div key={file.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {file.type === 'pdf' ? (
                            <div className="w-10 h-10 bg-red-100 text-red-500 rounded flex items-center justify-center">
                              <RiFilePdfLine size={24} />
                            </div>
                          ) : file.type === 'excel' ? (
                            <div className="w-10 h-10 bg-green-100 text-green-500 rounded flex items-center justify-center">
                              <RiFileExcelLine size={24} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded flex items-center justify-center">
                              <RiFilePdfLine size={24} />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{file.title || file.name}</div>
                            <div className="text-xs text-gray-500">
                              {file.size} • رفع بواسطة {file.uploadedBy} • {file.uploadDate}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            toast({
                              title: "جاري تنزيل الملف",
                              description: "ستتوفر هذه الميزة قريبًا"
                            });
                          }}
                        >
                          تنزيل
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-center py-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      toast({
                        title: "عرض كل الملفات",
                        description: "ستتوفر هذه الميزة قريبًا"
                      });
                    }}
                  >
                    عرض كل الملفات ({project.files.length})
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}