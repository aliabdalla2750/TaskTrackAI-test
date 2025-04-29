import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  RiCheckLine, RiInformationLine, RiAddLine, 
  RiPlayLine, RiClipboardLine, RiTimeLine,
  RiCheckboxCircleLine, RiUser3Line, RiCalendarLine,
  RiAlarmLine, RiArrowRightSLine
} from 'react-icons/ri';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';

// Demo data for a single employee
const demoTaskData = {
  date: '29 أبريل 2025',
  employee: {
    id: 2,
    name: 'محمد خالد',
    role: 'مطور خلفية',
    avatar: 'https://ui-avatars.com/api/?name=محمد+خالد&background=5A47FF&color=fff',
  },
  today: [
    {
      id: 1,
      title: 'إكمال تطوير واجهة برمجية المدفوعات',
      project: 'تطوير تطبيق الخدمات المصرفية',
      subgoal: 'تطوير خدمات API للمدفوعات',
      priority: 'عالية',
      dueDate: '29 أبريل 2025',
      status: 'قيد التنفيذ',
      progress: 80,
      notes: '',
      approved: true
    },
    {
      id: 2,
      title: 'بدء التكامل مع بوابة الدفع',
      project: 'تطوير تطبيق الخدمات المصرفية',
      subgoal: 'تطوير خدمات API للمدفوعات',
      priority: 'عالية',
      dueDate: '30 أبريل 2025',
      status: 'لم تبدأ',
      progress: 0,
      notes: 'في انتظار وصول بيانات الاعتماد لبوابة الدفع من العميل',
      approved: true
    }
  ],
  completed: [
    {
      id: 3,
      title: 'بدأت العمل على واجهة برمجية للمدفوعات',
      project: 'تطوير تطبيق الخدمات المصرفية',
      subgoal: 'تطوير خدمات API للمدفوعات',
      priority: 'عالية',
      completedDate: '28 أبريل 2025',
      feedback: 'ممتاز! استمر في العمل على النقاط المتبقية',
    },
    {
      id: 4,
      title: 'أتممت توثيق API الخاص بالمستخدمين',
      project: 'تطوير تطبيق الخدمات المصرفية',
      subgoal: 'تطوير خدمات API للمدفوعات',
      priority: 'متوسطة',
      completedDate: '27 أبريل 2025',
      feedback: 'توثيق واضح ومفيد، شكرًا لك',
    }
  ],
  upcomingTasks: [
    {
      id: 5,
      title: 'إنشاء نظام الإشعارات للمدفوعات',
      project: 'تطوير تطبيق الخدمات المصرفية',
      subgoal: 'تطوير خدمات API للمدفوعات',
      priority: 'متوسطة',
      plannedDate: '1 مايو 2025', 
    },
    {
      id: 6,
      title: 'بدء اختبار واجهة المدفوعات',
      project: 'تطوير تطبيق الخدمات المصرفية',
      subgoal: 'اختبار وضمان الجودة',
      priority: 'متوسطة',
      plannedDate: '2 مايو 2025',
    }
  ],
  blockers: [
    {
      id: 1,
      description: 'في انتظار وصول بيانات الاعتماد لبوابة الدفع من العميل',
      status: 'معلق',
      reportedDate: '28 أبريل 2025',
    }
  ]
};

const getPriorityBadge = (priority: string) => {
  if (priority === 'عالية') {
    return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">{priority}</Badge>;
  } else if (priority === 'متوسطة') {
    return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">{priority}</Badge>;
  } else {
    return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">{priority}</Badge>;
  }
};

