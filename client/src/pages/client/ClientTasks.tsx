import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useToast from '@/hooks/useToast';

type TaskStatus = 'pending-review' | 'approved' | 'needs-revision' | 'completed';

interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  status: TaskStatus;
  deliverables?: {
    name: string;
    type: string;
    date: string;
  }[];
}

export default function ClientTasks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const toast = useToast();
  
  // Mock data for tasks
  const tasks: Task[] = [
    {
      id: '1',
      title: 'تصميم الصفحة الرئيسية',
      description: 'تصميم واجهة المستخدم للصفحة الرئيسية للموقع الإلكتروني',
      project: 'تطوير موقع الشركة',
      assignee: {
        name: 'سارة أحمد',
        avatar: 'https://ui-avatars.com/api/?name=سارة+أحمد&background=00BFA6&color=fff',
      },
      dueDate: '10/10/2023',
      status: 'pending-review',
      deliverables: [
        {
          name: 'تصميم الصفحة الرئيسية.psd',
          type: 'ملف تصميم',
          date: '08/10/2023',
        },
        {
          name: 'الصور المستخدمة.zip',
          type: 'ملف مضغوط',
          date: '08/10/2023',
        },
      ],
    },
    {
      id: '2',
      title: 'برمجة صفحة الخدمات',
      description: 'برمجة صفحة الخدمات وتكاملها مع قاعدة البيانات',
      project: 'تطوير موقع الشركة',
      assignee: {
        name: 'علي محمد',
        avatar: 'https://ui-avatars.com/api/?name=علي+محمد&background=5A47FF&color=fff',
      },
      dueDate: '15/10/2023',
      status: 'needs-revision',
      deliverables: [
        {
          name: 'صفحة الخدمات.html',
          type: 'ملف HTML',
          date: '12/10/2023',
        },
      ],
    },
    {
      id: '3',
      title: 'تصميم شاشات التطبيق',
      description: 'تصميم واجهات المستخدم لشاشات تطبيق الهاتف المحمول',
      project: 'تطوير تطبيق الهاتف',
      assignee: {
        name: 'أحمد إبراهيم',
        avatar: 'https://ui-avatars.com/api/?name=أحمد+إبراهيم&background=5A47FF&color=fff',
      },
      dueDate: '25/11/2023',
      status: 'approved',
      deliverables: [
        {
          name: 'شاشات التطبيق.sketch',
          type: 'ملف تصميم',
          date: '20/11/2023',
        },
      ],
    },
    {
      id: '4',
      title: 'تصميم البانرات الإعلانية',
      description: 'تصميم البانرات الإعلانية للحملة التسويقية',
      project: 'حملة تسويقية للمنتج الجديد',
      assignee: {
        name: 'فاطمة علي',
        avatar: 'https://ui-avatars.com/api/?name=فاطمة+علي&background=5A47FF&color=fff',
      },
      dueDate: '28/07/2023',
      status: 'completed',
      deliverables: [
        {
          name: 'البانرات الإعلانية.ai',
          type: 'ملف تصميم',
          date: '25/07/2023',
        },
      ],
    },
  ];
  
  // Projects for filter
  const projects = [
    { id: '1', name: 'تطوير موقع الشركة' },
    { id: '2', name: 'تطوير تطبيق الهاتف' },
    { id: '3', name: 'حملة تسويقية للمنتج الجديد' },
  ];
  
  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Filter by search term
    if (searchTerm && !task.title.includes(searchTerm)) {
      return false;
    }
    
    // Filter by project
    if (projectFilter !== 'all' && task.project !== projectFilter) {
      return false;
    }
    
    return true;
  });
  
  const pendingReviewTasks = filteredTasks.filter(task => task.status === 'pending-review');
  const needsRevisionTasks = filteredTasks.filter(task => task.status === 'needs-revision');
  const approvedCompletedTasks = filteredTasks.filter(task => ['approved', 'completed'].includes(task.status));
  
  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'pending-review':
        return { label: 'بانتظار المراجعة', color: 'bg-yellow-100 text-yellow-800' };
      case 'approved':
        return { label: 'تمت الموافقة', color: 'bg-green-100 text-green-800' };
      case 'needs-revision':
        return { label: 'يحتاج تعديلات', color: 'bg-red-100 text-red-800' };
      case 'completed':
        return { label: 'مكتملة', color: 'bg-blue-100 text-blue-800' };
    }
  };
  
  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('تم بنجاح', 'تم إرسال ملاحظاتك بنجاح');
    setFeedbackOpen(false);
  };
  
  const handleApproveTask = (task: Task) => {
    toast.success('تم بنجاح', 'تمت الموافقة على المهمة');
  };
  
  return (
    <DashboardLayout title="المهام">
      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">متابعة المهام</h2>
            <p className="text-gray-600">مراجعة وإدارة المهام المرتبطة بمشاريعك</p>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <Input
            placeholder="البحث عن مهمة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="المشروع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المشاريع</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.name}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Tasks Tabs */}
      <Tabs defaultValue="pending-review" className="mb-6">
        <TabsList className="bg-white shadow-sm">
          <TabsTrigger value="pending-review" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            بانتظار المراجعة ({pendingReviewTasks.length})
          </TabsTrigger>
          <TabsTrigger value="needs-revision" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            يحتاج تعديلات ({needsRevisionTasks.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            تمت الموافقة ({approvedCompletedTasks.length})
          </TabsTrigger>
        </TabsList>
        
        {['pending-review', 'needs-revision', 'approved'].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-6">
            <div className="grid grid-cols-1 gap-4">
              {filteredTasks
                .filter(task => {
                  if (tabValue === 'pending-review') return task.status === 'pending-review';
                  if (tabValue === 'needs-revision') return task.status === 'needs-revision';
                  if (tabValue === 'approved') return ['approved', 'completed'].includes(task.status);
                  return true;
                })
                .map((task) => (
                  <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{task.title}</h3>
                            <p className="text-sm text-gray-600">{task.project}</p>
                          </div>
                          <span className={`${getStatusLabel(task.status).color} text-xs px-2 py-1 rounded-full`}>
                            {getStatusLabel(task.status).label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <i className="fas fa-user-circle text-primary"></i>
                            <div>
                              <p className="text-xs text-gray-500">المكلف</p>
                              <p className="text-sm font-medium">{task.assignee.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <i className="fas fa-calendar text-primary"></i>
                            <div>
                              <p className="text-xs text-gray-500">تاريخ التسليم</p>
                              <p className="text-sm font-medium">{task.dueDate}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <i className="fas fa-file-alt text-primary"></i>
                            <div>
                              <p className="text-xs text-gray-500">عدد الملفات</p>
                              <p className="text-sm font-medium">{task.deliverables?.length || 0}</p>
                            </div>
                          </div>
                        </div>
                        
                        {task.deliverables && task.deliverables.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">الملفات المسلمة:</h4>
                            <div className="bg-gray-50 rounded-md p-2">
                              {task.deliverables.map((deliverable, index) => (
                                <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <i className="fas fa-file text-primary"></i>
                                    <div>
                                      <p className="text-sm font-medium">{deliverable.name}</p>
                                      <p className="text-xs text-gray-500">{deliverable.type} • {deliverable.date}</p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <i className="fas fa-download"></i>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end gap-2">
                          {task.status === 'pending-review' && (
                            <>
                              <Dialog open={feedbackOpen && selectedTask?.id === task.id} onOpenChange={(open) => {
                                setFeedbackOpen(open);
                                if (open) setSelectedTask(task);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline">
                                    <i className="fas fa-comment-alt ml-2"></i>
                                    <span>إرسال ملاحظات</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>إرسال ملاحظات على المهمة</DialogTitle>
                                  </DialogHeader>
                                  
                                  <form onSubmit={handleSendFeedback} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="feedback">الملاحظات</Label>
                                      <Textarea 
                                        id="feedback" 
                                        placeholder="اكتب ملاحظاتك هنا..." 
                                        rows={5}
                                        required
                                      />
                                    </div>
                                    
                                    <div className="flex justify-end gap-2">
                                      <Button type="submit" className="btn-animate bg-primary hover:bg-opacity-90 text-white">
                                        إرسال الملاحظات
                                      </Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              
                              <Button className="btn-animate bg-secondary hover:bg-opacity-90 text-white" onClick={() => handleApproveTask(task)}>
                                <i className="fas fa-check ml-2"></i>
                                <span>موافقة</span>
                              </Button>
                            </>
                          )}
                          
                          {task.status === 'needs-revision' && (
                            <Button variant="outline">
                              <i className="fas fa-eye ml-2"></i>
                              <span>عرض الملاحظات</span>
                            </Button>
                          )}
                          
                          {['approved', 'completed'].includes(task.status) && (
                            <Button variant="outline">
                              <i className="fas fa-eye ml-2"></i>
                              <span>عرض التفاصيل</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              
              {filteredTasks.filter(task => {
                if (tabValue === 'pending-review') return task.status === 'pending-review';
                if (tabValue === 'needs-revision') return task.status === 'needs-revision';
                if (tabValue === 'approved') return ['approved', 'completed'].includes(task.status);
                return true;
              }).length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <i className="fas fa-tasks text-4xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">لا توجد مهام في هذه القائمة</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </DashboardLayout>
  );
}
