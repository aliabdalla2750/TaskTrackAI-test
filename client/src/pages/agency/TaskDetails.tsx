import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  RiArrowRightLine, 
  RiCalendarLine, 
  RiUserLine, 
  RiArrowGoBackLine, 
  RiAttachmentLine, 
  RiFileTextLine,
  RiFileZipLine,
  RiFileExcelLine,
  RiFileWordLine,
  RiFilePdfLine,
  RiFileImageLine,
  RiDownloadLine,
  RiExternalLinkLine,
  RiUploadCloud2Line,
  RiChat1Line,
  RiCheckLine,
  RiTimeLine,
  RiEyeLine,
  RiCloseLine,
  RiAlertLine
} from 'react-icons/ri';

// تعريف الأنواع
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_review' | 'completed' | 'late';
  assignedTo: {
    id: string;
    name: string;
    avatar?: string;
  };
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  project: {
    id: string;
    name: string;
  };
}

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface Comment {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
}

// بيانات مؤقتة للعرض
const mockTask: Task = {
  id: "t456",
  title: "تصميم واجهة تسجيل الدخول",
  description: "تصميم UI لصفحة تسجيل الدخول بتوافق مع الهوية البصرية الجديدة. يجب الالتزام بالألوان الأساسية للمشروع مع مراعاة تجربة المستخدم والتصميم المتجاوب.",
  status: "in_review",
  assignedTo: {
    id: "e101",
    name: "أحمد خالد",
    avatar: "https://i.pravatar.cc/300"
  },
  dueDate: "2025-05-03",
  createdAt: "2025-04-25",
  updatedAt: "2025-04-27",
  progress: 75,
  project: {
    id: "p101",
    name: "تطوير منصة دفع إلكتروني"
  }
};

const mockAttachments: Attachment[] = [
  {
    id: "a1",
    fileName: "Login-Screen-V1.png",
    fileUrl: "/files/login-v1.png",
    fileType: "image/png",
    uploadedBy: "أحمد خالد",
    uploadedAt: "2025-04-26"
  },
  {
    id: "a2",
    fileName: "UI-Notes.pdf",
    fileUrl: "/files/ui-notes.pdf",
    fileType: "application/pdf",
    uploadedBy: "أحمد خالد",
    uploadedAt: "2025-04-27"
  }
];

const mockComments: Comment[] = [
  {
    id: "c1",
    text: "واجهت مشكلة في تناسق الألوان مع بعض عناصر الواجهة. هل يمكن مراجعة لوحة الألوان؟",
    createdBy: "أحمد خالد",
    createdAt: "2025-04-26"
  }
];

