import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchInput } from '@/components/ui/input';
import { IconButton } from '@/components/ui/button';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // تطبيق تأثير الظهور (fade-in) عند التحميل
    setMounted(true);
    
    // تحديث الوقت الحالي كل دقيقة
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timeInterval);
  }, []);
  
  const handleSearch = (value: string) => {
    console.log('بحث عن:', value);
    // هنا يمكنك تنفيذ وظيفة البحث الفعلية
  };
  
  const formattedDate = format(currentTime, 'EEEE، d MMMM yyyy', { locale: ar });
  
  return (
    <header className={`bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden ml-4 text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <i className="fas fa-bars"></i>
        </button>
        <div className="mr-4">
          <h1 className="text-xl font-bold text-gray-800 hidden md:block font-arabic">{title}</h1>
          <p className="text-xs text-gray-500 hidden lg:block">{formattedDate}</p>
        </div>
      </div>
      
      {/* شريط البحث */}
      <div className="hidden md:block w-1/3 mx-auto">
        <SearchInput
          placeholder="ابحث في المشاريع، المهام، الملفات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          variant="primary"
        />
      </div>
      
      <div className="flex items-center gap-3">
        {/* أيقونة البحث للموبايل */}
        <div className="block md:hidden">
          <IconButton
            icon={<i className="fas fa-search"></i>}
            variant="ghost"
            ariaLabel="بحث"
            onClick={() => {/* إظهار البحث للموبايل */}}
          />
        </div>
        
        {/* إشعارات */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <div>
              <IconButton
                icon={
                  <>
                    <i className="fas fa-bell"></i>
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-sm animate-pulse">3</span>
                  </>
                }
                variant="ghost"
                ariaLabel="الإشعارات"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-96 mr-4 p-0 rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div>
              <div className="flex items-center justify-between bg-primary/5 p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-700 font-arabic">الإشعارات</h3>
                <button className="text-xs text-primary hover:underline font-arabic">
                  تعليم الكل كمقروء
                </button>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                <div className="p-4 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-folder-plus text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 font-arabic">تم إنشاء مشروع جديد</p>
                    <p className="text-xs text-gray-500 mt-1 font-arabic">تم إنشاء مشروع "موقع شركة تقنية" بنجاح</p>
                    <p className="text-xs text-gray-400 mt-2">منذ 5 دقائق</p>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer">
                  <div className="w-8 h-8 bg-accent/10 text-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-tasks text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 font-arabic">تم تعيين مهمة جديدة لك</p>
                    <p className="text-xs text-gray-500 mt-1 font-arabic">مهمة "تصميم صفحة المنتجات" في مشروع "متجر إلكتروني"</p>
                    <p className="text-xs text-gray-400 mt-2">منذ ساعتين</p>
                  </div>
                </div>
                
                <div className="p-4 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer">
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-check text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 font-arabic">تم تقديم تسليم للمراجعة</p>
                    <p className="text-xs text-gray-500 mt-1 font-arabic">قام أحمد بتسليم "تصميم الشعار" للمراجعة</p>
                    <p className="text-xs text-gray-400 mt-2">منذ 4 ساعات</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center p-3 border-t border-gray-100 bg-gray-50">
                <button className="text-primary text-sm hover:underline font-arabic">
                  عرض كل الإشعارات
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* ملف تعريف المستخدم */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 text-sm transition-colors hover:opacity-80">
              <div className="hidden sm:block text-left ml-2">
                <p className="font-medium text-gray-800 font-arabic text-sm">أحمد محمد</p>
                <p className="text-xs text-gray-500">مدير الوكالة</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
                <img 
                  src="https://ui-avatars.com/api/?name=أحمد+محمد&background=5A47FF&color=fff" 
                  className="w-full h-full object-cover"
                  alt="صورة المستخدم"
                />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-60 mr-4 p-0 rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                  <img 
                    src="https://ui-avatars.com/api/?name=أحمد+محمد&background=5A47FF&color=fff" 
                    className="w-full h-full object-cover"
                    alt="صورة المستخدم"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-800 font-arabic">أحمد محمد</p>
                  <p className="text-sm text-gray-500">ahmed@example.com</p>
                </div>
              </div>
            </div>
            
            <div className="py-2">
              <button className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <i className="fas fa-user ml-2"></i>
                <span className="font-arabic">الملف الشخصي</span>
              </button>
              <button className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <i className="fas fa-cog ml-2"></i>
                <span className="font-arabic">الإعدادات</span>
              </button>
              <button className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <i className="fas fa-moon ml-2"></i>
                <span className="font-arabic">الوضع الليلي</span>
              </button>
            </div>
            
            <div className="p-3 border-t border-gray-100">
              <button className="w-full flex items-center justify-center gap-2 p-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <i className="fas fa-sign-out-alt"></i>
                <span className="font-arabic">تسجيل الخروج</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
