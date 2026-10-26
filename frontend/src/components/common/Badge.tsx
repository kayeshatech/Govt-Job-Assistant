import React, { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'active' | 'accent' | 'aurora' | 'outline' | 'subtle';
  size?: 'sm' | 'md';
  className?: string;
  icon?: ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  const variantStyles = {
    default: 'bg-opaline/40 text-nocturne border border-opaline/60',
    active: 'bg-nocturne text-starlight border border-nocturne',
    accent: 'bg-wisteria/15 text-nocturne border border-wisteria/40',
    aurora: 'bg-aurora/25 text-nocturne border border-aurora/50',
    outline: 'bg-transparent text-nocturne border border-opaline',
    subtle: 'bg-starlight text-wisteria border border-opaline/60',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full leading-none whitespace-nowrap transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