export default function EmployeeDailyTasks() {
  const [taskData, setTaskData] = useState(demoTaskData);
  const [selectedTab, setSelectedTab] = useState('today');
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [taskNotes, setTaskNotes] = useState<string>('');
  const [taskProgress, setTaskProgress] = useState<number>(0);
  const [isBlockerDialogOpen, setIsBlockerDialogOpen] = useState(false);
  const [newBlocker, setNewBlocker] = useState('');
  
  // Handle task update
  const handleTaskUpdate = (taskId: number) => {
    const task = taskData.today.find(t => t.id === taskId);
    if (task) {
      setActiveTaskId(taskId);
      setTaskNotes(task.notes);
      setTaskProgress(task.progress);
    }
  };
  
  // Update task progress and notes
  const updateTask = () => {
    if (!activeTaskId) return;
    
    setTaskData({
      ...taskData,
      today: taskData.today.map(task => 
        task.id === activeTaskId ? { ...task, progress: taskProgress, notes: taskNotes } : task
      )
    });
    
    setActiveTaskId(null);
  };
  
  // Mark task as complete
  const markTaskComplete = (taskId: number) => {
    const task = taskData.today.find(t => t.id === taskId);
    if (!task) return;
    
    // Move from today to completed
    setTaskData({
      ...taskData,
      today: taskData.today.filter(t => t.id !== taskId),
      completed: [
        {
          id: task.id,
          title: task.title,
          project: task.project,
          subgoal: task.subgoal,
          priority: task.priority,
          completedDate: taskData.date,
          feedback: '',
        },
        ...taskData.completed
      ]
    });
  };
  
  // Add a new blocker
  const addBlocker = () => {
    if (!newBlocker.trim()) return;
    
    setTaskData({
      ...taskData,
      blockers: [
        {
          id: Date.now(),
          description: newBlocker,
          status: 'معلق',
          reportedDate: taskData.date,
        },
        ...taskData.blockers
      ]
    });
    
    setNewBlocker('');
    setIsBlockerDialogOpen(false);
  };
  
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
  
  return (
    <DashboardLayout title="المهام اليومية">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with employee info */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={taskData.employee.avatar} alt={taskData.employee.name} className="w-12 h-12 rounded-full" />
            <div>
              <h1 className="text-xl font-bold">{taskData.employee.name}</h1>
              <p className="text-gray-500">{taskData.employee.role}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{taskData.date}</span>
          </div>
        </motion.div>
        
        {/* Summary cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <RiClipboardLine size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">مهام اليوم</div>
              <div className="text-2xl font-bold">{taskData.today.length}</div>
            </div>
          </div>
          
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <RiCheckboxCircleLine size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">المهام المكتملة</div>
              <div className="text-2xl font-bold">{taskData.completed.length}</div>
            </div>
          </div>
          
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <RiInformationLine size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">العوائق</div>
              <div className="text-2xl font-bold">{taskData.blockers.length}</div>
            </div>
          </div>
        </motion.div>
        
        {/* Task tabs */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="today" onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="today">مهام اليوم</TabsTrigger>
              <TabsTrigger value="upcoming">المهام القادمة</TabsTrigger>
              <TabsTrigger value="completed">المهام المكتملة</TabsTrigger>
              <TabsTrigger value="blockers">العوائق</TabsTrigger>
            </TabsList>
            
            {/* Today's tasks */}
            <TabsContent value="today" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">مهام اليوم ({taskData.today.length})</h2>
              </div>
              
              {taskData.today.length > 0 ? (
                <div className="space-y-4">
                  {taskData.today.map((task) => (
                    <div key={task.id} className={`dashboard-card overflow-hidden ${activeTaskId === task.id ? 'border-primary' : ''}`}>
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-lg">{task.title}</h3>
                              {getPriorityBadge(task.priority)}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <RiClipboardLine size={16} />
                                <span>{task.project}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <RiCalendarLine size={16} />
                                <span>استحقاق: {task.dueDate}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleTaskUpdate(task.id)}
                            >
                              تحديث
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => markTaskComplete(task.id)}
                            >
                              <RiCheckLine className="ml-1" /> إكمال
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">التقدم</span>
                            <span className="text-sm font-medium">{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                        
                        {task.notes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
                            <div className="font-medium mb-1">ملاحظات:</div>
                            <p>{task.notes}</p>
                          </div>
                        )}
                        
                        {activeTaskId === task.id && (
                          <div className="mt-4 space-y-4 border-t pt-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">تحديث التقدم:</label>
                              <div className="flex items-center gap-4">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={taskProgress}
                                  onChange={(e) => setTaskProgress(parseInt(e.target.value))}
                                  className="flex-1"
                                />
                                <span className="w-12 text-center">{taskProgress}%</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">ملاحظات أو تحديات:</label>
                              <Textarea
                                placeholder="أضف ملاحظاتك أو تحديات تواجهها..."
                                value={taskNotes}
                                onChange={(e) => setTaskNotes(e.target.value)}
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-4">
                              <Button variant="outline" onClick={() => setActiveTaskId(null)}>
                                إلغاء
                              </Button>
                              <Button onClick={updateTask}>
                                حفظ التحديث
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-card p-8 text-center">
                  <RiClipboardLine className="mx-auto mb-4 text-gray-300" size={48} />
                  <h3 className="text-lg font-medium mb-2">لا توجد مهام لليوم</h3>
                  <p className="text-gray-500 mb-4">لم يتم تعيين أي مهام لهذا اليوم</p>
                </div>
              )}
            </TabsContent>
            
            {/* Upcoming tasks */}
            <TabsContent value="upcoming" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">المهام القادمة ({taskData.upcomingTasks.length})</h2>
              </div>
              
              {taskData.upcomingTasks.length > 0 ? (
                <div className="space-y-4">
                  {taskData.upcomingTasks.map((task) => (
                    <div key={task.id} className="dashboard-card overflow-hidden">
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-lg">{task.title}</h3>
                              {getPriorityBadge(task.priority)}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <RiClipboardLine size={16} />
                                <span>{task.project}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <RiTimeLine size={16} />
                                <span>مخطط ليوم: {task.plannedDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-card p-8 text-center">
                  <RiCalendarLine className="mx-auto mb-4 text-gray-300" size={48} />
                  <h3 className="text-lg font-medium mb-2">لا توجد مهام قادمة</h3>
                  <p className="text-gray-500 mb-4">لم يتم تخطيط أي مهام للأيام القادمة</p>
                </div>
              )}
            </TabsContent>
            
            {/* Completed tasks */}
            <TabsContent value="completed" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">المهام المكتملة ({taskData.completed.length})</h2>
              </div>
              
              {taskData.completed.length > 0 ? (
                <div className="space-y-4">
                  {taskData.completed.map((task) => (
                    <div key={task.id} className="dashboard-card overflow-hidden">
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <RiCheckboxCircleLine className="text-green-500" />
                              <h3 className="font-medium text-lg">{task.title}</h3>
                              {getPriorityBadge(task.priority)}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <RiClipboardLine size={16} />
                                <span>{task.project}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <RiCalendarLine size={16} />
                                <span>أكتمل في: {task.completedDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {task.feedback && (
                          <div className="mt-4 p-3 bg-green-50 rounded-md text-sm">
                            <div className="font-medium mb-1">تعليق من المدير:</div>
                            <p>{task.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-card p-8 text-center">
                  <RiCheckboxCircleLine className="mx-auto mb-4 text-gray-300" size={48} />
                  <h3 className="text-lg font-medium mb-2">لا توجد مهام مكتملة</h3>
                  <p className="text-gray-500 mb-4">لم يتم إكمال أي مهام بعد</p>
                </div>
              )}
            </TabsContent>
            
            {/* Blockers */}
            <TabsContent value="blockers" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">العوائق ({taskData.blockers.length})</h2>
                <Dialog open={isBlockerDialogOpen} onOpenChange={setIsBlockerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <RiAddLine className="ml-1" />
                      إضافة عائق
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>إضافة عائق جديد</DialogTitle>
                      <DialogDescription>
                        أضف وصفًا للتحدي أو العائق الذي يمنعك من إكمال مهامك
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Textarea
                        placeholder="وصف العائق..."
                        value={newBlocker}
                        onChange={(e) => setNewBlocker(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsBlockerDialogOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={addBlocker} disabled={!newBlocker.trim()}>
                        إضافة
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {taskData.blockers.length > 0 ? (
                <div className="space-y-4">
                  {taskData.blockers.map((blocker) => (
                    <div key={blocker.id} className="dashboard-card p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                              <RiInformationLine size={16} />
                            </div>
                            <h3 className="font-medium">{blocker.description}</h3>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div>
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                {blocker.status}
                              </Badge>
                            </div>
                            <div>تم الإبلاغ في: {blocker.reportedDate}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dashboard-card p-8 text-center">
                  <RiInformationLine className="mx-auto mb-4 text-gray-300" size={48} />
                  <h3 className="text-lg font-medium mb-2">لا توجد عوائق</h3>
                  <p className="text-gray-500 mb-4">لا توجد عوائق مبلغ عنها حاليًا</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}