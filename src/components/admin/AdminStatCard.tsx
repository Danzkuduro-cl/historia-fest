import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

export default function AdminStatCard({ label, value, sub, icon, color }: StatCardProps) {
  const colors = {
    blue:   { border: 'border-slate-200', icon: 'text-red-600 bg-red-50',     value: 'text-slate-900' },
    green:  { border: 'border-slate-200', icon: 'text-green-600 bg-green-50', value: 'text-slate-900' },
    yellow: { border: 'border-slate-200', icon: 'text-amber-600 bg-amber-50', value: 'text-slate-900' },
    purple: { border: 'border-slate-200', icon: 'text-red-600 bg-red-50',     value: 'text-slate-900' },
    red:    { border: 'border-slate-200', icon: 'text-red-600 bg-red-50',     value: 'text-slate-900' },
  };

  const c = colors[color];

  return (
    <div className={cn('bg-white rounded-xl p-4 border shadow-sm', c.border)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-body text-slate-500 uppercase tracking-wide">{label}</p>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', c.icon)}>
          {icon}
        </div>
      </div>
      <p className={cn('text-2xl font-display font-bold', c.value)}>{value}</p>
      {sub && <p className="text-xs text-slate-400 font-body mt-1">{sub}</p>}
    </div>
  );
}
