'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTimeRemaining, formatCurrency, getWhatsAppUrl } from '@/lib/utils';
import { MessageCircle, Trophy, Users, Calendar, Zap, ArrowRight } from 'lucide-react';

interface TournamentHeaderProps {
  remainingSlots: number;
}

export default function TournamentHeader({ remainingSlots }: TournamentHeaderProps) {
  const tournamentDate = process.env.NEXT_PUBLIC_TOURNAMENT_DATE || '2025-02-15';
  const tournamentName = process.env.NEXT_PUBLIC_TOURNAMENT_NAME || 'ML Championship 2025';
  const registrationFee = parseInt(process.env.NEXT_PUBLIC_REGISTRATION_FEE || '50000');
  const maxSlots = parseInt(process.env.NEXT_PUBLIC_MAX_SLOTS || '64');
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890';

  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(tournamentDate));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(tournamentDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [tournamentDate]);

  const slotPercentage = ((maxSlots - remainingSlots) / maxSlots) * 100;

  return (
    <div className="relative overflow-hidden bg-white border-b border-slate-200">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10 pb-8">
        {/* Logo + Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4 animate-float">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl glass-card flex items-center justify-center border border-red-100 shadow-sm bg-white">
              <Trophy className="w-10 h-10 md:w-12 md:h-12 text-red-600" />
            </div>
            <div className="absolute -inset-2 rounded-2xl border border-red-500/10 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-2xl">
            <p className="font-mono text-red-600 text-xs tracking-[0.3em] uppercase font-bold">
              ⚡ Official Tournament
            </p>
            <h1
              className="font-display text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight"
            >
              {tournamentName}
            </h1>
            <p className="font-body text-red-600 text-sm md:text-base font-semibold italic">
              "Melawan Amnesia Sejarah Bangsa" "
            </p>
            <p className="font-body text-slate-500 text-xs md:text-sm">
              Mobile Legends Bang Bang · Turnamen Resmi Kabupaten Magelang
            </p>
            
            {/* Quick link to #bracket */}
            <div className="pt-2 flex justify-center">
              <a
                href="#bracket"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-display font-bold border border-red-200 transition-all shadow-2xs group"
              >
                <Trophy className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                <span>Lihat Bagan Turnamen (59 Tim)</span>
                <ArrowRight className="w-3.5 h-3.5 -ml-0.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<Zap className="w-4 h-4 text-red-600" />}
            label="Biaya Daftar"
            value={formatCurrency(registrationFee)}
            highlight="gold"
          />
          <StatCard
            icon={<Users className="w-4 h-4 text-slate-700" />}
            label="Status Pendaftaran"
            value="Ditutup"
            highlight="red"
            urgent={false}
          />
          <StatCard
            icon={<Calendar className="w-4 h-4 text-slate-700" />}
            label="Tanggal Main"
            value={new Date(tournamentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            highlight="purple"
          />
          <a
            href={getWhatsAppUrl(whatsapp, `Halo admin, saya ingin bertanya tentang ${tournamentName}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 border border-slate-200 hover:border-red-600/30 transition-all hover:shadow-[0_4px_20px_rgba(220,38,38,0.05)] group bg-white"
          >
            <MessageCircle className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
            <span className="text-slate-500 text-xs font-body">Kontak Admin</span>
            <span className="text-red-600 text-sm font-display font-semibold">WhatsApp</span>
          </a>
        </div>

        {/* Slot progress bar */}
        <div className="glass-card rounded-xl p-4 mb-6 bg-white border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-body text-slate-500">Slot Terisi</span>
            <span className="text-xs font-mono text-red-600 font-bold">59 / 59 Tim (100%)</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `100%`,
                background: 'linear-gradient(90deg, #DC2626, #EF4444)',
                boxShadow: `0 0 8px rgba(220, 38, 38, 0.2)`,
              }}
            />
          </div>
          <p className="text-xs text-red-700 mt-2 font-body font-semibold flex items-center gap-1">
            🔒 Pendaftaran telah resmi ditutup. Bagan pertandingan 59 tim telah diterbitkan.
          </p>
        </div>

        {/* Countdown */}
        {!timeLeft.expired && (
          <div className="text-center">
            <p className="text-xs font-mono text-slate-400 mb-2 tracking-wider">HITUNG MUNDUR TOURNAMENT</p>
            <div className="flex items-center justify-center gap-2 md:gap-4">
              <CountdownUnit value={isMounted ? timeLeft.days : 0} label="HARI" />
              <span className="text-red-600 text-xl font-display font-bold mb-4 animate-pulse">:</span>
              <CountdownUnit value={isMounted ? timeLeft.hours : 0} label="JAM" />
              <span className="text-red-600 text-xl font-display font-bold mb-4 animate-pulse">:</span>
              <CountdownUnit value={isMounted ? timeLeft.minutes : 0} label="MENIT" />
              <span className="text-red-600 text-xl font-display font-bold mb-4 animate-pulse">:</span>
              <CountdownUnit value={isMounted ? timeLeft.seconds : 0} label="DETIK" />
            </div>
          </div>
        )}
        {timeLeft.expired && (
          <div className="text-center glass-card rounded-xl p-3 border border-red-500/20 bg-white">
            <p className="text-red-600 font-display font-semibold">🏆 Tournament Telah Dimulai!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
  urgent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight: 'blue' | 'gold' | 'purple' | 'red';
  urgent?: boolean;
}) {
  const colors = {
    blue: 'border-slate-200 hover:border-slate-300 bg-white',
    gold: 'border-red-100 hover:border-red-200 bg-white',
    purple: 'border-slate-200 hover:border-slate-300 bg-white',
    red: 'border-red-200 hover:border-red-300 bg-white',
  };
  const textColors = {
    blue: 'text-slate-800',
    gold: 'text-red-600',
    purple: 'text-slate-800',
    red: 'text-red-600',
  };

  return (
    <div className={`glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 border ${colors[highlight]} transition-all ${urgent ? 'border-red-300 bg-red-50/50' : ''}`}>
      {icon}
      <span className="text-slate-500 text-xs font-body">{label}</span>
      <span className={`${textColors[highlight]} text-sm md:text-base font-display font-bold text-center leading-tight`}>
        {value}
      </span>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="glass-card rounded-lg px-3 py-2 min-w-[52px] text-center border border-slate-200 bg-white shadow-sm">
        <span className="font-mono text-xl md:text-2xl font-bold text-red-600">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-slate-400 text-[10px] font-mono mt-1 tracking-wider">{label}</span>
    </div>
  );
}
