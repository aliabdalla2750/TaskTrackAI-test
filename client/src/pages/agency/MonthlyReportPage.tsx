import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, addMonths, subMonths } from "date-fns";
import { ar } from "date-fns/locale";
import { DownloadCloud, Users, FileText, Calendar, TrendingUp, DollarSign, Briefcase, Award } from "lucide-react";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Import rechart components for visualizations
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface EmployeePerformance {
  id: number;
  name: string;
  position: string;
  completedTasks: number;
  taskCompletion: number;
  pendingTasks: number;
}

interface MonthlyKPIs {
  openProjects: number;
  completedProjects: number;
  taskCompletionRate: number;
  delayRate: number;
  topPerformer: {
    id: number;
    name: string;
    tasks: number;
  };
  mostActiveClient: {
    id: number;
    name: string;
    projects: number;
  };
  totalRevenue: number;
  mostTimeConsumingProject: {
    id: number;
    name: string;
    hours: number;
  };
}

interface MonthlyReport {
  id: number;
  agencyId: number;
  month: string;
  generatedAt: string;
  metrics: MonthlyKPIs;
  performanceHistory: {
    month: string;
    taskCompletionRate: number;
    delayRate: number;
    revenue: number;
  }[];
  employeePerformance: EmployeePerformance[];
}

const MonthlyReportPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    format(new Date(), "yyyy-MM")
  );

  const { data: report, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/reports/monthly", selectedMonth],
    queryFn: getQueryFn(),
  });

  const handleGenerateReport = async () => {
    try {
      await apiRequest("POST", "/api/reports/monthly/generate", { month: selectedMonth });
      toast({
        title: "تم إنشاء التقرير",
        description: "تم إنشاء التقرير الشهري بنجاح",
      });
      refetch();
    } catch (error) {
      toast({
        title: "فشل إنشاء التقرير",
        description: "حدث خطأ أثناء إنشاء التقرير. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // In a real implementation, this would call an API to generate and download a PDF
      toast({
        title: "جاري التحميل",
        description: "جاري تحميل التقرير بصيغة PDF...",
      });
      
      // Simulating API call delay
      setTimeout(() => {
        toast({
          title: "تم التحميل",
          description: "تم تحميل التقرير بنجاح",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "فشل التحميل",
        description: "حدث خطأ أثناء تحميل التقرير. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    
    // Generate options for the last 12 months
    for (let i = 0; i < 12; i++) {
      const date = subMonths(today, i);
      const value = format(date, "yyyy-MM");
      const label = format(date, "MMMM yyyy", { locale: ar });
      
      options.push({ value, label });
    }
    
    return options;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">حدث خطأ</CardTitle>
          </CardHeader>
          <CardContent>
            <p>فشل تحميل بيانات التقرير. يرجى تحديث الصفحة أو المحاولة لاحقًا.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => refetch()} variant="outline">
              إعادة المحاولة
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If no report data exists for the selected month
  if (!report) {
    return (
      <div className="container mx-auto p-6 rtl">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">التقرير الشهري</h1>
            <div className="flex gap-2">
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="اختر الشهر" />
                </SelectTrigger>
                <SelectContent>
                  {generateMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>لا يوجد تقرير</CardTitle>
              <CardDescription>
                لم يتم إنشاء تقرير لشهر {format(parseISO(`${selectedMonth}-01`), "MMMM yyyy", { locale: ar })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-center mb-6">
                لا توجد بيانات متاحة لهذا الشهر. قم بإنشاء تقرير جديد.
              </p>
              <Button onClick={handleGenerateReport}>
                إنشاء التقرير الشهري
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // For demonstration purposes, we'll create sample data
  // In a real implementation, this would come from the API
  const monthlyKPIs: MonthlyKPIs = report.metrics || {
    openProjects: 12,
    completedProjects: 4,
    taskCompletionRate: 78,
    delayRate: 12,
    topPerformer: {
      id: 1,
      name: "أحمد محمد",
      tasks: 23,
    },
    mostActiveClient: {
      id: 2,
      name: "شركة الأهرام للتكنولوجيا",
      projects: 3,
    },
    totalRevenue: 45000,
    mostTimeConsumingProject: {
      id: 3,
      name: "تطوير منصة التعليم الإلكتروني",
      hours: 120,
    },
  };

  const performanceHistory = report.performanceHistory || [
    { month: "يناير", taskCompletionRate: 65, delayRate: 15, revenue: 30000 },
    { month: "فبراير", taskCompletionRate: 70, delayRate: 12, revenue: 35000 },
    { month: "مارس", taskCompletionRate: 78, delayRate: 10, revenue: 42000 },
  ];

  const employeePerformance = report.employeePerformance || [
    { id: 1, name: "أحمد محمد", position: "مطور ويب", completedTasks: 23, taskCompletion: 92, pendingTasks: 2 },
    { id: 2, name: "سارة أحمد", position: "مصممة واجهات", completedTasks: 18, taskCompletion: 90, pendingTasks: 2 },
    { id: 3, name: "محمد أحمد", position: "مدير مشروع", completedTasks: 15, taskCompletion: 85, pendingTasks: 3 },
    { id: 4, name: "ليلى خالد", position: "مسوقة إلكترونية", completedTasks: 12, taskCompletion: 80, pendingTasks: 3 },
  ];

  return (
    <div className="container mx-auto p-6 rtl">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">التقرير الشهري</h1>
          <div className="flex gap-2">
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="اختر الشهر" />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleGenerateReport}>
              تحديث التقرير
            </Button>
            <Button onClick={handleDownloadPDF} className="gap-2">
              <DownloadCloud className="h-4 w-4" />
              تنزيل PDF
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              تقرير شهر {format(parseISO(`${selectedMonth}-01`), "MMMM yyyy", { locale: ar })}
            </CardTitle>
            <CardDescription>
              نظرة عامة على أداء الوكالة والمؤشرات الرئيسية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">المشاريع الجارية</p>
                      <h3 className="text-2xl font-bold">{monthlyKPIs.openProjects}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">معدل إنجاز المهام</p>
                      <h3 className="text-2xl font-bold">{monthlyKPIs.taskCompletionRate}%</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-100 rounded-full">
                      <TrendingUp className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">معدل التأخير</p>
                      <h3 className="text-2xl font-bold">{monthlyKPIs.delayRate}%</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي التحصيلات</p>
                      <h3 className="text-2xl font-bold">{monthlyKPIs.totalRevenue.toLocaleString()} ج.م</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>تطور الأداء (آخر 3 شهور)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={performanceHistory}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="taskCompletionRate" 
                          name="معدل إنجاز المهام (%)" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="delayRate" 
                          name="معدل التأخير (%)" 
                          stroke="#ff7d7d" 
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="revenue" 
                          name="الإيرادات (ج.م)" 
                          stroke="#82ca9d" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>المتميزون هذا الشهر</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium">أفضل موظف</p>
                        <Badge variant="outline" className="bg-primary/10">
                          {monthlyKPIs.topPerformer.tasks} مهمة
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{monthlyKPIs.topPerformer.name}</p>
                          <p className="text-sm text-muted-foreground">أكثر موظف نشاطًا</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium">أنشط عميل</p>
                        <Badge variant="outline" className="bg-primary/10">
                          {monthlyKPIs.mostActiveClient.projects} مشاريع
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{monthlyKPIs.mostActiveClient.name}</p>
                          <p className="text-sm text-muted-foreground">العميل الأكثر نشاطًا</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium">أكثر مشروع استهلك وقت</p>
                        <Badge variant="outline" className="bg-primary/10">
                          {monthlyKPIs.mostTimeConsumingProject.hours} ساعة
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{monthlyKPIs.mostTimeConsumingProject.name}</p>
                          <p className="text-sm text-muted-foreground">المشروع الأكثر استهلاكًا للوقت</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>أداء الموظفين</CardTitle>
                <CardDescription>ترتيب الموظفين حسب عدد المهام المنجزة</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الموظف</TableHead>
                      <TableHead>المنصب</TableHead>
                      <TableHead>المهام المنجزة</TableHead>
                      <TableHead>المهام المعلقة</TableHead>
                      <TableHead>نسبة الإنجاز</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeePerformance.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.completedTasks}</TableCell>
                        <TableCell>{employee.pendingTasks}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={employee.taskCompletion} className="h-2 w-24" />
                            <span className="text-sm">{employee.taskCompletion}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter className="flex justify-end">
            <p className="text-sm text-muted-foreground ml-auto">
              تم إنشاء التقرير في: {format(parseISO(report.generatedAt), "dd MMMM yyyy", { locale: ar })}
            </p>
            <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
              <DownloadCloud className="h-4 w-4" />
              تنزيل PDF
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyReportPage;