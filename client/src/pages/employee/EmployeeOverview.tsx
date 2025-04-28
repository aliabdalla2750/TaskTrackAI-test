import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EmployeeOverview() {
  // Tasks data
  const tasks = [
    {
      id: '1',
      title: 'تصميم الصفحة الرئيسية',
      project: 'تطوير موقع شركة السلام',
      dueDate: '10/10/2023',
      status: 'قيد التنفيذ',
      priority: 'عالية',
    },
    {
      id: '2',
      title: 'برمجة واجهة المستخدم',
      project: 'تطوير تطبيق الهاتف',
      dueDate: '15/10/2023',
      status: 'قيد المراجعة',
      priority: 'متوسطة',
    },
    {
      id: '3',
      title: 'تصميم الشعار الجديد',
      project: 'إعادة تصميم الهوية البصرية',
      dueDate: '05/10/2023',
      status: 'مكتملة',
      priority: 'منخفضة',
    },
  ];

  // Performance metrics
  const performanceMetrics = {
    completedTasks: 24,
    totalTasks: 30,
    onTimeTasks: 22,
    lateCompletions: 2,
    avgRating: 4.8,
    attendance: 97,
  };

  // Recent activity
  const activities = [
    {
      id: '1',
      action: 'تم الانتهاء من مهمة',
      task: 'تصميم الشعار الجديد',
      time: 'منذ ساعتين',
    },
    {
      id: '2',
      action: 'تم إرسال ملف للمراجعة',
      task: 'واجهة المستخدم الجديدة',
      time: 'منذ 4 ساعات',
    },
    {
      id: '3',
      action: 'تعليق جديد',
      task: 'تصميم الصفحة الرئيسية',
      message: 'يجب تعديل ألوان الخلفية حسب الهوية البصرية',
      time: 'منذ 5 ساعات',
    },
  ];

  return (
    <DashboardLayout title="نظرة عامة">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">{performanceMetrics.completedTasks}</div>
              <p className="text-sm text-gray-500">المهام المكتملة</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">{performanceMetrics.onTimeTasks}</div>
              <p className="text-sm text-gray-500">مهام سُلّمت في الموعد</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-1">{performanceMetrics.avgRating}</div>
              <p className="text-sm text-gray-500">متوسط التقييم</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-1">{performanceMetrics.attendance}%</div>
              <p className="text-sm text-gray-500">نسبة الالتزام</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tasks Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>المهام المسندة إليك</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المهمة</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المشروع</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ التسليم</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الأولوية</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">{task.title}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{task.project}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{task.dueDate}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant={
                            task.priority === 'عالية' ? 'destructive' :
                            task.priority === 'متوسطة' ? 'default' : 'outline'
                          }>
                            {task.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant={
                            task.status === 'مكتملة' ? 'default' :
                            task.status === 'قيد المراجعة' ? 'secondary' : 'outline'
                          }>
                            {task.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>الإنجاز الشهري</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">المهام المكتملة</span>
                    <span className="text-sm font-medium">{performanceMetrics.completedTasks}/{performanceMetrics.totalTasks}</span>
                  </div>
                  <Progress value={(performanceMetrics.completedTasks / performanceMetrics.totalTasks) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">الالتزام بالمواعيد</span>
                    <span className="text-sm font-medium">{performanceMetrics.onTimeTasks}/{performanceMetrics.completedTasks}</span>
                  </div>
                  <Progress value={(performanceMetrics.onTimeTasks / performanceMetrics.completedTasks) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">الجودة</span>
                    <span className="text-sm font-medium">{performanceMetrics.avgRating}/5</span>
                  </div>
                  <Progress value={(performanceMetrics.avgRating / 5) * 100} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>آخر الأنشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{activity.action}</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-sm">{activity.task}</p>
                    {activity.message && (
                      <p className="text-xs text-gray-500 mt-1">{activity.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}