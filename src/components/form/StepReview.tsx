'use client';

import { useFormContext } from 'react-hook-form';
import { formatCurrency } from '@/lib/utils';
import { Shield, AlertTriangle } from 'lucide-react';
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
  const players = watch('players') || [];
  const substitutes = watch('substitutes') || [];
  const fee = parseInt(process.env.NEXT_PUBLIC_REGISTRATION_FEE || '50000');

  const filledSubs = substitutes.filter(
    (s: { nickname?: string }) => s && s.nickname
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Konfirmasi Pendaftaran
        </h2>
        <p className="text-slate-600 text-sm font-body mt-1">
          Periksa kembali data sebelum submit.
        </p>
      </div>

      {/* Team Info */}
      <ReviewSection title="Informasi Tim Pahlawan" icon="⚔️">
        <div className="grid grid-cols-2 gap-3">
          <ReviewField label="Nama Tim Pahlawan" value={teamName} highlight />
          <ReviewField label="Kapten" value={captainName} />
          <ReviewField label="WhatsApp" value={whatsapp} />
        </div>
      </ReviewSection>

      {/* Players */}
      <ReviewSection title="Pemain Inti (5)" icon="🛡️">
        <div className="space-y-2">
          {players.map((player: { full_name: string; nickname: string; mlbb_id: string; server_id: string }, idx: number) => (
            <div
              key={idx}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                idx === 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold shrink-0 border',
                idx === 0 ? 'bg-red-100 text-red-600 border-red-300' : 'bg-white text-slate-700 border-slate-200'
              )}>
                {idx === 0 ? <Shield className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-semibold text-slate-900 truncate">
                  {player.nickname || '—'}
                  {idx === 0 && <span className="text-red-600 text-xs ml-1 font-bold">(Kapten)</span>}
                </p>
                <p className="text-xs text-slate-600 font-mono">
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
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-display font-bold text-slate-700 shrink-0">
                  C{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-semibold text-slate-900 truncate">{player.nickname}</p>
                  <p className="text-xs text-slate-600 font-mono">ID: {player.mlbb_id} · Server: {player.server_id}</p>
                </div>
              </div>
            ))}
          </div>
        </ReviewSection>
      )}

      {/* Payment Info */}
      <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-body font-semibold text-slate-700">Biaya Pendaftaran</p>
            <p className="text-xs text-slate-500 font-body mt-0.5">Pembayaran via QRIS / Transfer Bank / E-Wallet</p>
          </div>
          <p className="text-xl font-display font-bold text-red-600">
            {formatCurrency(fee)}
          </p>
        </div>
      </div>

      {/* Rules */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
        <p className="text-xs font-body text-slate-700 font-bold uppercase tracking-wide">
          Peraturan Tournament
        </p>
        <ul className="space-y-1.5">
          {[
            'Setiap tim wajib mempelajari profil pahlawan yang disandang',
            'Setiap tim wajib hadir tepat waktu saat pertandingan dimulai',
            'Penggunaan cheat/hack akan langsung didiskualifikasi',
            'Keputusan panitia bersifat final dan tidak dapat diganggu gugat',
            'Pembayaran yang telah dilakukan tidak dapat dikembalikan',
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700 font-body">
              <span className="text-red-600 font-bold mt-0.5 shrink-0">›</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Agreement */}
      <div className={cn(
        'bg-white rounded-xl p-4 border shadow-sm transition-all',
        errors.agreed ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'
      )}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="custom-checkbox mt-0.5"
            {...register('agreed')}
          />
          <span className="text-sm font-body text-slate-800 leading-relaxed">
            Saya menyatakan bahwa semua data yang diisi adalah{' '}
            <span className="text-slate-900 font-bold">benar dan akurat</span>, dan saya
            setuju dengan{' '}
            <span className="text-red-600 font-semibold">peraturan turnamen</span> yang berlaku.
          </span>
        </label>
        {errors.agreed && (
          <div className="flex items-center gap-2 mt-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <p className="text-xs text-red-600 font-body font-semibold">
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
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <p className="text-sm font-display font-bold text-slate-900">{title}</p>
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
      <p className={cn('text-sm font-body font-bold', highlight ? 'text-red-600' : 'text-slate-900')}>
        {value || '—'}
      </p>
    </div>
  );
}
