import React from "react";
import { useParams } from "wouter";
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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { Download, Send, ChevronLeft, CheckCircle, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: number;
  name: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  delayedTasks: number;
  latestSubmission?: {
    id: number;
    title: string;
    date: string;
  };
  endDate: string;
}

interface WeeklyReportDetails {
  id: number;
  clientId: number;
  clientName: string;
  clientCompany?: string;
  weekStart: string;
  sentAt?: string;
  projects: Project[];
}

const WeeklyReportView: React.FC = () => {
  const { id } = useParams();
  const { toast } = useToast();
  
  const { data: report, isLoading, error } = useQuery({
    queryKey: [`/api/reports/weekly/${id}`],
    queryFn: getQueryFn(),
  });

  const handleSendReport = async () => {
    try {
      await apiRequest("POST", `/api/reports/weekly/${id}/send`);
      toast({
        title: "تم الإرسال",
        description: "تم إرسال التقرير إلى العميل بنجاح",
      });
    } catch (error) {
      toast({
        title: "فشل الإرسال",
        description: "حدث خطأ أثناء إرسال التقرير. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await apiRequest("GET", `/api/reports/weekly/${id}/pdf`);
      toast({
        title: "جاري التحميل",
        description: "جاري تحميل التقرير بصيغة PDF...",
      });
    } catch (error) {
      toast({
        title: "فشل التحميل",
        description: "حدث خطأ أثناء تحميل التقرير. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !report) {
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
            <Button asChild variant="outline">
              <a href="/dashboard/agency/weekly-reports">العودة للتقارير</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Use real data from the report object or create sample data for the view
  const reportData: WeeklyReportDetails = report;

  return (
    <div className="container mx-auto p-6 rtl">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <a href="/dashboard/agency/weekly-reports">
                <ChevronLeft className="h-5 w-5" />
              </a>
            </Button>
            <h1 className="text-3xl font-bold">التقرير الأسبوعي للعميل</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              تنزيل PDF
            </Button>
            {!reportData.sentAt && (
              <Button onClick={handleSendReport} className="gap-2">
                <Send className="h-4 w-4" />
                إرسال التقرير
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  تقرير أسبوعي: {reportData.clientName}
                </CardTitle>
                {reportData.clientCompany && (
                  <CardDescription>{reportData.clientCompany}</CardDescription>
                )}
              </div>
              {reportData.sentAt ? (
                <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  تم الإرسال: {format(parseISO(reportData.sentAt), "dd MMMM yyyy", { locale: ar })}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  لم يتم الإرسال بعد
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">
                تقرير الأسبوع المنتهي في {format(parseISO(reportData.weekStart), "dd MMMM yyyy", { locale: ar })}
              </h3>
              
              {reportData.projects.length === 0 ? (
                <div className="p-8 text-center bg-muted rounded-lg">
                  <p>لا توجد مشاريع نشطة لهذا العميل خلال الأسبوع الماضي</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reportData.projects.map((project) => (
                    <Card key={project.id} className="border border-muted">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{project.name}</CardTitle>
                          <Button variant="ghost" size="sm" className="gap-1" asChild>
                            <a href={`/dashboard/agency/projects/${project.id}`} target="_blank">
                              عرض المشروع
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="flex justify-between mb-1 text-sm">
                            <span>نسبة التقدم</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm text-muted-foreground">المهام المكتملة</p>
                              <p className="font-semibold">{project.completedTasks} / {project.totalTasks}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <div>
                              <p className="text-sm text-muted-foreground">المهام المتأخرة</p>
                              <p className="font-semibold">{project.delayedTasks}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm text-muted-foreground">تاريخ الانتهاء المتوقع</p>
                              <p className="font-semibold">{format(parseISO(project.endDate), "dd MMMM yyyy", { locale: ar })}</p>
                            </div>
                          </div>
                        </div>
                        
                        {project.latestSubmission && (
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">آخر تسليم</h4>
                            <div className="flex justify-between items-center">
                              <p>{project.latestSubmission.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(parseISO(project.latestSubmission.date), "dd MMMM", { locale: ar })}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg text-sm">
              <h3 className="font-semibold mb-2">صيغة نص الواتساب</h3>
              <div className="p-4 bg-white rounded-lg whitespace-pre-wrap">
{`أستاذ ${reportData.clientName}،
إليك ملخص العمل على مشاريعك هذا الأسبوع:

${reportData.projects.map(project => `📂 ${project.name}:
✅ ${project.completedTasks} مهام تم تسليمها
⏳ ${project.totalTasks - project.completedTasks} مهام مازالت جارية
${project.delayedTasks > 0 ? `⚠️ ${project.delayedTasks} مهام متأخرة` : '⚠️ لا يوجد تأخير'}
نسبة التقدم: ${project.progress}%
👀 راجع كل التفاصيل من هنا: [رابط المشروع]

`).join('')}نتطلع دائمًا لتقديم أفضل الخدمات لكم،
فريق وكالة الرقمية
`}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              تم إنشاء التقرير في: {format(parseISO(reportData.weekStart), "dd MMMM yyyy", { locale: ar })}
            </p>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
                <Download className="h-4 w-4" />
                تنزيل PDF
              </Button>
              {!reportData.sentAt && (
                <Button onClick={handleSendReport} className="gap-2">
                  <Send className="h-4 w-4" />
                  إرسال التقرير
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyReportView;