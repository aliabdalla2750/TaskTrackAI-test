import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RiFileDownloadLine,
  RiFileExcel2Line,
  RiEyeLine,
  RiMoneyDollarCircleLine,
} from 'react-icons/ri';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Billing {
  id: number;
  projectId: number;
  projectName: string;
  amount: number;
  status: string;
  invoiceNumber: string;
  dueDate: string;
  createdAt: string;
  invoiceLink?: string;
}

interface Payment {
  id: number;
  billingId: number;
  invoiceNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  status: string;
}

// بديل مؤقت لـ i18n
const STATUS_TRANSLATIONS = {
  paid: 'مدفوعة',
  unpaid: 'غير مدفوعة',
  overdue: 'متأخرة',
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  completed: 'مكتملة',
  failed: 'فشلت',
  cancelled: 'ملغية',
};

const translateStatus = (status: string) => {
  return STATUS_TRANSLATIONS[status as keyof typeof STATUS_TRANSLATIONS] || status;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

export default function BillingPage() {
  const { toast } = useToast();
  const clientId = 1; // في الواقع، سنحصل على هذا من المستخدم الحالي
  const [activeTab, setActiveTab] = useState('invoices');

  // استعلام API للفواتير
  const {
    data: billingData,
    isLoading: billingLoading,
    error: billingError,
  } = useQuery({
    queryKey: ['/api/client/billings', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/client/${clientId}/billings`);
      if (!response.ok) {
        throw new Error('فشل في تحميل الفواتير');
      }
      return response.json();
    },
  });

  // استعلام API للمدفوعات
  const {
    data: paymentData,
    isLoading: paymentLoading,
    error: paymentError,
  } = useQuery({
    queryKey: ['/api/client/payments', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/client/${clientId}/payments`);
      if (!response.ok) {
        throw new Error('فشل في تحميل المدفوعات');
      }
      return response.json();
    },
  });

  const handleDownloadInvoice = (invoiceLink: string, invoiceNumber: string) => {
    // في الواقع، سيتم تنفيذ التحميل الفعلي هنا
    toast({
      title: 'جاري تنزيل الفاتورة',
      description: `الفاتورة رقم: ${invoiceNumber}`,
    });

    // محاكاة التحميل - في الواقع، سيتم استخدام blob وa.download
    setTimeout(() => {
      toast({
        title: 'تم تنزيل الفاتورة بنجاح',
        description: `الفاتورة رقم: ${invoiceNumber}`,
      });
    }, 1500);
  };

  const handleExportToExcel = (type: 'invoices' | 'payments') => {
    toast({
      title: 'جاري تصدير البيانات',
      description: type === 'invoices' ? 'جاري تصدير الفواتير إلى Excel' : 'جاري تصدير المدفوعات إلى Excel',
    });

    // استدعاء نقطة نهاية API للتصدير
    fetch(`/api/client/${clientId}/export-${type}`, {
      method: 'POST',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('فشل في تصدير البيانات');
        }
        return response.blob();
      })
      .then((blob) => {
        // إنشاء رابط تنزيل
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${type === 'invoices' ? 'فواتير' : 'مدفوعات'}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: 'تم التصدير بنجاح',
          description: `تم تصدير ${
            type === 'invoices' ? 'الفواتير' : 'المدفوعات'
          } بنجاح إلى ملف Excel`,
        });
      })
      .catch((error) => {
        console.error(`Error exporting ${type}:`, error);
        toast({
          variant: 'destructive',
          title: 'فشل التصدير',
          description: `فشل في تصدير ${type === 'invoices' ? 'الفواتير' : 'المدفوعات'}: ${error.message}`,
        });
      });
  };

  const handlePayInvoice = (invoiceId: number, invoiceNumber: string) => {
    toast({
      title: 'تم إرسالك إلى صفحة الدفع',
      description: `للفاتورة رقم: ${invoiceNumber}`,
    });
    // هنا سيتم توجيه المستخدم إلى صفحة الدفع
  };

  const handleViewInvoice = (invoiceId: number, invoiceNumber: string) => {
    toast({
      title: 'جاري عرض تفاصيل الفاتورة',
      description: `الفاتورة رقم: ${invoiceNumber}`,
    });
    // هنا سيتم توجيه المستخدم إلى صفحة تفاصيل الفاتورة أو فتح مودال
  };

  // حساب إجماليات لرؤية عامة
  const unpaidTotal = billingData?.billings
    ? billingData.billings
        .filter((bill: Billing) => bill.status === 'unpaid' || bill.status === 'overdue')
        .reduce((sum: number, bill: Billing) => sum + bill.amount, 0)
    : 0;

  const paidTotal = paymentData?.payments
    ? paymentData.payments
        .filter((payment: Payment) => payment.status === 'completed')
        .reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
    : 0;

  const overdueBills = billingData?.billings
    ? billingData.billings.filter((bill: Billing) => bill.status === 'overdue').length
    : 0;

  if (billingError || paymentError) {
    return (
      <DashboardLayout title="الفواتير والمدفوعات">
        <div className="container mx-auto p-6">
          <div className="text-red-500 p-4 rounded-lg bg-red-100 text-center">
            <h2 className="text-xl font-bold">خطأ في تحميل البيانات</h2>
            <p>{billingError ? (billingError as Error).message : (paymentError as Error).message}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="الفواتير والمدفوعات">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">الفواتير والمدفوعات</h1>
        </div>

        {/* نظرة عامة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary text-lg">إجمالي المستحق</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {billingLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  formatCurrency(unpaidTotal)
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary text-lg">إجمالي المدفوعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  formatCurrency(paidTotal)
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary text-lg">الفواتير المتأخرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {billingLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  overdueBills
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="invoices">الفواتير</TabsTrigger>
            <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <Card className="bg-white">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-primary text-xl">قائمة الفواتير</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportToExcel('invoices')}
                    disabled={billingLoading || !billingData?.billings?.length}
                  >
                    <RiFileExcel2Line className="ml-2" />
                    تصدير إلى Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {billingLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !billingData?.billings?.length ? (
                  <div className="text-center py-8 text-gray-500">لا توجد فواتير متاحة</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>رقم الفاتورة</TableHead>
                          <TableHead>المشروع</TableHead>
                          <TableHead>المبلغ</TableHead>
                          <TableHead>تاريخ الإصدار</TableHead>
                          <TableHead>تاريخ الاستحقاق</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billingData.billings.map((bill: Billing) => (
                          <TableRow key={bill.id}>
                            <TableCell>{bill.invoiceNumber}</TableCell>
                            <TableCell>{bill.projectName}</TableCell>
                            <TableCell>{formatCurrency(bill.amount)}</TableCell>
                            <TableCell>
                              {format(new Date(bill.createdAt), 'dd MMM yyyy', { locale: ar })}
                            </TableCell>
                            <TableCell>
                              {format(new Date(bill.dueDate), 'dd MMM yyyy', { locale: ar })}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  bill.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : bill.status === 'overdue'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {translateStatus(bill.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2 space-x-reverse">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewInvoice(bill.id, bill.invoiceNumber)}
                                  title="عرض التفاصيل"
                                >
                                  <RiEyeLine />
                                </Button>
                                {bill.invoiceLink && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDownloadInvoice(bill.invoiceLink || '', bill.invoiceNumber)
                                    }
                                    title="تنزيل PDF"
                                  >
                                    <RiFileDownloadLine />
                                  </Button>
                                )}
                                {bill.status === 'unpaid' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePayInvoice(bill.id, bill.invoiceNumber)}
                                    title="دفع الفاتورة"
                                    className="text-primary"
                                  >
                                    <RiMoneyDollarCircleLine />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="bg-white">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-primary text-xl">سجل المدفوعات</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportToExcel('payments')}
                    disabled={paymentLoading || !paymentData?.payments?.length}
                  >
                    <RiFileExcel2Line className="ml-2" />
                    تصدير إلى Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {paymentLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !paymentData?.payments?.length ? (
                  <div className="text-center py-8 text-gray-500">لا يوجد سجل مدفوعات</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>رقم الفاتورة</TableHead>
                          <TableHead>المبلغ</TableHead>
                          <TableHead>تاريخ الدفع</TableHead>
                          <TableHead>طريقة الدفع</TableHead>
                          <TableHead>رقم المرجع</TableHead>
                          <TableHead>الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentData.payments.map((payment: Payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.invoiceNumber}</TableCell>
                            <TableCell>{formatCurrency(payment.amount)}</TableCell>
                            <TableCell>
                              {format(new Date(payment.paymentDate), 'dd MMM yyyy', { locale: ar })}
                            </TableCell>
                            <TableCell>{payment.paymentMethod}</TableCell>
                            <TableCell>{payment.reference}</TableCell>
                            <TableCell>
                              <Badge
                                className={`${
                                  payment.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : payment.status === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {translateStatus(payment.status)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}