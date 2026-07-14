'use client';

import PlayerCard from './PlayerCard';
import { UserPlus, Info } from 'lucide-react';

export default function StepSubstitutes() {
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="mb-2">
        <h2 className="font-display text-xl font-bold text-white">
          Pemain Cadangan
        </h2>
        <p className="text-slate-400 text-sm font-body mt-1">
          Maksimal 2 pemain cadangan. Bagian ini opsional.
        </p>
      </div>

      {/* Info banner */}
      <div className="glass-card rounded-xl p-3 border border-neon-purple/15 flex items-start gap-3">
        <Info className="w-4 h-4 text-neon-purple shrink-0 mt-0.5" />
        <p className="text-xs font-body text-slate-400">
          <span className="text-neon-purple font-semibold">Info:</span> Pemain cadangan dapat masuk menggantikan pemain inti jika diperlukan. Jika tidak ada, lewati langkah ini.
        </p>
      </div>

      {/* Substitute players */}
      <div className="space-y-3">
        {[0, 1].map((idx) => (
          <PlayerCard
            key={idx}
            index={idx}
            prefix="substitutes"
            isRequired={false}
            isCaptain={false}
            label={`Pemain Cadangan ${idx + 1}`}
            defaultOpen={false}
          />
        ))}
      </div>

      <div className="glass-card rounded-xl p-4 border border-dark-400/50 text-center">
        <UserPlus className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-500 font-body">
          Pemain cadangan bersifat opsional. Kamu bisa lanjut tanpa mengisi bagian ini.
        </p>
      </div>
    </div>
  );
}
