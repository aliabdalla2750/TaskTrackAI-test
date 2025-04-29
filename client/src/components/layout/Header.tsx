import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden ml-4 text-gray-500 hover:text-gray-800"
        >
          <i className="fas fa-bars"></i>
        </button>
        <h1 className="text-xl font-bold hidden sm:block">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <button className="text-gray-500 hover:text-gray-800 relative">
              <i className="fas fa-bell"></i>
              <span className="absolute -top-1 -left-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">3</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 mr-4">
            <div className="space-y-2">
              <h3 className="font-bold text-sm border-b pb-2">الإشعارات</h3>
              
              <div className="p-2 hover:bg-gray-50 rounded-md">
                <p className="text-sm font-medium">تم إنشاء مشروع جديد</p>
                <p className="text-xs text-gray-500">منذ 5 دقائق</p>
              </div>
              
              <div className="p-2 hover:bg-gray-50 rounded-md">
                <p className="text-sm font-medium">تم تعيين مهمة جديدة لك</p>
                <p className="text-xs text-gray-500">منذ ساعة</p>
              </div>
              
              <div className="p-2 hover:bg-gray-50 rounded-md">
                <p className="text-sm font-medium">تم تقديم تسليم للمراجعة</p>
                <p className="text-xs text-gray-500">منذ 3 ساعات</p>
              </div>
              
              <div className="text-center pt-2 border-t">
                <button className="text-primary text-sm hover:underline">
                  عرض كل الإشعارات
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="relative hidden sm:block">
          <button className="flex items-center gap-2 text-sm font-medium">
            <span>وكالة الرقمية</span>
            <img 
              src="https://ui-avatars.com/api/?name=وكالة+الرقمية&background=5A47FF&color=fff" 
              className="w-8 h-8 rounded-full"
              alt="وكالة الرقمية"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
