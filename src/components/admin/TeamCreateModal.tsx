'use client';

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X, Users, Shield, Loader2, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { createTeamManual } from '@/lib/admin-actions';
import NeonButton from '@/components/ui/NeonButton';
import { cn } from '@/lib/utils';

interface TeamCreateModalProps {
  availableHeroTeams: { id: number; hero: string; team_name: string; title: string; desc: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

interface PlayerInput {
  full_name: string;
  nickname: string;
  mlbb_id: string;
  server_id: string;
}

interface FormValues {
  team_name: string;
  captain_name: string;
  whatsapp: string;
  payment_status: 'paid' | 'pending';
  corePlayers: PlayerInput[];
  subPlayers: PlayerInput[];
}

export default function TeamCreateModal({ availableHeroTeams, onClose, onSuccess }: TeamCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchHero, setSearchHero] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      team_name: '',
      captain_name: '',
      whatsapp: '',
      payment_status: 'pending',
      corePlayers: Array.from({ length: 5 }, () => ({ full_name: '', nickname: '', mlbb_id: '', server_id: '' })),
      subPlayers: Array.from({ length: 2 }, () => ({ full_name: '', nickname: '', mlbb_id: '', server_id: '' }))
    }
  });

  // Register team_name validation rule
  React.useEffect(() => {
    register('team_name', { required: 'Pilih nama tim pahlawan' });
  }, [register]);

  const selectedTeamName = watch('team_name');

  const filteredHeroes = useMemo(() => {
    if (!searchHero) return availableHeroTeams;
    const lower = searchHero.toLowerCase();
    return availableHeroTeams.filter(h => 
      h.hero.toLowerCase().includes(lower) || h.team_name.toLowerCase().includes(lower)
    );
  }, [availableHeroTeams, searchHero]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Validate subs: only include if at least one field is filled, but if any field is filled, all must be filled
      const validSubs = data.subPlayers.filter(p => p.full_name || p.nickname || p.mlbb_id || p.server_id);
      
      for (const sub of validSubs) {
        if (!sub.full_name || !sub.nickname || !sub.mlbb_id || !sub.server_id) {
          toast.error('Mohon lengkapi semua data pemain cadangan jika diisi');
          setIsSubmitting(false);
          return;
        }
      }

      if (!data.team_name) {
        toast.error('Pilih nama tim pahlawan');
        setIsSubmitting(false);
        return;
      }

      const result = await createTeamManual({
        team_name: data.team_name,
        captain_name: data.captain_name,
        whatsapp: data.whatsapp,
        payment_status: data.payment_status,
        players: [
          ...data.corePlayers.map((p, i) => ({ ...p, player_type: 'core' as const, player_order: i + 1 })),
          ...validSubs.map((p, i) => ({ ...p, player_type: 'substitute' as const, player_order: i + 1 })),
        ],
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Tim berhasil ditambahkan!');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Gagal menambahkan tim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-slate-900 font-bold flex items-center gap-2">
            <Shield className="text-red-600 w-6 h-6" />
            Tambah Tim Baru
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 font-body">
          <form id="team-create-form" onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log('Form validation errors:', errors);
            toast.error('Mohon lengkapi semua field pendaftaran yang wajib diisi!');
          })} className="space-y-8">
            
            {/* General Info */}
            <div className="space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="font-display font-semibold text-lg text-slate-800 flex items-center gap-2">
                Info Tim & Kontak
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label className="font-mono text-sm font-medium text-slate-700">Nama Tim Pahlawan</label>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg text-left transition-colors",
                        dropdownOpen ? "border-red-500 ring-1 ring-red-500" : "border-slate-300 hover:border-slate-400"
                      )}
                    >
                      <span className={cn("truncate", !selectedTeamName && "text-slate-400")}>
                        {selectedTeamName || "Pilih pahlawan..."}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-2 border-b border-slate-100">
                          <input 
                            type="text" 
                            placeholder="Cari hero atau tim..." 
                            value={searchHero}
                            onChange={e => setSearchHero(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1">
                          {filteredHeroes.map(h => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => {
                                setValue('team_name', h.team_name, { shouldValidate: true });
                                setDropdownOpen(false);
                                setSearchHero('');
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 text-left rounded-md hover:bg-red-50 transition-colors"
                            >
                              <div>
                                <div className="font-medium text-slate-900">{h.team_name}</div>
                                <div className="text-xs text-slate-500">Hero: {h.hero}</div>
                              </div>
                              {selectedTeamName === h.team_name && <Check className="w-4 h-4 text-red-600" />}
                            </button>
                          ))}
                          {filteredHeroes.length === 0 && (
                            <div className="p-3 text-sm text-center text-slate-500">Tidak ada pahlawan ditemukan</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.team_name && <p className="text-sm text-red-500 mt-1">Wajib dipilih</p>}
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-sm font-medium text-slate-700">Nama Kapten</label>
                  <input
                    {...register('captain_name', { required: 'Wajib diisi', minLength: { value: 3, message: 'Minimal 3 karakter' } })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    placeholder="Nama Kapten"
                  />
                  {errors.captain_name && <p className="text-sm text-red-500">{errors.captain_name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-sm font-medium text-slate-700">WhatsApp</label>
                  <input
                    {...register('whatsapp', { required: 'Wajib diisi', minLength: { value: 10, message: 'Minimal 10 digit' } })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    placeholder="08xxxxxxxxxx"
                    type="tel"
                  />
                  {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-sm font-medium text-slate-700">Status Pembayaran</label>
                  <select
                    {...register('payment_status')}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors appearance-none"
                  >
                    <option value="pending">Menunggu (Pending)</option>
                    <option value="paid">Lunas (Paid)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Core Players */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Users className="w-5 h-5 text-red-600" />
                5 Pemain Inti (Wajib)
              </h3>
              <div className="space-y-4">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div key={`core-${index}`} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-red-200 transition-colors">
                    <div className="col-span-1 sm:col-span-4 flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">Pemain Inti {index + 1}</span>
                    </div>
                    <div>
                      <input
                        {...register(`corePlayers.${index}.full_name` as const, { required: 'Wajib diisi' })}
                        placeholder="Nama Lengkap"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                      {errors.corePlayers?.[index]?.full_name && <p className="text-xs text-red-500 mt-1">Wajib diisi</p>}
                    </div>
                    <div>
                      <input
                        {...register(`corePlayers.${index}.nickname` as const, { required: 'Wajib diisi' })}
                        placeholder="IGN / Nickname"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                      {errors.corePlayers?.[index]?.nickname && <p className="text-xs text-red-500 mt-1">Wajib diisi</p>}
                    </div>
                    <div>
                      <input
                        {...register(`corePlayers.${index}.mlbb_id` as const, { required: 'Wajib diisi' })}
                        placeholder="MLBB ID (Contoh: 12345678)"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                      {errors.corePlayers?.[index]?.mlbb_id && <p className="text-xs text-red-500 mt-1">Wajib diisi</p>}
                    </div>
                    <div>
                      <input
                        {...register(`corePlayers.${index}.server_id` as const, { required: 'Wajib diisi' })}
                        placeholder="Server ID (Contoh: 1234)"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                      {errors.corePlayers?.[index]?.server_id && <p className="text-xs text-red-500 mt-1">Wajib diisi</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Substitute Players */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Users className="w-5 h-5 text-slate-400" />
                2 Pemain Cadangan (Opsional)
              </h3>
              <div className="space-y-4">
                {[0, 1].map((index) => (
                  <div key={`sub-${index}`} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                    <div className="col-span-1 sm:col-span-4 flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">Pemain Cadangan {index + 1}</span>
                    </div>
                    <div>
                      <input
                        {...register(`subPlayers.${index}.full_name` as const)}
                        placeholder="Nama Lengkap"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <input
                        {...register(`subPlayers.${index}.nickname` as const)}
                        placeholder="IGN / Nickname"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <input
                        {...register(`subPlayers.${index}.mlbb_id` as const)}
                        placeholder="MLBB ID"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <input
                        {...register(`subPlayers.${index}.server_id` as const)}
                        placeholder="Server ID"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-full font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          
          <NeonButton
            type="submit"
            form="team-create-form"
            disabled={isSubmitting}
            className="px-8 py-2.5 h-11"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Menyimpan...
              </span>
            ) : (
              'Simpan Tim'
            )}
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
