import React, { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, containerClassName = '', className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-nocturne mb-1.5 uppercase tracking-wider">
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
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg bg-starlight text-eclipse placeholder:text-opaline text-sm border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-wisteria focus:border-wisteria disabled:opacity-50 disabled:bg-opaline/20 ${
              leftIcon ? 'pl-9' : 'pl-3.5'
            } ${rightIcon ? 'pr-9' : 'pr-3.5'} py-2.5 ${
              error ? 'border-wisteria ring-1 ring-wisteria' : 'border-opaline/80 hover:border-aurora'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-wisteria">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-wisteria font-medium flex items-center gap-1">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-wisteria/80">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
