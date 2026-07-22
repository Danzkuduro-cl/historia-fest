'use client';

import PlayerCard from './PlayerCard';
import { UserPlus, Info } from 'lucide-react';

export default function StepSubstitutes() {
  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Pemain Cadangan (Opsional)
        </h2>
        <p className="text-slate-600 text-sm font-body mt-1">
          Maksimal 2 pemain cadangan. Bagian ini opsional.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
        <p className="text-xs font-body text-slate-700 leading-relaxed">
          <span className="text-slate-900 font-bold">Info:</span> Pemain cadangan dapat masuk menggantikan pemain inti jika diperlukan saat pertandingan. Jika tidak ada cadangan, langsung klik &quot;Lanjut&quot;.
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

      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
        <UserPlus className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
        <p className="text-xs text-slate-500 font-body">
          Pemain cadangan bersifat opsional. Kamu bisa lanjut tanpa mengisi bagian ini.
        </p>
      </div>
    </div>
  );
}
