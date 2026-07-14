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
    primary: 'bg-neon-blue text-dark-900 hover:bg-neon-blue/90 shadow-neon-blue font-bold',
    secondary: 'bg-transparent border border-neon-blue/40 text-neon-blue hover:bg-neon-blue/10 hover:border-neon-blue',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5',
    danger: 'bg-transparent border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500',
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
