import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBg: string;
  iconColor: string;
  progressValue?: number;
  progressMax?: number;
  progressColor?: string;
  progressLabel?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  progressValue,
  progressMax,
  progressColor = 'bg-primary',
  progressLabel,
}: StatsCardProps) {
  const progressPercent = progressValue && progressMax
    ? Math.round((progressValue / progressMax) * 100)
    : undefined;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
          <i className={`fas ${icon}`}></i>
        </div>
      </div>
      
      {progressValue !== undefined && progressMax !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${progressColor} rounded-full h-2`} 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-gray-500 text-xs mt-1">
            {progressLabel || `${progressValue} من أصل ${progressMax}`}
          </p>
        </div>
      )}
    </div>
  );
}
