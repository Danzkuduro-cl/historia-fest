'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getTimeRemaining, formatCurrency, getWhatsAppUrl } from '@/lib/utils';
import { MessageCircle, Trophy, Users, Calendar, Zap } from 'lucide-react';

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
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-transparent" />

      {/* Decorative orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 pb-6">
        {/* Logo + Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4 animate-float">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl glass-card flex items-center justify-center border border-neon-blue/30 shadow-neon-blue">
              <Trophy className="w-10 h-10 md:w-12 md:h-12 text-neon-gold" />
            </div>
            <div className="absolute -inset-2 rounded-2xl border border-neon-blue/20 animate-pulse" />
          </div>

          <div className="space-y-1">
            <p className="font-mono text-neon-blue/70 text-xs tracking-[0.3em] uppercase">
              ⚡ Official Tournament
            </p>
            <h1
              className="font-display text-3xl md:text-5xl font-bold text-white leading-tight"
              style={{ textShadow: '0 0 30px rgba(0,212,255,0.3)' }}
            >
              {tournamentName}
            </h1>
            <p className="font-body text-slate-400 text-sm md:text-base">
              Mobile Legends Bang Bang · Turnamen Resmi
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<Zap className="w-4 h-4 text-neon-gold" />}
            label="Biaya Daftar"
            value={formatCurrency(registrationFee)}
            highlight="gold"
          />
          <StatCard
            icon={<Users className="w-4 h-4 text-neon-blue" />}
            label="Sisa Slot"
            value={`${remainingSlots} / ${maxSlots}`}
            highlight={remainingSlots <= 10 ? 'red' : 'blue'}
            urgent={remainingSlots <= 10}
          />
          <StatCard
            icon={<Calendar className="w-4 h-4 text-neon-purple" />}
            label="Tanggal Main"
            value={new Date(tournamentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            highlight="purple"
          />
          <a
            href={getWhatsAppUrl(whatsapp, `Halo admin, saya ingin bertanya tentang ${tournamentName}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 border border-green-500/20 hover:border-green-500/50 transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] group"
          >
            <MessageCircle className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
            <span className="text-slate-400 text-xs font-body">Kontak Admin</span>
            <span className="text-green-400 text-sm font-display font-semibold">WhatsApp</span>
          </a>
        </div>

        {/* Slot progress bar */}
        <div className="glass-card rounded-xl p-3 mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-body text-slate-400">Slot Terisi</span>
            <span className="text-xs font-mono text-neon-blue">{maxSlots - remainingSlots}/{maxSlots} Tim</span>
          </div>
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${slotPercentage}%`,
                background: slotPercentage >= 90
                  ? 'linear-gradient(90deg, #FF003C, #FF6B35)'
                  : 'linear-gradient(90deg, #00D4FF, #B400FF)',
                boxShadow: `0 0 10px ${slotPercentage >= 90 ? '#FF003C' : '#00D4FF'}66`,
              }}
            />
          </div>
          {remainingSlots <= 10 && remainingSlots > 0 && (
            <p className="text-xs text-red-400 mt-1.5 font-body animate-pulse">
              ⚠️ Hampir penuh! Segera daftar sebelum slot habis.
            </p>
          )}
          {remainingSlots === 0 && (
            <p className="text-xs text-red-400 mt-1.5 font-body font-semibold">
              🚫 Pendaftaran sudah ditutup. Slot penuh.
            </p>
          )}
        </div>

        {/* Countdown */}
        {!timeLeft.expired && (
          <div className="text-center">
            <p className="text-xs font-mono text-slate-500 mb-2 tracking-wider">HITUNG MUNDUR TOURNAMENT</p>
            <div className="flex items-center justify-center gap-2 md:gap-4">
              <CountdownUnit value={isMounted ? timeLeft.days : 0} label="HARI" />
              <span className="text-neon-blue text-xl font-display font-bold mb-4 animate-pulse">:</span>
              <CountdownUnit value={isMounted ? timeLeft.hours : 0} label="JAM" />
              <span className="text-neon-blue text-xl font-display font-bold mb-4 animate-pulse">:</span>
              <CountdownUnit value={isMounted ? timeLeft.minutes : 0} label="MENIT" />
              <span className="text-neon-blue text-xl font-display font-bold mb-4 animate-pulse">:</span>
              <CountdownUnit value={isMounted ? timeLeft.seconds : 0} label="DETIK" />
            </div>
          </div>
        )}
        {timeLeft.expired && (
          <div className="text-center glass-card rounded-xl p-3 border border-red-500/30">
            <p className="text-red-400 font-display font-semibold">🏆 Tournament Telah Dimulai!</p>
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
    blue: 'border-neon-blue/20 hover:border-neon-blue/50',
    gold: 'border-neon-gold/20 hover:border-neon-gold/50',
    purple: 'border-neon-purple/20 hover:border-neon-purple/50',
    red: 'border-red-500/30 hover:border-red-500/60',
  };
  const textColors = {
    blue: 'text-neon-blue',
    gold: 'text-neon-gold',
    purple: 'text-neon-purple',
    red: 'text-red-400',
  };

  return (
    <div className={`glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 border ${colors[highlight]} transition-all ${urgent ? 'animate-pulse-neon' : ''}`}>
      {icon}
      <span className="text-slate-400 text-xs font-body">{label}</span>
      <span className={`${textColors[highlight]} text-sm md:text-base font-display font-bold text-center leading-tight`}>
        {value}
      </span>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="glass-card rounded-lg px-3 py-2 min-w-[52px] text-center border border-neon-blue/20">
        <span className="font-mono text-xl md:text-2xl font-bold text-neon-blue neon-text">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-slate-500 text-[10px] font-mono mt-1 tracking-wider">{label}</span>
    </div>
  );
}
