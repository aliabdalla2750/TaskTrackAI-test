import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useToast from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Types
interface Client {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  agencyId: number;
  rating: number | null;
  payment_status: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface ClientRating {
  id: number;
  clientId: number;
  projectId: number;
  rating: number;
  comment: string | null;
  type: string;
  createdBy: number;
  createdAt: string;
}

interface ClientNote {
  id: number;
  clientId: number;
  note: string;
  type: string;
  authorId: number;
  createdAt: string;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  agencyId: number;
}

interface RatingFormData {
  projectId: number;
  rating: number;
  comment: string;
  type: string;
  createdBy: number;
}

interface NoteFormData {
  note: string;
  type: string;
  authorId: number;
}

export default function AgencyClients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTab, setSelectedTab] = useState('details');
  const toast = useToast();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Temporary agency ID (in production this would come from auth context)
  const agencyId = 1;
  const userId = 1; // Current user ID
  
  // Form state
  const [clientForm, setClientForm] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    agencyId
  });
  
  const [ratingForm, setRatingForm] = useState<RatingFormData>({
    projectId: 1, // Default value, would be selected from projects
    rating: 5,
    comment: '',
    type: 'positive',
    createdBy: userId
  });
  
  const [noteForm, setNoteForm] = useState<NoteFormData>({
    note: '',
    type: 'neutral',
    authorId: userId
  });
  
  // Client Data Fetching
  const { 
    data: clients = [], 
    isLoading: isLoadingClients,
    error: clientsError,
    refetch: refetchClients
  } = useQuery({
    queryKey: ['/api/clients', { agencyId }],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/clients?agencyId=${agencyId}`);
      return await response.json();
    }
  });
  
  // Client Ratings and Notes for selected client
  const {
    data: clientRatings = [],
    isLoading: isLoadingRatings,
    refetch: refetchRatings
  } = useQuery({
    queryKey: ['/api/clients/ratings', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];
      const response = await apiRequest('GET', `/api/clients/${selectedClient.id}/ratings`);
      return await response.json();
    },
    enabled: !!selectedClient
  });
  
  const {
    data: clientNotes = [],
    isLoading: isLoadingNotes,
    refetch: refetchNotes
  } = useQuery({
    queryKey: ['/api/clients/notes', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];
      const response = await apiRequest('GET', `/api/clients/${selectedClient.id}/notes`);
      return await response.json();
    },
    enabled: !!selectedClient
  });
  
  // Mutations
  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await apiRequest('POST', '/api/clients', data);
      return await response.json();
    },
    onSuccess: () => {
      toast.success("تم بنجاح", "تمت إضافة العميل الجديد");
      setClientDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      resetClientForm();
    },
    onError: (error) => {
      toast.error("خطأ", "حدث خطأ أثناء إضافة العميل");
    }
  });
  
  const createRatingMutation = useMutation({
    mutationFn: async (data: RatingFormData) => {
      if (!selectedClient) throw new Error("لم يتم تحديد عميل");
      const response = await apiRequest('POST', `/api/clients/${selectedClient.id}/ratings`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تمت إضافة التقييم",
        variant: "success"
      });
      setRatingDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/clients/ratings'] });
      resetRatingForm();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة التقييم",
        variant: "destructive"
      });
    }
  });
  
  const createNoteMutation = useMutation({
    mutationFn: async (data: NoteFormData) => {
      if (!selectedClient) throw new Error("لم يتم تحديد عميل");
      const response = await apiRequest('POST', `/api/clients/${selectedClient.id}/notes`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تمت إضافة الملاحظة",
        variant: "success"
      });
      setNoteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/clients/notes'] });
      resetNoteForm();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الملاحظة",
        variant: "destructive"
      });
    }
  });
  
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ clientId, status }: { clientId: number, status: string }) => {
      const response = await apiRequest('PUT', `/api/clients/${clientId}/payment-status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم تحديث حالة الدفع",
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الدفع",
        variant: "destructive"
      });
    }
  });
  
  // Calculate payment status automatically
  const calculatePaymentStatusMutation = useMutation({
    mutationFn: async (clientId: number) => {
      const response = await apiRequest('POST', `/api/clients/${clientId}/calculate-payment-status`);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم بنجاح",
        description: `تم تحديث حالة الدفع إلى ${getPaymentStatusLabel(data.paymentStatus)}`,
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حساب حالة الدفع",
        variant: "destructive"
      });
    }
  });
  
  // Form Handlers
  const resetClientForm = () => {
    setClientForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      agencyId
    });
  };
  
  const resetRatingForm = () => {
    setRatingForm({
      projectId: 1,
      rating: 5,
      comment: '',
      type: 'positive',
      createdBy: userId
    });
  };
  
  const resetNoteForm = () => {
    setNoteForm({
      note: '',
      type: 'neutral',
      authorId: userId
    });
  };
  
  const handleClientFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setClientForm({
      ...clientForm,
      [e.target.id]: e.target.value
    });
  };
  
  const handleRatingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRatingForm({
      ...ratingForm,
      [e.target.id]: e.target.value
    });
  };
  
  const handleNoteFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNoteForm({
      ...noteForm,
      [e.target.id]: e.target.value
    });
  };
  
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    createClientMutation.mutate(clientForm);
  };
  
  const handleAddRating = (e: React.FormEvent) => {
    e.preventDefault();
    createRatingMutation.mutate(ratingForm);
  };
  
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    createNoteMutation.mutate(noteForm);
  };
  
  const handleSelectTypeChange = (id: string, value: string) => {
    if (id === 'ratingType') {
      setRatingForm({
        ...ratingForm,
        type: value
      });
    } else if (id === 'noteType') {
      setNoteForm({
        ...noteForm,
        type: value
      });
    }
  };
  
  const handleRatingChange = (value: string) => {
    setRatingForm({
      ...ratingForm,
      rating: parseInt(value)
    });
  };
  
  const handleOpenClientDetails = (client: Client) => {
    setSelectedClient(client);
    setSelectedTab('details');
  };
  
  const handleChangePaymentStatus = (clientId: number, status: string) => {
    updatePaymentStatusMutation.mutate({ clientId, status });
  };
  
  const handleCalculatePaymentStatus = (clientId: number) => {
    calculatePaymentStatusMutation.mutate(clientId);
  };
  
  // Utility Functions
  const getPaymentStatusColor = (status: string | null) => {
    switch(status) {
      case 'regular': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'stopped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPaymentStatusLabel = (status: string | null) => {
    switch(status) {
      case 'regular': return 'منتظم';
      case 'late': return 'متأخر';
      case 'stopped': return 'متوقف';
      default: return 'غير محدد';
    }
  };
  
  const getRatingTypeColor = (type: string) => {
    switch(type) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'neutral': return 'bg-blue-100 text-blue-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getRatingTypeLabel = (type: string) => {
    switch(type) {
      case 'positive': return 'إيجابي';
      case 'neutral': return 'محايد';
      case 'negative': return 'سلبي';
      default: return 'غير محدد';
    }
  };
  
  const getAvatarColor = (name: string) => {
    const colors = ['5A47FF', '00BFA6', 'F59E0B', 'EF4444', '8B5CF6', '10B981', 'F97316'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  // Filter clients
  const filteredClients = clients.filter((client: Client) => {
    if (searchTerm && 
      !client.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      !(client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }
    return true;
  });
  
  return (
    <DashboardLayout title="العملاء">
      {/* Header Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">إدارة العملاء</h2>
            <p className="text-gray-600">إضافة ومتابعة العملاء وتقييماتهم وحالات الدفع</p>
          </div>
          
          <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
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
                  <Label htmlFor="name">اسم العميل</Label>
                  <Input 
                    id="name" 
                    value={clientForm.name}
                    onChange={handleClientFormChange}
                    placeholder="أدخل اسم العميل" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">اسم الشركة</Label>
                  <Input 
                    id="company" 
                    value={clientForm.company}
                    onChange={handleClientFormChange}
                    placeholder="أدخل اسم الشركة" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={clientForm.email}
                    onChange={handleClientFormChange}
                    placeholder="أدخل البريد الإلكتروني" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input 
                    id="phone" 
                    value={clientForm.phone}
                    onChange={handleClientFormChange}
                    placeholder="أدخل رقم الهاتف" 
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="btn-animate bg-primary hover:bg-opacity-90 text-white"
                    disabled={createClientMutation.isPending}
                  >
                    {createClientMutation.isPending ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        <span>جاري الإضافة...</span>
                      </>
                    ) : (
                      <span>إضافة عميل</span>
                    )}
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
      
      {/* Loading State */}
      {isLoadingClients && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2">جاري تحميل بيانات العملاء...</span>
        </div>
      )}
      
      {/* Error State */}
      {clientsError && (
        <div className="text-center py-10">
          <div className="text-red-500 mb-2">
            <i className="fas fa-exclamation-triangle text-xl"></i>
          </div>
          <h3 className="text-lg font-medium">حدث خطأ أثناء تحميل بيانات العملاء</h3>
          <p className="text-gray-500 mb-4">يرجى المحاولة مرة أخرى لاحقاً</p>
          <Button onClick={() => refetchClients()} variant="outline">
            <i className="fas fa-sync-alt ml-2"></i>
            <span>إعادة المحاولة</span>
          </Button>
        </div>
      )}
      
      {/* Client Details Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <DialogContent className="max-w-3xl w-full">
          {selectedClient && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedClient.name)}&background=${getAvatarColor(selectedClient.name)}&color=fff&size=64`}
                      alt={selectedClient.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedClient.name}</DialogTitle>
                    <p className="text-gray-500">{selectedClient.company}</p>
                    <div className="flex items-center mt-1">
                      <Badge className={getPaymentStatusColor(selectedClient.payment_status)}>
                        {getPaymentStatusLabel(selectedClient.payment_status)}
                      </Badge>
                      {selectedClient.rating && (
                        <div className="flex items-center mr-3">
                          <span className="text-yellow-500">
                            <i className="fas fa-star"></i>
                          </span>
                          <span className="text-sm font-medium mr-1">{selectedClient.rating}</span>
                          <span className="text-xs text-gray-500">/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="details">بيانات العميل</TabsTrigger>
                  <TabsTrigger value="ratings">التقييمات</TabsTrigger>
                  <TabsTrigger value="notes">الملاحظات</TabsTrigger>
                </TabsList>
                
                {/* Details Tab */}
                <TabsContent value="details" className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-3">معلومات الاتصال</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="w-24 text-gray-500">البريد الإلكتروني:</span>
                          <span>{selectedClient.email}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-gray-500">رقم الهاتف:</span>
                          <span>{selectedClient.phone || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24 text-gray-500">الشركة:</span>
                          <span>{selectedClient.company || 'غير محدد'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-3">حالة الدفع</h3>
                      <div className="mb-3">
                        <p className="text-gray-500 mb-2">الحالة الحالية:</p>
                        <Badge className={`text-sm ${getPaymentStatusColor(selectedClient.payment_status)}`}>
                          {getPaymentStatusLabel(selectedClient.payment_status)}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-500 mb-2">تغيير حالة الدفع:</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-green-50 hover:bg-green-100"
                            onClick={() => handleChangePaymentStatus(selectedClient.id, 'regular')}
                          >
                            منتظم
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-yellow-50 hover:bg-yellow-100"
                            onClick={() => handleChangePaymentStatus(selectedClient.id, 'late')}
                          >
                            متأخر
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-red-50 hover:bg-red-100"
                            onClick={() => handleChangePaymentStatus(selectedClient.id, 'stopped')}
                          >
                            متوقف
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleCalculatePaymentStatus(selectedClient.id)}
                        disabled={calculatePaymentStatusMutation.isPending}
                      >
                        {calculatePaymentStatusMutation.isPending ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            <span>جاري الحساب...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-calculator ml-2"></i>
                            <span>حساب حالة الدفع تلقائياً</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Ratings Tab */}
                <TabsContent value="ratings" className="py-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">تقييمات العميل</h3>
                    <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-secondary text-white">
                          <i className="fas fa-plus ml-2"></i>
                          <span>إضافة تقييم</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>إضافة تقييم جديد</DialogTitle>
                        </DialogHeader>
                        
                        <form onSubmit={handleAddRating} className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="rating">التقييم</Label>
                            <Select 
                              value={ratingForm.rating.toString()} 
                              onValueChange={handleRatingChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر التقييم" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 - ضعيف جداً</SelectItem>
                                <SelectItem value="2">2 - ضعيف</SelectItem>
                                <SelectItem value="3">3 - متوسط</SelectItem>
                                <SelectItem value="4">4 - جيد</SelectItem>
                                <SelectItem value="5">5 - ممتاز</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="ratingType">نوع التقييم</Label>
                            <Select 
                              id="ratingType" 
                              value={ratingForm.type} 
                              onValueChange={(value) => handleSelectTypeChange('ratingType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع التقييم" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="positive">إيجابي</SelectItem>
                                <SelectItem value="neutral">محايد</SelectItem>
                                <SelectItem value="negative">سلبي</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="comment">تعليق</Label>
                            <Textarea 
                              id="comment" 
                              value={ratingForm.comment}
                              onChange={handleRatingFormChange}
                              placeholder="أضف تعليق حول هذا التقييم..." 
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              className="btn-animate bg-primary hover:bg-opacity-90 text-white"
                              disabled={createRatingMutation.isPending}
                            >
                              {createRatingMutation.isPending ? (
                                <>
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                  <span>جاري الإضافة...</span>
                                </>
                              ) : (
                                <span>إضافة تقييم</span>
                              )}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {isLoadingRatings ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="mr-2">جاري التحميل...</span>
                    </div>
                  ) : clientRatings.length > 0 ? (
                    <div className="space-y-4">
                      {clientRatings.map((rating: ClientRating) => (
                        <Card key={rating.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between mb-3">
                              <Badge className={getRatingTypeColor(rating.type)}>
                                {getRatingTypeLabel(rating.type)}
                              </Badge>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <span 
                                    key={index} 
                                    className={`text-${index < rating.rating ? 'yellow' : 'gray'}-400`}
                                  >
                                    <i className="fas fa-star text-sm"></i>
                                  </span>
                                ))}
                              </div>
                            </div>
                            {rating.comment && (
                              <p className="text-gray-700 mb-2">{rating.comment}</p>
                            )}
                            <div className="text-xs text-gray-500">
                              {new Date(rating.createdAt).toLocaleDateString('ar-EG')}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                      <div className="text-gray-400 mb-2">
                        <i className="fas fa-star text-xl"></i>
                      </div>
                      <p className="text-gray-500">لا توجد تقييمات لهذا العميل حتى الآن</p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Notes Tab */}
                <TabsContent value="notes" className="py-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">ملاحظات داخلية</h3>
                    <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-secondary text-white">
                          <i className="fas fa-plus ml-2"></i>
                          <span>إضافة ملاحظة</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>إضافة ملاحظة جديدة</DialogTitle>
                        </DialogHeader>
                        
                        <form onSubmit={handleAddNote} className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="note">الملاحظة</Label>
                            <Textarea 
                              id="note" 
                              value={noteForm.note}
                              onChange={handleNoteFormChange}
                              placeholder="أضف ملاحظة داخلية حول هذا العميل..." 
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="noteType">نوع الملاحظة</Label>
                            <Select 
                              id="noteType" 
                              value={noteForm.type} 
                              onValueChange={(value) => handleSelectTypeChange('noteType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر نوع الملاحظة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="positive">إيجابي</SelectItem>
                                <SelectItem value="neutral">محايد</SelectItem>
                                <SelectItem value="negative">سلبي</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              className="btn-animate bg-primary hover:bg-opacity-90 text-white"
                              disabled={createNoteMutation.isPending}
                            >
                              {createNoteMutation.isPending ? (
                                <>
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                  <span>جاري الإضافة...</span>
                                </>
                              ) : (
                                <span>إضافة ملاحظة</span>
                              )}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {isLoadingNotes ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="mr-2">جاري التحميل...</span>
                    </div>
                  ) : clientNotes.length > 0 ? (
                    <div className="space-y-4">
                      {clientNotes.map((note: ClientNote) => (
                        <Card key={note.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between mb-3">
                              <Badge className={getRatingTypeColor(note.type)}>
                                {getRatingTypeLabel(note.type)}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                {new Date(note.createdAt).toLocaleDateString('ar-EG')}
                              </div>
                            </div>
                            <p className="text-gray-700">{note.note}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                      <div className="text-gray-400 mb-2">
                        <i className="fas fa-sticky-note text-xl"></i>
                      </div>
                      <p className="text-gray-500">لا توجد ملاحظات لهذا العميل حتى الآن</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation(`/projects?client=${selectedClient.id}`)}
                  className="mr-auto"
                >
                  <i className="fas fa-folder-open ml-2"></i>
                  <span>عرض مشاريع العميل</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedClient(null)}
                >
                  إغلاق
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Clients Grid */}
      {!isLoadingClients && !clientsError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.length > 0 ? (
            filteredClients.map((client: Client) => (
              <Card key={client.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=${getAvatarColor(client.name)}&color=fff&size=64`}
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
                      <span className="text-sm">{client.phone || 'غير محدد'}</span>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">التقييم</span>
                        <span className="text-sm font-medium flex items-center">
                          {client.rating ? (
                            <>
                              <i className="fas fa-star text-yellow-500 ml-1"></i>
                              {client.rating}
                            </>
                          ) : (
                            'غير مقيم'
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">حالة الدفع</span>
                        <Badge className={getPaymentStatusColor(client.payment_status)}>
                          {getPaymentStatusLabel(client.payment_status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="secondary" 
                    className="w-full text-white"
                    onClick={() => handleOpenClientDetails(client)}
                  >
                    <i className="fas fa-info-circle ml-2"></i>
                    <span>عرض التفاصيل</span>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <i className="fas fa-user-tie text-4xl text-gray-300 mb-2"></i>
              <p className="text-gray-500">لا يوجد عملاء يطابقون معايير البحث</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
