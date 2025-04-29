import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  RiCheckLine, RiInformationLine, RiAddLine, 
  RiPlayLine, RiArrowRightLine, RiUser3Line 
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

export default function DailyStandUp() {
  const [standupData, setStandupData] = useState(demoStandupData);
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(demoStandupData.date);
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [newUpdate, setNewUpdate] = useState<StandupUpdate>({
    yesterday: [{ id: 1, text: '', done: true }],
    today: [{ id: 1, text: '', done: false }],
    blockers: []
  });
  const [selectedMember, setSelectedMember] = useState<string>('');
  
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
              ما الذي تم إنجازه بالأمس، وما هي خطة اليوم، وما هي العوائق؟
            </p>
          </div>
          
          <div className="flex items-center gap-2">
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
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addYesterdayItem}
                      >
                        + إضافة إنجاز آخر
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      ما هي خطتك لليوم؟
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
                            placeholder="مثال: بدء العمل على صفحة المنتجات"
                            className="flex-1"
                          />
                          {newUpdate.today.length > 1 && (
                            <button 
                              onClick={() => removeTodayItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addTodayItem}
                      >
                        + إضافة مهمة أخرى
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      هل هناك عوائق تواجهك؟
                    </label>
                    {newUpdate.blockers.length === 0 ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addBlockerItem}
                      >
                        + إضافة عائق
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        {newUpdate.blockers.map((item, index) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <div className="text-red-500">
                              <RiInformationLine />
                            </div>
                            <Input
                              value={item.text}
                              onChange={(e) => updateBlockerItem(item.id, e.target.value)}
                              placeholder="مثال: في انتظار المعلومات من العميل"
                              className="flex-1"
                            />
                            <button 
                              onClick={() => removeBlockerItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={addBlockerItem}
                        >
                          + إضافة عائق آخر
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingUpdate(false)}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleSubmitUpdate}
                    disabled={!selectedMember || 
                      newUpdate.yesterday.some(i => !i.text) || 
                      newUpdate.today.some(i => !i.text) ||
                      newUpdate.blockers.some(i => !i.text)
                    }
                  >
                    إرسال
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
        
        {/* Date selector */}
        <motion.div variants={itemVariants} className="dashboard-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">{selectedDate}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">السابق</Button>
            <Button variant="outline" size="sm">اليوم</Button>
            <Button variant="outline" size="sm" disabled>التالي</Button>
          </div>
        </motion.div>
        
        {/* Teams tabs */}
        <motion.div variants={itemVariants}>
          <Tabs 
            defaultValue={selectedTeam.id.toString()} 
            onValueChange={(value) => setSelectedTeamIndex(
              standupData.teams.findIndex(t => t.id.toString() === value)
            )}
          >
            <TabsList className="mb-6">
              {standupData.teams.map((team) => (
                <TabsTrigger key={team.id} value={team.id.toString()}>
                  {team.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {standupData.teams.map((team) => (
              <TabsContent key={team.id} value={team.id.toString()} className="space-y-6">
                {team.members.map((member) => (
                  <div key={member.id} className="dashboard-card overflow-hidden">
                    <div className="p-4 flex items-center justify-between bg-gray-50 border-b">
                      <div className="flex items-center gap-3">
                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 flex flex-col md:flex-row gap-6">
                      {/* Yesterday */}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-500 mb-3">ماذا أنجز بالأمس؟</h4>
                        {member.yesterday.length > 0 ? (
                          <ul className="space-y-2">
                            {member.yesterday.map((item) => (
                              <li key={item.id} className="flex items-start gap-2">
                                <div className="mt-0.5 text-green-500">
                                  <RiCheckLine />
                                </div>
                                <span>{item.text}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 italic">لا يوجد إنجازات مسجلة للأمس</p>
                        )}
                      </div>
                      
                      {/* Today */}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-500 mb-3">ما هي خطته لليوم؟</h4>
                        {member.today.length > 0 ? (
                          <ul className="space-y-2">
                            {member.today.map((item) => (
                              <li key={item.id} className="flex items-start gap-2">
                                <div className="mt-0.5 text-blue-500">
                                  <RiPlayLine />
                                </div>
                                <span>{item.text}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 italic">لا توجد خطة مسجلة لليوم</p>
                        )}
                      </div>
                      
                      {/* Blockers */}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-500 mb-3">العوائق</h4>
                        {member.blockers.length > 0 ? (
                          <ul className="space-y-2">
                            {member.blockers.map((item) => (
                              <li key={item.id} className="flex items-start gap-2">
                                <div className="mt-0.5 text-red-500">
                                  <RiInformationLine />
                                </div>
                                <span>{item.text}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 italic">لا توجد عوائق مسجلة</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}