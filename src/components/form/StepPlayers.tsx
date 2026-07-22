'use client';

import PlayerCard from './PlayerCard';
import { Sword } from 'lucide-react';

export default function StepPlayers() {
  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Pemain Inti (5 Pemain)
        </h2>
        <p className="text-slate-600 text-sm font-body mt-1">
          Daftarkan 5 pemain inti tim kamu. Pemain 1 otomatis menjadi kapten.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-start gap-3">
        <Sword className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <p className="text-xs font-body text-slate-700 leading-relaxed">
          <span className="text-red-600 font-bold">Penting:</span> MLBB ID dan Server ID dapat ditemukan di profil in-game kamu (sebelah Nickname). Pastikan semua data akurat untuk verifikasi panitia.
        </p>
      </div>

      {/* Player cards */}
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((idx) => (
          <PlayerCard
            key={idx}
            index={idx}
            prefix="players"
            isRequired={true}
            isCaptain={idx === 0}
            label={idx === 0 ? 'Pemain 1 (Kapten)' : `Pemain ${idx + 1}`}
            defaultOpen={idx === 0}
          />
        ))}
      </div>

      <p className="text-xs text-center text-slate-500 font-body">
        * Semua 5 pemain inti wajib diisi lengkap
      </p>
    </div>
  );
}
