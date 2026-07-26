'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy, Check, MessageCircle, Trophy, Home } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/utils';
import NeonButton from '@/components/ui/NeonButton';
import confetti from 'canvas-confetti';

function SuccessContent() {
  const params = useSearchParams();
  const code = params.get('code') || '';
  const teamName = params.get('team') || '';
  const [copied, setCopied] = useState(false);

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const tournamentName = process.env.NEXT_PUBLIC_TOURNAMENT_NAME || 'ML Championship 2025';

  useEffect(() => {
    // Clear any pending payment from localStorage on success
    try { localStorage.removeItem('historia-pending-payment'); } catch {}

    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ['#00D4FF', '#B400FF', '#FFD700'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const waMessage = `Halo admin, saya ingin konfirmasi pendaftaran.\n\nNama Tim: ${decodeURIComponent(teamName)}\nKode Registrasi: ${code}\n\nMohon konfirmasi pembayaran saya. Terima kasih!`;

  return (
    <div className="min-h-screen bg-dark-900 grid-bg flex items-center justify-center px-4 py-12">
      {/* Glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center animate-float shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <div className="absolute -inset-3 rounded-full border border-green-500/20 animate-pulse" />
          </div>
        </div>

        {/* Main card */}
        <div className="glass-card rounded-2xl border border-green-500/20 overflow-hidden">
          {/* Header */}
          <div className="p-6 text-center border-b border-dark-400/50">
            <p className="font-mono text-green-400/70 text-xs tracking-[0.3em] uppercase mb-2">
              ✓ Pembayaran Berhasil
            </p>
            <h1 className="font-display text-2xl font-bold text-white mb-1">
              Pendaftaran Diterima!
            </h1>
            <p className="text-slate-400 text-sm font-body">
              Tim <span className="text-neon-blue font-semibold">{decodeURIComponent(teamName)}</span> telah resmi terdaftar
            </p>
          </div>

          {/* Registration code */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                Kode Registrasi
              </p>
              <div className="glass-card rounded-xl p-4 border border-neon-blue/20 flex items-center justify-between gap-3">
                <code className="font-mono text-neon-blue font-bold text-sm md:text-base break-all">
                  {code}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 p-2 rounded-lg bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/20 transition-all"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-neon-blue" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 font-body mt-2">
                Simpan kode ini sebagai bukti pendaftaran kamu.
              </p>
            </div>

            {/* Next steps */}
            <div className="space-y-2">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                Langkah Selanjutnya
              </p>
              {[
                'Simpan kode registrasi di atas',
                'Screenshot halaman ini sebagai bukti',
                'Hubungi admin via WhatsApp jika ada pertanyaan',
                'Tunggu informasi lebih lanjut dari panitia',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-xs font-mono text-neon-blue shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm font-body text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 space-y-3">
            <a
              href={getWhatsAppUrl(whatsapp, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <NeonButton
                variant="primary"
                size="lg"
                className="w-full bg-green-500 hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] text-dark-900"
                icon={<MessageCircle className="w-4 h-4" />}
              >
                Konfirmasi via WhatsApp
              </NeonButton>
            </a>

            <Link href="/" className="block">
              <NeonButton variant="ghost" size="md" className="w-full" icon={<Home className="w-4 h-4" />}>
                Kembali ke Halaman Utama
              </NeonButton>
            </Link>
          </div>
        </div>

        {/* Tournament badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500">
          <Trophy className="w-4 h-4 text-neon-gold" />
          <span className="text-xs font-body">{tournamentName}</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-neon-blue font-mono text-sm animate-pulse">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
