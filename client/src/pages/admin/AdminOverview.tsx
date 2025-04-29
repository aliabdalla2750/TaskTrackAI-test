import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Legend, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';

export default function AdminOverview() {
  // Mock data for charts
  const aiUsageData = [
    { name: 'Jan', tokens: 120000, cost: 5.2 },
    { name: 'Feb', tokens: 150000, cost: 6.5 },
    { name: 'Mar', tokens: 180000, cost: 7.8 },
    { name: 'Apr', tokens: 210000, cost: 9.1 },
    { name: 'May', tokens: 250000, cost: 10.8 },
    { name: 'Jun', tokens: 300000, cost: 13.0 },
    { name: 'Jul', tokens: 280000, cost: 12.1 },
    { name: 'Aug', tokens: 320000, cost: 13.8 },
    { name: 'Sep', tokens: 350000, cost: 15.1 },
    { name: 'Oct', tokens: 400000, cost: 17.3 },
  ];
  
  const agencyProjectsData = [
    { name: 'وكالة الإبداع', active: 8, completed: 12 },
    { name: 'وكالة الرقمية', active: 5, completed: 15 },
    { name: 'وكالة المستقبل', active: 10, completed: 5 },
    { name: 'وكالة الحلول', active: 7, completed: 9 },
    { name: 'وكالة الأفكار', active: 4, completed: 6 },
  ];
  
  const projectTypesData = [
    { name: 'تطوير مواقع', value: 35, color: '#5A47FF' },
    { name: 'تطوير تطبيقات', value: 25, color: '#00BFA6' },
    { name: 'تسويق رقمي', value: 20, color: '#F59E0B' },
    { name: 'تصميم', value: 15, color: '#EF4444' },
    { name: 'أخرى', value: 5, color: '#8B5CF6' },
  ];
  
  const aiModelUsageData = [
    { name: 'GPT-4o', value: 45, color: '#5A47FF' },
    { name: 'Claude', value: 30, color: '#00BFA6' },
    { name: 'DeepSeek', value: 25, color: '#F59E0B' },
  ];
  
  // Recent activity log
  const activityLogs = [
    {
      id: '1',
      action: 'إضافة سيناريو AI جديد',
      user: 'أحمد المدير',
      time: 'منذ 10 دقائق',
    },
    {
      id: '2',
      action: 'تعديل إعدادات نموذج GPT-4o',
      user: 'أحمد المدير',
      time: 'منذ 30 دقيقة',
    },
    {
      id: '3',
      action: 'إضافة وكالة جديدة',
      user: 'محمد المشرف',
      time: 'منذ ساعة',
    },
    {
      id: '4',
      action: 'تحديث حالة اشتراك الوكالة الرقمية',
      user: 'محمد المشرف',
      time: 'منذ 3 ساعات',
    },
    {
      id: '5',
      action: 'إرسال فاتورة لوكالة الإبداع',
      user: 'سارة المحاسبة',
      time: 'منذ 5 ساعات',
    },
  ];
  
  return (
    <DashboardLayout title="نظرة عامة">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-xl font-bold mb-1">مرحباً بك في لوحة تحكم المدير</h2>
            <p className="text-gray-600">إدارة النظام وتتبع الأداء العام للمنصة</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Link href="/dashboard/admin/users">
              <a className="btn-animate bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-md flex items-center gap-2">
                <i className="fas fa-users"></i>
                <span>إدارة المستخدمين</span>
              </a>
            </Link>
            <Link href="/dashboard/admin/ai-providers">
              <a className="btn-animate bg-accent hover:bg-opacity-90 text-white px-4 py-2 rounded-md flex items-center gap-2">
                <i className="fas fa-plug"></i>
                <span>مزودي الذكاء الاصطناعي</span>
              </a>
            </Link>
            <Link href="/dashboard/admin/ai-scenarios">
              <a className="btn-animate bg-secondary hover:bg-opacity-90 text-white px-4 py-2 rounded-md flex items-center gap-2">
                <i className="fas fa-robot"></i>
                <span>سيناريوهات AI</span>
              </a>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="الوكالات النشطة"
          value="12"
          icon="fa-building"
          iconBg="bg-blue-100"
          iconColor="text-primary"
        />
        
        <StatsCard
          title="المشاريع النشطة"
          value="34"
          icon="fa-folder-open"
          iconBg="bg-green-100"
          iconColor="text-secondary"
        />
        
        <StatsCard
          title="عدد المستخدمين"
          value="87"
          icon="fa-users"
          iconBg="bg-purple-100"
          iconColor="text-primary"
        />
        
        <StatsCard
          title="استخدام AI (هذا الشهر)"
          value="2.3M"
          icon="fa-robot"
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          progressValue={68}
          progressMax={100}
          progressLabel="68% من الحصة الشهرية"
        />
      </div>
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* AI Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>استخدام الذكاء الاصطناعي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={aiUsageData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#5A47FF" />
                  <YAxis yAxisId="right" orientation="right" stroke="#00BFA6" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="#5A47FF" 
                    fill="#5A47FF" 
                    fillOpacity={0.3} 
                    name="عدد التوكنز"
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#00BFA6" 
                    fill="#00BFA6" 
                    fillOpacity={0.3} 
                    name="التكلفة ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Agency Projects Chart */}
        <Card>
          <CardHeader>
            <CardTitle>مشاريع الوكالات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={agencyProjectsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" stackId="a" fill="#5A47FF" name="المشاريع النشطة" />
                  <Bar dataKey="completed" stackId="a" fill="#00BFA6" name="المشاريع المكتملة" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Project Types Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>أنواع المشاريع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {projectTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* AI Models Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>استخدام نماذج الذكاء الاصطناعي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={aiModelUsageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {aiModelUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>سجل النشاط الأخير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراء
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    بواسطة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الوقت
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activityLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.action}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{log.user}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{log.time}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
