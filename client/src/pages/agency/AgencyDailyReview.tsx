import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  RiCheckLine, RiInformationLine, RiFilterLine, 
  RiFileChartLine, RiCalendarLine, RiSearch2Line, 
  RiCheckboxCircleLine, RiEmotionHappyLine, RiEmotionNormalLine,
  RiEmotionUnhappyLine, RiTimeLine, RiTeamLine, RiMessage2Line
} from 'react-icons/ri';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// نوع البيانات للمهام
interface Task {
  id: number;
  title: string;
  project: string;
  projectId: number;
  status: string;
}

// نوع البيانات للموظف
interface Employee {
  id: number;
  name: string;
  role: string;
  avatar: string;
  email?: string;
}

// نوع البيانات للتقرير اليومي
interface DailyStandup {
  id: number;
  employeeId: number;
  employee: Employee;
  date: string;
  status: 'open' | 'closed' | 'reviewed';
  dayTasks: number[]; // قائمة بـ IDs للمهام المطلوبة
  tasksDone: number[]; // قائمة بـ IDs للمهام المنجزة
  comments?: string;
  dayRating?: number;
  reviewComments?: string;
  reviewedBy?: number;
  createdAt: string;
  updatedAt?: string;
}

// بيانات تجريبية للمهام
const demoTasks: Task[] = [
  {
    id: 1,
    title: 'إكمال تطوير واجهة برمجية المدفوعات',
    project: 'تطبيق الخدمات المصرفية',
    projectId: 1,
    status: 'قيد التنفيذ'
  },
  {
    id: 2,
    title: 'بدء التكامل مع بوابة الدفع',
    project: 'تطبيق الخدمات المصرفية',
    projectId: 1,
    status: 'لم تبدأ'
  },
  {
    id: 3,
    title: 'اختبار وظائف تسجيل المستخدمين',
    project: 'إعادة تصميم الموقع الإلكتروني',
    projectId: 2,
    status: 'مكتمل'
  },
  {
    id: 4,
    title: 'تصميم واجهة صفحة المدفوعات',
    project: 'تطبيق الخدمات المصرفية',
    projectId: 1,
    status: 'قيد التنفيذ'
  }
];

// بيانات تجريبية للموظفين
const demoEmployees: Employee[] = [
  { id: 1, name: 'سارة أحمد', role: 'مصمم واجهات المستخدم', avatar: 'https://ui-avatars.com/api/?name=سارة+أحمد&background=00BFA6&color=fff' },
  { id: 2, name: 'محمد خالد', role: 'مطور خلفية', avatar: 'https://ui-avatars.com/api/?name=محمد+خالد&background=5A47FF&color=fff' },
  { id: 3, name: 'أحمد علي', role: 'مدير مشروع', avatar: 'https://ui-avatars.com/api/?name=أحمد+علي&background=F59E0B&color=fff' },
  { id: 4, name: 'ليلى حسن', role: 'مختبر جودة', avatar: 'https://ui-avatars.com/api/?name=ليلى+حسن&background=EF4444&color=fff' }
];

