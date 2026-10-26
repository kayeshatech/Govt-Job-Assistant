import React, { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface Option {
  label: string;
  value: string | number;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, helperText, error, leftIcon, containerClassName = '', className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-nocturne mb-1.5 uppercase tracking-wider">
            {label}
            {props.required && <span className="text-wisteria ml-0.5">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-wisteria">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none rounded-lg bg-starlight text-eclipse text-sm border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-wisteria focus:border-wisteria disabled:opacity-50 ${
              leftIcon ? 'pl-9' : 'pl-3.5'
            } pr-9 py-2.5 ${
              error ? 'border-wisteria ring-1 ring-wisteria' : 'border-opaline/80 hover:border-aurora'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-wisteria">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-wisteria font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-wisteria/80">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
