import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EmployeeSubmissions() {
  // Submissions data
  const submissions = [
    {
      id: '1',
      taskTitle: 'تصميم الشعار الجديد',
      project: 'إعادة تصميم الهوية البصرية',
      submittedAt: '05/10/2023',
      status: 'مقبول',
      feedback: 'عمل ممتاز، تم تنفيذ جميع المطلوبات بشكل دقيق.',
      files: [
        { name: 'logo-final.ai', size: '2.4MB' },
        { name: 'logo-variations.pdf', size: '4.1MB' },
      ],
    },
    {
      id: '2',
      taskTitle: 'تصميم الموقع الإلكتروني',
      project: 'تطوير موقع شركة السلام',
      submittedAt: '01/10/2023',
      status: 'مرفوض',
      feedback: 'يرجى تعديل الألوان لتتناسب مع الهوية البصرية للشركة، وتحسين توزيع العناصر في الصفحة الرئيسية.',
      files: [
        { name: 'website-design-v1.psd', size: '24.8MB' },
        { name: 'homepage-mockup.jpg', size: '1.2MB' },
      ],
    },
    {
      id: '3',
      taskTitle: 'تصميم البانرات الإعلانية',
      project: 'الحملة التسويقية',
      submittedAt: '28/09/2023',
      status: 'قيد المراجعة',
      feedback: null,
      files: [
        { name: 'banners-pack.zip', size: '14.5MB' },
      ],
    },
    {
      id: '4',
      taskTitle: 'تصميم الكتيب التعريفي',
      project: 'إعادة تصميم الهوية البصرية',
      submittedAt: '20/09/2023',
      status: 'مقبول',
      feedback: 'تصميم رائع ومتناسق مع الهوية البصرية الجديدة.',
      files: [
        { name: 'brochure-final.pdf', size: '8.2MB' },
        { name: 'brochure-mockup.jpg', size: '1.8MB' },
      ],
    },
    {
      id: '5',
      taskTitle: 'تصميم بطاقات العمل',
      project: 'إعادة تصميم الهوية البصرية',
      submittedAt: '15/09/2023',
      status: 'مقبول مع تعديلات',
      feedback: 'التصميم جيد، لكن يجب تعديل حجم الخط واختيار لون أكثر تباينًا للنص.',
      files: [
        { name: 'business-cards.ai', size: '3.4MB' },
      ],
    },
  ];

  return (
    <DashboardLayout title="التسليمات">
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">جميع التسليمات</TabsTrigger>
          <TabsTrigger value="accepted">مقبولة</TabsTrigger>
          <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
          <TabsTrigger value="rejected">مرفوضة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-4">
            {submissions.map((submission) => (
              <SubmissionCard 
                key={submission.id} 
                submission={submission} 
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="accepted">
          <div className="grid grid-cols-1 gap-4">
            {submissions
              .filter((submission) => submission.status === 'مقبول' || submission.status === 'مقبول مع تعديلات')
              .map((submission) => (
                <SubmissionCard 
                  key={submission.id} 
                  submission={submission} 
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="pending">
          <div className="grid grid-cols-1 gap-4">
            {submissions
              .filter((submission) => submission.status === 'قيد المراجعة')
              .map((submission) => (
                <SubmissionCard 
                  key={submission.id} 
                  submission={submission} 
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="rejected">
          <div className="grid grid-cols-1 gap-4">
            {submissions
              .filter((submission) => submission.status === 'مرفوض')
              .map((submission) => (
                <SubmissionCard 
                  key={submission.id} 
                  submission={submission} 
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

// Submission Card Component
function SubmissionCard({ submission }: { submission: any }) {
  // Determine badge color based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'مقبول':
        return 'default';
      case 'مقبول مع تعديلات':
        return 'secondary';
      case 'قيد المراجعة':
        return 'outline';
      case 'مرفوض':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold">{submission.taskTitle}</h3>
                <p className="text-sm text-gray-500">{submission.project}</p>
              </div>
              <Badge variant={getBadgeVariant(submission.status)}>
                {submission.status}
              </Badge>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">الملفات المرفقة:</h4>
              <div className="space-y-2">
                {submission.files.map((file: any, index: number) => (
                  <div key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
                    <i className="fas fa-file ml-2 text-gray-400"></i>
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500 mr-2">({file.size})</span>
                    <Button variant="ghost" size="sm" className="mr-auto">
                      <i className="fas fa-download"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {submission.feedback && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">تعليقات:</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  {submission.feedback}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-500">تاريخ التسليم: </span>
                <span className="font-medium">{submission.submittedAt}</span>
              </div>
              
              {submission.status === 'مرفوض' && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <i className="fas fa-redo ml-2"></i>
                  إعادة تسليم
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}