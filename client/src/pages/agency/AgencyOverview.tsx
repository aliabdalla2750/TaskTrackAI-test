import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { TaskTable } from '@/components/dashboard/TaskTable';
import { AiChatBox } from '@/components/dashboard/AiChatBox';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';
import { Link } from 'wouter';

export default function AgencyOverview() {
  // Mock data for the dashboard
  const recentProjects = [
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
  ];
  
  const recentTasks = [
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
  ];
  
  return (
    <DashboardLayout title="نظرة عامة">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">مرحباً بك في تاسكايا</h2>
            <p className="text-gray-600">منصة إدارة المشاريع الذكية المعتمدة على الذكاء الاصطناعي</p>
          </div>
          <CreateProjectModal />
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="المشاريع النشطة"
          value="7"
          icon="fa-folder-open"
          iconBg="bg-blue-100"
          iconColor="text-primary"
          progressValue={7}
          progressMax={10}
          progressLabel="7 من أصل 10 مشاريع"
        />
        
        <StatsCard
          title="المهام المكتملة"
          value="24"
          icon="fa-check-circle"
          iconBg="bg-green-100"
          iconColor="text-secondary"
          progressValue={24}
          progressMax={40}
          progressColor="bg-secondary"
          progressLabel="24 من أصل 40 مهمة"
        />
        
        <StatsCard
          title="المهام المتأخرة"
          value="3"
          icon="fa-exclamation-circle"
          iconBg="bg-red-100"
          iconColor="text-red-500"
          progressValue={3}
          progressMax={40}
          progressColor="bg-red-500"
          progressLabel="3 من أصل 40 مهمة"
        />
        
        <StatsCard
          title="استخدام الذكاء الاصطناعي"
          value="68%"
          icon="fa-robot"
          iconBg="bg-purple-100"
          iconColor="text-primary"
          progressValue={68}
          progressMax={100}
          progressLabel="استهلاك الحصة الشهرية"
        />
      </div>
      
      {/* Recent Projects Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">المشاريع الأخيرة</h2>
          <Link href="/dashboard/agency/projects">
            <a className="text-primary text-sm flex items-center gap-1 hover:underline">
              <span>عرض الكل</span>
              <i className="fas fa-arrow-left text-xs"></i>
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentProjects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              status={project.status}
              progress={project.progress}
              dueDate={project.dueDate}
              team={project.team}
            />
          ))}
        </div>
      </div>
      
      {/* Recent Tasks Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">المهام الأخيرة</h2>
          <Link href="/dashboard/agency/tasks">
            <a className="text-primary text-sm flex items-center gap-1 hover:underline">
              <span>عرض الكل</span>
              <i className="fas fa-arrow-left text-xs"></i>
            </a>
          </Link>
        </div>
        
        <TaskTable tasks={recentTasks} />
      </div>
      
      {/* AI Assistant Preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">المساعد الذكي</h2>
          <Link href="/dashboard/agency/ai-assistant">
            <a className="text-primary text-sm flex items-center gap-1 hover:underline">
              <span>فتح المساعد</span>
              <i className="fas fa-arrow-left text-xs"></i>
            </a>
          </Link>
        </div>
        
        <AiChatBox
          title=""
          welcomeMessage="مرحباً بك! أنا المساعد الذكي الخاص بك في تاسكايا. كيف يمكنني مساعدتك اليوم؟"
        />
      </div>
    </DashboardLayout>
  );
}
