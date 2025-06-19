import React from 'react';

export function Badge({ className = '', variant = 'default', ...props }) {
  const base = 'inline-block px-2 py-1 text-xs font-semibold rounded';
  const variantClass = variant === 'outline' ? 'border' : '';
  return <span className={`${base} ${variantClass} ${className}`} {...props} />;
}
