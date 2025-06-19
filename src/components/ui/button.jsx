import React from 'react';

export const Button = React.forwardRef(function Button({ className = '', size = 'md', ...props }, ref) {
  const sizeClasses = {
    lg: 'px-6 py-3 text-lg',
    md: 'px-4 py-2 text-base',
    sm: 'px-3 py-1 text-sm'
  };
  return (
    <button ref={ref} className={`inline-flex items-center justify-center rounded-md font-medium focus:outline-none transition-colors ${sizeClasses[size] || sizeClasses.md} ${className}`} {...props} />
  );
});
