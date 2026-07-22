'use client';

import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import NeonInput from '@/components/ui/NeonInput';
import { Shield, Phone, User, Search, Info, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeroTeam } from '@/lib/hero-teams';

interface StepTeamInfoProps {
  availableHeroTeams: HeroTeam[];
}

export default function StepTeamInfo({ availableHeroTeams }: StepTeamInfoProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const selectedTeamName = watch('team_name');
  const [search, setSearch] = useState('');

  const selectedHero = availableHeroTeams.find((h) => h.team_name === selectedTeamName);

  const filteredTeams = availableHeroTeams.filter(
    (item) =>
      item.team_name.toLowerCase().includes(search.toLowerCase()) ||
      item.hero.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Informasi Tim Pahlawan
        </h2>
        <p className="text-slate-600 text-sm font-body mt-1">
          Pilih nama tim Pahlawan Nasional untuk tim kamu dan lengkapi data kapten.
        </p>
      </div>

      {/* Rules Notice */}
      <div className="rounded-xl p-4 border border-red-200 bg-red-50/70 shadow-sm">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-body text-slate-800 leading-relaxed">
              <span className="text-red-700 font-bold uppercase tracking-wider">Aturan Nama Pahlawan: ⚔️</span>
              <br />
              Setiap tim memilih 1 nama Pahlawan Nasional. Profil singkat pahlawan akan dibacakan oleh panitia saat tim kamu bertanding di panggung!
            </p>
          </div>
        </div>
      </div>

      {/* Hero Team Selection Dropdown / Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-body font-semibold text-slate-800">
          Pilih Nama Tim Pahlawan <span className="text-red-600">*</span>
        </label>
        
        {/* Hidden input for react-hook-form */}
        <input type="hidden" {...register('team_name')} />

        {/* Selected hero preview box */}
        {selectedHero ? (
          <div className="p-4 rounded-xl border-2 border-red-500 bg-white shadow-md flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <span className="font-display font-bold text-slate-900 text-lg">
                  {selectedHero.team_name}
                </span>
                <span className="text-xs font-mono font-semibold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                  {selectedHero.hero}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setValue('team_name', '', { shouldValidate: true })}
                className="text-xs font-semibold text-red-600 hover:text-red-800 underline font-body"
              >
                Ganti Pilihan
              </button>
            </div>
            <p className="text-xs font-body text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900">&quot;{selectedHero.title}&quot;</span> — {selectedHero.desc}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ketik untuk cari pahlawan / nama tim..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-body text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm"
              />
            </div>

            {/* List options */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredTeams.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 font-body bg-white rounded-xl border border-slate-200">
                  Nama pahlawan tidak ditemukan atau sudah terpakai tim lain.
                </div>
              ) : (
                filteredTeams.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setValue('team_name', item.team_name, { shouldValidate: true });
                    }}
                    className={cn(
                      'w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 shadow-sm',
                      'bg-white hover:bg-red-50/50 hover:border-red-400 border-slate-200 text-slate-900'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-slate-900 text-base">
                        {item.team_name}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.hero}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-body line-clamp-1">
                      <span className="text-red-600 font-semibold">{item.title}</span> — {item.desc}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {errors.team_name && (
          <p className="text-xs text-red-600 font-body font-semibold mt-1 flex items-center gap-1">
            <span>⚠</span> {errors.team_name.message as string}
          </p>
        )}
      </div>

      {/* Captain Name */}
      <NeonInput
        label="Nama Lengkap Kapten"
        placeholder="Masukkan nama asli kapten tim"
        required
        error={errors.captain_name?.message as string}
        icon={<User className="w-4 h-4 text-slate-500" />}
        {...register('captain_name')}
      />

      {/* WhatsApp */}
      <NeonInput
        label="Nomor WhatsApp Kapten"
        placeholder="08xx atau +628xx"
        required
        type="tel"
        error={errors.whatsapp?.message as string}
        hint="Akan digunakan panitia untuk konfirmasi pembayaran & koordinasi"
        icon={<Phone className="w-4 h-4 text-slate-500" />}
        {...register('whatsapp')}
      />
    </div>
  );
}
