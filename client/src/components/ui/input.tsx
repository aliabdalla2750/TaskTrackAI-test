import React, { forwardRef } from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  width?: 'full' | 'auto';
  onRightIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      variant = 'default',
      width = 'full',
      className = '',
      onRightIconClick,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: 'border-gray-300 focus-within:border-primary focus-within:ring-primary/10',
      primary: 'border-primary/30 focus-within:border-primary focus-within:ring-primary/20',
      secondary: 'border-secondary/30 focus-within:border-secondary focus-within:ring-secondary/20',
      accent: 'border-accent/30 focus-within:border-accent focus-within:ring-accent/20',
    };

    const errorStyles = error
      ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-200'
      : '';

    return (
      <div className={`${width === 'full' ? 'w-full' : 'w-auto'} ${className} animate-fade-in`}>
        {label && (
          <label
            htmlFor={props.id}
            className={`block text-sm font-medium mb-1.5 ${
              error ? 'text-red-500' : 'text-gray-700'
            } font-arabic`}
          >
            {label}
          </label>
        )}
        <div
          className={`relative flex items-center border-2 rounded-xl ${
            error ? errorStyles : variantStyles[variant]
          } bg-white overflow-hidden transition-colors focus-within:ring-4`}
        >
          {leftIcon && (
            <div className="absolute left-3 text-gray-400">{leftIcon}</div>
          )}
          <input
            {...props}
            ref={ref}
            className={`w-full py-2.5 focus:outline-none bg-transparent ${
              leftIcon ? 'pl-10' : 'pl-4'
            } ${rightIcon ? 'pr-10' : 'pr-4'} text-gray-900 placeholder-gray-400 font-arabic`}
          />
          {rightIcon && (
            <div 
              className={`absolute right-3 text-gray-400 ${onRightIconClick ? 'cursor-pointer hover:text-primary' : ''}`}
              onClick={onRightIconClick}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {(hint || error) && (
          <p
            className={`mt-1.5 text-xs ${
              error ? 'text-red-500' : 'text-gray-500'
            } font-arabic`}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  width?: 'full' | 'auto';
  rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      hint,
      error,
      variant = 'default',
      width = 'full',
      className = '',
      rows = 4,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: 'border-gray-300 focus-within:border-primary focus-within:ring-primary/10',
      primary: 'border-primary/30 focus-within:border-primary focus-within:ring-primary/20',
      secondary: 'border-secondary/30 focus-within:border-secondary focus-within:ring-secondary/20',
      accent: 'border-accent/30 focus-within:border-accent focus-within:ring-accent/20',
    };

    const errorStyles = error
      ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-200'
      : '';

    return (
      <div className={`${width === 'full' ? 'w-full' : 'w-auto'} ${className} animate-fade-in`}>
        {label && (
          <label
            htmlFor={props.id}
            className={`block text-sm font-medium mb-1.5 ${
              error ? 'text-red-500' : 'text-gray-700'
            } font-arabic`}
          >
            {label}
          </label>
        )}
        <div
          className={`relative border-2 rounded-xl ${
            error ? errorStyles : variantStyles[variant]
          } bg-white transition-colors focus-within:ring-4`}
        >
          <textarea
            {...props}
            ref={ref}
            rows={rows}
            className="w-full py-2.5 px-4 focus:outline-none bg-transparent text-gray-900 placeholder-gray-400 font-arabic resize-y"
          />
        </div>
        {(hint || error) && (
          <p
            className={`mt-1.5 text-xs ${
              error ? 'text-red-500' : 'text-gray-500'
            } font-arabic`}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'بحث...',
  value,
  onChange,
  onSearch,
  className = '',
  variant = 'default',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value || '');
    }
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(value || '');
    }
  };

  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      leftIcon={<i className="fas fa-search" />}
      rightIcon={<i className="fas fa-arrow-right" />}
      onRightIconClick={handleSearchClick}
      className={className}
      variant={variant}
    />
  );
};