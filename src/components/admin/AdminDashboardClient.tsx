'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  Search, Filter, Download, LogOut, RefreshCw,
  Trophy, Users, CheckCircle, Clock, Eye,
  ChevronDown, Shield, Zap, Trash2, AlertTriangle
} from 'lucide-react';

import AdminStatCard from '@/components/admin/AdminStatCard';
import TeamDetailModal from '@/components/admin/TeamDetailModal';
import NeonButton from '@/components/ui/NeonButton';
import { adminLogout, updatePaymentStatus, deleteTeam } from '@/lib/admin-actions';
import { formatCurrency, getPaymentStatusColor, getPaymentStatusLabel, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  player_type: string;
  player_order: number;
  full_name: string;
  nickname: string;
  mlbb_id: string;
  server_id: string;
}

interface Team {
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
}

interface Stats {
  totalTeams: number;
  paidTeams: number;
  pendingTeams: number;
  remainingSlots: number;
  totalRevenue: number;
  maxSlots: number;
}

interface AdminDashboardClientProps {
  teams: Team[];
  stats: Stats;
}

export default function AdminDashboardClient({ teams: initialTeams, stats }: AdminDashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Team | null>(null);

  const filtered = initialTeams.filter((team) => {
    const matchSearch =
      search === '' ||
      team.team_name.toLowerCase().includes(search.toLowerCase()) ||
      team.captain_name.toLowerCase().includes(search.toLowerCase()) ||
      team.registration_code.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || team.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleUpdateStatus = async (teamId: string, status: string) => {
    setUpdatingId(teamId);
    try {
      const result = await updatePaymentStatus(teamId, status);
      if ('error' in result) {
        toast.error(result.error || 'Gagal update status');
      } else {
        toast.success('Status berhasil diupdate');
        router.refresh();
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (team: Team) => {
    setDeletingId(team.id);
    setConfirmDelete(null);
    try {
      const result = await deleteTeam(team.id);
      if ('error' in result) {
        toast.error(result.error || 'Gagal menghapus data');
      } else {
        toast.success(`Tim "${team.team_name}" berhasil dihapus`);
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tournament-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Export berhasil!');
    } catch {
      toast.error('Export gagal. Coba lagi.');
    }
  };

  const handleLogout = () => {
    startTransition(() => adminLogout());
  };

  return (
    <div className="min-h-screen bg-dark-900 grid-bg">
      {/* Detail Modal */}
      {selectedTeam && (
        <TeamDetailModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-dark-400/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-neon-blue" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-sm leading-none">Admin Dashboard</h1>
              <p className="text-xs text-slate-500 font-body">{process.env.NEXT_PUBLIC_TOURNAMENT_NAME}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={() => router.refresh()}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              <span className="hidden md:inline">Refresh</span>
            </NeonButton>
            <NeonButton
              variant="secondary"
              size="sm"
              onClick={handleExport}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              <span className="hidden md:inline">Export</span>
            </NeonButton>
            <NeonButton
              variant="danger"
              size="sm"
              onClick={handleLogout}
              loading={isPending}
              icon={<LogOut className="w-3.5 h-3.5" />}
            >
              <span className="hidden md:inline">Logout</span>
            </NeonButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <AdminStatCard
            label="Total Tim"
            value={stats.totalTeams}
            sub={`dari ${stats.maxSlots} slot`}
            icon={<Users className="w-4 h-4" />}
            color="blue"
          />
          <AdminStatCard
            label="Sudah Bayar"
            value={stats.paidTeams}
            sub="Tim terkonfirmasi"
            icon={<CheckCircle className="w-4 h-4" />}
            color="green"
          />
          <AdminStatCard
            label="Menunggu"
            value={stats.pendingTeams}
            sub="Belum terkonfirmasi"
            icon={<Clock className="w-4 h-4" />}
            color="yellow"
          />
          <AdminStatCard
            label="Sisa Slot"
            value={stats.remainingSlots}
            sub={`Total revenue: ${formatCurrency(stats.totalRevenue)}`}
            icon={<Trophy className="w-4 h-4" />}
            color="purple"
          />
        </div>

        {/* Slot progress */}
        <div className="glass-card rounded-xl p-4 border border-dark-400/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-body text-slate-400">Kapasitas Slot</span>
            <span className="text-xs font-mono text-neon-blue">
              {stats.totalTeams}/{stats.maxSlots} Tim Terdaftar
            </span>
          </div>
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${(stats.totalTeams / stats.maxSlots) * 100}%`,
                background: 'linear-gradient(90deg, #00D4FF, #B400FF)',
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari tim, kapten, atau kode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="neon-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-body"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="neon-input pl-10 pr-8 py-2.5 rounded-xl text-sm font-body appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="all">Semua Status</option>
              <option value="paid">Sudah Bayar</option>
              <option value="pending">Menunggu</option>
              <option value="failed">Gagal</option>
              <option value="expired">Kadaluarsa</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl border border-dark-400/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-400/50">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-blue" />
              <h2 className="font-display font-semibold text-white">
                Data Tim
              </h2>
              <span className="text-xs font-mono text-neon-blue bg-neon-blue/10 px-2 py-0.5 rounded-full border border-neon-blue/20">
                {filtered.length}
              </span>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-400/50">
                  {['Tim', 'Kapten', 'WhatsApp', 'Kode Registrasi', 'Status', 'Tanggal', 'Aksi'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-400/30">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500 font-body">
                      {search || statusFilter !== 'all' ? 'Tidak ada hasil yang cocok' : 'Belum ada pendaftar'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((team) => (
                    <tr key={team.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          {team.logo_url ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-neon-blue/20 shrink-0">
                              <Image src={team.logo_url} alt={team.team_name} width={32} height={32} className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/15 flex items-center justify-center shrink-0">
                              <Trophy className="w-3.5 h-3.5 text-neon-blue" />
                            </div>
                          )}
                          <span className="text-sm font-body font-medium text-white">{team.team_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-body text-slate-300">{team.captain_name}</td>
                      <td className="px-5 py-4 text-sm font-mono text-slate-400">{team.whatsapp}</td>
                      <td className="px-5 py-4">
                        <code className="text-xs font-mono text-neon-blue/80 bg-neon-blue/5 px-2 py-1 rounded border border-neon-blue/10">
                          {team.registration_code}
                        </code>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={team.payment_status}
                          onChange={(e) => handleUpdateStatus(team.id, e.target.value)}
                          disabled={updatingId === team.id}
                          className={cn(
                            'text-xs font-mono px-2.5 py-1.5 rounded-full border cursor-pointer appearance-none',
                            'bg-transparent transition-all hover:opacity-80',
                            getPaymentStatusColor(team.payment_status)
                          )}
                        >
                          <option value="pending">MENUNGGU</option>
                          <option value="paid">LUNAS</option>
                          <option value="failed">GAGAL</option>
                          <option value="expired">KADALUARSA</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-xs font-body text-slate-500">
                        {formatDate(team.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <NeonButton
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => setSelectedTeam(team)}
                          >
                            Detail
                          </NeonButton>
                          <button
                            onClick={() => setConfirmDelete(team)}
                            disabled={deletingId === team.id}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-40"
                            title="Hapus tim"
                          >
                            {deletingId === team.id
                              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-dark-400/30">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-body">
                {search || statusFilter !== 'all' ? 'Tidak ada hasil' : 'Belum ada pendaftar'}
              </div>
            ) : (
              filtered.map((team) => (
                <div key={team.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {team.logo_url ? (
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-neon-blue/20">
                          <Image src={team.logo_url} alt={team.team_name} width={36} height={36} className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-neon-blue/10 border border-neon-blue/15 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-neon-blue" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-body font-semibold text-white">{team.team_name}</p>
                        <p className="text-xs text-slate-500 font-body">{team.captain_name}</p>
                      </div>
                    </div>
                    <span className={cn('text-xs font-mono px-2 py-1 rounded-full border', getPaymentStatusColor(team.payment_status))}>
                      {getPaymentStatusLabel(team.payment_status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono text-neon-blue/70">{team.registration_code}</code>
                    <div className="flex gap-2">
                      <select
                        value={team.payment_status}
                        onChange={(e) => handleUpdateStatus(team.id, e.target.value)}
                        disabled={updatingId === team.id}
                        className="text-xs neon-input rounded-lg px-2 py-1 cursor-pointer"
                      >
                        <option value="pending">Menunggu</option>
                        <option value="paid">Lunas</option>
                        <option value="failed">Gagal</option>
                        <option value="expired">Kadaluarsa</option>
                      </select>
                      <NeonButton variant="secondary" size="sm" icon={<Eye className="w-3 h-3" />} onClick={() => setSelectedTeam(team)} />
                      <button
                        onClick={() => setConfirmDelete(team)}
                        disabled={deletingId === team.id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-40"
                      >
                        {deletingId === team.id
                          ? <RefreshCw className="w-3 h-3 animate-spin" />
                          : <Trash2 className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative glass-card rounded-2xl border border-red-500/30 p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-display font-bold text-white">Hapus Tim?</p>
                <p className="text-xs text-slate-400 font-body mt-0.5">Tindakan ini tidak bisa dibatalkan</p>
              </div>
            </div>
            <p className="text-sm font-body text-slate-300 mb-5">
              Semua data tim{' '}
              <span className="text-white font-semibold">&quot;{confirmDelete.team_name}&quot;</span>{' '}
              termasuk pemain dan riwayat pembayaran akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-dark-400 text-slate-300 text-sm font-body hover:border-slate-500 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-body font-semibold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
