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
  const fullName = watch(`${prefix}.${index}.full_name`);
  const nickname = watch(`${prefix}.${index}.nickname`);
  const mlbbId = watch(`${prefix}.${index}.mlbb_id`);
  const serverId = watch(`${prefix}.${index}.server_id`);

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

  // Truly filled only when ALL fields are provided
  const isFilled = Boolean(fullName && nickname && mlbbId && serverId);

  return (
    <div
      className={cn(
        'bg-white rounded-xl border transition-all duration-200 shadow-sm',
        isCaptain
          ? 'border-red-300 ring-1 ring-red-100'
          : 'border-slate-200 hover:border-slate-300'
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
              'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-display font-bold border',
              isCaptain
                ? 'bg-red-100 text-red-600 border-red-200'
                : isFilled
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            )}
          >
            {isCaptain ? <Shield className="w-4 h-4" /> : index + 1}
          </div>
          <div className="text-left">
            <p className={cn('text-sm font-display font-bold', isCaptain ? 'text-red-600' : 'text-slate-900')}>
              {label}
            </p>
            {nickname ? (
              <p className="text-xs font-mono text-slate-500">
                {nickname}{mlbbId ? ` · ID: ${mlbbId}` : ''}{serverId ? ` (${serverId})` : ''}
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-body">Belum diisi</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isFilled && (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-body font-semibold">
              ✓ Lengkap
            </span>
          )}
          {!isRequired && (
            <span className="text-xs text-slate-500 font-body font-medium">Opsional</span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Form fields */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-4">
          <div className="grid grid-cols-1 gap-3">
            <NeonInput
              label="Nama Lengkap Pemain"
              placeholder="Nama asli pemain"
              required={isRequired}
              error={getError('full_name')}
              icon={<User className="w-4 h-4 text-slate-500" />}
              {...register(`${prefix}.${index}.full_name`)}
            />

            <NeonInput
              label="Nickname MLBB"
              placeholder="Username in-game"
              required={isRequired}
              error={getError('nickname')}
              icon={<Hash className="w-4 h-4 text-slate-500" />}
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
                icon={<Hash className="w-4 h-4 text-slate-500" />}
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
                icon={<Server className="w-4 h-4 text-slate-500" />}
                {...register(`${prefix}.${index}.server_id`)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
