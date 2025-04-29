import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { BarChartIcon, Calendar, CreditCard, DollarSign, Download, FileText, Filter, PieChartIcon, Printer, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { queryClient } from '@/lib/queryClient';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to get status badge color
const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return <Badge className="bg-green-500">مدفوع</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
    case 'overdue':
      return <Badge className="bg-red-500">متأخر</Badge>;
    case 'cancelled':
      return <Badge className="bg-gray-500">ملغي</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const BillingPage: React.FC = () => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('invoices');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Placeholder agency ID - would normally come from auth context
  const agencyId = 1;

  // Fetch billing data
  const { data: billingData, isLoading: isBillingLoading } = useQuery({
    queryKey: [`/api/agency/${agencyId}/billings`],
    // API response will include billings array
  });

  // Fetch payments data
  const { data: paymentsData, isLoading: isPaymentsLoading } = useQuery({
    queryKey: [`/api/agency/${agencyId}/payments`],
    // API response will include payments array
  });

  // Fetch wallet data
  const { data: walletData, isLoading: isWalletLoading } = useQuery({
    queryKey: [`/api/agency/${agencyId}/wallet`],
    // API response will include wallet info
  });

  // Handle invoice filtering
  const filteredInvoices = React.useMemo(() => {
    if (!billingData?.billings) return [];
    
    return billingData.billings.filter((invoice: any) => {
      // Filter by status
      if (filterStatus !== 'all' && invoice.status !== filterStatus) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          invoice.clientName.toLowerCase().includes(query) ||
          invoice.projectName.toLowerCase().includes(query) ||
          invoice.invoiceNumber.toLowerCase().includes(query) ||
          invoice.description.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [billingData, filterStatus, searchQuery]);

  // Handle generating invoice PDF
  const handleGenerateInvoice = (invoiceId: number) => {
    toast({
      title: 'جاري إنشاء الفاتورة',
      description: 'يتم الآن إنشاء ملف PDF للفاتورة...',
    });
    
    // Add loading state
    const loadingToastId = Math.random().toString();
    toast({
      id: loadingToastId,
      title: 'جاري التحميل',
      description: 'يرجى الانتظار...',
      duration: 3000,
    });
    
    // Call the API to generate PDF
    fetch(`/api/billings/${invoiceId}/pdf`)
      .then(response => {
        if (!response.ok) {
          throw new Error('فشل في إنشاء ملف PDF');
        }
        return response.json();
      })
      .then((data) => {
        // Close loading toast
        toast({
          title: 'تم إنشاء الفاتورة بنجاح',
          description: 'يمكنك الآن تنزيل أو مشاركة الفاتورة',
          variant: 'success',
        });
        
        // If a file URL is returned, open it in a new tab
        if (data && data.fileUrl) {
          window.open(data.fileUrl, '_blank');
        }
      })
      .catch(error => {
        toast({
          title: 'خطأ',
          description: error.message,
          variant: 'destructive',
        });
      });
  };

  // Handle paying an invoice
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoice) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    const paymentMethod = formData.get('paymentMethod');
    const reference = formData.get('reference');
    const notes = formData.get('notes');
    
    // Call the API to process payment
    fetch(`/api/billings/${selectedInvoice.id}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethod: paymentMethod || 'bank',
        reference: reference || '',
        notes: notes || '',
        paymentDate: new Date().toISOString(),
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('فشل في تسجيل الدفعة');
        }
        return response.json();
      })
      .then(() => {
        toast({
          title: 'تم تسجيل الدفعة بنجاح',
          description: `تم تسجيل دفعة بقيمة ${formatCurrency(selectedInvoice.amount)} للفاتورة ${selectedInvoice.invoiceNumber}`,
        });
        
        // Invalidate and refetch the queries to update the data
        queryClient.invalidateQueries({ queryKey: [`/api/agency/${agencyId}/billings`] });
        queryClient.invalidateQueries({ queryKey: [`/api/agency/${agencyId}/payments`] });
        queryClient.invalidateQueries({ queryKey: [`/api/agency/${agencyId}/wallet`] });
        
        setPaymentDialogOpen(false);
      })
      .catch(error => {
        toast({
          title: 'خطأ',
          description: error.message,
          variant: 'destructive',
        });
      });
  };

  // Handle invoice row click
  const handleInvoiceClick = (invoice: any) => {
    setSelectedInvoice(invoice);
  };

  // Loading state
  if (isBillingLoading || isPaymentsLoading || isWalletLoading) {
    return (
      <DashboardLayout title="إدارة الفواتير والمدفوعات">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-muted-foreground">جاري تحميل بيانات الفواتير...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="إدارة الفواتير والمدفوعات">
      <div className="container py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">إدارة الفواتير والمدفوعات</h1>
          
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  الرصيد الحالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(walletData?.currentBalance || 0)}</p>
                <p className="text-sm text-muted-foreground">
                  آخر تحديث: {walletData?.lastUpdated ? format(new Date(walletData.lastUpdated), 'dd/MM/yyyy') : 'غير متوفر'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  إجمالي الفواتير
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {billingData?.billings?.length || 0} فواتير
                </p>
                <p className="text-sm text-muted-foreground">
                  قيمة إجمالية: {formatCurrency(
                    billingData?.billings?.reduce((sum: number, invoice: any) => sum + invoice.amount, 0) || 0
                  )}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  إجمالي الإيرادات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(walletData?.totalRevenue || 0)}</p>
                <p className="text-sm text-muted-foreground">
                  عدد المدفوعات: {paymentsData?.payments?.length || 0}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs */}
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="invoices">الفواتير</TabsTrigger>
              <TabsTrigger value="payments">المدفوعات</TabsTrigger>
              <TabsTrigger value="reports">التقارير المالية</TabsTrigger>
            </TabsList>
            
            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث في الفواتير..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full md:w-[300px]"
                    />
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="كل الحالات" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">كل الحالات</SelectItem>
                          <SelectItem value="paid">مدفوع</SelectItem>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                          <SelectItem value="overdue">متأخر</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button variant="outline" className="w-full md:w-auto" onClick={() => {
                      toast({
                        title: "جاري تصدير البيانات",
                        description: "يتم تصدير جميع بيانات الفواتير بتنسيق اكسل..."
                      });
                      
                      fetch(`/api/agency/${agencyId}/billings/export-excel`)
                        .then(response => {
                          if (!response.ok) {
                            throw new Error('فشل تصدير البيانات');
                          }
                          return response.json();
                        })
                        .then(data => {
                          if (data && data.fileUrl) {
                            window.open(data.fileUrl, '_blank');
                            toast({
                              title: "تم تصدير البيانات بنجاح",
                              description: "تم فتح ملف الاكسل في نافذة جديدة",
                              variant: "success"
                            });
                          }
                        })
                        .catch(error => {
                          toast({
                            title: "خطأ",
                            description: error.message,
                            variant: "destructive"
                          });
                        });
                    }}>
                      <BarChartIcon className="w-4 h-4 mr-2" />
                      تصدير اكسل
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full md:w-auto">
                          <FileText className="w-4 h-4 mr-2" />
                          إنشاء فاتورة جديدة
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
                          <DialogDescription>
                            أدخل بيانات الفاتورة الجديدة
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          
                          const formData = new FormData(e.target as HTMLFormElement);
                          const clientId = Number(formData.get('clientId'));
                          const projectId = Number(formData.get('projectId'));
                          const amount = Number(formData.get('amount'));
                          const dueDate = formData.get('dueDate') as string;
                          const description = formData.get('description') as string;
                          
                          fetch('/api/billings', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              agencyId,
                              clientId,
                              projectId,
                              amount,
                              dueDate,
                              description,
                              status: 'pending',
                            }),
                          })
                            .then(response => {
                              if (!response.ok) {
                                throw new Error('فشل في إنشاء الفاتورة');
                              }
                              return response.json();
                            })
                            .then(() => {
                              toast({
                                title: 'تم إنشاء الفاتورة بنجاح',
                                description: 'تمت إضافة الفاتورة الجديدة للنظام',
                              });
                              
                              // Invalidate queries to refresh data
                              queryClient.invalidateQueries({ queryKey: [`/api/agency/${agencyId}/billings`] });
                              
                              // Close the dialog
                              const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]');
                              if (closeButton instanceof HTMLElement) {
                                closeButton.click();
                              }
                            })
                            .catch(error => {
                              toast({
                                title: 'خطأ',
                                description: error.message,
                                variant: 'destructive',
                              });
                            });
                        }}>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="clientId" className="text-right">العميل</label>
                              <select 
                                name="clientId" 
                                id="clientId"
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-foreground file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                              >
                                <option value="">اختر العميل</option>
                                {/* يمكن استبداله بجلب قائمة العملاء من API */}
                                <option value="1">شركة الأمل</option>
                                <option value="2">مؤسسة المستقبل</option>
                                <option value="3">مجموعة النور</option>
                              </select>
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="projectId" className="text-right">المشروع</label>
                              <select 
                                name="projectId" 
                                id="projectId"
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-foreground file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                              >
                                <option value="">اختر المشروع</option>
                                {/* يمكن استبداله بجلب قائمة المشاريع من API */}
                                <option value="1">تطوير موقع الويب</option>
                                <option value="2">حملة تسويق رقمي</option>
                                <option value="3">تصميم العلامة التجارية</option>
                              </select>
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="amount" className="text-right">المبلغ</label>
                              <Input
                                id="amount"
                                name="amount"
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="أدخل المبلغ"
                                className="col-span-3"
                                required
                              />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="dueDate" className="text-right">تاريخ الاستحقاق</label>
                              <Input
                                id="dueDate"
                                name="dueDate"
                                type="date"
                                className="col-span-3"
                                required
                              />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="description" className="text-right">الوصف</label>
                              <textarea
                                id="description"
                                name="description"
                                placeholder="وصف الفاتورة"
                                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-foreground file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                              ></textarea>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button type="submit">إنشاء الفاتورة</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {/* Invoices Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>رقم الفاتورة</TableHead>
                          <TableHead>العميل</TableHead>
                          <TableHead>المشروع</TableHead>
                          <TableHead>التاريخ</TableHead>
                          <TableHead>تاريخ الاستحقاق</TableHead>
                          <TableHead>المبلغ</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.length > 0 ? (
                          filteredInvoices.map((invoice: any) => (
                            <TableRow 
                              key={invoice.id} 
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleInvoiceClick(invoice)}
                            >
                              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                              <TableCell>{invoice.clientName}</TableCell>
                              <TableCell>{invoice.projectName}</TableCell>
                              <TableCell>{format(new Date(invoice.createdAt), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleGenerateInvoice(invoice.id);
                                    }}
                                  >
                                    <Printer className="w-4 h-4" />
                                  </Button>
                                  {invoice.status === 'pending' && (
                                    <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                                      <DialogTrigger asChild>
                                        <Button 
                                          variant="default" 
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedInvoice(invoice);
                                            setPaymentDialogOpen(true);
                                          }}
                                        >
                                          دفع
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>تسجيل دفعة جديدة</DialogTitle>
                                          <DialogDescription>
                                            قم بملء تفاصيل الدفعة للفاتورة {invoice.invoiceNumber}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handlePaymentSubmit}>
                                          <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <label className="text-right">المبلغ</label>
                                              <Input
                                                defaultValue={invoice.amount}
                                                className="col-span-3"
                                                readOnly
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <label className="text-right">طريقة الدفع</label>
                                              <Select defaultValue="bank">
                                                <SelectTrigger className="col-span-3">
                                                  <SelectValue placeholder="اختر طريقة الدفع" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="bank">تحويل بنكي</SelectItem>
                                                  <SelectItem value="cash">نقدي</SelectItem>
                                                  <SelectItem value="card">بطاقة ائتمان</SelectItem>
                                                  <SelectItem value="mobile">محفظة إلكترونية</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <label className="text-right">تاريخ الدفع</label>
                                              <Input
                                                type="date"
                                                defaultValue={format(new Date(), 'yyyy-MM-dd')}
                                                className="col-span-3"
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <label className="text-right">رقم المرجع</label>
                                              <Input className="col-span-3" placeholder="رقم التحويل أو المرجع" />
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                              <label className="text-right">ملاحظات</label>
                                              <Input className="col-span-3" placeholder="أي ملاحظات إضافية" />
                                            </div>
                                          </div>
                                          <DialogFooter>
                                            <Button type="submit">تأكيد الدفع</Button>
                                          </DialogFooter>
                                        </form>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              لا توجد فواتير تطابق معايير البحث
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>سجل المدفوعات</CardTitle>
                  <CardDescription>
                    جميع المدفوعات المستلمة من العملاء
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم المرجع</TableHead>
                        <TableHead>العميل</TableHead>
                        <TableHead>تاريخ الدفع</TableHead>
                        <TableHead>طريقة الدفع</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>ملاحظات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentsData?.payments && paymentsData.payments.length > 0 ? (
                        paymentsData.payments.map((payment: any) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.reference}</TableCell>
                            <TableCell>{payment.clientName}</TableCell>
                            <TableCell>{format(new Date(payment.paymentDate), 'dd/MM/yyyy')}</TableCell>
                            <TableCell>{payment.paymentMethod}</TableCell>
                            <TableCell>{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>{payment.notes}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            لا توجد مدفوعات مسجلة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Reports Tab */}
            <TabsContent value="reports">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>التقارير المالية</CardTitle>
                    <CardDescription>
                      إنشاء وتنزيل تقارير مالية مفصلة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                        <Calendar className="w-8 h-8 mb-2" />
                        <span className="font-medium">التقرير الشهري</span>
                        <span className="text-sm text-muted-foreground">ملخص مالي للشهر الحالي</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 mb-2" />
                        <span className="font-medium">تقرير الإيرادات</span>
                        <span className="text-sm text-muted-foreground">تقرير مفصل بجميع الإيرادات</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-6 flex flex-col items-center gap-2">
                        <DollarSign className="w-8 h-8 mb-2" />
                        <span className="font-medium">تقرير المستحقات</span>
                        <span className="text-sm text-muted-foreground">متابعة الفواتير المستحقة</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>إنشاء تقرير مخصص</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label>تاريخ البداية</label>
                          <Input id="report-start-date" type="date" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label>تاريخ النهاية</label>
                          <Input id="report-end-date" type="date" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label>نوع التقرير</label>
                          <Select defaultValue="all" id="report-type">
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع التقرير" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">جميع العمليات المالية</SelectItem>
                              <SelectItem value="invoices">الفواتير فقط</SelectItem>
                              <SelectItem value="payments">المدفوعات فقط</SelectItem>
                              <SelectItem value="pending">المستحقات فقط</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label>العميل</label>
                          <Select defaultValue="all" id="report-client">
                            <SelectTrigger>
                              <SelectValue placeholder="اختر العميل" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">جميع العملاء</SelectItem>
                              <SelectItem value="1">شركة السعادة للتجارة</SelectItem>
                              <SelectItem value="2">مؤسسة النجاح</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <Button className="w-full sm:w-auto">
                          <FileText className="w-4 h-4 mr-2" />
                          إنشاء التقرير
                        </Button>
                        <Button variant="outline" className="w-full sm:w-auto"
                          onClick={() => {
                            const startDate = document.getElementById('report-start-date') as HTMLInputElement;
                            const endDate = document.getElementById('report-end-date') as HTMLInputElement;
                            
                            // Input validation
                            if (!startDate?.value) {
                              toast({
                                title: "تنبيه",
                                description: "يرجى تحديد تاريخ بداية التقرير",
                                variant: "warning",
                              });
                              return;
                            }
                            
                            if (!endDate?.value) {
                              toast({
                                title: "تنبيه",
                                description: "يرجى تحديد تاريخ نهاية التقرير",
                                variant: "warning",
                              });
                              return;
                            }
                            
                            toast({
                              title: "جاري توليد التقرير بصيغة PDF",
                              description: "يتم الآن إنشاء ملف PDF للتقرير المالي...",
                            });
                            
                            // Add loading state with animation
                            const loadingToastId = Math.random().toString();
                            toast({
                              id: loadingToastId,
                              title: 'جاري توليد التقرير',
                              description: 'يرجى الانتظار...',
                              duration: 4000,
                            });
                            
                            // Call API to generate PDF report
                            fetch(`/api/agency/${agencyId}/financial-reports/pdf`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                startDate: startDate.value || new Date().toISOString(),
                                endDate: endDate.value || new Date().toISOString(),
                                type: document.getElementById('report-type')?.value || 'all',
                                clientId: document.getElementById('report-client')?.value || 'all',
                              }),
                            })
                              .then(response => {
                                if (!response.ok) {
                                  throw new Error('فشل في توليد ملف PDF');
                                }
                                return response.json();
                              })
                              .then((data) => {
                                toast({
                                  title: "تم إنشاء التقرير بنجاح",
                                  description: "يمكنك الآن تنزيل ملف PDF للتقرير المالي",
                                  variant: "success",
                                });
                                
                                // Open the PDF in a new tab if available
                                if (data && data.fileUrl) {
                                  window.open(data.fileUrl, '_blank');
                                }
                              })
                              .catch(error => {
                                toast({
                                  title: "خطأ",
                                  description: error.message,
                                  variant: "destructive",
                                });
                              });
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          تصدير PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Selected Invoice Details */}
          {selectedInvoice && (
            <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>تفاصيل الفاتورة #{selectedInvoice.invoiceNumber}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">معلومات العميل</h3>
                      <p>الاسم: {selectedInvoice.clientName}</p>
                      <p>المشروع: {selectedInvoice.projectName}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">معلومات الفاتورة</h3>
                      <p>التاريخ: {format(new Date(selectedInvoice.createdAt), 'dd/MM/yyyy')}</p>
                      <p>تاريخ الاستحقاق: {format(new Date(selectedInvoice.dueDate), 'dd/MM/yyyy')}</p>
                      <p>
                        الحالة: <span className="inline-block ml-2">{getStatusBadge(selectedInvoice.status)}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">وصف الفاتورة</h3>
                    <p className="text-sm">{selectedInvoice.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">الخدمات والتكاليف</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الوصف</TableHead>
                          <TableHead className="text-right">المبلغ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>{selectedInvoice.description}</TableCell>
                          <TableCell className="text-right">{formatCurrency(selectedInvoice.amount)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-bold">الإجمالي</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(selectedInvoice.amount)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleGenerateInvoice(selectedInvoice.id)}>
                      <Printer className="w-4 h-4 mr-2" />
                      طباعة الفاتورة
                    </Button>
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      تصدير PDF
                    </Button>
                  </div>
                  {selectedInvoice.status === 'pending' && (
                    <Button onClick={() => {
                      setPaymentDialogOpen(true);
                    }}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      تسجيل دفعة
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;