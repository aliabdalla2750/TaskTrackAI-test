import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, Filter, RefreshCw, Send, Eye, Calendar, DownloadCloud } from "lucide-react";
import { format, parseISO, isAfter, startOfWeek, endOfWeek } from "date-fns";
import { ar } from "date-fns/locale";
import { Client, WeeklyReport } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const WeeklyReportsPage: React.FC = () => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    data: clients,
    isLoading: isLoadingClients,
    error: clientsError,
  } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: getQueryFn(),
  });

  const {
    data: weeklyReports,
    isLoading: isLoadingReports,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ["/api/reports/weekly"],
    queryFn: getQueryFn(),
  });

  const handleResendReport = async (clientId: number, reportId: number) => {
    try {
      await apiRequest("POST", `/api/reports/weekly/${reportId}/send`, { clientId });
      toast({
        title: "تم إرسال التقرير",
        description: "تم إرسال التقرير بنجاح عبر واتساب",
      });
      refetchReports();
    } catch (error) {
      toast({
        title: "فشل إرسال التقرير",
        description: "حدث خطأ أثناء إرسال التقرير. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async (clientId: number) => {
    try {
      await apiRequest("POST", "/api/reports/weekly/generate", { clientId });
      toast({
        title: "تم إنشاء التقرير",
        description: "تم إنشاء التقرير الأسبوعي بنجاح",
      });
      refetchReports();
    } catch (error) {
      toast({
        title: "فشل إنشاء التقرير",
        description: "حدث خطأ أثناء إنشاء التقرير. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const filteredClients = React.useMemo(() => {
    if (!clients) return [];
    
    return clients.filter((client: Client) => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           client.company?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      
      const hasReportThisWeek = weeklyReports?.some((report: WeeklyReport) => {
        const reportWeekStart = parseISO(report.weekStart);
        const currentWeekStart = startOfWeek(new Date());
        return report.clientId === client.id && 
               isAfter(reportWeekStart, currentWeekStart);
      });
      
      if (statusFilter === "sent") return matchesSearch && hasReportThisWeek;
      if (statusFilter === "notsent") return matchesSearch && !hasReportThisWeek;
      
      return matchesSearch;
    });
  }, [clients, weeklyReports, searchQuery, statusFilter]);

  const getClientLatestReport = (clientId: number) => {
    if (!weeklyReports) return null;
    
    const clientReports = weeklyReports.filter(
      (report: WeeklyReport) => report.clientId === clientId
    );
    
    if (clientReports.length === 0) return null;
    
    return clientReports.reduce((latest: WeeklyReport, current: WeeklyReport) => {
      const latestDate = parseISO(latest.sentAt || latest.weekStart);
      const currentDate = parseISO(current.sentAt || current.weekStart);
      return isAfter(currentDate, latestDate) ? current : latest;
    });
  };

  const getClientProjectsCount = (clientId: number) => {
    // In a real implementation, this would query the projects count
    // For now, we'll just return a placeholder value
    return Math.floor(Math.random() * 5) + 1;
  };

  if (isLoadingClients || isLoadingReports) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (clientsError || reportsError) {
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

  return (
    <div className="container mx-auto p-6 rtl">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">التقارير الأسبوعية للعملاء</h1>
          <Button
            onClick={() => refetchReports()}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>مرشحات</CardTitle>
            <CardDescription>تصفية العملاء حسب حالة التقرير الأسبوعي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-1">حالة التقرير</label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="جميع العملاء" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العملاء</SelectItem>
                    <SelectItem value="sent">تم إرسال التقرير</SelectItem>
                    <SelectItem value="notsent">لم يتم الإرسال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[300px]">
                <label className="block text-sm font-medium mb-1">بحث</label>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث باسم العميل أو الشركة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>قائمة العملاء والتقارير</CardTitle>
            <CardDescription>
              عرض التقارير الأسبوعية لكل العملاء وإمكانية إرسالها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم العميل</TableHead>
                  <TableHead>الشركة</TableHead>
                  <TableHead>المشاريع الجارية</TableHead>
                  <TableHead>آخر تقرير</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      لا توجد بيانات للعرض
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client: Client) => {
                    const latestReport = getClientLatestReport(client.id);
                    const projectsCount = getClientProjectsCount(client.id);
                    const currentWeekStart = startOfWeek(new Date());
                    const hasReportThisWeek = latestReport && 
                      isAfter(parseISO(latestReport.weekStart), currentWeekStart);
                    
                    return (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.company || "-"}</TableCell>
                        <TableCell>{projectsCount}</TableCell>
                        <TableCell>
                          {latestReport ? (
                            <div className="flex flex-col">
                              <span>
                                {format(parseISO(latestReport.weekStart), "dd MMMM yyyy", { locale: ar })}
                              </span>
                              {latestReport.sentAt && (
                                <span className="text-xs text-muted-foreground">
                                  تم الإرسال: {format(parseISO(latestReport.sentAt), "dd MMMM", { locale: ar })}
                                </span>
                              )}
                            </div>
                          ) : (
                            "لا يوجد"
                          )}
                        </TableCell>
                        <TableCell>
                          {hasReportThisWeek ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              تم الإرسال
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
                              لم يتم الإرسال
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {latestReport ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  asChild
                                >
                                  <a href={`/dashboard/agency/weekly-reports/${latestReport.id}`} target="_blank">
                                    <Eye className="h-3.5 w-3.5" />
                                    عرض
                                  </a>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleResendReport(client.id, latestReport.id)}
                                >
                                  <Send className="h-3.5 w-3.5" />
                                  إرسال
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleGenerateReport(client.id)}
                              >
                                <Calendar className="h-3.5 w-3.5" />
                                إنشاء تقرير
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              إجمالي العملاء: {filteredClients.length}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                toast({
                  title: "جاري إنشاء التقارير",
                  description: "يتم الآن إنشاء التقارير الأسبوعية لجميع العملاء...",
                });
                
                // This would call an API to generate all reports
                apiRequest("POST", "/api/reports/weekly/generate-all")
                  .then(() => {
                    toast({
                      title: "تم إنشاء التقارير",
                      description: "تم إنشاء التقارير الأسبوعية لجميع العملاء بنجاح",
                    });
                    refetchReports();
                  })
                  .catch(() => {
                    toast({
                      title: "حدث خطأ",
                      description: "فشل إنشاء بعض التقارير. يرجى المحاولة مرة أخرى.",
                      variant: "destructive",
                    });
                  });
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              إنشاء تقرير لجميع العملاء
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WeeklyReportsPage;