'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function NeonButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: NeonButtonProps) {
  const variants = {
    primary: 'bg-red-600 text-white hover:bg-red-700 shadow-md font-bold',
    secondary: 'bg-transparent border border-red-600/40 text-red-600 hover:bg-red-50 hover:border-red-600',
    ghost: 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100',
    danger: 'bg-transparent border border-red-600/40 text-red-600 hover:bg-red-50 hover:border-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'btn-neon rounded-lg font-display font-semibold tracking-wide transition-all duration-200',
        'flex items-center justify-center gap-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}
