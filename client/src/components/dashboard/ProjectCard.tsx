import React from 'react';

type ProjectStatus = 'active' | 'completed' | 'paused';

interface TeamMember {
  name: string;
  avatarColor: string;
}

interface ProjectCardProps {
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
  team: TeamMember[];
}

export function ProjectCard({
  title,
  description,
  status,
  progress,
  dueDate,
  team,
}: ProjectCardProps) {
  const getStatusLabel = () => {
    switch (status) {
      case 'active':
        return { label: 'جاري', color: 'bg-blue-100 text-primary' };
      case 'completed':
        return { label: 'مكتمل', color: 'bg-green-100 text-secondary' };
      case 'paused':
        return { label: 'متوقف', color: 'bg-yellow-100 text-yellow-600' };
    }
  };
  
  const { label, color } = getStatusLabel();
  
  const getProgressColor = () => {
    if (status === 'completed') return 'bg-secondary';
    if (status === 'paused') return 'bg-yellow-500';
    return 'bg-primary';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <span className={`${color} text-xs px-2 py-1 rounded-full`}>
            {label}
          </span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">تقدم المشروع</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className={`${getProgressColor()} rounded-full h-2`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2 space-x-reverse">
            {team.map((member, index) => (
              <img 
                key={index}
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=${encodeURIComponent(member.avatarColor)}&color=fff`}
                className="w-6 h-6 rounded-full border border-white"
                alt={member.name}
              />
            ))}
          </div>
          <span className="text-gray-500 text-sm">
            {status === 'completed' 
              ? `تم التسليم: ${dueDate}` 
              : `تاريخ التسليم: ${dueDate}`
            }
          </span>
        </div>
      </div>
    </div>
  );
}
