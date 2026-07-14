'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Clock, Copy, Check, MessageCircle, RefreshCw, Home } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/utils';
import NeonButton from '@/components/ui/NeonButton';
import { useState } from 'react';

function PendingContent() {
  const params = useSearchParams();
  const code = params.get('code') || '';
  const teamName = params.get('team') || '';
  const [copied, setCopied] = useState(false);

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const fee = process.env.NEXT_PUBLIC_REGISTRATION_FEE || '50000';

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const waMessage = `Halo admin, saya sudah melakukan pembayaran.\n\nNama Tim: ${decodeURIComponent(teamName)}\nKode Registrasi: ${code}\nJumlah: Rp${parseInt(fee).toLocaleString('id-ID')}\n\nMohon konfirmasi pembayaran saya. Terima kasih!`;

  return (
    <div className="min-h-screen bg-dark-900 grid-bg flex items-center justify-center px-4 py-12">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <Clock className="w-12 h-12 text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute -inset-3 rounded-full border border-yellow-500/15 animate-pulse" />
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl border border-yellow-500/20 overflow-hidden">
          <div className="p-6 text-center border-b border-dark-400/50">
            <p className="font-mono text-yellow-400/70 text-xs tracking-[0.3em] uppercase mb-2">
              ⏳ Menunggu Pembayaran
            </p>
            <h1 className="font-display text-2xl font-bold text-white mb-1">
              Pendaftaran Pending
            </h1>
            <p className="text-slate-400 text-sm font-body">
              Tim <span className="text-neon-blue font-semibold">{decodeURIComponent(teamName)}</span> menunggu konfirmasi pembayaran
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Code */}
            <div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                Kode Registrasi
              </p>
              <div className="glass-card rounded-xl p-4 border border-yellow-500/20 flex items-center justify-between gap-3">
                <code className="font-mono text-yellow-400 font-bold text-sm break-all">
                  {code}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 transition-all"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-yellow-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="glass-card rounded-xl p-4 border border-yellow-500/10 space-y-2">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Informasi</p>
              <ul className="space-y-2">
                {[
                  'Link pembayaran dikirim via Midtrans',
                  'Pembayaran berlaku 24 jam sejak pendaftaran',
                  'Slot dikonfirmasi setelah pembayaran sukses',
                  'Hubungi admin jika sudah bayar namun belum terkonfirmasi',
                ].map((info, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-body text-slate-400">
                    <span className="text-yellow-400 mt-0.5 shrink-0">›</span>
                    {info}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 space-y-3">
            <a
              href={getWhatsAppUrl(whatsapp, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <NeonButton
                size="lg"
                className="w-full bg-green-500 hover:bg-green-400 text-dark-900 font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)]"
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
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-neon-blue font-mono text-sm animate-pulse">Loading...</div>
      </div>
    }>
      <PendingContent />
    </Suspense>
  );
}
