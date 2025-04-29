import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { 
  RiCheckLine, RiInformationLine, RiAddLine, 
  RiPlayLine, RiClipboardLine, RiCalendarLine,
  RiCheckboxCircleLine, RiStarLine, RiTimeLine,
  RiMoonClearLine, RiEmotionHappyLine, RiEmotionNormalLine,
  RiEmotionUnhappyLine, RiTaskLine
} from 'react-icons/ri';

// UI Components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

// نوع البيانات للمهام
interface Task {
  id: number;
  title: string;
  description: string;
  project: string;
  projectId: number;
  subgoal?: string;
  subgoalId?: number;
  priority: string;
  dueDate: string;
  status: string;
  assigned?: boolean;
}

// نوع البيانات للتقرير اليومي
interface DailyStandup {
  id?: number;
  employeeId: number;
  employeeName: string;
  date: string;
  status: 'open' | 'closed' | 'reviewed';
  dayTasks: number[]; // قائمة بـ IDs للمهام المطلوبة
  tasksDone: number[]; // قائمة بـ IDs للمهام المنجزة
  comments?: string;
  dayRating?: number;
  reviewComments?: string;
  reviewedBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

// بيانات تجريبية لعرض المهام
const demoTasks: Task[] = [
  {
    id: 1,
    title: 'إكمال تطوير واجهة برمجية المدفوعات',
    description: 'إنهاء تطوير الواجهة البرمجية للمدفوعات وتجهيزها للاختبار',
    project: 'تطبيق الخدمات المصرفية',
    projectId: 1,
    subgoal: 'تطوير خدمات API للمدفوعات',
    subgoalId: 2,
    priority: 'عالية',
    dueDate: '29 أبريل 2025',
    status: 'قيد التنفيذ',
    assigned: true
  },
  {
    id: 2,
    title: 'بدء التكامل مع بوابة الدفع',
    description: 'بدء عملية التكامل مع بوابة الدفع بعد استلام بيانات الاعتماد',
    project: 'تطبيق الخدمات المصرفية',
    projectId: 1,
    subgoal: 'تطوير خدمات API للمدفوعات',
    subgoalId: 2,
    priority: 'عالية',
    dueDate: '30 أبريل 2025',
    status: 'لم تبدأ',
    assigned: true
  },
  {
    id: 3,
    title: 'توثيق إرشادات استخدام واجهة API',
    description: 'إعداد دليل مفصل لاستخدام واجهة برمجة التطبيقات الجديدة',
    project: 'تطبيق الخدمات المصرفية',
    projectId: 1,
    subgoal: 'توثيق النظام',
    subgoalId: 3,
    priority: 'متوسطة',
    dueDate: '2 مايو 2025',
    status: 'لم تبدأ',
    assigned: true
  }
];

// بيانات تجريبية لعرض التقرير اليومي
const demoDailyStandup: DailyStandup = {
  employeeId: 2,
  employeeName: 'محمد خالد',
  date: '29 أبريل 2025',
  status: 'open',
  dayTasks: [1, 2, 3],
  tasksDone: [],
  comments: '',
};

// نوع البيانات للمشكلة
interface Blocker {
  id: number;
  description: string;
}

export default function DailyStandupReport() {
  const [dailyStandup, setDailyStandup] = useState<DailyStandup>(demoDailyStandup);
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [comments, setComments] = useState('');
  const [dayRating, setDayRating] = useState<number | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [newBlocker, setNewBlocker] = useState('');
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [isAddBlockerDialogOpen, setIsAddBlockerDialogOpen] = useState(false);

  // تحميل البيانات
  useEffect(() => {
    // في التطبيق الحقيقي، هنا سنقوم بطلب البيانات من الخادم
    // لجلب التقرير اليومي والمهام المخصصة للموظف

    // هنا نستخدم البيانات التجريبية
    setDailyStandup(demoDailyStandup);
    setTasks(demoTasks);
    
    // المهام المكتملة مسبقًا
    if (demoDailyStandup.tasksDone.length > 0) {
      setSelectedTasks(demoDailyStandup.tasksDone);
    }
    
    // التعليقات المحفوظة مسبقًا
    if (demoDailyStandup.comments) {
      setComments(demoDailyStandup.comments);
    }
    
    // تقييم اليوم المحفوظ مسبقًا
    if (demoDailyStandup.dayRating) {
      setDayRating(demoDailyStandup.dayRating);
    }
  }, []);

  // معالجة تحديد/إلغاء تحديد المهام
  const handleTaskToggle = (taskId: number) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  // إضافة مشكلة جديدة
  const handleAddBlocker = () => {
    if (!newBlocker.trim()) return;
    
    const newBlockerId = blockers.length > 0 
      ? Math.max(...blockers.map(b => b.id)) + 1 
      : 1;
      
    setBlockers([
      ...blockers,
      { id: newBlockerId, description: newBlocker }
    ]);
    
    setNewBlocker('');
    setIsAddBlockerDialogOpen(false);
    
    // إضافة المشكلة للتعليقات
    const blockerComment = comments ? 
      `${comments}\n\n⚠️ مشكلة: ${newBlocker}` : 
      `⚠️ مشكلة: ${newBlocker}`;
    
    setComments(blockerComment);
    
    toast({
      title: "تمت إضافة المشكلة",
      description: "تم إضافة المشكلة بنجاح إلى التقرير اليومي"
    });
  };

  // إغلاق التقرير اليومي
  const handleSubmitReport = () => {
    // في التطبيق الحقيقي، هنا سنرسل البيانات إلى الخادم
    
    const updatedStandup: DailyStandup = {
      ...dailyStandup,
      tasksDone: selectedTasks,
      comments: comments,
      dayRating: dayRating || 3,
      status: 'closed',
      updatedAt: new Date().toISOString()
    };
    
    setDailyStandup(updatedStandup);
    setIsSubmitDialogOpen(false);
    
    toast({
      title: "تم إغلاق التقرير اليومي",
      description: "تم حفظ التقرير اليومي بنجاح"
    });
  };

  // تصنيف المهام حسب الأولوية
  const getPriorityBadge = (priority: string) => {
    if (priority === 'عالية') {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">{priority}</Badge>;
    } else if (priority === 'متوسطة') {
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">{priority}</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">{priority}</Badge>;
    }
  };

  // حساب نسبة الإنجاز
  const calculateCompletionPercentage = () => {
    if (dailyStandup.dayTasks.length === 0) return 0;
    return Math.round((selectedTasks.length / dailyStandup.dayTasks.length) * 100);
  };

  // تحويل تقييم اليوم إلى أيقونة
  const getDayRatingIcon = (rating: number | null) => {
    if (rating === null) return <RiStarLine className="text-gray-400" size={24} />;
    
    switch(rating) {
      case 5: return <RiEmotionHappyLine className="text-green-500" size={24} />;
      case 4: return <RiEmotionHappyLine className="text-green-400" size={24} />;
      case 3: return <RiEmotionNormalLine className="text-amber-400" size={24} />;
      case 2: return <RiEmotionUnhappyLine className="text-amber-500" size={24} />;
      case 1: return <RiEmotionUnhappyLine className="text-red-500" size={24} />;
      default: return <RiStarLine className="text-gray-400" size={24} />;
    }
  };

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
    <DashboardLayout title="التقرير اليومي">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* رأس الصفحة */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">التقرير اليومي ({dailyStandup.date})</h1>
            <p className="text-gray-500">
              مراجعة وتحديث حالة المهام اليومية المطلوبة منك
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddBlockerDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <RiInformationLine />
              <span>إضافة مشكلة</span>
            </Button>
            
            <Button
              onClick={() => setIsSubmitDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <RiMoonClearLine />
              <span>إغلاق اليوم</span>
            </Button>
          </div>
        </motion.div>
        
        {/* بطاقات ملخص */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <RiClipboardLine size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">المهام اليومية</div>
              <div className="text-2xl font-bold">{dailyStandup.dayTasks.length}</div>
            </div>
          </div>
          
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <RiCheckboxCircleLine size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">المهام المكتملة</div>
              <div className="text-2xl font-bold">{selectedTasks.length}</div>
            </div>
          </div>
          
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <RiTimeLine size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">نسبة الإنجاز</div>
              <div className="text-2xl font-bold">{calculateCompletionPercentage()}%</div>
            </div>
          </div>
        </motion.div>
        
        {/* مؤشر التقدم الكلي */}
        <motion.div variants={itemVariants} className="dashboard-card p-4 sm:p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">تقدم مهام اليوم</h2>
            <span className="text-sm font-medium">{calculateCompletionPercentage()}%</span>
          </div>
          <Progress value={calculateCompletionPercentage()} className="h-2" />
        </motion.div>
        
        {/* قائمة المهام */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h2 className="text-lg font-bold mb-4">المهام المطلوبة اليوم</h2>
          
          {tasks.map((task) => (
            <Card key={task.id} className={`mb-4 ${selectedTasks.includes(task.id) ? 'border-green-500 bg-green-50' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={`task-${task.id}`}
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                      />
                      <label 
                        htmlFor={`task-${task.id}`} 
                        className={`font-medium text-base cursor-pointer ${selectedTasks.includes(task.id) ? 'line-through text-gray-500' : ''}`}
                      >
                        {task.title}
                      </label>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <CardDescription>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <RiTaskLine size={14} />
                          <span>{task.project}</span>
                        </div>
                        {task.subgoal && (
                          <div className="flex items-center gap-1">
                            <RiPlayLine size={14} />
                            <span>{task.subgoal}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <RiCalendarLine size={14} />
                          <span>استحقاق: {task.dueDate}</span>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="text-xs">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{task.description}</p>
              </CardContent>
            </Card>
          ))}
          
          {tasks.length === 0 && (
            <div className="dashboard-card p-8 text-center">
              <RiClipboardLine className="mx-auto mb-4 text-gray-300" size={48} />
              <h3 className="text-lg font-medium mb-2">لا توجد مهام مسندة</h3>
              <p className="text-gray-500 mb-4">لم يتم تعيين أي مهام لهذا اليوم</p>
            </div>
          )}
        </motion.div>
        
        {/* ملاحظات اليوم وتقييم */}
        <motion.div variants={itemVariants} className="dashboard-card p-6">
          <h2 className="text-lg font-bold mb-4">ملاحظات وتقييم</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                ملاحظات عن اليوم أو معوقات:
              </label>
              <Textarea
                placeholder="اكتب ملاحظاتك هنا... ما الذي أنجزته؟ هل واجهت أي عقبات؟"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3">
                تقييم اليوم:
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-6">
                  <button 
                    type="button"
                    onClick={() => setDayRating(1)}
                    className={`flex flex-col items-center ${dayRating === 1 ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <RiEmotionUnhappyLine size={28} />
                    <span className="text-xs mt-1">صعب</span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setDayRating(3)}
                    className={`flex flex-col items-center ${dayRating === 3 ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <RiEmotionNormalLine size={28} />
                    <span className="text-xs mt-1">عادي</span>
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setDayRating(5)}
                    className={`flex flex-col items-center ${dayRating === 5 ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <RiEmotionHappyLine size={28} />
                    <span className="text-xs mt-1">جيد</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* نافذة إضافة مشكلة */}
      <Dialog open={isAddBlockerDialogOpen} onOpenChange={setIsAddBlockerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة مشكلة أو عائق</DialogTitle>
            <DialogDescription>
              أضف تفاصيل المشكلة أو العائق الذي يمنعك من إتمام المهام.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="اشرح المشكلة التي تواجهها بالتفصيل..."
              value={newBlocker}
              onChange={(e) => setNewBlocker(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBlockerDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddBlocker}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* نافذة تأكيد إغلاق اليوم */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إغلاق التقرير اليومي</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من إغلاق التقرير اليومي؟ لن تتمكن من تعديل المهام المنجزة بعد ذلك.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">ملخص اليوم:</p>
              <ul className="text-sm space-y-1">
                <li>• عدد المهام الكلي: {dailyStandup.dayTasks.length}</li>
                <li>• المهام المكتملة: {selectedTasks.length}</li>
                <li>• النسبة المئوية: {calculateCompletionPercentage()}%</li>
                {dayRating && (
                  <li className="flex items-center gap-2">
                    • تقييم اليوم: {getDayRatingIcon(dayRating)}
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              عودة للتعديل
            </Button>
            <Button onClick={handleSubmitReport}>
              تأكيد الإغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}