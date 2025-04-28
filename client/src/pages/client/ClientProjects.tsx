import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ClientProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for projects
  const allProjects = [
    {
      id: '1',
      title: 'تطوير موقع الشركة',
      description: 'تطوير موقع إلكتروني متجاوب للشركة مع لوحة تحكم متكاملة',
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
      title: 'تطوير تطبيق الهاتف',
      description: 'تطوير تطبيق للهواتف الذكية يتيح للعملاء متابعة طلباتهم وتقديم طلبات جديدة',
      status: 'active' as const,
      progress: 45,
      dueDate: '30/11/2023',
      team: [
        { name: 'أحمد إبراهيم', avatarColor: '5A47FF' },
        { name: 'ليلى أحمد', avatarColor: '00BFA6' },
        { name: 'خالد محمد', avatarColor: 'F59E0B' },
      ],
    },
    {
      id: '3',
      title: 'حملة تسويقية للمنتج الجديد',
      description: 'تصميم وتنفيذ حملة تسويقية شاملة للترويج للمنتج الجديد عبر وسائل التواصل الاجتماعي',
      status: 'completed' as const,
      progress: 100,
      dueDate: '01/08/2023',
      team: [
        { name: 'فاطمة علي', avatarColor: '5A47FF' },
        { name: 'عمر خالد', avatarColor: '00BFA6' },
      ],
    },
    {
      id: '4',
      title: 'تصميم الهوية البصرية',
      description: 'تصميم هوية بصرية كاملة للشركة تشمل الشعار والألوان والخطوط',
      status: 'completed' as const,
      progress: 100,
      dueDate: '15/07/2023',
      team: [
        { name: 'سارة أحمد', avatarColor: '00BFA6' },
      ],
    },
    {
      id: '5',
      title: 'إعداد محتوى وسائل التواصل',
      description: 'إعداد محتوى لصفحات التواصل الاجتماعي للشركة لمدة ثلاثة أشهر',
      status: 'completed' as const,
      progress: 100,
      dueDate: '30/06/2023',
      team: [
        { name: 'ريم خالد', avatarColor: '00BFA6' },
      ],
    },
  ];
  
  // Filter projects by search term
  const filteredProjects = allProjects.filter((project) => {
    if (searchTerm && !project.title.includes(searchTerm) && !project.description.includes(searchTerm)) {
      return false;
    }
    return true;
  });
  
  // Get active and completed projects
  const activeProjects = filteredProjects.filter((project) => project.status === 'active');
  const completedProjects = filteredProjects.filter((project) => project.status === 'completed');
  
  return (
    <DashboardLayout title="المشاريع">
      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">المشاريع</h2>
            <p className="text-gray-600">متابعة مشاريعك وسير العمل فيها</p>
          </div>
          
          <Button className="btn-animate bg-primary hover:bg-opacity-90 text-white">
            <i className="fas fa-plus ml-2"></i>
            <span>طلب مشروع جديد</span>
          </Button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <Input
          placeholder="البحث عن مشروع..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>
      
      {/* Projects Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="bg-white shadow-sm">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            جميع المشاريع ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            المشاريع النشطة ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            المشاريع المكتملة ({completedProjects.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
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
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjects.length > 0 ? (
              activeProjects.map((project) => (
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
                <p className="text-gray-500">لا توجد مشاريع نشطة تطابق معايير البحث</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedProjects.length > 0 ? (
              completedProjects.map((project) => (
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
                <p className="text-gray-500">لا توجد مشاريع مكتملة تطابق معايير البحث</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Project Request Form */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-bold mb-4">هل لديك مشروع جديد تريد تنفيذه؟</h2>
        <p className="text-gray-600 mb-4">يمكنك التواصل مباشرة مع فريقنا لمناقشة تفاصيل مشروعك الجديد وتقديم طلب رسمي.</p>
        <div className="flex gap-3">
          <Button className="btn-animate bg-primary hover:bg-opacity-90 text-white">
            <i className="fas fa-envelope ml-2"></i>
            <span>تواصل مع مدير المشاريع</span>
          </Button>
          <Button variant="outline">
            <i className="fas fa-download ml-2"></i>
            <span>تحميل نموذج طلب مشروع</span>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
