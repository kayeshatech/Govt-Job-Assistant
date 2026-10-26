import React, { ReactNode } from 'react';
import { Button } from '../common/Button';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-starlight border border-dashed border-opaline/90 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-opaline/30 flex items-center justify-center text-wisteria mb-4 shadow-sm border border-opaline/40">
        {icon}
      </div>
      <h3 className="text-base font-bold text-nocturne mb-1.5">{title}</h3>
      <p className="text-sm text-wisteria/90 max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
