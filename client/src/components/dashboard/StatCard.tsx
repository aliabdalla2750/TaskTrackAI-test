import React from 'react';
import { motion } from 'framer-motion';

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
  onClick
}: StatCardProps) => {
  const colorClasses = colorVariants[color];
  
  return (
    <motion.div 
      className={`dashboard-card dashboard-card-hover ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
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
        </div>
        <div className={`p-2 rounded-full ${colorClasses.icon}`}>
          {icon}
        </div>
      </div>
      
      {change && (
        <div className="mt-4">
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${change.type === 'increase' ? 'bg-green-500' : 'bg-red-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.abs(change.value) * 2, 100)}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
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