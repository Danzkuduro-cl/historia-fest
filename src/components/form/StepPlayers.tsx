'use client';

import PlayerCard from './PlayerCard';
import { Sword } from 'lucide-react';

export default function StepPlayers() {
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="mb-2">
        <h2 className="font-display text-xl font-bold text-white">
          Pemain Inti
        </h2>
        <p className="text-slate-400 text-sm font-body mt-1">
          Daftarkan 5 pemain inti tim kamu. Pemain 1 otomatis menjadi kapten.
        </p>
      </div>

      {/* Info banner */}
      <div className="glass-card rounded-xl p-3 border border-neon-blue/15 flex items-start gap-3">
        <Sword className="w-4 h-4 text-neon-blue shrink-0 mt-0.5" />
        <p className="text-xs font-body text-slate-400">
          <span className="text-neon-blue font-semibold">Penting:</span> MLBB ID dan Server ID dapat ditemukan di profil in-game kamu. Pastikan data akurat untuk verifikasi.
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
        * Semua 5 pemain inti wajib diisi
      </p>
    </div>
  );
}
