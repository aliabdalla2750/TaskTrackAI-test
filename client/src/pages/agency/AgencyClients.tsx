import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useToast from '@/hooks/useToast';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  activeProjects: number;
  completedProjects: number;
  avatarColor: string;
}

export default function AgencyClients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const toast = useToast();
  
  // Mock data for clients
  const clients: Client[] = [
    {
      id: '1',
      name: 'شركة السلام',
      email: 'info@alsalam.com',
      phone: '01234567890',
      company: 'شركة السلام للاستشارات الهندسية',
      activeProjects: 2,
      completedProjects: 1,
      avatarColor: '5A47FF',
    },
    {
      id: '2',
      name: 'شركة النور',
      email: 'info@alnoor.com',
      phone: '01234567891',
      company: 'شركة النور للمنتجات الغذائية',
      activeProjects: 1,
      completedProjects: 2,
      avatarColor: '00BFA6',
    },
    {
      id: '3',
      name: 'شركة العالمية',
      email: 'info@international.com',
      phone: '01234567892',
      company: 'الشركة العالمية للخدمات الإلكترونية',
      activeProjects: 1,
      completedProjects: 0,
      avatarColor: 'F59E0B',
    },
    {
      id: '4',
      name: 'مؤسسة الإبداع',
      email: 'info@creativity.com',
      phone: '01234567893',
      company: 'مؤسسة الإبداع للحلول التسويقية',
      activeProjects: 0,
      completedProjects: 3,
      avatarColor: 'EF4444',
    },
  ];
  
  // Filter clients
  const filteredClients = clients.filter((client) => {
    if (searchTerm && !client.name.includes(searchTerm) && !client.company.includes(searchTerm)) {
      return false;
    }
    
    return true;
  });
  
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would add a client via API
    toast.success('تم بنجاح', 'تمت إضافة عميل جديد');
    setOpen(false);
  };
  
  return (
    <DashboardLayout title="العملاء">
      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">إدارة العملاء</h2>
            <p className="text-gray-600">إضافة ومتابعة العملاء ومشاريعهم</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-animate bg-secondary hover:bg-opacity-90 text-white">
                <i className="fas fa-user-plus ml-2"></i>
                <span>إضافة عميل جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleAddClient} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">اسم العميل</Label>
                  <Input id="clientName" placeholder="أدخل اسم العميل" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientCompany">اسم الشركة</Label>
                  <Input id="clientCompany" placeholder="أدخل اسم الشركة" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">البريد الإلكتروني</Label>
                  <Input id="clientEmail" type="email" placeholder="أدخل البريد الإلكتروني" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">رقم الهاتف</Label>
                  <Input id="clientPhone" placeholder="أدخل رقم الهاتف" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientNotes">ملاحظات</Label>
                  <Textarea id="clientNotes" placeholder="أدخل أي ملاحظات إضافية..." />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" className="btn-animate bg-primary hover:bg-opacity-90 text-white">
                    إضافة عميل
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <Input
          placeholder="البحث عن عميل..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>
      
      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <Card key={client.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=${client.avatarColor}&color=fff&size=64`}
                      alt={client.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <p className="text-sm text-gray-500">{client.company}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-envelope text-gray-400"></i>
                    <span className="text-sm">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-phone text-gray-400"></i>
                    <span className="text-sm">{client.phone}</span>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">المشاريع النشطة</span>
                      <span className="text-sm font-medium text-primary">{client.activeProjects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">المشاريع المكتملة</span>
                      <span className="text-sm font-medium text-secondary">{client.completedProjects}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <i className="fas fa-folder-open ml-2"></i>
                      <span>المشاريع</span>
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <i className="fas fa-edit ml-2"></i>
                      <span>تعديل</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <i className="fas fa-user-tie text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-500">لا يوجد عملاء يطابقون معايير البحث</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
