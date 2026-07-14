'use client';

import { useFormContext } from 'react-hook-form';
import { formatCurrency } from '@/lib/utils';
import { Shield, User, Hash, Server, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StepReview() {
  const {
    watch,
    register,
    formState: { errors },
  } = useFormContext();

  const teamName = watch('team_name');
  const captainName = watch('captain_name');
  const whatsapp = watch('whatsapp');
  const logoPreview = watch('logoPreview');
  const players = watch('players') || [];
  const substitutes = watch('substitutes') || [];
  const fee = parseInt(process.env.NEXT_PUBLIC_REGISTRATION_FEE || '50000');

  const filledSubs = substitutes.filter(
    (s: { nickname?: string }) => s && s.nickname
  );

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="mb-2">
        <h2 className="font-display text-xl font-bold text-white">
          Konfirmasi Pendaftaran
        </h2>
        <p className="text-slate-400 text-sm font-body mt-1">
          Periksa kembali data sebelum submit.
        </p>
      </div>

      {/* Team Info */}
      <ReviewSection title="Informasi Tim" icon="🏆">
        <div className="grid grid-cols-2 gap-3">
          <ReviewField label="Nama Tim" value={teamName} highlight />
          <ReviewField label="Kapten" value={captainName} />
          <ReviewField label="WhatsApp" value={whatsapp} />
          {logoPreview && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Logo Tim</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreview}
                alt="Logo"
                className="w-12 h-12 rounded-lg object-cover border border-neon-blue/20"
              />
            </div>
          )}
        </div>
      </ReviewSection>

      {/* Players */}
      <ReviewSection title="Pemain Inti (5)" icon="⚔️">
        <div className="space-y-2">
          {players.map((player: { full_name: string; nickname: string; mlbb_id: string; server_id: string }, idx: number) => (
            <div
              key={idx}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg',
                idx === 0 ? 'bg-neon-gold/5 border border-neon-gold/20' : 'bg-dark-600/50'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold shrink-0',
                idx === 0 ? 'bg-neon-gold/20 text-neon-gold' : 'bg-neon-blue/10 text-neon-blue'
              )}>
                {idx === 0 ? <Shield className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium text-white truncate">
                  {player.nickname || '—'}
                  {idx === 0 && <span className="text-neon-gold text-xs ml-1">(Kapten)</span>}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {player.mlbb_id} · Server: {player.server_id}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ReviewSection>

      {/* Substitutes */}
      {filledSubs.length > 0 && (
        <ReviewSection title={`Pemain Cadangan (${filledSubs.length})`} icon="🛡️">
          <div className="space-y-2">
            {filledSubs.map((player: { full_name: string; nickname: string; mlbb_id: string; server_id: string }, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-dark-600/50">
                <div className="w-7 h-7 rounded-full bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-xs font-display font-bold text-neon-purple shrink-0">
                  C{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-white truncate">{player.nickname}</p>
                  <p className="text-xs text-slate-500 font-mono">ID: {player.mlbb_id} · Server: {player.server_id}</p>
                </div>
              </div>
            ))}
          </div>
        </ReviewSection>
      )}

      {/* Payment Info */}
      <div className="glass-card rounded-xl p-4 border border-neon-gold/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-body text-slate-400">Biaya Pendaftaran</p>
            <p className="text-xs text-slate-500 font-body mt-0.5">Pembayaran via QRIS / Transfer Bank</p>
          </div>
          <p className="text-xl font-display font-bold text-neon-gold neon-text-gold">
            {formatCurrency(fee)}
          </p>
        </div>
      </div>

      {/* Rules */}
      <div className="glass-card rounded-xl p-4 border border-dark-400/50 space-y-3">
        <p className="text-xs font-body text-slate-400 font-semibold uppercase tracking-wide">
          Peraturan Tournament
        </p>
        <ul className="space-y-1.5">
          {[
            'Setiap tim wajib hadir tepat waktu saat pertandingan dimulai',
            'Penggunaan cheat/hack akan langsung didiskualifikasi',
            'Keputusan panitia bersifat final dan tidak dapat diganggu gugat',
            'Pembayaran yang telah dilakukan tidak dapat dikembalikan',
            'Tim wajib menggunakan pemain yang terdaftar',
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-400 font-body">
              <span className="text-neon-blue mt-0.5 shrink-0">›</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Agreement */}
      <div className={cn(
        'glass-card rounded-xl p-4 border transition-all',
        errors.agreed ? 'border-red-500/40' : 'border-dark-400/50'
      )}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="custom-checkbox mt-0.5"
            {...register('agreed')}
          />
          <span className="text-sm font-body text-slate-300 leading-relaxed">
            Saya menyatakan bahwa semua data yang diisi adalah{' '}
            <span className="text-white font-semibold">benar dan akurat</span>, dan saya
            setuju dengan{' '}
            <span className="text-neon-blue">peraturan turnamen</span> yang berlaku.
          </span>
        </label>
        {errors.agreed && (
          <div className="flex items-center gap-2 mt-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <p className="text-xs text-red-400 font-body">
              {errors.agreed.message as string}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl overflow-hidden border border-dark-400/50">
      <div className="px-4 py-3 border-b border-dark-400/50 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <p className="text-sm font-display font-semibold text-white">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ReviewField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500 font-body mb-0.5">{label}</p>
      <p className={cn('text-sm font-body font-medium', highlight ? 'text-neon-blue' : 'text-white')}>
        {value || '—'}
      </p>
    </div>
  );
}
