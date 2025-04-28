import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

export default function ClientOverview() {
  // Mock data for projects
  const activeProjects = [
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
  ];
  
  // Recent notifications
  const notifications = [
    {
      id: '1',
      title: 'تم تسليم مهمة جديدة',
      message: 'تم تسليم مهمة "تصميم الصفحة الرئيسية" وبانتظار المراجعة',
      time: 'منذ ساعتين',
      isRead: false,
    },
    {
      id: '2',
      title: 'تم تحديث حالة المشروع',
      message: 'تم تحديث حالة مشروع "تطوير موقع الشركة" إلى 75% مكتمل',
      time: 'منذ 5 ساعات',
      isRead: true,
    },
    {
      id: '3',
      title: 'رسالة جديدة من مدير المشروع',
      message: 'لديك رسالة جديدة من مدير المشروع بخصوص التعديلات المطلوبة',
      time: 'منذ يوم',
      isRead: true,
    },
    {
      id: '4',
      title: 'اقتراب موعد تسليم المشروع',
      message: 'يتبقى 15 يوم على موعد تسليم مشروع "تطوير موقع الشركة"',
      time: 'منذ يومين',
      isRead: true,
    },
  ];
  
  // Invoice data
  const invoices = [
    {
      id: '1',
      project: 'تطوير موقع الشركة',
      amount: '15,000 ر.س',
      status: 'مدفوعة',
      date: '01/09/2023',
    },
    {
      id: '2',
      project: 'تطوير موقع الشركة (الدفعة الثانية)',
      amount: '20,000 ر.س',
      status: 'مستحقة',
      date: '15/10/2023',
    },
    {
      id: '3',
      project: 'تطوير تطبيق الهاتف (الدفعة الأولى)',
      amount: '25,000 ر.س',
      status: 'مدفوعة',
      date: '10/08/2023',
    },
  ];
  
  return (
    <DashboardLayout title="نظرة عامة">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">مرحباً بك في لوحة تحكم العميل</h2>
            <p className="text-gray-600">متابعة حالة مشاريعك وسير العمل فيها</p>
          </div>
          <Link href="/dashboard/client/projects">
            <a className="btn-animate bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-md flex items-center gap-2">
              <i className="fas fa-folder-open"></i>
              <span>عرض المشاريع</span>
            </a>
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="المشاريع النشطة"
          value="2"
          icon="fa-folder-open"
          iconBg="bg-blue-100"
          iconColor="text-primary"
        />
        
        <StatsCard
          title="المشاريع المكتملة"
          value="3"
          icon="fa-check-circle"
          iconBg="bg-green-100"
          iconColor="text-secondary"
        />
        
        <StatsCard
          title="الملفات المسلمة"
          value="15"
          icon="fa-file-alt"
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        
        <StatsCard
          title="الفواتير المستحقة"
          value="1"
          icon="fa-file-invoice-dollar"
          iconBg="bg-red-100"
          iconColor="text-red-500"
        />
      </div>
      
      {/* Projects and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">المشاريع النشطة</h2>
            <Link href="/dashboard/client/projects">
              <a className="text-primary text-sm flex items-center gap-1 hover:underline">
                <span>عرض الكل</span>
                <i className="fas fa-arrow-left text-xs"></i>
              </a>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.map((project) => (
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
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">الإشعارات الجديدة</h2>
            <a href="#" className="text-primary text-sm flex items-center gap-1 hover:underline">
              <span>عرض الكل</span>
              <i className="fas fa-arrow-left text-xs"></i>
            </a>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y">
                {notifications.map((notification) => (
                  <li key={notification.id} className="p-4 hover:bg-gray-50">
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${notification.isRead ? 'bg-gray-300' : 'bg-primary'}`}></div>
                      <div>
                        <h3 className="font-medium text-sm">{notification.title}</h3>
                        <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                        <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Invoices */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">الفواتير</h2>
          <a href="#" className="text-primary text-sm flex items-center gap-1 hover:underline">
            <span>عرض الكل</span>
            <i className="fas fa-arrow-left text-xs"></i>
          </a>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الفاتورة
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المشروع
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراء
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">INV-{invoice.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{invoice.project}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{invoice.amount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{invoice.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.status === 'مدفوعة' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a href="#" className="text-primary hover:underline">
                          {invoice.status === 'مدفوعة' ? 'عرض' : 'دفع'}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Contact Project Manager */}
      <Card>
        <CardHeader>
          <CardTitle>التواصل مع مدير المشروع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <img
              src="https://ui-avatars.com/api/?name=فاطمة+علي&background=5A47FF&color=fff"
              alt="فاطمة علي"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-bold text-md">فاطمة علي</h3>
              <p className="text-sm text-gray-500">مديرة المشاريع</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <a href="#" className="flex-1 bg-primary text-white text-center py-2 rounded-md hover:bg-opacity-90 transition btn-animate">
              <i className="fas fa-comment-alt ml-2"></i>
              <span>محادثة</span>
            </a>
            <a href="#" className="flex-1 bg-gray-100 text-gray-700 text-center py-2 rounded-md hover:bg-gray-200 transition btn-animate">
              <i className="fas fa-envelope ml-2"></i>
              <span>بريد إلكتروني</span>
            </a>
            <a href="#" className="flex-1 bg-gray-100 text-gray-700 text-center py-2 rounded-md hover:bg-gray-200 transition btn-animate">
              <i className="fas fa-phone ml-2"></i>
              <span>اتصال</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
