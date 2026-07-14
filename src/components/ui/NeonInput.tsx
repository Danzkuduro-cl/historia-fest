'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const NeonInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-body font-medium text-slate-300">
          {label}
          {props.required && <span className="text-neon-blue ml-1">*</span>}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'neon-input w-full rounded-lg px-3 py-2.5 text-sm font-body',
              icon && 'pl-10',
              error && 'error',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 font-body flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-slate-500 font-body">{hint}</p>
        )}
      </div>
    );
  }
);

NeonInput.displayName = 'NeonInput';
export default NeonInput;
