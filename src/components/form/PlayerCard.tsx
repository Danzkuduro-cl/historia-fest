'use client';

import { useFormContext } from 'react-hook-form';
import NeonInput from '@/components/ui/NeonInput';
import { Shield, User, Hash, Server, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  index: number;
  prefix: string; // 'players' or 'substitutes'
  isRequired?: boolean;
  isCaptain?: boolean;
  label: string;
  defaultOpen?: boolean;
}

export default function PlayerCard({
  index,
  prefix,
  isRequired = true,
  isCaptain = false,
  label,
  defaultOpen = false,
}: PlayerCardProps) {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const nickname = watch(`${prefix}.${index}.nickname`);
  const mlbbId = watch(`${prefix}.${index}.mlbb_id`);

  const getError = (field: string) => {
    const fieldErrors = errors as Record<string, unknown>;
    const parts = `${prefix}.${index}.${field}`.split('.');
    let current: unknown = fieldErrors;
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return (current as { message?: string })?.message;
  };

  const isFilled = nickname && mlbbId;

  return (
    <div
      className={cn(
        'glass-card rounded-xl border transition-all duration-200',
        isCaptain
          ? 'border-neon-gold/30 shadow-neon-gold/10'
          : 'border-neon-blue/10 hover:border-neon-blue/20'
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display font-bold',
              isCaptain
                ? 'bg-neon-gold/20 text-neon-gold border border-neon-gold/30'
                : isFilled
                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                : 'bg-dark-500 text-slate-500 border border-dark-400'
            )}
          >
            {isCaptain ? <Shield className="w-4 h-4" /> : index + 1}
          </div>
          <div className="text-left">
            <p className={cn('text-sm font-display font-semibold', isCaptain ? 'text-neon-gold' : 'text-white')}>
              {label}
            </p>
            {nickname && (
              <p className="text-xs font-mono text-slate-400">
                {nickname}{mlbbId ? ` · ID: ${mlbbId}` : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isFilled && (
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-body">
              ✓ Lengkap
            </span>
          )}
          {!isRequired && (
            <span className="text-xs text-slate-500 font-body">Opsional</span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Form fields */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-4 animate-fade-in">
          <div className="grid grid-cols-1 gap-3">
            <NeonInput
              label="Nama Lengkap"
              placeholder="Nama asli pemain"
              required={isRequired}
              error={getError('full_name')}
              icon={<User className="w-4 h-4" />}
              {...register(`${prefix}.${index}.full_name`)}
            />

            <NeonInput
              label="Nickname MLBB"
              placeholder="Username in-game"
              required={isRequired}
              error={getError('nickname')}
              icon={<Hash className="w-4 h-4" />}
              {...register(`${prefix}.${index}.nickname`)}
            />

            <div className="grid grid-cols-2 gap-3">
              <NeonInput
                label="MLBB ID"
                placeholder="Contoh: 123456789"
                required={isRequired}
                error={getError('mlbb_id')}
                type="text"
                inputMode="numeric"
                hint="Hanya angka"
                icon={<Hash className="w-4 h-4" />}
                {...register(`${prefix}.${index}.mlbb_id`)}
              />

              <NeonInput
                label="Server ID"
                placeholder="Contoh: 1234"
                required={isRequired}
                error={getError('server_id')}
                type="text"
                inputMode="numeric"
                hint="Hanya angka"
                icon={<Server className="w-4 h-4" />}
                {...register(`${prefix}.${index}.server_id`)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
