import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion } from 'framer-motion';
import {
  RiMenuLine, RiBellLine, RiSearchLine, RiUserLine,
  RiSettings3Line, RiLogoutBoxRLine
} from 'react-icons/ri';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-10 border-b"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100"
        >
          <RiMenuLine size={22} />
        </button>
        <h1 className="text-xl font-bold hidden sm:block text-primary">{title}</h1>
      </div>
      
      <div className="hidden md:flex items-center relative rounded-lg bg-gray-50 px-3 w-72">
        <RiSearchLine className="text-gray-400" />
        <input
          type="text"
          placeholder="بحث سريع..."
          className="bg-transparent border-none outline-none p-2 w-full"
        />
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100 relative"
            >
              <RiBellLine size={20} />
              <span className="absolute -top-1 -left-1 bg-secondary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">3</span>
            </motion.button>
          </PopoverTrigger>
          <PopoverContent className="w-80 mr-4 shadow-lg rounded-xl p-0 border">
            <div className="divide-y">
              <div className="p-3 bg-primary/5">
                <h3 className="font-bold text-md text-primary">الإشعارات</h3>
              </div>
              
              <motion.div 
                className="max-h-[300px] overflow-y-auto"
                initial="closed"
                animate="open"
                variants={{
                  open: {
                    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                  },
                  closed: {}
                }}
              >
                <NotificationItem 
                  title="تم إنشاء مشروع جديد"
                  time="منذ 5 دقائق"
                  isNew
                />
                <NotificationItem 
                  title="تم تعيين مهمة جديدة لك"
                  time="منذ ساعة"
                  isNew
                />
                <NotificationItem 
                  title="تم تقديم تسليم للمراجعة"
                  time="منذ 3 ساعات"
                  isNew
                />
              </motion.div>
              
              <div className="p-3 text-center">
                <button className="text-primary text-sm font-medium hover:underline">
                  عرض كل الإشعارات
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 py-1 px-3 rounded-full hover:bg-gray-100"
            >
              <span className="text-sm font-medium hidden sm:block">وكالة الرقمية</span>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center overflow-hidden shadow-sm">
                <img 
                  src="https://ui-avatars.com/api/?name=وكالة+الرقمية&background=430d58&color=fff" 
                  className="w-full h-full object-cover"
                  alt="وكالة الرقمية"
                />
              </div>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-1 mr-1 p-2" align="start">
            <div className="flex items-center gap-3 p-2 mb-1 border-b">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                <img
                  src="https://ui-avatars.com/api/?name=وكالة+الرقمية&background=430d58&color=fff" 
                  className="w-full h-full object-cover"
                  alt="وكالة الرقمية"
                />
              </div>
              <div>
                <div className="font-medium">وكالة الرقمية</div>
                <div className="text-xs text-gray-500">admin@taskaaya.com</div>
              </div>
            </div>
            <DropdownMenuItem className="flex items-center gap-2">
              <RiUserLine className="text-gray-500" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <RiSettings3Line className="text-gray-500" />
              <span>الإعدادات</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 text-red-500 hover:bg-red-50">
              <RiLogoutBoxRLine />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}

// Animation variants for notification items
const itemVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: -10 }
};

// Notification Item component
const NotificationItem = ({ title, time, isNew = false }: { title: string, time: string, isNew?: boolean }) => {
  return (
    <motion.div 
      variants={itemVariants}
      className={`p-3 hover:bg-accent cursor-pointer border-b ${isNew ? 'border-r-2 border-r-secondary' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
        {isNew && (
          <div className="w-2 h-2 rounded-full bg-secondary mt-1"></div>
        )}
      </div>
    </motion.div>
  );
};