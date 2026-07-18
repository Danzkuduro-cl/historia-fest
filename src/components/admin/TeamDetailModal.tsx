'use client';

import { X, Shield, User, Hash, Phone, Trophy } from 'lucide-react';
import { getPaymentStatusColor, getPaymentStatusLabel, formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Player {
  id: string;
  player_type: string;
  player_order: number;
  full_name: string;
  nickname: string;
  mlbb_id: string;
  server_id: string;
}

interface TeamDetailModalProps {
  team: {
    id: string;
    team_name: string;
    captain_name: string;
    whatsapp: string;
    logo_url?: string;
    registration_code: string;
    payment_status: string;
    created_at: string;
    players: Player[];
    payments: { amount: number; payment_method?: string; transaction_id: string }[];
  };
  onClose: () => void;
}

export default function TeamDetailModal({ team, onClose }: TeamDetailModalProps) {
  const corePlayers = (team.players || [])
    .filter((p) => p.player_type === 'core')
    .sort((a, b) => (a.player_order || 0) - (b.player_order || 0));

  const subPlayers = (team.players || []).filter((p) => p.player_type === 'substitute');
  const payment = team.payments?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-slate-200 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            {team.logo_url ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                <Image src={team.logo_url} alt={team.team_name} width={40} height={40} className="object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-red-600" />
              </div>
            )}
            <div>
              <h2 className="font-display font-bold text-slate-900">{team.team_name}</h2>
              <code className="text-xs font-mono text-red-600">{team.registration_code}</code>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status + captain */}
          <div className="grid grid-cols-2 gap-3">
            <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Kapten" value={team.captain_name} />
            <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="WhatsApp" value={team.whatsapp} />
            <div className="col-span-2">
              <p className="text-xs text-slate-500 font-body mb-1">Status Pembayaran</p>
              <span className={cn('px-3 py-1 rounded-full text-xs font-mono border font-semibold', getPaymentStatusColor(team.payment_status))}>
                {getPaymentStatusLabel(team.payment_status)}
              </span>
            </div>
            {payment && (
              <>
                <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label="Jumlah" value={formatCurrency(payment.amount)} />
                {payment.payment_method && (
                  <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label="Metode" value={payment.payment_method.toUpperCase()} />
                )}
              </>
            )}
          </div>

          {/* Core players */}
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
              Pemain Inti ({corePlayers.length}/5)
            </p>
            <div className="space-y-2">
              {corePlayers.map((player, idx) => (
                <div key={player.id} className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  idx === 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                )}>
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border',
                    idx === 0 ? 'bg-red-100 text-red-600 border-red-300' : 'bg-white text-slate-600 border-slate-200'
                  )}>
                    {idx === 0 ? <Shield className="w-3 h-3" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium text-slate-900 truncate">
                      {player.nickname}
                      {idx === 0 && <span className="text-red-600 text-xs ml-1">(Kapten)</span>}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{player.full_name}</p>
                    <p className="text-xs text-slate-400 font-mono">ID: {player.mlbb_id} · Server: {player.server_id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subs */}
          {subPlayers.length > 0 && (
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
                Pemain Cadangan ({subPlayers.length})
              </p>
              <div className="space-y-2">
                {subPlayers.map((player) => (
                  <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                      C
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body font-medium text-slate-900 truncate">{player.nickname}</p>
                      <p className="text-xs text-slate-500 font-mono">{player.full_name}</p>
                      <p className="text-xs text-slate-400 font-mono">ID: {player.mlbb_id} · Server: {player.server_id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-body mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="text-slate-400">{icon}</span>
        <p className="text-sm font-body text-slate-900">{value}</p>
      </div>
    </div>
  );
}
