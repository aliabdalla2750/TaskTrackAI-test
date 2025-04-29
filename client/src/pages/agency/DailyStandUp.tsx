import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  RiCheckLine, RiInformationLine, RiAddLine, 
  RiPlayLine, RiArrowRightLine, RiUser3Line,
  RiClipboardLine, RiTimeLine, RiArrowLeftLine,
  RiCheckboxCircleLine, RiCalendarLine, RiTaskLine,
  RiAlarmLine, RiListCheck, RiExchangeLine,
  RiShieldCheckLine, RiEyeLine, RiMessage2Line
} from 'react-icons/ri';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';

// Demo data
const demoTeam = [
  { id: 1, name: 'سارة أحمد', role: 'مصمم واجهات المستخدم', avatar: 'https://ui-avatars.com/api/?name=سارة+أحمد&background=00BFA6&color=fff' },
  { id: 2, name: 'محمد خالد', role: 'مطور خلفية', avatar: 'https://ui-avatars.com/api/?name=محمد+خالد&background=5A47FF&color=fff' },
  { id: 3, name: 'أحمد علي', role: 'مدير مشروع', avatar: 'https://ui-avatars.com/api/?name=أحمد+علي&background=F59E0B&color=fff' },
  { id: 4, name: 'ليلى حسن', role: 'مختبر جودة', avatar: 'https://ui-avatars.com/api/?name=ليلى+حسن&background=EF4444&color=fff' }
];

