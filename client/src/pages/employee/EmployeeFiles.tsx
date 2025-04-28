import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function EmployeeFiles() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  
  // Files data
  const files = [
    {
      id: '1',
      name: 'logo-final.ai',
      type: 'image',
      size: '2.4MB',
      task: 'تصميم الشعار الجديد',
      project: 'إعادة تصميم الهوية البصرية',
      uploadedAt: '05/10/2023',
    },
    {
      id: '2',
      name: 'logo-variations.pdf',
      type: 'document',
      size: '4.1MB',
      task: 'تصميم الشعار الجديد',
      project: 'إعادة تصميم الهوية البصرية',
      uploadedAt: '05/10/2023',
    },
    {
      id: '3',
      name: 'website-design-v1.psd',
      type: 'image',
      size: '24.8MB',
      task: 'تصميم الموقع الإلكتروني',
      project: 'تطوير موقع شركة السلام',
      uploadedAt: '01/10/2023',
    },
    {
      id: '4',
      name: 'homepage-mockup.jpg',
      type: 'image',
      size: '1.2MB',
      task: 'تصميم الموقع الإلكتروني',
      project: 'تطوير موقع شركة السلام',
      uploadedAt: '01/10/2023',
    },
    {
      id: '5',
      name: 'banners-pack.zip',
      type: 'archive',
      size: '14.5MB',
      task: 'تصميم البانرات الإعلانية',
      project: 'الحملة التسويقية',
      uploadedAt: '28/09/2023',
    },
    {
      id: '6',
      name: 'brochure-final.pdf',
      type: 'document',
      size: '8.2MB',
      task: 'تصميم الكتيب التعريفي',
      project: 'إعادة تصميم الهوية البصرية',
      uploadedAt: '20/09/2023',
    },
    {
      id: '7',
      name: 'brochure-mockup.jpg',
      type: 'image',
      size: '1.8MB',
      task: 'تصميم الكتيب التعريفي',
      project: 'إعادة تصميم الهوية البصرية',
      uploadedAt: '20/09/2023',
    },
    {
      id: '8',
      name: 'business-cards.ai',
      type: 'image',
      size: '3.4MB',
      task: 'تصميم بطاقات العمل',
      project: 'إعادة تصميم الهوية البصرية',
      uploadedAt: '15/09/2023',
    },
  ];

  // Filter files based on search query and file type
  const filteredFiles = files.filter((file) => {
    const matchesQuery = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.project.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = fileTypeFilter === 'all' || file.type === fileTypeFilter;
    
    return matchesQuery && matchesType;
  });

  // Group files by project
  const filesByProject = filteredFiles.reduce((acc, file) => {
    if (!acc[file.project]) {
      acc[file.project] = [];
    }
    acc[file.project].push(file);
    return acc;
  }, {} as Record<string, typeof files>);

  return (
    <DashboardLayout title="الملفات">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-72">
          <Input
            placeholder="ابحث عن ملفات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="نوع الملف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="image">صور</SelectItem>
              <SelectItem value="document">مستندات</SelectItem>
              <SelectItem value="archive">ملفات مضغوطة</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <i className="fas fa-upload ml-2"></i>
            رفع ملف
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="by-project">
        <TabsList className="mb-6">
          <TabsTrigger value="by-project">حسب المشروع</TabsTrigger>
          <TabsTrigger value="recent">الملفات الأخيرة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="by-project">
          {Object.keys(filesByProject).length > 0 ? (
            Object.entries(filesByProject).map(([project, files]) => (
              <div key={project} className="mb-8">
                <h2 className="text-lg font-bold mb-4">{project}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-500">لا توجد ملفات</h3>
              <p className="text-gray-400">لم يتم العثور على ملفات مطابقة لبحثك</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.length > 0 ? (
              filteredFiles
                .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                .map((file) => (
                  <FileCard key={file.id} file={file} />
                ))
            ) : (
              <div className="text-center py-12 col-span-3">
                <div className="text-6xl text-gray-300 mb-4">
                  <i className="fas fa-file-alt"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-500">لا توجد ملفات</h3>
                <p className="text-gray-400">لم يتم العثور على ملفات مطابقة لبحثك</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Upload File Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>رفع ملف جديد</DialogTitle>
            <DialogDescription>
              اختر الملف الذي تريد رفعه وحدد المشروع والمهمة المرتبطة به.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fileUpload">الملف</Label>
              <Input 
                id="fileUpload" 
                type="file" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectSelect">المشروع</Label>
              <Select>
                <SelectTrigger id="projectSelect">
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">تطوير موقع شركة السلام</SelectItem>
                  <SelectItem value="2">إعادة تصميم الهوية البصرية</SelectItem>
                  <SelectItem value="3">الحملة التسويقية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taskSelect">المهمة</Label>
              <Select>
                <SelectTrigger id="taskSelect">
                  <SelectValue placeholder="اختر المهمة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">تصميم الصفحة الرئيسية</SelectItem>
                  <SelectItem value="2">تصميم الشعار الجديد</SelectItem>
                  <SelectItem value="3">تصميم البانرات الإعلانية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">وصف الملف (اختياري)</Label>
              <Input 
                id="description" 
                placeholder="أضف وصفًا مختصرًا للملف..." 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUploadDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                // Here would be the logic to upload the file
                setIsUploadDialogOpen(false);
              }}
            >
              رفع الملف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// File Card Component
function FileCard({ file }: { file: any }) {
  // Determine file icon based on type
  const getFileIcon = (type: string, name: string) => {
    if (type === 'image') {
      const ext = name.split('.').pop()?.toLowerCase();
      
      if (ext === 'ai' || ext === 'psd') {
        return 'fas fa-file-image';
      }
      
      return 'fas fa-image';
    }
    
    if (type === 'document') {
      const ext = name.split('.').pop()?.toLowerCase();
      
      if (ext === 'pdf') {
        return 'fas fa-file-pdf';
      }
      
      if (ext === 'doc' || ext === 'docx') {
        return 'fas fa-file-word';
      }
      
      return 'fas fa-file-alt';
    }
    
    if (type === 'archive') {
      return 'fas fa-file-archive';
    }
    
    return 'fas fa-file';
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gray-50 flex items-center justify-center py-6">
        <i className={`${getFileIcon(file.type, file.name)} text-4xl text-gray-400`}></i>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm truncate" title={file.name}>
            {file.name}
          </h3>
          <span className="text-xs text-gray-500">{file.size}</span>
        </div>
        
        <p className="text-xs text-gray-500 mb-3">{file.task}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">{file.uploadedAt}</span>
          
          <div className="flex space-x-1 space-x-reverse">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <i className="fas fa-download text-gray-500"></i>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <i className="fas fa-share-alt text-gray-500"></i>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}