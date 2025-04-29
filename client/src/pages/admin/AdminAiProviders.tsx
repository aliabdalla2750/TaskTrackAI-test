import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PlusCircle, Edit, Trash2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface AiProvider {
  id: number;
  name: string;
  displayName: string;
  apiKey: string;
  baseUrl: string | null;
  isEnabled: boolean;
  isDefault: boolean;
  createdAt: Date | null;
}

interface AiModel {
  id: number;
  name: string;
  displayName: string;
  providerId: number;
  isEnabled: boolean;
  isDefault: boolean;
  maxTokens: number;
  createdAt: Date | null;
}

const AdminAiProviders = () => {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTestingProvider, setIsTestingProvider] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<AiProvider | null>(null);
  const [newProvider, setNewProvider] = useState<Partial<AiProvider>>({
    name: "",
    displayName: "",
    apiKey: "",
    baseUrl: "",
    isEnabled: true,
    isDefault: false
  });

  // استعلام للحصول على قائمة مزودي الذكاء الاصطناعي
  const providersQuery = useQuery({
    queryKey: ["/api/admin/ai-providers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/ai-providers");
      const data = await response.json();
      return data as AiProvider[];
    }
  });

  // إضافة مزود جديد
  const addProviderMutation = useMutation({
    mutationFn: async (provider: Partial<AiProvider>) => {
      const response = await apiRequest("POST", "/api/admin/ai-providers", provider);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-providers"] });
      setIsAddDialogOpen(false);
      toast({
        title: "تم الإضافة بنجاح",
        description: "تمت إضافة مزود الذكاء الاصطناعي بنجاح",
      });
      setNewProvider({
        name: "",
        displayName: "",
        apiKey: "",
        baseUrl: "",
        isEnabled: true,
        isDefault: false
      });
    },
    onError: (error) => {
      toast({
        title: "فشل في الإضافة",
        description: "حدث خطأ أثناء إضافة مزود الذكاء الاصطناعي",
        variant: "destructive"
      });
    }
  });

  // تحديث مزود
  const updateProviderMutation = useMutation({
    mutationFn: async (provider: Partial<AiProvider>) => {
      if (!currentProvider) return null;
      const response = await apiRequest("PUT", `/api/admin/ai-providers/${currentProvider.id}`, provider);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-providers"] });
      setIsEditDialogOpen(false);
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث مزود الذكاء الاصطناعي بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "فشل في التحديث",
        description: "حدث خطأ أثناء تحديث مزود الذكاء الاصطناعي",
        variant: "destructive"
      });
    }
  });

  // حذف مزود
  const deleteProviderMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/ai-providers/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-providers"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف مزود الذكاء الاصطناعي بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "فشل في الحذف",
        description: "حدث خطأ أثناء حذف مزود الذكاء الاصطناعي",
        variant: "destructive"
      });
    }
  });

  // اختبار اتصال المزود
  const testProviderConnection = async (provider: AiProvider) => {
    setIsTestingProvider(true);
    try {
      const response = await apiRequest("POST", `/api/admin/ai-providers/${provider.id}/test`);
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "تم الاتصال بنجاح",
          description: result.message,
          variant: "default"
        });
      } else {
        toast({
          title: "فشل الاتصال",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاختبار",
        description: "حدث خطأ أثناء اختبار الاتصال بالمزود",
        variant: "destructive"
      });
    } finally {
      setIsTestingProvider(false);
    }
  };

  const handleOpenEditDialog = (provider: AiProvider) => {
    setCurrentProvider(provider);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProvider) return;
    
    const updatedProvider = {
      name: currentProvider.name,
      displayName: currentProvider.displayName,
      apiKey: currentProvider.apiKey,
      baseUrl: currentProvider.baseUrl,
      isEnabled: currentProvider.isEnabled,
      isDefault: currentProvider.isDefault
    };

    updateProviderMutation.mutate(updatedProvider);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProviderMutation.mutate(newProvider);
  };

  return (
    <DashboardLayout title="إدارة مزودي الذكاء الاصطناعي">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">إدارة مزودي الذكاء الاصطناعي</h1>
            <p className="text-muted-foreground">إدارة مزودي الذكاء الاصطناعي والنماذج المتاحة</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                إضافة مزود جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مزود ذكاء اصطناعي جديد</DialogTitle>
                <DialogDescription>أدخل معلومات مزود الذكاء الاصطناعي الجديد</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSubmit}>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">اختر المزود</Label>
                      <Select 
                        value={newProvider.name} 
                        onValueChange={(value) => {
                          const displayNames = {
                            "openai": "OpenAI",
                            "deepseek": "DeepSeek",
                            "openrouter": "OpenRouter"
                          };
                          setNewProvider({ 
                            ...newProvider, 
                            name: value,
                            displayName: displayNames[value as keyof typeof displayNames]
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مزود الذكاء الاصطناعي" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="deepseek">DeepSeek</SelectItem>
                          <SelectItem value="openrouter">OpenRouter</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">اختر مزود الذكاء الاصطناعي</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="displayName">اسم العرض</Label>
                      <Input
                        id="displayName"
                        value={newProvider.displayName}
                        readOnly
                      />
                      <p className="text-xs text-muted-foreground">سيتم تعبئته تلقائيًا بناءً على اختيار المزود</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">مفتاح API</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="sk-..."
                      value={newProvider.apiKey}
                      onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground">هذا المفتاح سيتم تخزينه بشكل آمن</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baseUrl">عنوان URL الأساسي (اختياري)</Label>
                    <Input
                      id="baseUrl"
                      placeholder="https://api.example.com/v1"
                      value={newProvider.baseUrl || ""}
                      onChange={(e) => setNewProvider({ ...newProvider, baseUrl: e.target.value || null })}
                    />
                    <p className="text-xs text-muted-foreground">اترك فارغًا للاستخدام الافتراضي</p>
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <Switch
                      id="isEnabled"
                      checked={newProvider.isEnabled}
                      onCheckedChange={(checked) => setNewProvider({ ...newProvider, isEnabled: checked })}
                    />
                    <Label htmlFor="isEnabled">تمكين هذا المزود</Label>
                  </div>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <Switch
                      id="isDefault"
                      checked={newProvider.isDefault}
                      onCheckedChange={(checked) => setNewProvider({ ...newProvider, isDefault: checked })}
                    />
                    <Label htmlFor="isDefault">تعيين كمزود افتراضي</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={addProviderMutation.isPending}
                  >
                    {addProviderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    إضافة المزود
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="providers">
          <TabsList>
            <TabsTrigger value="providers">مزودي الذكاء الاصطناعي</TabsTrigger>
            <TabsTrigger value="models">النماذج</TabsTrigger>
          </TabsList>
          <TabsContent value="providers" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {providersQuery.isLoading ? (
                <div className="col-span-full flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : providersQuery.isError ? (
                <div className="col-span-full">
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="flex items-center text-destructive">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        خطأ في تحميل البيانات
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>حدث خطأ أثناء تحميل قائمة مزودي الذكاء الاصطناعي. الرجاء المحاولة مرة أخرى.</p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => providersQuery.refetch()}>إعادة المحاولة</Button>
                    </CardFooter>
                  </Card>
                </div>
              ) : providersQuery.data?.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>لا يوجد مزودي ذكاء اصطناعي</CardTitle>
                      <CardDescription>لم يتم إضافة أي مزودي ذكاء اصطناعي بعد</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>قم بإضافة مزود جديد باستخدام زر "إضافة مزود جديد"</p>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => setIsAddDialogOpen(true)}>إضافة مزود الآن</Button>
                    </CardFooter>
                  </Card>
                </div>
              ) : (
                providersQuery.data?.map((provider) => (
                  <Card key={provider.id} className={provider.isDefault ? "border-primary" : ""}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{provider.displayName}</span>
                        {provider.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary py-1 px-2 rounded-full">
                            افتراضي
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {provider.isEnabled ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>مفعل</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span>غير مفعل</span>
                          </>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">اسم النظام</span>
                          <span className="text-sm font-medium">{provider.name}</span>
                        </div>
                        {provider.baseUrl && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">URL</span>
                            <span className="text-sm font-medium truncate max-w-[150px]" title={provider.baseUrl}>{provider.baseUrl}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex space-x-2 space-x-reverse">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleOpenEditDialog(provider)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          تعديل
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteProviderMutation.mutate(provider.id)}
                          disabled={deleteProviderMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          حذف
                        </Button>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => testProviderConnection(provider)}
                        disabled={isTestingProvider}
                      >
                        {isTestingProvider ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <>اختبار الاتصال</>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="models" className="mt-6">
            <div className="text-center p-12">
              <h3 className="text-xl font-medium mb-2">قريباً</h3>
              <p className="text-muted-foreground">ستتمكن من إدارة نماذج الذكاء الاصطناعي لكل مزود هنا</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* نافذة تعديل المزود */}
      {currentProvider && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل مزود الذكاء الاصطناعي</DialogTitle>
              <DialogDescription>تعديل معلومات مزود الذكاء الاصطناعي</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">اسم المزود (للنظام)</Label>
                    <Input
                      id="edit-name"
                      value={currentProvider.name}
                      onChange={(e) => setCurrentProvider({ ...currentProvider, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-displayName">اسم العرض</Label>
                    <Input
                      id="edit-displayName"
                      value={currentProvider.displayName}
                      onChange={(e) => setCurrentProvider({ ...currentProvider, displayName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-apiKey">مفتاح API</Label>
                  <Input
                    id="edit-apiKey"
                    type="password"
                    value={currentProvider.apiKey}
                    onChange={(e) => setCurrentProvider({ ...currentProvider, apiKey: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-baseUrl">عنوان URL الأساسي (اختياري)</Label>
                  <Input
                    id="edit-baseUrl"
                    value={currentProvider.baseUrl || ""}
                    onChange={(e) => setCurrentProvider({ ...currentProvider, baseUrl: e.target.value || null })}
                  />
                </div>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Switch
                    id="edit-isEnabled"
                    checked={currentProvider.isEnabled}
                    onCheckedChange={(checked) => setCurrentProvider({ ...currentProvider, isEnabled: checked })}
                  />
                  <Label htmlFor="edit-isEnabled">تمكين هذا المزود</Label>
                </div>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Switch
                    id="edit-isDefault"
                    checked={currentProvider.isDefault}
                    onCheckedChange={(checked) => setCurrentProvider({ ...currentProvider, isDefault: checked })}
                  />
                  <Label htmlFor="edit-isDefault">تعيين كمزود افتراضي</Label>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateProviderMutation.isPending}
                >
                  {updateProviderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  حفظ التغييرات
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default AdminAiProviders;