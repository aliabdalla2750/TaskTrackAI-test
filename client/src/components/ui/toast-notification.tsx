import React, { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastNotificationProps {
  type: ToastType;
  title: string;
  message: string;
  onClose: () => void;
}

export function ToastNotification({ type, title, message, onClose }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for the fade out animation to complete
    }, 4700); // 5 seconds - 300ms for animation
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'fa-check',
          bg: 'bg-secondary',
        };
      case 'error':
        return {
          icon: 'fa-exclamation-circle',
          bg: 'bg-red-500',
        };
      case 'warning':
        return {
          icon: 'fa-exclamation-triangle',
          bg: 'bg-yellow-500',
        };
      case 'info':
      default:
        return {
          icon: 'fa-info-circle',
          bg: 'bg-primary',
        };
    }
  };
  
  const { icon, bg } = getIconAndColor();
  
  return (
    <div 
      className={`bg-white shadow-lg rounded-lg p-4 flex items-center gap-3 max-w-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center text-white`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-gray-600 text-xs">{message}</p>
      </div>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }} 
        className="text-gray-400 hover:text-gray-600 mr-auto"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}
