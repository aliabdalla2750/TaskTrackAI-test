import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import useToast from '@/hooks/useToast';

interface File {
  id: string;
  name: string;
  type: string;
  size: string;
  project: string;
  task?: string;
  uploadedBy: string;
  uploadedAt: string;
  thumbnailColor: string;
}

export default function AgencyFiles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const toast = useToast();
  
  // Mock data for files
  const files: File[] = [
    {
      id: '1',
      name: 'تصميم الصفحة الرئيسية.psd',
      type: 'image',
      size: '8.5 MB',
      project: 'تطوير موقع شركة السلام',
      task: 'تصميم الصفحة الرئيسية',
      uploadedBy: 'سارة أحمد',
      uploadedAt: '10/10/2023',
      thumbnailColor: 'blue',
    },
    {
      id: '2',
      name: 'خطة المشروع.pdf',
      type: 'document',
      size: '2.3 MB',
      project: 'تطوير موقع شركة السلام',
      uploadedBy: 'علي محمد',
      uploadedAt: '08/10/2023',
      thumbnailColor: 'red',
    },
    {
      id: '3',
      name: 'تصميمات البانرات.ai',
      type: 'image',
      size: '15.7 MB',
      project: 'حملة تسويقية لمنتج جديد',
      task: 'تصميم بانرات الحملة',
      uploadedBy: 'فاطمة علي',
      uploadedAt: '03/09/2023',
      thumbnailColor: 'yellow',
    },
    {
      id: '4',
      name: 'تقرير الأداء الشهري.xlsx',
      type: 'spreadsheet',
      size: '1.2 MB',
      project: 'حملة تسويقية لمنتج جديد',
      uploadedBy: 'محمد خالد',
      uploadedAt: '01/09/2023',
      thumbnailColor: 'green',
    },
    {
      id: '5',
      name: 'واجهة المستخدم.sketch',
      type: 'image',
      size: '10.8 MB',
      project: 'تطوير تطبيق الهاتف',
      task: 'تطوير واجهة المستخدم',
      uploadedBy: 'أحمد إبراهيم',
      uploadedAt: '20/09/2023',
      thumbnailColor: 'purple',
    },
    {
      id: '6',
      name: 'عقد المشروع.docx',
      type: 'document',
      size: '523 KB',
      project: 'تطوير تطبيق الهاتف',
      uploadedBy: 'فاطمة علي',
      uploadedAt: '15/09/2023',
      thumbnailColor: 'blue',
    },
  ];
  
  // Projects for filter
  const projects = [
    { id: '1', name: 'تطوير موقع شركة السلام' },
    { id: '2', name: 'حملة تسويقية لمنتج جديد' },
    { id: '3', name: 'تطوير تطبيق الهاتف' },
  ];
  
  // Filter files
  const filteredFiles = files.filter((file) => {
    // Filter by search term
    if (searchTerm && !file.name.includes(searchTerm)) {
      return false;
    }
    
    // Filter by project
    if (projectFilter !== 'all' && file.project !== projectFilter) {
      return false;
    }
    
    // Filter by type
    if (typeFilter !== 'all' && file.type !== typeFilter) {
      return false;
    }
    
    return true;
  });
  
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return 'fa-file-image';
      case 'document':
        return 'fa-file-alt';
      case 'spreadsheet':
        return 'fa-file-excel';
      default:
        return 'fa-file';
    }
  };
  
  const getThumbnailColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'red':
        return 'bg-red-100 text-red-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would upload a file via API
    toast.success('تم بنجاح', 'تم رفع الملف بنجاح');
    setOpen(false);
  };
  
  return (
    <DashboardLayout title="الملفات">
      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">إدارة الملفات</h2>
            <p className="text-gray-600">رفع وتنظيم الملفات الخاصة بالمشاريع والمهام</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-animate bg-secondary hover:bg-opacity-90 text-white">
                <i className="fas fa-upload ml-2"></i>
                <span>رفع ملف جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>رفع ملف جديد</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleUploadFile} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fileUpload">اختر الملف</Label>
                  <Input id="fileUpload" type="file" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fileProject">المشروع المرتبط</Label>
                  <Select>
                    <SelectTrigger id="fileProject">
                      <SelectValue placeholder="اختر المشروع" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.name}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fileTask">المهمة المرتبطة (اختياري)</Label>
                  <Select>
                    <SelectTrigger id="fileTask">
                      <SelectValue placeholder="اختر المهمة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task1">تصميم الصفحة الرئيسية</SelectItem>
                      <SelectItem value="task2">برمجة وظائف التسجيل</SelectItem>
                      <SelectItem value="task3">تصميم بانرات الحملة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fileDescription">وصف الملف (اختياري)</Label>
                  <Input id="fileDescription" placeholder="أدخل وصف الملف" />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" className="btn-animate bg-primary hover:bg-opacity-90 text-white">
                    رفع الملف
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="البحث عن ملف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="المشروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المشاريع</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.name}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="نوع الملف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="image">صور وتصاميم</SelectItem>
                <SelectItem value="document">مستندات</SelectItem>
                <SelectItem value="spreadsheet">جداول بيانات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex items-center p-4 border-b">
                  <div className={`w-10 h-10 rounded-md ${getThumbnailColor(file.thumbnailColor)} flex items-center justify-center mr-3`}>
                    <i className={`fas ${getFileIcon(file.type)} text-lg`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{file.name}</h3>
                    <p className="text-gray-500 text-xs">{file.size}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>
                
                <div className="p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">المشروع:</span>
                    <span className="font-medium truncate max-w-[180px]">{file.project}</span>
                  </div>
                  
                  {file.task && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">المهمة:</span>
                      <span className="font-medium truncate max-w-[180px]">{file.task}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">تم الرفع بواسطة:</span>
                    <span className="font-medium">{file.uploadedBy}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">تاريخ الرفع:</span>
                    <span className="font-medium">{file.uploadedAt}</span>
                  </div>
                  
                  <div className="flex justify-between pt-3 mt-3 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <i className="fas fa-eye ml-1"></i>
                      <span>عرض</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 mr-2">
                      <i className="fas fa-download ml-1"></i>
                      <span>تحميل</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <i className="fas fa-file-alt text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-500">لا توجد ملفات تطابق معايير البحث</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
