import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EmployeeTasks() {
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Tasks data
  const tasks = [
    {
      id: '1',
      title: 'تصميم الصفحة الرئيسية',
      project: 'تطوير موقع شركة السلام',
      dueDate: '10/10/2023',
      status: 'قيد التنفيذ',
      priority: 'عالية',
      description: 'تصميم الصفحة الرئيسية للموقع وفقًا للهوية البصرية الجديدة للشركة، مع التركيز على تجربة المستخدم.',
    },
    {
      id: '2',
      title: 'برمجة واجهة المستخدم',
      project: 'تطوير تطبيق الهاتف',
      dueDate: '15/10/2023',
      status: 'قيد المراجعة',
      priority: 'متوسطة',
      description: 'تحويل تصاميم التطبيق إلى واجهة مستخدم تفاعلية باستخدام React Native.',
    },
    {
      id: '3',
      title: 'تصميم الشعار الجديد',
      project: 'إعادة تصميم الهوية البصرية',
      dueDate: '05/10/2023',
      status: 'مكتملة',
      priority: 'منخفضة',
      description: 'تصميم شعار جديد للشركة يعكس قيمها ويتوافق مع اتجاهات التصميم الحديثة.',
    },
    {
      id: '4',
      title: 'تصميم البانرات الإعلانية',
      project: 'الحملة التسويقية',
      dueDate: '20/10/2023',
      status: 'قيد التنفيذ',
      priority: 'عالية',
      description: 'تصميم مجموعة من البانرات الإعلانية للحملة التسويقية الجديدة لمنتج الشركة.',
    },
    {
      id: '5',
      title: 'تطوير نظام الدفع',
      project: 'تطوير موقع شركة السلام',
      dueDate: '25/10/2023',
      status: 'قيد التنفيذ',
      priority: 'عالية',
      description: 'دمج بوابة الدفع مع موقع الشركة وضمان أمان المعاملات.',
    },
  ];

  // Open submission dialog
  const handleOpenSubmitDialog = (task: any) => {
    setSelectedTask(task);
    setIsSubmitDialogOpen(true);
  };

  return (
    <DashboardLayout title="المهام">
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">جميع المهام</TabsTrigger>
          <TabsTrigger value="in-progress">قيد التنفيذ</TabsTrigger>
          <TabsTrigger value="in-review">قيد المراجعة</TabsTrigger>
          <TabsTrigger value="completed">مكتملة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onSubmit={() => handleOpenSubmitDialog(task)} 
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 gap-4">
            {tasks
              .filter((task) => task.status === 'قيد التنفيذ')
              .map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onSubmit={() => handleOpenSubmitDialog(task)} 
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="in-review">
          <div className="grid grid-cols-1 gap-4">
            {tasks
              .filter((task) => task.status === 'قيد المراجعة')
              .map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onSubmit={() => handleOpenSubmitDialog(task)} 
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="grid grid-cols-1 gap-4">
            {tasks
              .filter((task) => task.status === 'مكتملة')
              .map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onSubmit={() => handleOpenSubmitDialog(task)} 
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Task Submission Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تسليم المهمة</DialogTitle>
            <DialogDescription>
              قم بإرفاق الملفات الخاصة بالمهمة وإضافة ملاحظات إذا لزم الأمر.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">المهمة</Label>
              <Input 
                id="taskName" 
                value={selectedTask?.title} 
                disabled 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fileUpload">الملفات</Label>
              <Input 
                id="fileUpload" 
                type="file" 
                multiple 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea 
                id="notes" 
                placeholder="أضف ملاحظات أو تعليقات حول التسليم..." 
                rows={4} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsSubmitDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                // Here would be the logic to submit the task
                setIsSubmitDialogOpen(false);
              }}
            >
              تسليم المهمة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// Task Card Component
function TaskCard({ task, onSubmit }: { task: any; onSubmit: () => void }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.project}</p>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Badge variant={
                  task.priority === 'عالية' ? 'destructive' :
                  task.priority === 'متوسطة' ? 'default' : 'outline'
                }>
                  {task.priority}
                </Badge>
                <Badge variant={
                  task.status === 'مكتملة' ? 'default' :
                  task.status === 'قيد المراجعة' ? 'secondary' : 'outline'
                }>
                  {task.status}
                </Badge>
              </div>
            </div>
            
            <p className="text-sm mb-4">{task.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-500">تاريخ التسليم: </span>
                <span className="font-medium">{task.dueDate}</span>
              </div>
              
              {task.status !== 'مكتملة' && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={onSubmit}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <i className="fas fa-upload ml-2"></i>
                  تسليم المهمة
                </Button>
              )}
              
              {task.status === 'مكتملة' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                >
                  <i className="fas fa-eye ml-2"></i>
                  عرض التسليم
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}