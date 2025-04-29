import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
  route?: string; // مسار التنقل
  linkTo?: string; // مسار URL مباشر
  progress?: number; // نسبة التقدم من 0 إلى 100
  detailText?: string; // نص توضيحي إضافي
  actionLabel?: string; // نص زر الإجراء
}

const colorVariants = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    icon: 'bg-primary text-white',
  },
  secondary: {
    bg: 'bg-secondary/10',
    text: 'text-secondary',
    icon: 'bg-secondary text-white',
  },
  success: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: 'bg-green-500 text-white',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: 'bg-amber-500 text-white',
  },
  danger: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    icon: 'bg-red-500 text-white',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: 'bg-blue-500 text-white',
  },
};

export const StatCard = ({ 
  icon, 
  title, 
  value, 
  change, 
  color = 'primary',
  onClick,
  route,
  linkTo,
  progress,
  detailText,
  actionLabel
}: StatCardProps) => {
  const colorClasses = colorVariants[color];
  const [, navigate] = useLocation();
  
  const handleClick = () => {
    if (onClick) {
      // استخدم المعالج المخصص إذا كان متوفرًا
      onClick();
    } else if (route) {
      // انتقل إلى المسار المحدد
      navigate(route);
    } else if (linkTo) {
      // افتح الرابط في نافذة جديدة
      window.open(linkTo, '_blank');
    }
  };
  
  // حدد ما إذا كان العنصر قابل للنقر
  const isClickable = onClick || route || linkTo;
  
  return (
    <motion.div 
      className={`dashboard-card dashboard-card-hover ${isClickable ? 'cursor-pointer' : ''}`}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold">{value}</p>
            {change && (
              <p className={`mr-2 text-sm ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {change.type === 'increase' ? '+' : ''}{change.value}%
              </p>
            )}
          </div>
          {detailText && (
            <p className="mt-1 text-xs text-gray-500">{detailText}</p>
          )}
        </div>
        <div className={`p-2 rounded-full ${colorClasses.icon}`}>
          {icon}
        </div>
      </div>
      
      {/* مؤشر التقدم الخطي (إما من progress أو change) */}
      {(progress !== undefined || change) && (
        <div className="mt-4">
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${
                progress !== undefined 
                  ? (
                    color === 'primary' ? 'bg-primary' : 
                    color === 'secondary' ? 'bg-secondary' :
                    color === 'success' ? 'bg-green-500' :
                    color === 'warning' ? 'bg-amber-500' :
                    color === 'danger' ? 'bg-red-500' :
                    'bg-blue-500'
                  ) 
                  : change?.type === 'increase' 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ 
                width: `${progress !== undefined 
                  ? Math.min(Math.max(progress, 0), 100) 
                  : Math.min(Math.abs((change?.value || 0) * 2), 100)}%` 
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </div>
      )}
      
      {/* مؤشر التقدم الدائري إذا تم توفير progress فقط */}
      {progress !== undefined && (
        <div className="mt-3 flex justify-center">
          <div className="relative w-10 h-10">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="stroke-gray-200"
                fill="none"
                strokeWidth="3"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${
                  color === 'primary' ? 'stroke-primary' : 
                  color === 'secondary' ? 'stroke-secondary' :
                  color === 'success' ? 'stroke-green-500' :
                  color === 'warning' ? 'stroke-amber-500' :
                  color === 'danger' ? 'stroke-red-500' :
                  'stroke-blue-500'
                }`}
                fill="none"
                strokeWidth="3"
                strokeDasharray={`${Math.min(Math.max(progress, 0), 100)}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium">{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* زر إجراء إضافي */}
      {actionLabel && (
        <div className="mt-4 text-center">
          <button
            className={`text-xs ${
              color === 'primary' ? 'text-primary hover:text-primary/80' : 
              color === 'secondary' ? 'text-secondary hover:text-secondary/80' :
              color === 'success' ? 'text-green-600 hover:text-green-700' :
              color === 'warning' ? 'text-amber-600 hover:text-amber-700' :
              color === 'danger' ? 'text-red-600 hover:text-red-700' :
              'text-blue-600 hover:text-blue-700'
            } transition-colors font-medium`}
            onClick={(e) => {
              e.stopPropagation(); // منع تنفيذ النقر العام
              handleClick();
            }}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export const StatCardSkeleton = () => {
  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="p-3 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
      <div className="mt-4">
        <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
      </div>
    </div>
  );
};