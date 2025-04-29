import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Client, Project } from "@shared/schema";
import { Calendar, CheckCircle2, Clock, Download, Mail, MailIcon, Send, Users, Phone, Printer, RefreshCw, BarChart3, AlertTriangle } from "lucide-react";
import { format, parseISO, getMonth, getYear, startOfMonth, endOfMonth } from "date-fns";
import { ar } from "date-fns/locale";

const MonthlyReportPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  
  const {
    data: clients,
    isLoading: isLoadingClients,
    error: clientsError
  } = useQuery({
    queryKey: ["/api/clients"]
  });
  
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError
  } = useQuery({
    queryKey: ["/api/projects"]
  });
  
  const {
    data: monthlyReport,
    isLoading: isLoadingReport,
    error: reportError,
    refetch: refetchReport
  } = useQuery({
    queryKey: ["/api/reports/monthly", selectedMonth, selectedClient],
    enabled: !!selectedClient
  });
  
  const generateReportMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClient) {
        throw new Error("يرجى اختيار عميل");
      }
      
      const monthDate = new Date(selectedMonth);
      const payload = {
        clientId: selectedClient,
        month: format(monthDate, 'yyyy-MM')
      };
      
      return apiRequest("POST", "/api/reports/monthly/generate", payload)
        .then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء التقرير الشهري",
        description: "تم إنشاء التقرير الشهري بنجاح",
      });
      refetchReport();
    },
    onError: (error: Error) => {
      toast({
        title: "فشل إنشاء التقرير",
        description: error.message || "حدث خطأ أثناء إنشاء التقرير الشهري. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  });
  
  const sendReportMutation = useMutation({
    mutationFn: async (method: 'email' | 'whatsapp') => {
      if (!selectedClient || !monthlyReport) {
        throw new Error("يرجى اختيار عميل وإنشاء تقرير أولاً");
      }
      
      return apiRequest("POST", `/api/reports/monthly/${monthlyReport.id}/send`, { 
        clientId: selectedClient,
        method
      })
        .then(res => res.json());
    },
    onSuccess: (_, variables) => {
      const method = variables === 'email' ? 'البريد الإلكتروني' : 'واتساب';
      toast({
        title: "تم إرسال التقرير",
        description: `تم إرسال التقرير الشهري عبر ${method} بنجاح`,
      });
      refetchReport();
    },
    onError: (error: Error) => {
      toast({
        title: "فشل إرسال التقرير",
        description: error.message || "حدث خطأ أثناء إرسال التقرير الشهري. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  });
  
  const getSelectedClient = () => {
    if (!clients || !selectedClient) return null;
    return clients.find((client: Client) => client.id === selectedClient);
  };
  
  const getClientProjects = () => {
    if (!projects || !selectedClient) return [];
    return projects.filter((project: Project) => project.clientId === selectedClient);
  };
  
  const isLoading = isLoadingClients || isLoadingProjects || isLoadingReport;
  const hasError = !!clientsError || !!projectsError || !!reportError;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">حدث خطأ</CardTitle>
          </CardHeader>
          <CardContent>
            <p>فشل تحميل البيانات. يرجى تحديث الصفحة أو المحاولة لاحقًا.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const selectedClientData = getSelectedClient();
  const clientProjects = getClientProjects();
  
  return (
    <div className="container mx-auto p-6 rtl">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">التقرير الشهري</h1>
          <Button
            onClick={() => refetchReport()}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>إعدادات التقرير</CardTitle>
            <CardDescription>اختر العميل والشهر لإنشاء التقرير الشهري</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="client" className="block mb-2">العميل</Label>
                <Select
                  value={selectedClient?.toString() || ""}
                  onValueChange={(value) => setSelectedClient(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients && Array.isArray(clients) ? clients.map((client: Client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} - {client.company || "بدون شركة"}
                      </SelectItem>
                    )) : null}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="month" className="block mb-2">الشهر</Label>
                <Input
                  id="month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              onClick={() => generateReportMutation.mutate()}
              disabled={!selectedClient || generateReportMutation.isPending}
              className="gap-2"
            >
              {generateReportMutation.isPending ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> جاري الإنشاء...</>
              ) : (
                <><BarChart3 className="h-4 w-4" /> إنشاء التقرير الشهري</>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {selectedClientData && monthlyReport && (
          <>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      التقرير الشهري: {selectedClientData.name}
                    </CardTitle>
                    <CardDescription>
                      شهر {format(parseISO(monthlyReport.monthStart), "MMMM yyyy", { locale: ar })}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        تاريخ الإنشاء: {monthlyReport.createdAt ? format(parseISO(monthlyReport.createdAt), "dd MMMM yyyy", { locale: ar }) : "غير متوفر"}
                      </span>
                    </div>
                    {monthlyReport.sentAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MailIcon className="h-4 w-4" />
                        <span>
                          تاريخ الإرسال: {format(parseISO(monthlyReport.sentAt), "dd MMMM yyyy", { locale: ar })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="w-full justify-start mb-6">
                    <TabsTrigger value="summary">ملخص</TabsTrigger>
                    <TabsTrigger value="projects">المشاريع</TabsTrigger>
                    <TabsTrigger value="tasks">المهام</TabsTrigger>
                    <TabsTrigger value="client">العميل</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">المشاريع النشطة</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{clientProjects.filter(p => p.status === 'in-progress').length}</div>
                          <p className="text-sm text-muted-foreground">من أصل {clientProjects.length} مشروع</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">المهام المكتملة</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{monthlyReport.reportData?.taskMetrics?.completed || 0}</div>
                          <p className="text-sm text-muted-foreground">خلال هذا الشهر</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">معدل الإنجاز</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {monthlyReport.reportData?.completionRate ? `${Math.round(monthlyReport.reportData.completionRate * 100)}%` : "N/A"}
                          </div>
                          <p className="text-sm text-muted-foreground">مقارنة بالشهر السابق</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">حالة المشاريع</h3>
                      <div className="space-y-4">
                        {monthlyReport.reportData?.projectsSummary && 
                         monthlyReport.reportData.projectsSummary.map((project: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between mb-2">
                              <h4 className="font-medium">{project.name}</h4>
                              <Badge className={
                                project.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                                project.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                project.status === 'delayed' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                'bg-gray-100 text-gray-800 border-gray-300'
                              }>
                                {
                                  project.status === 'completed' ? 'مكتمل' :
                                  project.status === 'in-progress' ? 'قيد التنفيذ' :
                                  project.status === 'delayed' ? 'متأخر' : 
                                  project.status
                                }
                              </Badge>
                            </div>
                            <div className="mb-2">
                              <Progress value={project.progress} className="h-2" /> 
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-muted-foreground">التقدم</span>
                                <span className="text-xs font-medium">{project.progress}%</span>
                              </div>
                            </div>
                            {project.achievements && (
                              <p className="text-sm mt-2">
                                <span className="font-medium">الإنجازات الرئيسية:</span> {project.achievements}
                              </p>
                            )}
                          </div>
                        ))}
                        
                        {(!monthlyReport.reportData?.projectsSummary || 
                          monthlyReport.reportData.projectsSummary.length === 0) && (
                          <div className="text-center py-8 text-muted-foreground">
                            لا توجد بيانات مشاريع متاحة لهذا الشهر.
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {monthlyReport.reportData?.notes && (
                      <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4">ملاحظات وتوصيات</h3>
                        <Card>
                          <CardContent className="pt-6">
                            <p className="whitespace-pre-line">{monthlyReport.reportData.notes}</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="projects">
                    <div className="space-y-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>اسم المشروع</TableHead>
                            <TableHead>الحالة</TableHead>
                            <TableHead>نسبة الإنجاز</TableHead>
                            <TableHead>تاريخ البدء</TableHead>
                            <TableHead>تاريخ الانتهاء المتوقع</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientProjects.length > 0 ? (
                            clientProjects.map((project: Project) => (
                              <TableRow key={project.id}>
                                <TableCell className="font-medium">{project.name}</TableCell>
                                <TableCell>
                                  <Badge className={
                                    project.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                                    project.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                    project.status === 'delayed' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                    'bg-gray-100 text-gray-800 border-gray-300'
                                  }>
                                    {
                                      project.status === 'completed' ? 'مكتمل' :
                                      project.status === 'in-progress' ? 'قيد التنفيذ' :
                                      project.status === 'delayed' ? 'متأخر' : 
                                      project.status
                                    }
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {monthlyReport.reportData?.projectsSummary?.find((p: any) => p.name === project.name)?.progress || 0}%
                                </TableCell>
                                <TableCell>
                                  {project.startDate ? format(parseISO(project.startDate), "dd/MM/yyyy") : "غير محدد"}
                                </TableCell>
                                <TableCell>
                                  {project.endDate ? format(parseISO(project.endDate), "dd/MM/yyyy") : "غير محدد"}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center p-6 text-muted-foreground">
                                لا توجد مشاريع لهذا العميل
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      
                      {monthlyReport.reportData?.taskMetrics && (
                        <Card className="mt-8">
                          <CardHeader>
                            <CardTitle>إحصائيات المهام</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                                <div className="text-green-600 mb-2">
                                  <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <div className="text-2xl font-bold">{monthlyReport.reportData.taskMetrics.completed || 0}</div>
                                <div className="text-sm text-muted-foreground">مكتملة</div>
                              </div>
                              
                              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-blue-600 mb-2">
                                  <Clock className="h-8 w-8" />
                                </div>
                                <div className="text-2xl font-bold">{monthlyReport.reportData.taskMetrics.inProgress || 0}</div>
                                <div className="text-sm text-muted-foreground">قيد التنفيذ</div>
                              </div>
                              
                              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-purple-600 mb-2">
                                  <Clock className="h-8 w-8" />
                                </div>
                                <div className="text-2xl font-bold">{monthlyReport.reportData.taskMetrics.pending || 0}</div>
                                <div className="text-sm text-muted-foreground">قيد الانتظار</div>
                              </div>
                              
                              <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg">
                                <div className="text-amber-600 mb-2">
                                  <AlertTriangle className="h-8 w-8" />
                                </div>
                                <div className="text-2xl font-bold">{monthlyReport.reportData.taskMetrics.delayed || 0}</div>
                                <div className="text-sm text-muted-foreground">متأخرة</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tasks">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="completed">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>المهام المكتملة</span>
                            <Badge variant="secondary" className="mr-2">
                              {monthlyReport.reportData?.completedTasks?.length || 0}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {monthlyReport.reportData?.completedTasks && 
                           monthlyReport.reportData.completedTasks.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>المهمة</TableHead>
                                  <TableHead>المشروع</TableHead>
                                  <TableHead>تاريخ الإكمال</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {monthlyReport.reportData.completedTasks.map((task: any, index: number) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell>{task.projectName}</TableCell>
                                    <TableCell>{task.completedAt ? format(new Date(task.completedAt), "dd/MM/yyyy") : "-"}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              لا توجد مهام مكتملة لهذا الشهر
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="inProgress">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>المهام قيد التنفيذ</span>
                            <Badge variant="secondary" className="mr-2">
                              {monthlyReport.reportData?.inProgressTasks?.length || 0}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {monthlyReport.reportData?.inProgressTasks && 
                           monthlyReport.reportData.inProgressTasks.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>المهمة</TableHead>
                                  <TableHead>المشروع</TableHead>
                                  <TableHead>تاريخ الاستحقاق</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {monthlyReport.reportData.inProgressTasks.map((task: any, index: number) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell>{task.projectName}</TableCell>
                                    <TableCell>{task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy") : "-"}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              لا توجد مهام قيد التنفيذ لهذا الشهر
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="delayed">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span>المهام المتأخرة</span>
                            <Badge variant="secondary" className="mr-2">
                              {monthlyReport.reportData?.delayedTasks?.length || 0}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {monthlyReport.reportData?.delayedTasks && 
                           monthlyReport.reportData.delayedTasks.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>المهمة</TableHead>
                                  <TableHead>المشروع</TableHead>
                                  <TableHead>تاريخ الاستحقاق</TableHead>
                                  <TableHead>التأخير (أيام)</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {monthlyReport.reportData.delayedTasks.map((task: any, index: number) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell>{task.projectName}</TableCell>
                                    <TableCell className="text-amber-600">
                                      {task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy") : "-"}
                                    </TableCell>
                                    <TableCell>{task.delayDays}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              لا توجد مهام متأخرة لهذا الشهر
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TabsContent>
                  
                  <TabsContent value="client">
                    <div className="flex flex-col md:flex-row gap-8">
                      <Card className="flex-1">
                        <CardHeader>
                          <CardTitle>معلومات العميل</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">الاسم</h4>
                            <p className="text-lg">{selectedClientData.name}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">الشركة</h4>
                            <p className="text-lg">{selectedClientData.company || "غير محدد"}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">البريد الإلكتروني</h4>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <p className="text-lg">{selectedClientData.email}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">رقم الهاتف</h4>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <p className="text-lg">{selectedClientData.phone || "غير متوفر"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="flex-1">
                        <CardHeader>
                          <CardTitle>ملخص تفاعل العميل</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">المشاريع النشطة</h4>
                              <p className="text-2xl font-bold">
                                {clientProjects.filter(p => p.status === 'in-progress').length}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">إجمالي عدد المشاريع</h4>
                              <p className="text-2xl font-bold">{clientProjects.length}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">التقارير المرسلة</h4>
                              <p className="text-2xl font-bold">
                                {monthlyReport.sentAt ? "نعم" : "لا"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="justify-between flex-wrap gap-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.open(`/api/reports/monthly/${monthlyReport.id}/download`, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                    تنزيل كـ PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-4 w-4" />
                    طباعة
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={() => sendReportMutation.mutate('email')}
                    disabled={sendReportMutation.isPending}
                  >
                    <Mail className="h-4 w-4" />
                    إرسال عبر البريد الإلكتروني
                  </Button>
                  <Button
                    variant="default"
                    className="gap-2"
                    onClick={() => sendReportMutation.mutate('whatsapp')}
                    disabled={sendReportMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                    إرسال عبر واتساب
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyReportPage;