import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useToast from '@/hooks/useToast';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  avatarColor: string;
  tasksCount: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  performanceRate: number;
}

export default function AgencyTeam() {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const toast = useToast();
  
  // Mock data for team members
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'علي محمد',
      position: 'مطور ويب',
      email: 'ali@example.com',
      phone: '01234567890',
      avatarColor: '5A47FF',
      tasksCount: {
        total: 12,
        completed: 8,
        inProgress: 3,
        overdue: 1,
      },
      performanceRate: 85,
    },
    {
      id: '2',
      name: 'سارة أحمد',
      position: 'مصممة UI/UX',
      email: 'sara@example.com',
      phone: '01234567891',
      avatarColor: '00BFA6',
      tasksCount: {
        total: 15,
        completed: 12,
        inProgress: 3,
        overdue: 0,
      },
      performanceRate: 92,
    },
    {
      id: '3',
      name: 'محمد خالد',
      position: 'مطور تطبيقات',
      email: 'mohamed@example.com',
      phone: '01234567892',
      avatarColor: 'F59E0B',
      tasksCount: {
        total: 10,
        completed: 7,
        inProgress: 2,
        overdue: 1,
      },
      performanceRate: 78,
    },
    {
      id: '4',
      name: 'فاطمة علي',
      position: 'مديرة مشاريع',
      email: 'fatma@example.com',
      phone: '01234567893',
      avatarColor: '5A47FF',
      tasksCount: {
        total: 8,
        completed: 6,
        inProgress: 2,
        overdue: 0,
      },
      performanceRate: 95,
    },
    {
      id: '5',
      name: 'أحمد إبراهيم',
      position: 'مطور واجهات',
      email: 'ahmed@example.com',
      phone: '01234567894',
      avatarColor: '5A47FF',
      tasksCount: {
        total: 14,
        completed: 9,
        inProgress: 4,
        overdue: 1,
      },
      performanceRate: 80,
    },
    {
      id: '6',
      name: 'ريم خالد',
      position: 'كاتبة محتوى',
      email: 'reem@example.com',
      phone: '01234567895',
      avatarColor: '00BFA6',
      tasksCount: {
        total: 9,
        completed: 7,
        inProgress: 2,
        overdue: 0,
      },
      performanceRate: 88,
    },
  ];
  
  // Filter team members
  const filteredTeamMembers = teamMembers.filter((member) => {
    if (searchTerm && !member.name.includes(searchTerm) && !member.position.includes(searchTerm)) {
      return false;
    }
    
    return true;
  });
  
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would add a team member via API
    toast.success('تم بنجاح', 'تمت إضافة عضو جديد للفريق');
    setOpen(false);
  };
  
  return (
    <DashboardLayout title="فريق العمل">
      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">إدارة فريق العمل</h2>
            <p className="text-gray-600">إضافة ومتابعة أعضاء فريق العمل وأدائهم</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-animate bg-secondary hover:bg-opacity-90 text-white">
                <i className="fas fa-user-plus ml-2"></i>
                <span>إضافة عضو جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة عضو جديد للفريق</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleAddMember} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="memberName">الاسم</Label>
                  <Input id="memberName" placeholder="أدخل الاسم" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="memberPosition">المنصب</Label>
                  <Input id="memberPosition" placeholder="أدخل المنصب" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="memberEmail">البريد الإلكتروني</Label>
                  <Input id="memberEmail" type="email" placeholder="أدخل البريد الإلكتروني" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="memberPhone">رقم الهاتف</Label>
                  <Input id="memberPhone" placeholder="أدخل رقم الهاتف" />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" className="btn-animate bg-primary hover:bg-opacity-90 text-white">
                    إضافة عضو
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
          placeholder="البحث عن عضو الفريق..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>
      
      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeamMembers.length > 0 ? (
          filteredTeamMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=${member.avatarColor}&color=fff&size=64`}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-gray-500">{member.position}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-envelope text-gray-400"></i>
                    <span className="text-sm">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-phone text-gray-400"></i>
                    <span className="text-sm">{member.phone}</span>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">معدل الأداء</span>
                      <span className="text-sm font-medium">{member.performanceRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`rounded-full h-2 ${
                          member.performanceRate >= 90 ? 'bg-green-500' : 
                          member.performanceRate >= 70 ? 'bg-primary' : 
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${member.performanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-blue-50 p-2 rounded-md">
                      <p className="text-xs text-gray-500">المهام المكتملة</p>
                      <p className="font-bold text-primary">{member.tasksCount.completed}</p>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded-md">
                      <p className="text-xs text-gray-500">المهام الجارية</p>
                      <p className="font-bold text-yellow-600">{member.tasksCount.inProgress}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded-md">
                      <p className="text-xs text-gray-500">المهام المتأخرة</p>
                      <p className="font-bold text-red-500">{member.tasksCount.overdue}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-md">
                      <p className="text-xs text-gray-500">إجمالي المهام</p>
                      <p className="font-bold text-gray-700">{member.tasksCount.total}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <i className="fas fa-users text-4xl text-gray-300 mb-2"></i>
            <p className="text-gray-500">لا يوجد أعضاء فريق يطابقون معايير البحث</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
