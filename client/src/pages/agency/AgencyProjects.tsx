import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AgencyProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [, navigate] = useLocation();
  
  // Mock data for projects
  const allProjects = [
    {
      id: '1',
      title: 'تطوير موقع شركة السلام',
      description: 'تطوير موقع إلكتروني متجاوب لشركة السلام للاستشارات الهندسية',
      status: 'active' as const,
      progress: 75,
      dueDate: '15/10/2023',
      team: [
        { name: 'علي محمد', avatarColor: '5A47FF' },
        { name: 'سارة أحمد', avatarColor: '00BFA6' },
        { name: 'محمد خالد', avatarColor: 'F59E0B' },
      ],
    },
    {
      id: '2',
      title: 'حملة تسويقية لمنتج جديد',
      description: 'تصميم وتنفيذ حملة تسويقية شاملة للترويج لمنتج شركة النور الجديد',
      status: 'completed' as const,
      progress: 100,
      dueDate: '05/09/2023',
      team: [
        { name: 'فاطمة علي', avatarColor: '5A47FF' },
        { name: 'عمر خالد', avatarColor: '00BFA6' },
      ],
    },
    {
      id: '3',
      title: 'تطوير تطبيق الهاتف',
      description: 'تطوير تطبيق للهواتف الذكية لشركة العالمية للخدمات الإلكترونية',
      status: 'paused' as const,
      progress: 45,
      dueDate: '30/11/2023',
      team: [
        { name: 'أحمد إبراهيم', avatarColor: '5A47FF' },
        { name: 'ليلى أحمد', avatarColor: '00BFA6' },
        { name: 'خالد محمد', avatarColor: 'F59E0B' },
      ],
    },
    {
      id: '4',
      title: 'تجديد هوية الشركة',
      description: 'إعادة تصميم الهوية البصرية الكاملة للشركة بما يشمل الشعار والألوان والخطوط',
      status: 'active' as const,
      progress: 30,
      dueDate: '20/12/2023',
      team: [
        { name: 'نورا محمد', avatarColor: '5A47FF' },
        { name: 'سامي علي', avatarColor: 'F59E0B' },
      ],
    },
    {
      id: '5',
      title: 'إعداد المحتوى التسويقي',
      description: 'كتابة وتصميم محتوى تسويقي لوسائل التواصل الاجتماعي والموقع الإلكتروني',
      status: 'completed' as const,
      progress: 100,
      dueDate: '10/08/2023',
      team: [
        { name: 'ريم خالد', avatarColor: '00BFA6' },
      ],
    },
  ];
  
  // Filter and sort projects
  const filteredProjects = allProjects
    .filter((project) => {
      // Filter by search term
      if (searchTerm && !project.title.includes(searchTerm) && !project.description.includes(searchTerm)) {
        return false;
      }
      
      // Filter by status
      if (statusFilter === 'active' && project.status !== 'active') {
        return false;
      }
      if (statusFilter === 'completed' && project.status !== 'completed') {
        return false;
      }
      if (statusFilter === 'paused' && project.status !== 'paused') {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected option
      if (sortBy === 'latest') {
        // In a real app, this would sort by creation date
        return parseInt(b.id) - parseInt(a.id);
      }
      if (sortBy === 'progress') {
        return b.progress - a.progress;
      }
      if (sortBy === 'dueDate') {
        // In a real app, this would compare actual dates
        return a.dueDate.localeCompare(b.dueDate);
      }
      return 0;
    });
  
  return (
    <DashboardLayout title="المشاريع">
      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">إدارة المشاريع</h2>
            <p className="text-gray-600">تتبع وإدارة مشاريعك بكفاءة عالية</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/dashboard/agency/create-project-smart')}
              className="btn-animate bg-primary hover:bg-opacity-90 text-white"
            >
              <i className="fas fa-magic ml-2"></i>
              <span>مشروع ذكي</span>
            </Button>
            <CreateProjectModal />
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="البحث عن مشروع..."
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
                <SelectItem value="active">جاري</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="paused">متوقف</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">الأحدث</SelectItem>
                <SelectItem value="progress">نسبة الإنجاز</SelectItem>
                <SelectItem value="dueDate">تاريخ التسليم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              status={project.status}
              progress={project.progress}
              dueDate={project.dueDate}
              team={project.team}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <i className="fas fa-folder-open text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-500">لا توجد مشاريع تطابق معايير البحث</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
