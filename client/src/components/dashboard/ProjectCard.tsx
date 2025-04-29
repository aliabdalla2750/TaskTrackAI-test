import React from 'react';
import { motion } from 'framer-motion';
import { 
  RiCalendarLine, RiTimeLine, RiUser3Line, 
  RiCheckboxCircleLine, RiErrorWarningLine, RiInformationLine 
} from 'react-icons/ri';

export interface ProjectCardProps {
  id: number | string;
  title: string;
  description: string;
  client?: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  status: 'completed' | 'in-progress' | 'delayed' | 'upcoming' | 'active' | 'overdue' | string;
  subgoals?: number;
  completedSubgoals?: number;
  tasks?: number;
  completedTasks?: number;
  team?: Array<{ name: string; avatarColor?: string; avatar?: string }>;
  onClick?: () => void;
  className?: string;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  completed: {
    color: 'bg-green-100 text-green-800',
    icon: <RiCheckboxCircleLine className="text-green-500" />,
    label: 'مكتمل'
  },
  'in-progress': {
    color: 'bg-blue-100 text-blue-800',
    icon: <RiInformationLine className="text-blue-500" />,
    label: 'قيد التنفيذ'
  },
  delayed: {
    color: 'bg-red-100 text-red-800',
    icon: <RiErrorWarningLine className="text-red-500" />,
    label: 'متأخر'
  },
  upcoming: {
    color: 'bg-amber-100 text-amber-800',
    icon: <RiTimeLine className="text-amber-500" />,
    label: 'قادم'
  },
  active: {
    color: 'bg-blue-100 text-blue-800',
    icon: <RiInformationLine className="text-blue-500" />,
    label: 'نشط'
  },
  overdue: {
    color: 'bg-red-100 text-red-800',
    icon: <RiErrorWarningLine className="text-red-500" />,
    label: 'متأخر'
  }
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  client,
  progress,
  startDate,
  endDate,
  dueDate,
  status,
  subgoals,
  completedSubgoals,
  tasks,
  completedTasks,
  team,
  onClick,
  className
}) => {
  // Default status info if status not found in config
  const defaultStatusInfo = {
    color: 'bg-gray-100 text-gray-800',
    icon: <RiInformationLine className="text-gray-500" />,
    label: status || 'غير محدد'
  };
  
  // Get status info from config or use default
  const statusInfo = statusConfig[status] || defaultStatusInfo;
  
  return (
    <motion.div 
      className={`dashboard-card card-hover ${onClick ? 'cursor-pointer' : ''} ${className}`}
      whileHover={{ y: -5 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg">{title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${statusInfo.color}`}>
          {statusInfo.icon}
          {statusInfo.label}
        </span>
      </div>
      
      <p className="mt-2 text-gray-600 text-sm line-clamp-2">{description}</p>
      
      <div className="flex items-center mt-4 text-sm text-gray-500">
        <RiUser3Line className="ml-1" />
        <span>{client}</span>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">التقدم</span>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
        <div className="flex items-center">
          <RiCalendarLine className="ml-1" />
          <span>{startDate} - {endDate}</span>
        </div>
        
        {subgoals !== undefined && completedSubgoals !== undefined && (
          <div>
            <span className="font-medium">{completedSubgoals}/{subgoals}</span> أهداف فرعية
          </div>
        )}
        
        {tasks !== undefined && completedTasks !== undefined && (
          <div>
            <span className="font-medium">{completedTasks}/{tasks}</span> مهام
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ProjectCardSkeleton = () => {
  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-start">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      
      <div className="mt-2 h-12 bg-gray-200 rounded animate-pulse"></div>
      
      <div className="flex items-center mt-4">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full"></div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
};