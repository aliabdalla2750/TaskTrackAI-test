import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  onClick,
  className = '',
  type = 'button',
  isLoading = false,
  loadingText,
}) => {
  // تحديد الألوان والأنماط بناءً على المتغير (variant)
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary/30',
    secondary: 'bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary/30',
    accent: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent/30',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary/5 focus:ring-primary/20',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
  };

  // تحديد الحجم
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // تأثير النبض عند النقر
  const handleClick = (e: React.MouseEvent) => {
    const button = e.currentTarget;
    button.classList.add('animate-pulse');
    setTimeout(() => {
      button.classList.remove('animate-pulse');
    }, 500);
    
    if (onClick) onClick();
  };

  return (
    <button
      type={type}
      className={`
        rounded-xl font-bold transition-all duration-300
        focus:outline-none focus:ring-2 
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading && (
          <svg className="animate-spin -mr-1 ml-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {icon && iconPosition === 'left' && !isLoading && <span>{icon}</span>}
        <span className="font-arabic">{isLoading && loadingText ? loadingText : children}</span>
        {icon && iconPosition === 'right' && !isLoading && <span>{icon}</span>}
      </div>
    </button>
  );
};

interface IconButtonProps {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  title?: string;
  ariaLabel: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  title,
  ariaLabel,
}) => {
  // تحديد الألوان والأنماط بناءً على المتغير (variant)
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary/30',
    secondary: 'bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary/30',
    accent: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent/30',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary/5 focus:ring-primary/20',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
  };

  // تحديد الحجم
  const sizeStyles = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg',
  };

  return (
    <button
      type="button"
      className={`
        rounded-full aspect-square flex items-center justify-center
        transition-all duration-300 focus:outline-none focus:ring-2
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
};

interface ButtonGroupProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  // تحويل الأطفال إلى مصفوفة للتعامل معها
  const childrenArray = React.Children.toArray(children);
  
  // تمرير خصائص للأزرار الداخلية
  const modifiedChildren = childrenArray.map((child, index) => {
    if (React.isValidElement(child) && (child.type === Button || child.type === IconButton)) {
      return React.cloneElement(child, {
        variant,
        size,
        className: `
          ${index === 0 ? 'rounded-r-none' : ''} 
          ${index === childrenArray.length - 1 ? 'rounded-l-none' : ''} 
          ${index > 0 && index < childrenArray.length - 1 ? 'rounded-none' : ''} 
          ${index > 0 ? '-mr-px' : ''}
          ${child.props.className || ''}
        `,
      });
    }
    return child;
  });

  return (
    <div className={`inline-flex rounded-xl overflow-hidden ${className}`}>
      {modifiedChildren}
    </div>
  );
};