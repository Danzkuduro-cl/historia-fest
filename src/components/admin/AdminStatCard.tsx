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
    blue: { border: 'border-neon-blue/20', icon: 'text-neon-blue bg-neon-blue/10', value: 'text-neon-blue' },
    green: { border: 'border-green-500/20', icon: 'text-green-400 bg-green-500/10', value: 'text-green-400' },
    yellow: { border: 'border-yellow-500/20', icon: 'text-yellow-400 bg-yellow-500/10', value: 'text-yellow-400' },
    purple: { border: 'border-neon-purple/20', icon: 'text-neon-purple bg-neon-purple/10', value: 'text-neon-purple' },
    red: { border: 'border-red-500/20', icon: 'text-red-400 bg-red-500/10', value: 'text-red-400' },
  };

  const c = colors[color];

  return (
    <div className={cn('glass-card rounded-xl p-4 border', c.border)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-body text-slate-400 uppercase tracking-wide">{label}</p>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', c.icon)}>
          {icon}
        </div>
      </div>
      <p className={cn('text-2xl font-display font-bold', c.value)}>{value}</p>
      {sub && <p className="text-xs text-slate-500 font-body mt-1">{sub}</p>}
    </div>
  );
}
