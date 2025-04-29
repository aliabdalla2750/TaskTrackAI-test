import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isToday } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Checkbox
} from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Task } from "@shared/schema";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Send, 
  CheckCheck, 
  BookCheck,
  Loader2, 
  AlertTriangle,
  CheckCircle,
  BellRing
} from "lucide-react";

const DailyStandupReport: React.FC = () => {
  const { toast } = useToast();
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [plannedTasks, setPlannedTasks] = useState<number[]>([]);
  const [achievements, setAchievements] = useState<string>("");
  const [challenges, setChallenges] = useState<string>("");
  const [plans, setPlans] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [satisfaction, setSatisfaction] = useState<number>(3);
  const [confirmDialog, setConfirmDialog] = useState<boolean>(false);
  
  const {
    data: myTasks,
    isLoading: isLoadingTasks,
    error: tasksError
  } = useQuery({
    queryKey: ["/api/tasks/assigned"]
  });
  
  const {
    data: todayStandup,
    isLoading: isLoadingStandup,
    error: standupError,
    refetch: refetchStandup
  } = useQuery({
    queryKey: ["/api/daily-standups/today"]
  });
  
  const {
    data: previousStandups,
    isLoading: isLoadingPrevious,
    error: previousError
  } = useQuery({
    queryKey: ["/api/daily-standups/recent"]
  });
  
  const submitStandupMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        tasksDone: selectedTasks,
        tasksPlanned: plannedTasks,
        achievements,
        challenges,
        plans,
        satisfaction
      };
      
      return apiRequest("POST", "/api/daily-standups", payload)
        .then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال التقرير اليومي",
        description: "تم تسجيل التقرير اليومي بنجاح",
      });
      setConfirmDialog(false);
      refetchStandup();
      
      // Reset form
      setSelectedTasks([]);
      setPlannedTasks([]);
      setAchievements("");
      setChallenges("");
      setPlans("");
      setComments("");
      setSatisfaction(3);
    },
    onError: (error: Error) => {
      toast({
        title: "فشل إرسال التقرير",
        description: error.message || "حدث خطأ أثناء إرسال التقرير اليومي. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      setConfirmDialog(false);
    }
  });
  
  const closeStandupMutation = useMutation({
    mutationFn: async () => {
      if (!todayStandup || !todayStandup.id) {
        throw new Error("لا يوجد تقرير مفتوح للإغلاق");
      }
      
      return apiRequest("PUT", `/api/daily-standups/${todayStandup.id}/close`, {
        tasksDone: selectedTasks,
        comments,
        rating: satisfaction
      })
        .then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "تم إغلاق التقرير اليومي",
        description: "تم إغلاق التقرير اليومي بنجاح",
      });
      setConfirmDialog(false);
      refetchStandup();
    },
    onError: (error: Error) => {
      toast({
        title: "فشل إغلاق التقرير",
        description: error.message || "حدث خطأ أثناء إغلاق التقرير اليومي. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      setConfirmDialog(false);
    }
  });
  
  // If we have a standup from today, prefill the form
  useEffect(() => {
    if (todayStandup) {
      if (todayStandup.tasksDone && Array.isArray(todayStandup.tasksDone)) {
        setSelectedTasks(todayStandup.tasksDone);
      }
      
      if (todayStandup.tasksPlanned && Array.isArray(todayStandup.tasksPlanned)) {
        setPlannedTasks(todayStandup.tasksPlanned);
      }
      
      if (todayStandup.achievements) {
        setAchievements(todayStandup.achievements);
      }
      
      if (todayStandup.challenges) {
        setChallenges(todayStandup.challenges);
      }
      
      if (todayStandup.plans) {
        setPlans(todayStandup.plans);
      }
      
      if (todayStandup.comments) {
        setComments(todayStandup.comments);
      }
      
      if (todayStandup.satisfaction) {
        setSatisfaction(todayStandup.satisfaction);
      }
    }
  }, [todayStandup]);
  
  const toggleTask = (taskId: number) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };
  
  const togglePlannedTask = (taskId: number) => {
    setPlannedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };
  
  const getTaskById = (taskId: number) => {
    if (!myTasks || !Array.isArray(myTasks)) return null;
    return myTasks.find((task: Task) => task.id === taskId);
  };
  
  const isLoading = isLoadingTasks || isLoadingStandup || isLoadingPrevious;
  const hasError = !!tasksError || !!standupError || !!previousError;
  
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
  
  const handleSubmit = () => {
    setConfirmDialog(true);
  };
  
  const getStandupStatusBadge = (standup: any) => {
    if (standup.closedAt) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          تم الإغلاق
        </Badge>
      );
    } else if (standup.submittedAt) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          تم التقديم
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300">
          قيد الإنشاء
        </Badge>
      );
    }
  };
  
  const isFormComplete = () => {
    if (todayStandup && todayStandup.submittedAt && !todayStandup.closedAt) {
      // For closing a standup, we need selected tasks and a satisfaction rating
      return selectedTasks.length > 0 && satisfaction > 0;
    } else {
      // For submitting a new standup, we need all fields
      return (
        selectedTasks.length > 0 &&
        plannedTasks.length > 0 &&
        achievements.trim() !== "" &&
        challenges.trim() !== "" &&
        plans.trim() !== ""
      );
    }
  };
  
  const renderSatisfactionEmoji = (rating: number) => {
    switch (rating) {
      case 1: return "😞";
      case 2: return "🙁";
      case 3: return "😐";
      case 4: return "🙂";
      case 5: return "😄";
      default: return "😐";
    }
  };
  
  const renderSatisfactionLabel = (rating: number) => {
    switch (rating) {
      case 1: return "غير راضٍ تمامًا";
      case 2: return "غير راضٍ";
      case 3: return "محايد";
      case 4: return "راضٍ";
      case 5: return "راضٍ جدًا";
      default: return "محايد";
    }
  };
  
  const isStandupSubmitted = todayStandup && todayStandup.submittedAt && !todayStandup.closedAt;
  const isStandupClosed = todayStandup && todayStandup.closedAt;
  
  return (
    <div className="container mx-auto p-6 rtl">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">التقرير اليومي</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(), "EEEE dd MMMM yyyy", { locale: ar })}</span>
            </div>
          </div>
        </div>
        
        {isStandupClosed ? (
          <Card>
            <CardHeader>
              <CardTitle>تم إغلاق التقرير اليومي</CardTitle>
              <CardDescription>لقد قمت بالفعل بإرسال وإغلاق التقرير اليومي لليوم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="bg-green-50 text-green-600 p-4 rounded-full">
                  <CheckCheck className="h-12 w-12" />
                </div>
                <p className="text-xl font-semibold">شكرًا لإكمال التقرير اليومي</p>
                <p className="text-center text-muted-foreground max-w-md">
                  ستتمكن من إنشاء تقرير جديد غدًا. إذا كنت ترغب في مراجعة تقارير سابقة، يمكنك الإطلاع على التقارير السابقة أدناه.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{isStandupSubmitted ? "إغلاق التقرير اليومي" : "إنشاء التقرير اليومي"}</CardTitle>
                  <CardDescription>
                    {isStandupSubmitted
                      ? "قم بتحديث ومراجعة ما تم إنجازه من مهام اليوم وإغلاق التقرير"
                      : "قم بملء التقرير اليومي حول إنجازاتك والتحديات التي واجهتك"}
                  </CardDescription>
                </div>
                {isStandupSubmitted && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>تم التقديم {todayStandup.submittedAt ? format(parseISO(todayStandup.submittedAt), "HH:mm", { locale: ar }) : ""}</span>
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Today's Tasks */}
              <div>
                <h3 className="text-lg font-medium mb-3">المهام المنجزة اليوم</h3>
                <div className="border rounded-lg divide-y">
                  {myTasks && Array.isArray(myTasks) && myTasks.length > 0 ? (
                    myTasks.filter((task: Task) => task.status !== 'completed').map((task: Task) => (
                      <div key={task.id} className="flex items-start gap-3 p-3">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={() => toggleTask(task.id)}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`task-${task.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {task.title}
                          </label>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{format(parseISO(task.dueDate), "dd/MM/yyyy")}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      لا توجد مهام مسندة لك حاليًا
                    </div>
                  )}
                </div>
              </div>
              
              {/* Planned Tasks for Tomorrow */}
              {!isStandupSubmitted && (
                <div>
                  <h3 className="text-lg font-medium mb-3">المهام المخطط لها غدًا</h3>
                  <div className="border rounded-lg divide-y">
                    {myTasks && Array.isArray(myTasks) && myTasks.length > 0 ? (
                      myTasks.filter((task: Task) => 
                        task.status !== 'completed' && 
                        !selectedTasks.includes(task.id)
                      ).map((task: Task) => (
                        <div key={`planned-${task.id}`} className="flex items-start gap-3 p-3">
                          <Checkbox
                            id={`planned-task-${task.id}`}
                            checked={plannedTasks.includes(task.id)}
                            onCheckedChange={() => togglePlannedTask(task.id)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`planned-task-${task.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {task.title}
                            </label>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            )}
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{format(parseISO(task.dueDate), "dd/MM/yyyy")}</span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        لا توجد مهام مسندة لك حاليًا
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Achievements */}
              {!isStandupSubmitted && (
                <div>
                  <Label htmlFor="achievements" className="text-lg font-medium mb-3 block">
                    ما هي إنجازاتك اليوم؟
                  </Label>
                  <Textarea
                    id="achievements"
                    placeholder="اذكر أهم إنجازاتك وما استطعت إكماله اليوم..."
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              )}
              
              {/* Challenges */}
              {!isStandupSubmitted && (
                <div>
                  <Label htmlFor="challenges" className="text-lg font-medium mb-3 block">
                    ما هي التحديات التي واجهتك؟
                  </Label>
                  <Textarea
                    id="challenges"
                    placeholder="اذكر التحديات أو العقبات التي واجهتك اليوم..."
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              )}
              
              {/* Plans */}
              {!isStandupSubmitted && (
                <div>
                  <Label htmlFor="plans" className="text-lg font-medium mb-3 block">
                    ما هي خططك للغد؟
                  </Label>
                  <Textarea
                    id="plans"
                    placeholder="اذكر ما تخطط للقيام به غدًا..."
                    value={plans}
                    onChange={(e) => setPlans(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              )}
              
              {/* Comments for closing */}
              {isStandupSubmitted && (
                <div>
                  <Label htmlFor="comments" className="text-lg font-medium mb-3 block">
                    تعليقات إضافية عند إغلاق التقرير
                  </Label>
                  <Textarea
                    id="comments"
                    placeholder="أي ملاحظات إضافية عند إغلاق التقرير اليومي..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              )}
              
              {/* Satisfaction Rating */}
              <div>
                <Label htmlFor="satisfaction" className="text-lg font-medium mb-3 block">
                  ما هو مستوى رضاك عن هذا اليوم؟
                </Label>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-2xl">😞</span>
                    <span className="text-2xl">🙁</span>
                    <span className="text-2xl">😐</span>
                    <span className="text-2xl">🙂</span>
                    <span className="text-2xl">😄</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={satisfaction}
                    onChange={(e) => setSatisfaction(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-center items-center gap-2">
                    <span className="text-3xl">{renderSatisfactionEmoji(satisfaction)}</span>
                    <span className="font-medium">{renderSatisfactionLabel(satisfaction)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!isFormComplete()}
                className="gap-2"
              >
                {isStandupSubmitted ? (
                  <>
                    <CheckCheck className="h-4 w-4" />
                    إغلاق التقرير اليومي
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    إرسال التقرير اليومي
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Previous standups */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">التقارير السابقة</h2>
          <Accordion type="single" collapsible className="w-full">
            {previousStandups && Array.isArray(previousStandups) && previousStandups.length > 0 ? (
              previousStandups.map((standup: any, index: number) => (
                <AccordionItem key={standup.id} value={standup.id.toString()}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {format(parseISO(standup.date), "EEEE dd MMMM yyyy", { locale: ar })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {standup.tasksDone?.length || 0} مهام منجزة
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStandupStatusBadge(standup)}
                        <span className="text-xl ml-4">
                          {renderSatisfactionEmoji(standup.satisfaction)}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">المهام المنجزة</h4>
                          <ul className="space-y-2">
                            {standup.tasksDone && Array.isArray(standup.tasksDone) && standup.tasksDone.length > 0 ? (
                              standup.tasksDone.map((taskId: number) => {
                                const task = getTaskById(taskId);
                                return task ? (
                                  <li key={taskId} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>{task.title}</span>
                                  </li>
                                ) : (
                                  <li key={taskId} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>مهمة #{taskId}</span>
                                  </li>
                                );
                              })
                            ) : (
                              <li className="text-muted-foreground">لا توجد مهام مسجلة</li>
                            )}
                          </ul>
                        </div>
                        {standup.tasksPlanned && Array.isArray(standup.tasksPlanned) && standup.tasksPlanned.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">المهام المخطط لها</h4>
                            <ul className="space-y-2">
                              {standup.tasksPlanned.map((taskId: number) => {
                                const task = getTaskById(taskId);
                                return task ? (
                                  <li key={taskId} className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <span>{task.title}</span>
                                  </li>
                                ) : (
                                  <li key={taskId} className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <span>مهمة #{taskId}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {standup.achievements && (
                        <div>
                          <h4 className="font-medium mb-2">الإنجازات</h4>
                          <p className="text-sm whitespace-pre-line">{standup.achievements}</p>
                        </div>
                      )}
                      
                      {standup.challenges && (
                        <div>
                          <h4 className="font-medium mb-2">التحديات</h4>
                          <p className="text-sm whitespace-pre-line">{standup.challenges}</p>
                        </div>
                      )}
                      
                      {standup.plans && (
                        <div>
                          <h4 className="font-medium mb-2">الخطط</h4>
                          <p className="text-sm whitespace-pre-line">{standup.plans}</p>
                        </div>
                      )}
                      
                      {standup.comments && (
                        <div>
                          <h4 className="font-medium mb-2">تعليقات إضافية</h4>
                          <p className="text-sm whitespace-pre-line">{standup.comments}</p>
                        </div>
                      )}
                      
                      {standup.managerFeedback && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <BellRing className="h-4 w-4 text-blue-600" />
                            <span>ملاحظات المدير</span>
                          </h4>
                          <p className="text-sm whitespace-pre-line">{standup.managerFeedback}</p>
                          <div className="text-xs text-muted-foreground mt-2">
                            {standup.reviewedAt && (
                              <span>تمت المراجعة: {format(parseISO(standup.reviewedAt), "dd MMMM yyyy HH:mm", { locale: ar })}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <div>
                          {standup.submittedAt && (
                            <span>تم التقديم: {format(parseISO(standup.submittedAt), "HH:mm", { locale: ar })}</span>
                          )}
                        </div>
                        <div>
                          {standup.closedAt && (
                            <span>تم الإغلاق: {format(parseISO(standup.closedAt), "HH:mm", { locale: ar })}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  لا توجد تقارير سابقة لعرضها
                </CardContent>
              </Card>
            )}
          </Accordion>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isStandupSubmitted ? "تأكيد إغلاق التقرير" : "تأكيد إرسال التقرير"}
            </DialogTitle>
            <DialogDescription>
              {isStandupSubmitted 
                ? "هل أنت متأكد من إغلاق التقرير اليومي؟ لن تتمكن من تعديله بعد ذلك." 
                : "هل أنت متأكد من إرسال التقرير اليومي؟ يمكنك تعديله قبل إغلاقه في نهاية اليوم."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="font-medium mb-2">
              {isStandupSubmitted ? "المهام المنجزة المحددة:" : "ملخص التقرير:"}
            </h3>
            <ul className="space-y-1">
              {selectedTasks.map(taskId => {
                const task = getTaskById(taskId);
                return (
                  <li key={taskId} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{task ? task.title : `مهمة #${taskId}`}</span>
                  </li>
                );
              })}
            </ul>
            
            {!isStandupSubmitted && (
              <>
                <h3 className="font-medium mt-4 mb-2">المهام المخطط لها للغد:</h3>
                <ul className="space-y-1">
                  {plannedTasks.map(taskId => {
                    const task = getTaskById(taskId);
                    return (
                      <li key={taskId} className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{task ? task.title : `مهمة #${taskId}`}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => isStandupSubmitted ? closeStandupMutation.mutate() : submitStandupMutation.mutate()}
              disabled={submitStandupMutation.isPending || closeStandupMutation.isPending}
            >
              {(submitStandupMutation.isPending || closeStandupMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isStandupSubmitted ? "جاري الإغلاق..." : "جاري الإرسال..."}
                </>
              ) : (
                <>
                  {isStandupSubmitted ? "إغلاق التقرير" : "إرسال التقرير"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyStandupReport;