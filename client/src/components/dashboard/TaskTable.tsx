import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

type TaskStatus = 'completed' | 'in-progress' | 'overdue';

interface Task {
  id: string;
  title: string;
  project: string;
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  status: TaskStatus;
}

interface TaskTableProps {
  tasks: Task[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  const [, navigate] = useLocation();
  
  const handleTaskClick = (taskId: string) => {
    navigate(`/dashboard/agency/tasks/${taskId}`);
  };
  
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            مكتملة
          </span>
        );
      case 'in-progress':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            قيد التنفيذ
          </span>
        );
      case 'overdue':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            متأخرة
          </span>
        );
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المهمة
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المشروع
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المكلف
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الموعد النهائي
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <motion.tr 
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{task.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{task.project}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img 
                      className="h-6 w-6 rounded-full" 
                      src={task.assignee.avatar} 
                      alt={task.assignee.name}
                    />
                    <div className="mr-2 text-sm text-gray-900">{task.assignee.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${task.status === 'overdue' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                    {task.dueDate}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(task.status)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
