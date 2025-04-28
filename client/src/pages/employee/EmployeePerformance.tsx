import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import recharts components
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function EmployeePerformance() {
  // Monthly performance data
  const monthlyData = [
    { month: 'يناير', completed: 20, onTime: 18, quality: 4.5 },
    { month: 'فبراير', completed: 22, onTime: 20, quality: 4.7 },
    { month: 'مارس', completed: 18, onTime: 16, quality: 4.2 },
    { month: 'أبريل', completed: 25, onTime: 23, quality: 4.8 },
    { month: 'مايو', completed: 24, onTime: 22, quality: 4.6 },
    { month: 'يونيو', completed: 28, onTime: 26, quality: 4.9 },
  ];
  
  // Current performance metrics
  const performanceMetrics = {
    completedTasks: 28,
    totalTasks: 30,
    onTimeTasks: 26,
    lateCompletions: 2,
    avgRating: 4.9,
    attendance: 97,
    efficiency: 92,
    overallScore: 94,
  };
  
  // KPI data
  const kpiData = [
    { name: 'إنجاز المهام', value: performanceMetrics.completedTasks / performanceMetrics.totalTasks * 100 },
    { name: 'الالتزام بالمواعيد', value: performanceMetrics.onTimeTasks / performanceMetrics.completedTasks * 100 },
    { name: 'جودة العمل', value: performanceMetrics.avgRating / 5 * 100 },
    { name: 'الحضور', value: performanceMetrics.attendance },
    { name: 'الكفاءة', value: performanceMetrics.efficiency },
  ];
  
  // Time allocation data for pie chart
  const timeAllocationData = [
    { name: 'تصميم', value: 45 },
    { name: 'تنفيذ', value: 30 },
    { name: 'مراجعة', value: 15 },
    { name: 'اجتماعات', value: 10 },
  ];
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <DashboardLayout title="الأداء">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold">لوحة الأداء الشهرية</h2>
        <Select defaultValue="6">
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="الفترة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">آخر 3 أشهر</SelectItem>
            <SelectItem value="6">آخر 6 أشهر</SelectItem>
            <SelectItem value="12">آخر 12 شهر</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">{performanceMetrics.overallScore}</div>
              <p className="text-sm text-gray-500">الدرجة الكلية</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-1">
                {Math.round(performanceMetrics.completedTasks / performanceMetrics.totalTasks * 100)}%
              </div>
              <p className="text-sm text-gray-500">معدل الإنجاز</p>
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
              <div className="text-4xl font-bold text-blue-500 mb-1">
                {Math.round(performanceMetrics.onTimeTasks / performanceMetrics.completedTasks * 100)}%
              </div>
              <p className="text-sm text-gray-500">الالتزام بالمواعيد</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>معدل إنجاز المهام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" name="المهام المنجزة" fill="#0088FE" />
                  <Bar dataKey="onTime" name="المهام المنجزة في الموعد" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>متوسط التقييم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="quality" name="جودة العمل" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* KPIs and Time Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>مؤشرات الأداء الرئيسية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpiData.map((kpi, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{kpi.name}</span>
                    <span className="text-sm font-medium">{Math.round(kpi.value)}%</span>
                  </div>
                  <Progress value={kpi.value} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>توزيع الوقت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeAllocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timeAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
      
      {/* Development Areas */}
      <Card>
        <CardHeader>
          <CardTitle>مجالات التطوير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 ml-3">
                  <i className="fas fa-clock"></i>
                </div>
                <h3 className="text-lg font-bold">إدارة الوقت</h3>
              </div>
              <p className="text-sm text-gray-600">
                تحسين إدارة الوقت لتقليل نسبة المهام المتأخرة. ننصح بتطبيق تقنية بومودورو وتحديد أولويات المهام بشكل أفضل.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 ml-3">
                  <i className="fas fa-book"></i>
                </div>
                <h3 className="text-lg font-bold">تعلم مهارات جديدة</h3>
              </div>
              <p className="text-sm text-gray-600">
                التركيز على تعلم أحدث التقنيات في مجال التصميم لتحسين جودة العمل وزيادة الكفاءة.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 ml-3">
                  <i className="fas fa-users"></i>
                </div>
                <h3 className="text-lg font-bold">العمل الجماعي</h3>
              </div>
              <p className="text-sm text-gray-600">
                تعزيز مهارات التواصل والتعاون مع فريق العمل لتحسين سير العمل وتسريع إنجاز المشاريع.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}