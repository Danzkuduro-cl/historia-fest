'use client';

import { useState, useEffect } from 'react';
import { X, Save, Users, Shield, Pencil } from 'lucide-react';
import NeonButton from '@/components/ui/NeonButton';
import { cn } from '@/lib/utils';
import { updateTeamAndPlayers } from '@/lib/admin-actions';
import toast from 'react-hot-toast';

interface Player {
  id?: string;
  player_type: string;
  player_order: number;
  full_name: string;
  nickname: string;
  mlbb_id: string;
  server_id: string;
}

interface TeamEditModalProps {
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
  onSuccess: () => void;
}

const emptyPlayer = (): Player => ({
  player_type: '',
  player_order: 0,
  full_name: '',
  nickname: '',
  mlbb_id: '',
  server_id: '',
});

export default function TeamEditModal({ team, onClose, onSuccess }: TeamEditModalProps) {
  const [captainName, setCaptainName] = useState(team.captain_name);
  const [whatsapp, setWhatsapp] = useState(team.whatsapp);
  
  const [corePlayers, setCorePlayers] = useState<Player[]>([]);
  const [subPlayers, setSubPlayers] = useState<Player[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cores = [...team.players].filter(p => p.player_type === 'core').sort((a, b) => a.player_order - b.player_order);
    const subs = [...team.players].filter(p => p.player_type === 'substitute').sort((a, b) => a.player_order - b.player_order);
    
    // Fill to 5 cores
    while (cores.length < 5) cores.push(emptyPlayer());
    // Fill to 2 subs
    while (subs.length < 2) subs.push(emptyPlayer());
    
    setCorePlayers(cores.slice(0, 5));
    setSubPlayers(subs.slice(0, 2));
  }, [team]);

  const handleCoreChange = (index: number, field: keyof Player, value: string) => {
    const newCores = [...corePlayers];
    newCores[index] = { ...newCores[index], [field]: value };
    setCorePlayers(newCores);
  };

  const handleSubChange = (index: number, field: keyof Player, value: string) => {
    const newSubs = [...subPlayers];
    newSubs[index] = { ...newSubs[index], [field]: value };
    setSubPlayers(newSubs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const validCores = corePlayers.filter(p => p.full_name && p.nickname && p.mlbb_id && p.server_id);
      const validSubs = subPlayers.filter(p => p.full_name || p.nickname || p.mlbb_id || p.server_id);
      
      const allSubsValid = validSubs.every(p => p.full_name && p.nickname && p.mlbb_id && p.server_id);

      if (validCores.length < 5) {
        setError('Semua 5 pemain inti harus diisi dengan lengkap.');
        setIsLoading(false);
        return;
      }

      if (!allSubsValid) {
        setError('Jika pemain cadangan diisi, semua datanya harus lengkap.');
        setIsLoading(false);
        return;
      }
      
      const payloadPlayers = [
        ...validCores.map((p, i) => ({ ...p, player_type: 'core' as const, player_order: i + 1 })),
        ...validSubs.map((p, i) => ({ ...p, player_type: 'substitute' as const, player_order: i + 1 })),
      ];

      const result = await updateTeamAndPlayers(team.id, {
        captain_name: captainName,
        whatsapp: whatsapp,
        players: payloadPlayers,
      });

      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success('Data tim berhasil diperbarui!');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan perubahan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2 rounded-lg">
              <Pencil className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="font-display font-bold text-xl text-slate-900">
              Edit Tim
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="edit-team-form" onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-body text-sm">
                {error}
              </div>
            )}

            {/* Read-only info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-1">
              <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">Nama Tim</span>
              <span className="font-display font-semibold text-lg text-slate-900">{team.team_name}</span>
            </div>

            {/* General Info */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Informasi Umum
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-slate-600 uppercase tracking-wider">Nama Kapten</label>
                  <input
                    type="text"
                    value={captainName}
                    onChange={e => setCaptainName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="font-mono text-xs text-slate-600 uppercase tracking-wider">No. WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Core Players */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                <h3 className="font-display font-bold text-lg text-slate-900">Pemain Inti (5 Pemain)</h3>
              </div>
              
              <div className="space-y-4">
                {corePlayers.map((player, index) => (
                  <div key={`core-${index}`} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                    <div className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Pemain {index + 1} {index === 0 && '(Kapten)'}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                        <input
                          type="text"
                          value={player.full_name}
                          onChange={(e) => handleCoreChange(index, 'full_name', e.target.value)}
                          required
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Nickname (In-Game)</label>
                        <input
                          type="text"
                          value={player.nickname}
                          onChange={(e) => handleCoreChange(index, 'nickname', e.target.value)}
                          required
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">MLBB ID</label>
                        <input
                          type="text"
                          value={player.mlbb_id}
                          onChange={(e) => handleCoreChange(index, 'mlbb_id', e.target.value)}
                          required
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Server ID</label>
                        <input
                          type="text"
                          value={player.server_id}
                          onChange={(e) => handleCoreChange(index, 'server_id', e.target.value)}
                          required
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub Players */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-500" />
                <h3 className="font-display font-bold text-lg text-slate-900">Pemain Cadangan (Maks 2)</h3>
              </div>
              
              <div className="space-y-4">
                {subPlayers.map((player, index) => (
                  <div key={`sub-${index}`} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                    <div className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
                      Cadangan {index + 1}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                        <input
                          type="text"
                          value={player.full_name}
                          onChange={(e) => handleSubChange(index, 'full_name', e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Nickname (In-Game)</label>
                        <input
                          type="text"
                          value={player.nickname}
                          onChange={(e) => handleSubChange(index, 'nickname', e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">MLBB ID</label>
                        <input
                          type="text"
                          value={player.mlbb_id}
                          onChange={(e) => handleSubChange(index, 'mlbb_id', e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Server ID</label>
                        <input
                          type="text"
                          value={player.server_id}
                          onChange={(e) => handleSubChange(index, 'server_id', e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 font-body focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-end gap-3 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl font-display font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <NeonButton
            type="submit"
            form="edit-team-form"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl"
          >
            <span className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </span>
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
