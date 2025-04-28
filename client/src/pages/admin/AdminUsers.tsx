import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import useToast from '@/hooks/useToast';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'agency' | 'client' | 'employee';
  agencyId: number | null;
  status: 'active' | 'inactive';
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const toast = useToast();

  // Form state for new user
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'agency' as const,
    agencyId: null as number | null,
    status: 'active' as const
  });

  // Fetch users
  const { data, isLoading, isError } = useQuery<{ users: User[] }>({
    queryKey: ['/api/admin/users'],
  });

  // Create user mutation
  const createUser = useMutation({
    mutationFn: (userData: typeof newUser) => 
      apiRequest('POST', '/api/admin/users', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast.success('تم بنجاح', 'تمت إضافة المستخدم بنجاح');
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('خطأ', 'فشل في إضافة المستخدم');
      console.error('Failed to create user:', error);
    }
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: (userId: number) => 
      apiRequest('DELETE', `/api/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast.success('تم بنجاح', 'تم حذف المستخدم بنجاح');
    },
    onError: (error) => {
      toast.error('خطأ', 'فشل في حذف المستخدم');
      console.error('Failed to delete user:', error);
    }
  });

  // Update user status mutation
  const updateUserStatus = useMutation({
    mutationFn: ({ userId, status }: { userId: number, status: 'active' | 'inactive' }) => 
      apiRequest('PUT', `/api/admin/users/${userId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast.success('تم بنجاح', 'تم تحديث حالة المستخدم بنجاح');
    },
    onError: (error) => {
      toast.error('خطأ', 'فشل في تحديث حالة المستخدم');
      console.error('Failed to update user status:', error);
    }
  });

  // Reset form
  const resetForm = () => {
    setNewUser({
      name: '',
      email: '',
      role: 'agency',
      agencyId: null,
      status: 'active'
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(newUser);
  };

  // Filter users
  const filteredUsers = data?.users.filter(user => {
    // Filter by search term
    if (searchTerm && !user.name.includes(searchTerm) && !user.email.includes(searchTerm)) {
      return false;
    }
    
    // Filter by role
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== 'all' && user.status !== statusFilter) {
      return false;
    }
    
    return true;
  }) || [];

  // Get role text in Arabic
  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير';
      case 'agency':
        return 'وكالة';
      case 'client':
        return 'عميل';
      case 'employee':
        return 'موظف';
      default:
        return role;
    }
  };

  // Get role color class
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'agency':
        return 'bg-blue-100 text-blue-800';
      case 'client':
        return 'bg-green-100 text-green-800';
      case 'employee':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout title="إدارة المستخدمين">
      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">إدارة المستخدمين</h2>
            <p className="text-gray-600">إضافة وتعديل وحذف المستخدمين في النظام</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-animate bg-secondary hover:bg-opacity-90 text-white">
                <i className="fas fa-user-plus ml-2"></i>
                <span>إضافة مستخدم جديد</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم</Label>
                  <Input 
                    id="name" 
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="أدخل اسم المستخدم" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="أدخل البريد الإلكتروني" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">الدور</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({...newUser, role: value as any})}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير</SelectItem>
                      <SelectItem value="agency">وكالة</SelectItem>
                      <SelectItem value="client">عميل</SelectItem>
                      <SelectItem value="employee">موظف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(newUser.role === 'client' || newUser.role === 'employee') && (
                  <div className="space-y-2">
                    <Label htmlFor="agencyId">الوكالة</Label>
                    <Select 
                      value={newUser.agencyId?.toString() || ""} 
                      onValueChange={(value) => setNewUser({...newUser, agencyId: value ? parseInt(value) : null})}
                    >
                      <SelectTrigger id="agencyId">
                        <SelectValue placeholder="اختر الوكالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">وكالة الرقمية</SelectItem>
                        <SelectItem value="2">وكالة الإبداع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select 
                    value={newUser.status} 
                    onValueChange={(value) => setNewUser({...newUser, status: value as any})}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">مفعل</SelectItem>
                      <SelectItem value="inactive">غير مفعل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="btn-animate bg-primary hover:bg-opacity-90 text-white"
                    disabled={createUser.isPending}
                  >
                    {createUser.isPending ? (
                      <span className="flex items-center gap-2">
                        <i className="fas fa-spinner fa-spin"></i>
                        جاري الإضافة...
                      </span>
                    ) : (
                      'إضافة المستخدم'
                    )}
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
              placeholder="البحث عن مستخدم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="agency">وكالة</SelectItem>
                <SelectItem value="client">عميل</SelectItem>
                <SelectItem value="employee">موظف</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">مفعل</SelectItem>
                <SelectItem value="inactive">غير مفعل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
              <p>جاري تحميل البيانات...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-500">
              <i className="fas fa-exclamation-circle text-3xl mb-4"></i>
              <p>حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-users text-4xl text-gray-300 mb-2"></i>
              <p className="text-gray-500">لا يوجد مستخدمين يطابقون معايير البحث</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستخدم
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      البريد الإلكتروني
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الدور
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الوكالة
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=5A47FF&color=fff`} 
                            alt={user.name}
                          />
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleText(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.agencyId ? 'وكالة الرقمية' : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'active' ? 'مفعل' : 'غير مفعل'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => updateUserStatus.mutate({
                              userId: user.id, 
                              status: user.status === 'active' ? 'inactive' : 'active'
                            })}
                            title={user.status === 'active' ? 'تعطيل' : 'تفعيل'}
                          >
                            <i className={`fas ${user.status === 'active' ? 'fa-toggle-on text-green-500' : 'fa-toggle-off text-gray-400'}`}></i>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم؟')) {
                                deleteUser.mutate(user.id);
                              }
                            }}
                            title="حذف"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
