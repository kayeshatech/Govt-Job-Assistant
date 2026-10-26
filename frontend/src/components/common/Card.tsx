import React, { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'ghost' | 'interactive';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-200';

  const variantStyles = {
    default: 'bg-starlight border border-opaline/70 shadow-sm',
    elevated: 'bg-starlight border border-opaline/70 shadow-card hover:shadow-elevated',
    ghost: 'bg-transparent border border-opaline/40',
    interactive:
      'bg-starlight border border-opaline/70 shadow-sm hover:border-wisteria/60 hover:shadow-card cursor-pointer',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