// مكون لعرض حالة المهمة
const StatusBadge = ({ status }: { status: Task['status'] }) => {
  const statusMap = {
    open: { label: 'مفتوحة', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    in_review: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    completed: { label: 'مكتملة', color: 'bg-green-100 text-green-800 border-green-300' },
    late: { label: 'متأخرة', color: 'bg-red-100 text-red-800 border-red-300' }
  };

  const statusInfo = statusMap[status];
  
  // أيقونة مناسبة لكل حالة
  const StatusIcon = () => {
    switch(status) {
      case 'open': return <RiTimeLine className="mr-1" />;
      case 'in_review': return <RiEyeLine className="mr-1" />;
      case 'completed': return <RiCheckLine className="mr-1" />;
      case 'late': return <RiAlertLine className="mr-1" />;
    }
  };

  return (
    <Badge className={`${statusInfo.color} flex items-center px-2 py-1 text-xs border`}>
      <StatusIcon />
      {statusInfo.label}
    </Badge>
  );
};

// مكون لعرض الملفات المرفقة
const AttachmentCard = ({ attachment }: { attachment: Attachment }) => {
  // تحديد أيقونة مناسبة حسب نوع الملف
  const FileIcon = () => {
    if (attachment.fileType.includes('image')) return <RiFileImageLine size={20} />;
    if (attachment.fileType.includes('pdf')) return <RiFilePdfLine size={20} />;
    if (attachment.fileType.includes('word')) return <RiFileWordLine size={20} />;
    if (attachment.fileType.includes('excel')) return <RiFileExcelLine size={20} />;
    if (attachment.fileType.includes('zip')) return <RiFileZipLine size={20} />;
    return <RiFileTextLine size={20} />;
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 mb-2">
      <div className="flex items-center">
        <div className="text-primary mr-3">
          <FileIcon />
        </div>
        <div>
          <p className="text-sm font-medium">{attachment.fileName}</p>
          <p className="text-xs text-gray-500">
            {attachment.uploadedBy} • {format(new Date(attachment.uploadedAt), 'dd MMM yyyy', { locale: ar })}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="h-8 px-2">
          <RiExternalLinkLine className="mr-1" />
          عرض
        </Button>
        <Button variant="outline" size="sm" className="h-8 px-2">
          <RiDownloadLine className="mr-1" />
          تحميل
        </Button>
      </div>
    </div>
  );
};

export default function TaskDetails() {
  const [, navigate] = useLocation();
  const { taskId } = useParams();
  const { toast } = useToast();
  
  // حالة الصفحة
  const [task, setTask] = useState<Task | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<Task['status'] | ''>('');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // جلب البيانات
  useEffect(() => {
    const fetchTaskData = async () => {
      setIsLoading(true);
      try {
        // في الوضع الحقيقي سنقوم بجلب البيانات من الخادم
        // توقف قصير لمحاكاة جلب البيانات
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // استخدام البيانات المؤقتة
        setTask(mockTask);
        setAttachments(mockAttachments);
        setComments(mockComments);
        setNewStatus(mockTask.status);
      } catch (error) {
        console.error("Error fetching task data:", error);
        toast({
          title: "خطأ في جلب البيانات",
          description: "حدث خطأ أثناء محاولة جلب بيانات المهمة",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTaskData();
  }, [taskId, toast]);
  
  // تحديث حالة المهمة
  const handleStatusUpdate = async () => {
    if (!newStatus || !task) return;
    
    setIsSubmitting(true);
    try {
      // محاكاة تحديث الحالة في الخادم
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // تحديث حالة المهمة محلياً
      setTask({
        ...task,
        status: newStatus as Task['status'],
        updatedAt: new Date().toISOString().split('T')[0]
      });
      
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث حالة المهمة",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث حالة المهمة",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // إضافة تعليق جديد
  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return;
    
    setIsSubmitting(true);
    try {
      // محاكاة إرسال التعليق للخادم
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // إضافة التعليق الجديد محلياً
      const newCommentObj: Comment = {
        id: `c${comments.length + 1}`,
        text: newComment,
        createdBy: "المستخدم الحالي",
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setComments([...comments, newCommentObj]);
      setNewComment('');
      
      toast({
        title: "تم إضافة التعليق",
        description: "تم إضافة التعليق بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "خطأ في إضافة التعليق",
        description: "حدث خطأ أثناء إضافة التعليق",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // محتوى شريط التحميل
  if (isLoading) {
    return (
      <DashboardLayout title="تفاصيل المهمة">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded-md w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded-md w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded-md w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-24 bg-gray-200 rounded-md"></div>
              <div className="h-24 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // إذا لم يتم العثور على المهمة
  if (!task) {
    return (
      <DashboardLayout title="تفاصيل المهمة">
        <div className="max-w-5xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">لم يتم العثور على المهمة</h2>
          <p className="text-gray-600 mb-6">المهمة غير موجودة أو تم حذفها</p>
          <Button 
            onClick={() => navigate('/dashboard/agency/tasks')}
            className="gap-2"
          >
            <RiArrowGoBackLine />
            العودة للمهام
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title={task.title}>
      <motion.div 
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* شريط العنوان */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500"
                onClick={() => navigate(`/dashboard/agency/projects/${task.project.id}`)}
              >
                <RiArrowGoBackLine className="ml-1" />
                العودة للمشروع:&nbsp;
                <span className="font-bold text-primary">{task.project.name}</span>
              </Button>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{task.title}</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <StatusBadge status={task.status} />
            
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border">
                <AvatarImage src={task.assignedTo.avatar} alt={task.assignedTo.name} />
                <AvatarFallback>{task.assignedTo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{task.assignedTo.name}</span>
            </div>
          </div>
        </div>
        
        {/* شريط التقدم */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-1">
            <span>التقدم</span>
            <span>{task.progress}%</span>
          </div>
          <Progress value={task.progress} className="h-2" />
        </div>
        
        {/* بطاقة التفاصيل الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>تفاصيل المهمة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                  <RiCalendarLine className="ml-1" />
                  تاريخ الإسناد
                </h4>
                <p className="text-sm">
                  {format(new Date(task.createdAt), 'dd MMMM yyyy', { locale: ar })}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                  <RiCalendarLine className="ml-1" />
                  تاريخ التسليم
                </h4>
                <p className="text-sm">
                  {format(new Date(task.dueDate), 'dd MMMM yyyy', { locale: ar })}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                  <RiUserLine className="ml-1" />
                  الموظف المكلف
                </h4>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={task.assignedTo.avatar} alt={task.assignedTo.name} />
                    <AvatarFallback>{task.assignedTo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assignedTo.name}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                  <RiArrowRightLine className="ml-1" />
                  آخر تحديث
                </h4>
                <p className="text-sm">
                  {format(new Date(task.updatedAt), 'dd MMMM yyyy', { locale: ar })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* المرفقات والتعليقات */}
        <Tabs defaultValue="attachments" className="mb-8">
          <TabsList>
            <TabsTrigger value="attachments" className="gap-1">
              <RiAttachmentLine />
              المرفقات <Badge className="mr-1">{attachments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1">
              <RiChat1Line />
              التعليقات <Badge className="mr-1">{comments.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="attachments" className="pt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>ملفات المهمة</CardTitle>
                  <Button variant="outline" size="sm" className="gap-1">
                    <RiUploadCloud2Line />
                    رفع ملف جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {attachments.length > 0 ? (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <AttachmentCard key={attachment.id} attachment={attachment} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <RiAttachmentLine className="mx-auto mb-2 text-3xl" />
                    <p>لا توجد ملفات مرفقة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comments" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>تعليقات المهمة</CardTitle>
                <CardDescription>إضافة ملاحظات أو مشكلات مرتبطة بتنفيذ المهمة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{comment.createdBy}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'dd MMM yyyy', { locale: ar })}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <RiChat1Line className="mx-auto mb-2 text-3xl" />
                      <p>لا توجد تعليقات بعد</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Textarea 
                    placeholder="أضف تعليقاً أو ملاحظة..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-2"
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="gap-1"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                    ) : (
                      <RiChat1Line />
                    )}
                    إضافة تعليق
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* تحديث حالة المهمة */}
        <Card>
          <CardHeader>
            <CardTitle>تحديث حالة المهمة</CardTitle>
            <CardDescription>يمكنك تحديث حالة المهمة لتعكس وضعها الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-full sm:w-64">
                <Select 
                  value={newStatus} 
                  onValueChange={setNewStatus as (value: string) => void}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حالة المهمة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">مفتوحة</SelectItem>
                    <SelectItem value="in_review">قيد المراجعة</SelectItem>
                    <SelectItem value="completed">مكتملة</SelectItem>
                    <SelectItem value="late">متأخرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleStatusUpdate}
                disabled={!newStatus || isSubmitting || newStatus === task.status}
                className="gap-1"
              >
                {isSubmitting ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                ) : (
                  <RiCheckLine />
                )}
                تحديث الحالة
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}