// بيانات تجريبية للتقارير اليومية
const demoDailyStandups: DailyStandup[] = [
  {
    id: 1,
    employeeId: 1,
    employee: demoEmployees[0],
    date: '29 أبريل 2025',
    status: 'closed',
    dayTasks: [4],
    tasksDone: [4],
    comments: 'أكملت تصميم واجهة صفحة المدفوعات وسلمتها للفريق',
    dayRating: 5,
    createdAt: '2025-04-29T08:00:00Z',
    updatedAt: '2025-04-29T16:30:00Z'
  },
  {
    id: 2,
    employeeId: 2,
    employee: demoEmployees[1],
    date: '29 أبريل 2025',
    status: 'closed',
    dayTasks: [1, 2],
    tasksDone: [1],
    comments: 'أكملت تطوير واجهة برمجية المدفوعات، ولكن هناك مشكلة مع بوابة الدفع.\n\n⚠️ مشكلة: في انتظار وصول بيانات الاعتماد لبوابة الدفع من العميل',
    dayRating: 3,
    createdAt: '2025-04-29T08:15:00Z',
    updatedAt: '2025-04-29T17:00:00Z'
  },
  {
    id: 3,
    employeeId: 4,
    employee: demoEmployees[3],
    date: '29 أبريل 2025',
    status: 'closed',
    dayTasks: [3],
    tasksDone: [3],
    comments: 'أكملت اختبار وظائف تسجيل المستخدمين وإدارة الحسابات',
    dayRating: 4,
    createdAt: '2025-04-29T08:30:00Z',
    updatedAt: '2025-04-29T16:45:00Z'
  },
  {
    id: 4,
    employeeId: 3,
    employee: demoEmployees[2],
    date: '29 أبريل 2025',
    status: 'open', // لم يقم بإغلاق التقرير بعد
    dayTasks: [],
    tasksDone: [],
    createdAt: '2025-04-29T08:00:00Z'
  }
];

export default function AgencyDailyReview() {
  const [dailyStandups, setDailyStandups] = useState<DailyStandup[]>(demoDailyStandups);
  const [filteredStandups, setFilteredStandups] = useState<DailyStandup[]>(demoDailyStandups);
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [employees, setEmployees] = useState<Employee[]>(demoEmployees);
  const [date, setDate] = useState<string>('29 أبريل 2025');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('all');
  const [selectedStandup, setSelectedStandup] = useState<DailyStandup | null>(null);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [view, setView] = useState<string>('summary');

  // تحميل البيانات
  useEffect(() => {
    // في التطبيق الحقيقي، هنا سنقوم بطلب البيانات من الخادم
    // لجلب تقارير اليوم والمهام والموظفين
    
    // هنا نستخدم البيانات التجريبية
    setDailyStandups(demoDailyStandups);
    setFilteredStandups(demoDailyStandups);
    setTasks(demoTasks);
    setEmployees(demoEmployees);
  }, []);

  // تطبيق التصفية
  useEffect(() => {
    let filtered = [...dailyStandups];
    
    // تصفية حسب الحالة
    if (selectedStatusFilter !== 'all') {
      filtered = filtered.filter(standup => standup.status === selectedStatusFilter);
    }
    
    // تصفية حسب الموظف
    if (selectedEmployeeFilter !== 'all') {
      filtered = filtered.filter(standup => standup.employeeId === parseInt(selectedEmployeeFilter));
    }
    
    // تصفية حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(standup => 
        standup.employee.name.includes(searchQuery) || 
        (standup.comments && standup.comments.includes(searchQuery))
      );
    }
    
    setFilteredStandups(filtered);
  }, [dailyStandups, selectedStatusFilter, selectedEmployeeFilter, searchQuery]);

  // حساب إحصائيات الفريق
  const teamStats = {
    totalEmployees: employees.length,
    submittedReports: dailyStandups.filter(s => s.status === 'closed' || s.status === 'reviewed').length,
    completionRate: Math.round((dailyStandups.filter(s => s.status === 'closed' || s.status === 'reviewed').length / employees.length) * 100),
    averageRating: calculateAverageRating(),
    tasksCompleted: dailyStandups.reduce((acc, s) => acc + s.tasksDone.length, 0),
    tasksTotal: dailyStandups.reduce((acc, s) => acc + s.dayTasks.length, 0),
    blockers: dailyStandups.filter(s => s.comments && s.comments.includes('⚠️ مشكلة')).length
  };

  // حساب متوسط تقييم اليوم
  function calculateAverageRating(): number {
    const standups = dailyStandups.filter(s => s.dayRating);
    if (standups.length === 0) return 0;
    
    const sum = standups.reduce((acc, s) => acc + (s.dayRating || 0), 0);
    return Math.round((sum / standups.length) * 10) / 10; // تقريب إلى رقم عشري واحد
  }

  // الحصول على أيقونة التقييم
  function getRatingIcon(rating: number | undefined) {
    if (!rating) return null;
    
    switch(true) {
      case rating >= 4:
        return <RiEmotionHappyLine className="text-green-500" />;
      case rating >= 3:
        return <RiEmotionNormalLine className="text-amber-400" />;
      case rating < 3:
        return <RiEmotionUnhappyLine className="text-red-500" />;
      default:
        return null;
    }
  }

  // الحصول على لون شريط التقدم
  function getProgressColor(percentage: number): string {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  }

  // الحصول على نسبة إكمال المهام للموظف
  function getCompletionRate(standup: DailyStandup): number {
    if (standup.dayTasks.length === 0) return 0;
    return Math.round((standup.tasksDone.length / standup.dayTasks.length) * 100);
  }

  // فتح نافذة مراجعة التقرير
  function openReviewDialog(standup: DailyStandup) {
    setSelectedStandup(standup);
    setReviewComment(standup.reviewComments || '');
    setIsReviewDialogOpen(true);
  }

  // إرسال المراجعة
  function submitReview() {
    if (!selectedStandup) return;
    
    // في التطبيق الحقيقي، هنا سنرسل البيانات إلى الخادم
    
    // تحديث التقرير محليًا
    const updatedStandups = dailyStandups.map(standup => 
      standup.id === selectedStandup.id 
        ? { 
            ...standup, 
            status: 'reviewed', 
            reviewComments: reviewComment,
            reviewedBy: 1, // هنا سيكون معرف المستخدم الحالي
            updatedAt: new Date().toISOString()
          } 
        : standup
    );
    
    setDailyStandups(updatedStandups);
    setSelectedStandup(null);
    setReviewComment('');
    setIsReviewDialogOpen(false);
    
    toast({
      title: "تمت المراجعة",
      description: "تم حفظ ملاحظاتك على التقرير اليومي"
    });
  }

  // الحصول على اسم الموظف من المعرف
  function getEmployeeName(id: number): string {
    const employee = employees.find(e => e.id === id);
    return employee ? employee.name : 'غير معروف';
  }

  // الحصول على اسم المهمة من المعرف
  function getTaskTitle(id: number): string {
    const task = tasks.find(t => t.id === id);
    return task ? task.title : 'مهمة غير معروفة';
  }

  // تنسيقات للحركة
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
    <DashboardLayout title="مراجعة التقارير اليومية">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* رأس الصفحة */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">مراجعة التقارير اليومية ({date})</h1>
            <p className="text-gray-500">
              متابعة وتقييم تقارير الموظفين اليومية
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setView(view === 'summary' ? 'details' : 'summary')}
            >
              <RiFileChartLine />
              <span>{view === 'summary' ? 'عرض التفاصيل' : 'عرض الملخص'}</span>
            </Button>
          </div>
        </motion.div>
        
        {/* بطاقات ملخص */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <RiTeamLine size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">الفريق</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{teamStats.submittedReports}/{teamStats.totalEmployees}</div>
                <div className="text-sm text-gray-500">
                  ({teamStats.completionRate}%)
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <RiCheckboxCircleLine size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">المهام المكتملة</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{teamStats.tasksCompleted}/{teamStats.tasksTotal}</div>
                <div className="text-sm text-gray-500">
                  ({teamStats.tasksTotal > 0 ? Math.round((teamStats.tasksCompleted / teamStats.tasksTotal) * 100) : 0}%)
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              {getRatingIcon(teamStats.averageRating) || <RiEmotionNormalLine size={24} />}
            </div>
            <div>
              <div className="text-sm text-gray-500">متوسط التقييم</div>
              <div className="text-2xl font-bold">{teamStats.averageRating}</div>
            </div>
          </div>
          
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <RiInformationLine size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">العوائق</div>
              <div className="text-2xl font-bold">{teamStats.blockers}</div>
            </div>
          </div>
        </motion.div>
        
        {/* أدوات التصفية */}
        <motion.div variants={itemVariants} className="dashboard-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">بحث</label>
              <div className="relative">
                <RiSearch2Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="بحث بالاسم أو التعليقات..."
                  className="pe-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">حالة التقرير</label>
              <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="open">مفتوح</SelectItem>
                  <SelectItem value="closed">مغلق</SelectItem>
                  <SelectItem value="reviewed">تمت المراجعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">الموظف</label>
              <Select value={selectedEmployeeFilter} onValueChange={setSelectedEmployeeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الموظفين" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الموظفين</SelectItem>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">التاريخ</label>
              <Button variant="outline" className="w-full text-start justify-start" disabled>
                <RiCalendarLine className="ms-2" />
                {date}
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* عرض البيانات */}
        {view === 'summary' ? (
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-lg font-bold">ملخص تقارير الفريق ({filteredStandups.length})</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStandups.map(standup => (
                <Card key={standup.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={standup.employee.avatar} alt={standup.employee.name} />
                          <AvatarFallback>{standup.employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{standup.employee.name}</CardTitle>
                          <CardDescription>{standup.employee.role}</CardDescription>
                        </div>
                      </div>
                      <div>
                        {standup.status === 'open' && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            مفتوح
                          </Badge>
                        )}
                        {standup.status === 'closed' && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            مغلق
                          </Badge>
                        )}
                        {standup.status === 'reviewed' && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800">
                            تمت المراجعة
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {standup.status !== 'open' ? (
                      <>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1 text-sm">
                            <span>نسبة إكمال المهام</span>
                            <span className="font-medium">{getCompletionRate(standup)}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getProgressColor(getCompletionRate(standup))}`}
                              style={{ width: `${getCompletionRate(standup)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">المهام</span>
                            <span className="text-sm font-medium">{standup.tasksDone.length}/{standup.dayTasks.length}</span>
                          </div>
                          
                          {standup.comments && (
                            <div>
                              <div className="text-sm text-gray-500 mb-1">التعليقات</div>
                              <p className="text-sm line-clamp-2">
                                {standup.comments.includes('⚠️ مشكلة') ? (
                                  <span className="text-red-500 font-medium">
                                    {standup.comments.substring(0, 100)}
                                    {standup.comments.length > 100 ? '...' : ''}
                                  </span>
                                ) : (
                                  <span>
                                    {standup.comments.substring(0, 100)}
                                    {standup.comments.length > 100 ? '...' : ''}
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                          
                          {standup.dayRating && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">تقييم اليوم</span>
                              <div className="flex items-center gap-1">
                                {getRatingIcon(standup.dayRating)}
                                <span className="text-sm font-medium">{standup.dayRating}/5</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="py-4 text-center text-gray-500">
                        <RiTimeLine className="mx-auto mb-2" size={24} />
                        <p>لم يتم إغلاق التقرير بعد</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="bg-gray-50 py-3">
                    {standup.status === 'closed' && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => openReviewDialog(standup)}
                      >
                        <RiMessage2Line className="ms-2" />
                        مراجعة وإضافة تعليق
                      </Button>
                    )}
                    {standup.status === 'reviewed' && (
                      <div className="w-full text-sm">
                        <div className="font-medium text-gray-700 mb-1">تمت المراجعة بواسطة:</div>
                        <div className="text-gray-600">{standup.reviewedBy ? getEmployeeName(standup.reviewedBy) : 'غير معروف'}</div>
                      </div>
                    )}
                    {standup.status === 'open' && (
                      <p className="w-full text-sm text-center text-gray-500">
                        في انتظار إغلاق التقرير من قبل الموظف
                      </p>
                    )}
                  </CardFooter>
                </Card>
              ))}
              
              {filteredStandups.length === 0 && (
                <div className="col-span-full dashboard-card p-8 text-center">
                  <RiFilterLine className="mx-auto mb-4 text-gray-300" size={48} />
                  <h3 className="text-lg font-medium mb-2">لا توجد نتائج</h3>
                  <p className="text-gray-500 mb-4">لا توجد تقارير تطابق معايير التصفية المحددة</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-lg font-bold">تفاصيل التقارير اليومية ({filteredStandups.length})</h2>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>المهام المكتملة</TableHead>
                    <TableHead>التقييم</TableHead>
                    <TableHead>التعليقات</TableHead>
                    <TableHead>وقت التحديث</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStandups.map(standup => (
                    <TableRow key={standup.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={standup.employee.avatar} alt={standup.employee.name} />
                            <AvatarFallback>{standup.employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{standup.employee.name}</div>
                            <div className="text-xs text-gray-500">{standup.employee.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {standup.status === 'open' && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            مفتوح
                          </Badge>
                        )}
                        {standup.status === 'closed' && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            مغلق
                          </Badge>
                        )}
                        {standup.status === 'reviewed' && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800">
                            تمت المراجعة
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {standup.status !== 'open' ? (
                          <div className="flex flex-col gap-1">
                            <div className="text-sm">{standup.tasksDone.length}/{standup.dayTasks.length}</div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getProgressColor(getCompletionRate(standup))}`}
                                style={{ width: `${getCompletionRate(standup)}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {standup.dayRating ? (
                          <div className="flex items-center gap-1">
                            {getRatingIcon(standup.dayRating)}
                            <span>{standup.dayRating}/5</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {standup.comments ? (
                          <div className="max-w-xs">
                            <p className="truncate">
                              {standup.comments.includes('⚠️ مشكلة') ? (
                                <span className="text-red-500 font-medium">
                                  {standup.comments.substring(0, 50)}
                                  {standup.comments.length > 50 ? '...' : ''}
                                </span>
                              ) : (
                                <span>
                                  {standup.comments.substring(0, 50)}
                                  {standup.comments.length > 50 ? '...' : ''}
                                </span>
                              )}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {standup.updatedAt ? (
                          <div className="text-sm text-gray-500">
                            {new Date(standup.updatedAt).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {standup.status === 'closed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openReviewDialog(standup)}
                          >
                            مراجعة
                          </Button>
                        )}
                        {standup.status === 'reviewed' && (
                          <span className="text-xs text-gray-500">
                            تمت المراجعة
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredStandups.length === 0 && (
                <div className="dashboard-card p-8 text-center mt-4">
                  <RiFilterLine className="mx-auto mb-4 text-gray-300" size={48} />
                  <h3 className="text-lg font-medium mb-2">لا توجد نتائج</h3>
                  <p className="text-gray-500 mb-4">لا توجد تقارير تطابق معايير التصفية المحددة</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* نافذة المراجعة */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>مراجعة التقرير اليومي</DialogTitle>
            <DialogDescription>
              مراجعة وإضافة تعليقات على التقرير اليومي للموظف {selectedStandup?.employee.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStandup && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">معلومات التقرير</h3>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">التاريخ:</span>
                      <span>{selectedStandup.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">تقييم اليوم:</span>
                      <div className="flex items-center gap-1">
                        {getRatingIcon(selectedStandup.dayRating)}
                        <span>{selectedStandup.dayRating || '-'}/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">المهام المكتملة:</span>
                      <span>{selectedStandup.tasksDone.length}/{selectedStandup.dayTasks.length}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">المهام المنجزة</h3>
                  <div className="text-sm">
                    {selectedStandup.tasksDone.length > 0 ? (
                      <ul className="space-y-1 ps-4 list-disc">
                        {selectedStandup.tasksDone.map(taskId => (
                          <li key={taskId}>
                            {getTaskTitle(taskId)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">لم يتم إنجاز أي مهام</p>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedStandup.comments && (
                <div>
                  <h3 className="text-sm font-medium mb-2">تعليقات الموظف</h3>
                  <div className={`text-sm p-3 rounded-md ${selectedStandup.comments.includes('⚠️ مشكلة') ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <p className="whitespace-pre-line">
                      {selectedStandup.comments}
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  إضافة ملاحظاتك:
                </label>
                <Textarea
                  placeholder="أضف ملاحظاتك أو تعليقاتك على التقرير..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={submitReview}>
              إرسال المراجعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}