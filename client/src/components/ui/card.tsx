import React from "react";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  isHoverable?: boolean;
  isPrimary?: boolean;
  isAccent?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className = "",
  children,
  onClick,
  isHoverable = false,
  isPrimary = false,
  isAccent = false,
}) => {
  const baseClass = "rounded-2xl shadow-card p-6 transition-all duration-300";
  const hoverClass = isHoverable ? "hover:shadow-card-hover transform hover:-translate-y-1" : "";
  const primaryClass = isPrimary ? "bg-primary/5 border border-primary/20" : "";
  const accentClass = isAccent ? "bg-accent/5 border border-accent/20" : "";
  const defaultClass = !isPrimary && !isAccent ? "bg-white border border-gray-100" : "";
  const clickableClass = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${baseClass} ${hoverClass} ${primaryClass} ${accentClass} ${defaultClass} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className = "",
  children,
  title,
  subtitle,
  icon,
}) => {
  if (title || subtitle || icon) {
    return (
      <div className={`flex items-center justify-between mb-4 ${className}`}>
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary text-xl">{icon}</div>}
          <div>
            {title && <h3 className="text-lg font-arabic font-bold text-gray-800">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div>{children}</div>
      </div>
    );
  }

  return <div className={`mb-4 ${className}`}>{children}</div>;
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ className = "", children }) => {
  return <div className={className}>{children}</div>;
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className = "", children }) => {
  return <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>{children}</div>;
};

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ className = "", children }) => {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ className = "", children }) => {
  return <h3 className={`text-lg font-bold text-gray-800 font-arabic ${className}`}>{children}</h3>;
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className = "",
  onClick,
}) => {
  return (
    <Card 
      className={`animate-fade-in ${className}`} 
      isHoverable 
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-gray-500 font-arabic">{title}</h3>
          <p className="text-2xl font-bold mt-1 font-arabic">{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <i className={`fas fa-arrow-${trend.isPositive ? 'up' : 'down'} mr-1`}></i>
              <span>{trend.value}%</span>
              <span className="text-gray-500 mr-1"> من الشهر الماضي</span>
            </div>
          )}
        </div>
        <div className="bg-primary/10 p-3 rounded-xl text-primary">
          {icon}
        </div>
      </div>
    </Card>
  );
};

interface EmptyCardProps {
  title: string;
  message: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyCard: React.FC<EmptyCardProps> = ({
  title,
  message,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <Card className="text-center py-12 animate-fade-in">
      <div className="mx-auto w-16 h-16 text-primary/50 flex items-center justify-center text-4xl mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 font-arabic mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary mx-auto"
        >
          {actionLabel}
        </button>
      )}
    </Card>
  );
};