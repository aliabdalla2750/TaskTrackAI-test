import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TaskTable } from '@/components/dashboard/TaskTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useToast from '@/hooks/useToast';

export default function AgencyTasks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const toast = useToast();
  
  // Mock data for tasks
  const allTasks = [
    {
      id: '1',
      title: 'تصميم الصفحة الرئيسية',
      project: 'تطوير موقع شركة السلام',
      assignee: {
        name: 'سارة أحمد',
        avatar: 'https://ui-avatars.com/api/?name=سارة+أحمد&background=00BFA6&color=fff',
      },
      dueDate: '10/10/2023',
      status: 'completed' as const,
    },
    {
      id: '2',
      title: 'برمجة وظائف التسجيل',
      project: 'تطوير موقع شركة السلام',
      assignee: {
        name: 'علي محمد',
        avatar: 'https://ui-avatars.com/api/?name=علي+محمد&background=5A47FF&color=fff',
      },
      dueDate: '12/10/2023',
      status: 'in-progress' as const,
    },
    {
      id: '3',
      title: 'تصميم بانرات الحملة',
      project: 'حملة تسويقية لمنتج جديد',
      assignee: {
        name: 'فاطمة علي',
        avatar: 'https://ui-avatars.com/api/?name=فاطمة+علي&background=5A47FF&color=fff',
      },
      dueDate: '03/09/2023',
      status: 'completed' as const,
    },
    {
      id: '4',
      title: 'تطوير واجهة المستخدم',
      project: 'تطوير تطبيق الهاتف',
      assignee: {
        name: 'أحمد إبراهيم',
        avatar: 'https://ui-avatars.com/api/?name=أحمد+إبراهيم&background=5A47FF&color=fff',
      },
      dueDate: '15/09/2023',
      status: 'overdue' as const,
    },
    {
      id: '5',
      title: 'كتابة محتوى صفحة المنتجات',
      project: 'تطوير موقع شركة السلام',
      assignee: {
        name: 'ريم خالد',
        avatar: 'https://ui-avatars.com/api/?name=ريم+خالد&background=00BFA6&color=fff',
      },
      dueDate: '20/10/2023',
      status: 'in-progress' as const,
    },
    {
      id: '6',
      title: 'تطوير خاصية البحث',
      project: 'تطوير تطبيق الهاتف',
      assignee: {
        name: 'خالد محمد',
        avatar: 'https://ui-avatars.com/api/?name=خالد+محمد&background=F59E0B&color=fff',
      },
      dueDate: '25/09/2023',
      status: 'completed' as const,
    },
  ];
  
  // Projects for filter
  const projects = [
    { id: '1', name: 'تطوير موقع شركة السلام' },
    { id: '2', name: 'حملة تسويقية لمنتج جديد' },
    { id: '3', name: 'تطوير تطبيق الهاتف' },
  ];
  
  // Team members for filter and assignment
  const teamMembers = [
    { id: '1', name: 'سارة أحمد' },
    { id: '2', name: 'علي محمد' },
    { id: '3', name: 'فاطمة علي' },
    { id: '4', name: 'أحمد إبراهيم' },
    { id: '5', name: 'ريم خالد' },
    { id: '6', name: 'خالد محمد' },
  ];
  
  // Filter tasks
  const filteredTasks = allTasks.filter((task) => {
    // Filter by search term
    if (searchTerm && !task.title.includes(searchTerm)) {
      return false;
    }
    
    // Filter by status
    if (statusFilter === 'completed' && task.status !== 'completed') {
      return false;
    }
    if (statusFilter === 'in-progress' && task.status !== 'in-progress') {
      return false;
    }
    if (statusFilter === 'overdue' && task.status !== 'overdue') {
      return false;
    }
    
    // Filter by project
    if (projectFilter !== 'all' && task.project !== projectFilter) {
      return false;
    }
    
    // Filter by assignee
    if (assigneeFilter !== 'all' && task.assignee.name !== assigneeFilter) {
      return false;
    }
    
    return true;
  });
  
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would create a task via API
    toast.success('تم بنجاح', 'تم إنشاء المهمة بنجاح');
    setOpen(false);
  };
  
  return (
    <DashboardLayout title="المهام">
      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">إدارة المهام</h2>
            <p className="text-gray-600">تتبع وإدارة مهام المشاريع وتوزيعها على أعضاء الفريق</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-animate bg-secondary hover:bg-opacity-90 text-white">
                <i className="fas fa-plus ml-2"></i>
                <span>إنشاء مهمة جديدة</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleCreateTask} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="taskTitle">عنوان المهمة</Label>
                  <Input id="taskTitle" placeholder="أدخل عنوان المهمة" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectSelect">المشروع</Label>
                  <Select>
                    <SelectTrigger id="projectSelect">
                      <SelectValue placeholder="اختر المشروع" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.name}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assigneeSelect">تعيين إلى</Label>
                  <Select>
                    <SelectTrigger id="assigneeSelect">
                      <SelectValue placeholder="اختر عضو فريق" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">تاريخ التسليم</Label>
                  <Input id="dueDate" type="date" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">وصف المهمة</Label>
                  <Textarea id="description" placeholder="أدخل وصف تفصيلي للمهمة..." />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" className="btn-animate bg-primary hover:bg-opacity-90 text-white">
                    إنشاء المهمة
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="البحث عن مهمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="completed">مكتملة</SelectItem>
                <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                <SelectItem value="overdue">متأخرة</SelectItem>
              </SelectContent>
            </Select>
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
          
          <div>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="المكلف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأعضاء</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Tasks Table */}
      {filteredTasks.length > 0 ? (
        <TaskTable tasks={filteredTasks} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <i className="fas fa-tasks text-4xl text-gray-300 mb-2"></i>
          <p className="text-gray-500">لا توجد مهام تطابق معايير البحث</p>
        </div>
      )}
    </DashboardLayout>
  );
}