// In a real app, this would be fetched from the API
const demoStandupData = {
  date: '29 أبريل 2025',
  teams: [
    {
      id: 1,
      name: 'فريق تطوير تطبيق الخدمات المصرفية',
      members: [
        {
          id: 1,
          name: 'سارة أحمد',
          avatar: 'https://ui-avatars.com/api/?name=سارة+أحمد&background=00BFA6&color=fff',
          yesterday: [
            { id: 1, text: 'أكملت تصميم الصفحة الرئيسية وتم قبولها', done: true },
            { id: 2, text: 'قمت بإجراء تعديلات على صفحة تسجيل الدخول بناءً على ملاحظات العميل', done: true }
          ],
          today: [
            { id: 1, text: 'بدء العمل على تصميم واجهة المدفوعات', done: false },
            { id: 2, text: 'إعداد تصاميم لحالات الخطأ المختلفة', done: false }
          ],
          blockers: []
        },
        {
          id: 2,
          name: 'محمد خالد',
          avatar: 'https://ui-avatars.com/api/?name=محمد+خالد&background=5A47FF&color=fff',
          yesterday: [
            { id: 1, text: 'بدأت العمل على واجهة برمجية للمدفوعات', done: true },
            { id: 2, text: 'أتممت توثيق API الخاص بالمستخدمين', done: true }
          ],
          today: [
            { id: 1, text: 'إكمال تطوير واجهة برمجية المدفوعات', done: false },
            { id: 2, text: 'بدء التكامل مع بوابة الدفع', done: false }
          ],
          blockers: [
            { id: 1, text: 'في انتظار وصول بيانات الاعتماد لبوابة الدفع من العميل' }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'فريق إعادة تصميم الموقع الإلكتروني',
      members: [
        {
          id: 3,
          name: 'أحمد علي',
          avatar: 'https://ui-avatars.com/api/?name=أحمد+علي&background=F59E0B&color=fff',
          yesterday: [
            { id: 1, text: 'اجتماع مع العميل لمناقشة التقدم والملاحظات', done: true },
            { id: 2, text: 'إعداد خطة العمل للأسبوع القادم', done: true }
          ],
          today: [
            { id: 1, text: 'مراجعة التصاميم المقدمة من الفريق', done: false },
            { id: 2, text: 'إعداد تقرير التقدم الأسبوعي', done: false }
          ],
          blockers: []
        },
        {
          id: 4,
          name: 'ليلى حسن',
          avatar: 'https://ui-avatars.com/api/?name=ليلى+حسن&background=EF4444&color=fff',
          yesterday: [
            { id: 1, text: 'اختبار وظائف تسجيل المستخدمين وإدارة الحسابات', done: true }
          ],
          today: [
            { id: 1, text: 'اختبار تكامل الموقع مع وسائل التواصل الاجتماعي', done: false },
            { id: 2, text: 'إعداد سيناريوهات اختبار لوظائف الدفع', done: false }
          ],
          blockers: [
            { id: 1, text: 'بعض وظائف API وسائل التواصل الاجتماعي لا تعمل بشكل صحيح' }
          ]
        }
      ]
    }
  ]
};

interface StandupItem {
  id: number;
  text: string;
  done?: boolean;
}

interface StandupUpdate {
  yesterday: StandupItem[];
  today: StandupItem[];
  blockers: StandupItem[];
}

// Demo data for available tasks
const availableTasks = [
  {
    id: 1,
    title: 'تطوير واجهة API للمدفوعات',
    project: 'تطبيق الخدمات المصرفية',
    description: 'تطوير واجهة برمجية للتعامل مع عمليات الدفع المختلفة والتكامل مع بوابات الدفع',
    priority: 'عالية',
    dueDate: '30 أبريل 2025',
    estimatedHours: 8,
    skills: ['Node.js', 'Express', 'API']
  },
  {
    id: 2,
    title: 'تصميم واجهة صفحة المدفوعات',
    project: 'تطبيق الخدمات المصرفية',
    description: 'تصميم واجهة المستخدم لصفحة المدفوعات مع جميع حالات الخطأ المحتملة',
    priority: 'عالية',
    dueDate: '29 أبريل 2025',
    estimatedHours: 6,
    skills: ['UI/UX', 'Figma']
  },
  {
    id: 3,
    title: 'اختبار وظائف التسجيل',
    project: 'إعادة تصميم الموقع الإلكتروني',
    description: 'اختبار جميع وظائف تسجيل المستخدمين وإدارة الحسابات',
    priority: 'متوسطة',
    dueDate: '1 مايو 2025',
    estimatedHours: 4,
    skills: ['QA', 'Testing']
  },
  {
    id: 4,
    title: 'توثيق API',
    project: 'تطبيق الخدمات المصرفية',
    description: 'كتابة توثيق شامل لجميع نقاط النهاية API في النظام',
    priority: 'منخفضة',
    dueDate: '5 مايو 2025',
    estimatedHours: 5,
    skills: ['Documentation', 'API']
  }
];

// Demo data for current team tasks assignments
const teamTaskAssignments = [
  {
    memberId: 1, // سارة أحمد
    taskId: 2,
    assignedDate: '28 أبريل 2025',
    status: 'قيد التنفيذ',
    progress: 60,
    notes: 'جاري العمل على التصميم، وسيتم الانتهاء غدًا',
  },
  {
    memberId: 2, // محمد خالد
    taskId: 1,
    assignedDate: '27 أبريل 2025',
    status: 'قيد التنفيذ',
    progress: 80,
    notes: 'في انتظار بيانات اعتماد بوابة الدفع',
  },
  {
    memberId: 4, // ليلى حسن
    taskId: 3,
    assignedDate: '28 أبريل 2025',
    status: 'قيد التنفيذ',
    progress: 40,
    notes: 'مشكلة في API التواصل الاجتماعي',
  }
];

export default function DailyStandUp() {
  const [standupData, setStandupData] = useState(demoStandupData);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(demoStandupData.date);
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [isAssigningTask, setIsAssigningTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [taskDueDate, setTaskDueDate] = useState<string>('');
  const [taskNotes, setTaskNotes] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [currentTabView, setCurrentTabView] = useState('teamView');
  const [newUpdate, setNewUpdate] = useState<StandupUpdate>({
    yesterday: [{ id: 1, text: '', done: true }],
    today: [{ id: 1, text: '', done: false }],
    blockers: []
  });
  const [selectedMemberForFeedback, setSelectedMemberForFeedback] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  
  // Helpers for form state
  const addYesterdayItem = () => {
    setNewUpdate({
      ...newUpdate,
      yesterday: [...newUpdate.yesterday, { id: Date.now(), text: '', done: true }]
    });
  };
  
  const addTodayItem = () => {
    setNewUpdate({
      ...newUpdate,
      today: [...newUpdate.today, { id: Date.now(), text: '', done: false }]
    });
  };
  
  const addBlockerItem = () => {
    setNewUpdate({
      ...newUpdate,
      blockers: [...newUpdate.blockers, { id: Date.now(), text: '' }]
    });
  };
  
  const updateYesterdayItem = (id: number, value: string) => {
    setNewUpdate({
      ...newUpdate,
      yesterday: newUpdate.yesterday.map(item => 
        item.id === id ? { ...item, text: value } : item
      )
    });
  };
  
  const updateTodayItem = (id: number, value: string) => {
    setNewUpdate({
      ...newUpdate,
      today: newUpdate.today.map(item => 
        item.id === id ? { ...item, text: value } : item
      )
    });
  };
  
  const updateBlockerItem = (id: number, value: string) => {
    setNewUpdate({
      ...newUpdate,
      blockers: newUpdate.blockers.map(item => 
        item.id === id ? { ...item, text: value } : item
      )
    });
  };
  
  const removeYesterdayItem = (id: number) => {
    setNewUpdate({
      ...newUpdate,
      yesterday: newUpdate.yesterday.filter(item => item.id !== id)
    });
  };
  
  const removeTodayItem = (id: number) => {
    setNewUpdate({
      ...newUpdate,
      today: newUpdate.today.filter(item => item.id !== id)
    });
  };
  
  const removeBlockerItem = (id: number) => {
    setNewUpdate({
      ...newUpdate,
      blockers: newUpdate.blockers.filter(item => item.id !== id)
    });
  };
  
  const handleSubmitUpdate = () => {
    // In a real app, you would send this to the API
    console.log("Submitted update:", newUpdate);
    setIsAddingUpdate(false);
    // Reset form
    setNewUpdate({
      yesterday: [{ id: 1, text: '', done: true }],
      today: [{ id: 1, text: '', done: false }],
      blockers: []
    });
  };

  const handleAssignTask = () => {
    // In a real app, you would assign the task via API
    console.log("Assigned task:", { 
      taskId: selectedTask, 
      memberId: selectedAssignee,
      dueDate: taskDueDate,
      notes: taskNotes
    });
    
    setIsAssigningTask(false);
    setSelectedTask(null);
    setSelectedAssignee('');
    setTaskDueDate('');
    setTaskNotes('');
  };

  const handleSubmitFeedback = () => {
    // In a real app, you would send this feedback to the API
    console.log("Submitted feedback for member:", selectedMemberForFeedback, feedbackText);
    setIsFeedbackDialogOpen(false);
    setSelectedMemberForFeedback(null);
    setFeedbackText('');
  };
  
  // Get task details by ID
  const getTaskById = (id: number) => {
    return availableTasks.find(task => task.id === id);
  };
  
  // Get member by ID
  const getMemberById = (id: number) => {
    for (const team of standupData.teams) {
      const member = team.members.find(m => m.id === id);
      if (member) return member;
    }
    return null;
  };
  
  // Check if a task is assigned to a member
  const isTaskAssigned = (taskId: number) => {
    return teamTaskAssignments.some(assignment => assignment.taskId === taskId);
  };
  
  // Get task assignments for a member
  const getMemberAssignments = (memberId: number) => {
    return teamTaskAssignments.filter(assignment => assignment.memberId === memberId);
  };
  
  // Count tasks by status across all team members
  const taskStatusCounts = {
    total: teamTaskAssignments.length,
    inProgress: teamTaskAssignments.filter(t => t.status === 'قيد التنفيذ').length,
    completed: teamTaskAssignments.filter(t => t.status === 'مكتمل').length,
    blocked: teamTaskAssignments.filter(t => t.notes.includes('انتظار') || t.notes.includes('مشكلة')).length,
  };
  
  // Count member updates across all teams
  const memberUpdateCounts = {
    total: standupData.teams.reduce((acc, team) => acc + team.members.length, 0),
    updated: standupData.teams.reduce((acc, team) => {
      return acc + team.members.filter(member => 
        member.yesterday.length > 0 || member.today.length > 0
      ).length;
    }, 0),
    withBlockers: standupData.teams.reduce((acc, team) => {
      return acc + team.members.filter(member => member.blockers.length > 0).length;
    }, 0),
  };
  
  // Animations
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
  
  const selectedTeam = standupData.teams[selectedTeamIndex];
  
  return (
    <DashboardLayout title="التقرير اليومي">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header and controls */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">تقرير الـ Stand-up اليومي</h1>
            <p className="text-gray-500">
              مراجعة المهام ومتابعة تقدم الفريق وتوزيع المهام الجديدة
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isAssigningTask} onOpenChange={setIsAssigningTask}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <RiAddLine />
                  <span>تعيين مهمة</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>تعيين مهمة جديدة</DialogTitle>
                  <DialogDescription>
                    اختر المهمة وعضو الفريق الذي سيتم تكليفه بها.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">المهمة</label>
                    <Select value={selectedTask?.toString() || ''} onValueChange={(v) => setSelectedTask(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المهمة" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTasks.map((task) => (
                          <SelectItem 
                            key={task.id} 
                            value={task.id.toString()}
                            disabled={isTaskAssigned(task.id)}
                          >
                            {isTaskAssigned(task.id) ? `${task.title} (مُسندة)` : task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">عضو الفريق</label>
                    <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر عضو الفريق" />
                      </SelectTrigger>
                      <SelectContent>
                        {demoTeam.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">تاريخ الاستحقاق</label>
                    <Input
                      type="text"
                      placeholder="مثال: 5 مايو 2025"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">ملاحظات</label>
                    <Textarea
                      placeholder="أي ملاحظات إضافية حول المهمة..."
                      value={taskNotes}
                      onChange={(e) => setTaskNotes(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAssigningTask(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleAssignTask}
                    disabled={!selectedTask || !selectedAssignee}
                  >
                    تعيين المهمة
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddingUpdate} onOpenChange={setIsAddingUpdate}>
              <DialogTrigger asChild>
                <Button className="btn-primary flex items-center gap-2">
                  <RiAddLine />
                  <span>إضافة تحديث</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>إضافة تحديث جديد</DialogTitle>
                  <DialogDescription>
                    أدخل تفاصيل ما أنجزته بالأمس وما تخطط له اليوم وأي عوائق تواجهها.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">العضو</label>
                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر عضو الفريق" />
                      </SelectTrigger>
                      <SelectContent>
                        {demoTeam.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      ماذا أنجزت بالأمس؟
                    </label>
                    <div className="space-y-2">
                      {newUpdate.yesterday.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="text-green-500">
                            <RiCheckLine />
                          </div>
                          <Input
                            value={item.text}
                            onChange={(e) => updateYesterdayItem(item.id, e.target.value)}
                            placeholder="مثال: أكملت تصميم الصفحة الرئيسية"
                            className="flex-1"
                          />
                          {newUpdate.yesterday.length > 1 && (
                            <button 
                              onClick={() => removeYesterdayItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <RiInformationLine />
                            </button>
                          )}
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={addYesterdayItem}
                        className="mt-2"
                      >
                        <RiAddLine className="ml-1" />
                        إضافة بند
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      ما الذي ستعمل عليه اليوم؟
                    </label>
                    <div className="space-y-2">
                      {newUpdate.today.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="text-blue-500">
                            <RiPlayLine />
                          </div>
                          <Input
                            value={item.text}
                            onChange={(e) => updateTodayItem(item.id, e.target.value)}
                            placeholder="مثال: سأعمل على تطوير واجهة المدفوعات"
                            className="flex-1"
                          />
                          {newUpdate.today.length > 1 && (
                            <button 
                              onClick={() => removeTodayItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <RiInformationLine />
                            </button>
                          )}
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={addTodayItem}
                        className="mt-2"
                      >
                        <RiAddLine className="ml-1" />
                        إضافة بند
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      هل هناك أي عوائق تواجهك؟
                    </label>
                    <div className="space-y-2">
                      {newUpdate.blockers.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="text-red-500">
                            <RiInformationLine />
                          </div>
                          <Input
                            value={item.text}
                            onChange={(e) => updateBlockerItem(item.id, e.target.value)}
                            placeholder="مثال: في انتظار بيانات اعتماد من العميل"
                            className="flex-1"
                          />
                          <button 
                            onClick={() => removeBlockerItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <RiInformationLine />
                          </button>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={addBlockerItem}
                        className="mt-2"
                      >
                        <RiAddLine className="ml-1" />
                        إضافة عائق
                      </Button>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAddingUpdate(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleSubmitUpdate}>
                    إرسال
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
        
        {/* Stats overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <RiUser3Line size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">أعضاء الفريق</div>
              <div className="text-2xl font-bold">{memberUpdateCounts.total}</div>
            </div>
          </div>
          
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <RiTaskLine size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">المهام النشطة</div>
              <div className="text-2xl font-bold">{taskStatusCounts.total}</div>
            </div>
          </div>
          
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <RiInformationLine size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">المهام المعطلة</div>
              <div className="text-2xl font-bold">{taskStatusCounts.blocked}</div>
            </div>
          </div>
          
          <div className="dashboard-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <RiCalendarLine size={24} />
            </div>
            <div>
              <div className="text-sm text-gray-500">التاريخ</div>
              <div className="text-xl font-bold">{selectedDate}</div>
            </div>
          </div>
        </motion.div>
        
        {/* View tabs */}
        <motion.div variants={itemVariants}>
          <Tabs 
            value={currentTabView} 
            onValueChange={setCurrentTabView} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="teamView" className="flex items-center gap-2">
                <RiUser3Line />
                <span>عرض الفريق</span>
              </TabsTrigger>
              <TabsTrigger value="taskView" className="flex items-center gap-2">
                <RiTaskLine />
                <span>عرض المهام</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Team view */}
            <TabsContent value="teamView" className="space-y-6">
              {/* Team selection */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium" htmlFor="team-select">
                  الفريق:
                </label>
                <Select 
                  value={selectedTeamIndex.toString()} 
                  onValueChange={(value) => setSelectedTeamIndex(parseInt(value))}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="اختر الفريق" />
                  </SelectTrigger>
                  <SelectContent>
                    {standupData.teams.map((team, index) => (
                      <SelectItem key={team.id} value={index.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Team members */}
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  أعضاء الفريق ({selectedTeam.members.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedTeam.members.map((member) => (
                    <div key={member.id} className="dashboard-card overflow-hidden">
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={member.avatar} 
                              alt={member.name}
                              className="w-10 h-10 rounded-full" 
                            />
                            <div>
                              <h3 className="font-medium">{member.name}</h3>
                            </div>
                          </div>
                          
                          <Dialog open={selectedMemberForFeedback === member.id && isFeedbackDialogOpen} onOpenChange={(open) => {
                            if (!open) {
                              setIsFeedbackDialogOpen(false);
                              setSelectedMemberForFeedback(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-blue-600"
                                onClick={() => {
                                  setSelectedMemberForFeedback(member.id);
                                  setIsFeedbackDialogOpen(true);
                                }}
                              >
                                <RiMessage2Line className="ml-1" />
                                تعليق
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>إضافة تعليق أو ملاحظات للموظف</DialogTitle>
                                <DialogDescription>
                                  أضف تعليقك أو ملاحظاتك على تقدم {member.name}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="py-4">
                                <Textarea
                                  placeholder="اكتب تعليقك أو ملاحظاتك هنا..."
                                  rows={5}
                                  value={feedbackText}
                                  onChange={(e) => setFeedbackText(e.target.value)}
                                />
                              </div>
                              
                              <DialogFooter>
                                <Button variant="ghost" onClick={() => {
                                  setIsFeedbackDialogOpen(false);
                                  setSelectedMemberForFeedback(null);
                                }}>
                                  إلغاء
                                </Button>
                                <Button 
                                  onClick={handleSubmitFeedback}
                                  disabled={!feedbackText.trim()}
                                >
                                  إرسال
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        
                        {/* Assigned tasks */}
                        {getMemberAssignments(member.id).length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                              <RiListCheck className="text-purple-500" />
                              <span>المهام المسندة</span>
                            </h4>
                            <div className="space-y-3">
                              {getMemberAssignments(member.id).map((assignment) => {
                                const task = getTaskById(assignment.taskId);
                                return task && (
                                  <div key={assignment.taskId} className="border rounded-md p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="font-medium">{task.title}</div>
                                      {assignment.status === 'قيد التنفيذ' ? (
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                          قيد التنفيذ
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                          مكتمل
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="mb-3">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>التقدم</span>
                                        <span>{assignment.progress}%</span>
                                      </div>
                                      <Progress value={assignment.progress} className="h-1" />
                                    </div>
                                    {assignment.notes && (
                                      <div className="text-xs text-gray-600">
                                        ملاحظات: {assignment.notes}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-6">
                          {/* Yesterday's achievements */}
                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                              <RiArrowRightLine className="text-green-500" />
                              <span>بالأمس</span>
                            </h4>
                            {member.yesterday.length > 0 ? (
                              <ul className="ms-6 space-y-1 list-disc list-outside">
                                {member.yesterday.map((item) => (
                                  <li key={item.id} className="text-sm">
                                    {item.text}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 ms-6">
                                لا توجد تحديثات
                              </p>
                            )}
                          </div>
                          
                          {/* Today's plan */}
                          <div>
                            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                              <RiPlayLine className="text-blue-500" />
                              <span>خطة اليوم</span>
                            </h4>
                            {member.today.length > 0 ? (
                              <ul className="ms-6 space-y-1 list-disc list-outside">
                                {member.today.map((item) => (
                                  <li key={item.id} className="text-sm">
                                    {item.text}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 ms-6">
                                لا توجد خطة معلنة لليوم
                              </p>
                            )}
                          </div>
                          
                          {/* Blockers */}
                          {member.blockers.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                                <RiInformationLine className="text-red-500" />
                                <span>العوائق</span>
                              </h4>
                              <ul className="ms-6 space-y-1 list-disc list-outside">
                                {member.blockers.map((item) => (
                                  <li key={item.id} className="text-sm text-red-600">
                                    {item.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Task view */}
            <TabsContent value="taskView" className="space-y-6">
              {/* Available Tasks */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <RiClipboardLine />
                  <span>المهام المتاحة للتعيين ({availableTasks.filter(t => !isTaskAssigned(t.id)).length})</span>
                </h2>
                
                <div className="space-y-4">
                  {availableTasks.filter(t => !isTaskAssigned(t.id)).map((task) => (
                    <div key={task.id} className="dashboard-card p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{task.title}</h3>
                            {task.priority === 'عالية' ? (
                              <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">{task.priority}</Badge>
                            ) : task.priority === 'متوسطة' ? (
                              <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">{task.priority}</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">{task.priority}</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                              المشروع: {task.project}
                            </div>
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                              <RiCalendarLine size={12} />
                              {task.dueDate}
                            </div>
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                              <RiTimeLine size={12} />
                              {task.estimatedHours} ساعات
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.skills.map((skill, index) => (
                              <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Button 
                            onClick={() => {
                              setSelectedTask(task.id);
                              setTaskDueDate(task.dueDate);
                              setIsAssigningTask(true);
                            }}
                            size="sm"
                          >
                            <RiUser3Line className="ml-1" />
                            تعيين
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {availableTasks.filter(t => !isTaskAssigned(t.id)).length === 0 && (
                    <div className="dashboard-card p-8 text-center">
                      <RiClipboardLine className="mx-auto mb-4 text-gray-300" size={48} />
                      <h3 className="text-lg font-medium mb-2">جميع المهام مسندة</h3>
                      <p className="text-gray-500 mb-4">لا توجد مهام متاحة للتعيين حاليًا</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Assigned Tasks */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <RiExchangeLine />
                  <span>المهام المسندة ({teamTaskAssignments.length})</span>
                </h2>
                
                <div className="space-y-4">
                  {teamTaskAssignments.map((assignment) => {
                    const task = getTaskById(assignment.taskId);
                    const member = getMemberById(assignment.memberId);
                    
                    return task && member && (
                      <div key={assignment.taskId} className="dashboard-card p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{task.title}</h3>
                              {task.priority === 'عالية' ? (
                                <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">{task.priority}</Badge>
                              ) : task.priority === 'متوسطة' ? (
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">{task.priority}</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">{task.priority}</Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" />
                                <span className="text-sm">{member.name}</span>
                              </div>
                              
                              <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                المشروع: {task.project}
                              </div>
                              
                              <div className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                                <RiCalendarLine size={12} />
                                {task.dueDate}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>التقدم</span>
                                <span>{assignment.progress}%</span>
                              </div>
                              <Progress value={assignment.progress} className="h-2" />
                            </div>
                            
                            {assignment.notes && (
                              <div className="text-sm p-3 bg-gray-50 rounded">
                                <strong className="text-xs text-gray-500">ملاحظات:</strong> {assignment.notes}
                              </div>
                            )}
                          </div>
                          
                          <div className="shrink-0 flex items-start">
                            <Badge className={assignment.status === 'قيد التنفيذ' 
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }>
                              {assignment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {teamTaskAssignments.length === 0 && (
                    <div className="dashboard-card p-8 text-center">
                      <RiExchangeLine className="mx-auto mb-4 text-gray-300" size={48} />
                      <h3 className="text-lg font-medium mb-2">لا توجد مهام مسندة</h3>
                      <p className="text-gray-500 mb-4">لم يتم تعيين أي مهام للفريق حتى الآن</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}