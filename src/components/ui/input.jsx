import React from 'react';

export const Input = React.forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input ref={ref} className={`px-3 py-2 rounded-md border bg-gray-800 text-white focus:outline-none ${className}`} {...props} />
  );
});
