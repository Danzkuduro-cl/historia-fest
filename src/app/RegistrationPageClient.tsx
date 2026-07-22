'use client';

import { useState, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import StepProgress from '@/components/StepProgress';
import StepTeamInfo from '@/components/form/StepTeamInfo';
import StepPlayers from '@/components/form/StepPlayers';
import StepSubstitutes from '@/components/form/StepSubstitutes';
import StepReview from '@/components/form/StepReview';
import NeonButton from '@/components/ui/NeonButton';
import { registerTeam } from '@/lib/actions';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { HeroTeam } from '@/lib/hero-teams';

const playerSchema = z.object({
  full_name: z.string().min(3, 'Nama minimal 3 karakter').max(50, 'Nama terlalu panjang'),
  nickname: z.string().min(2, 'Nickname minimal 2 karakter').max(20, 'Nickname maksimal 20 karakter'),
  mlbb_id: z.string().min(5, 'MLBB ID minimal 5 digit').max(20, 'MLBB ID terlalu panjang').regex(/^\d+$/, 'Hanya angka'),
  server_id: z.string().min(1, 'Server ID wajib diisi').max(20, 'Server ID terlalu panjang').regex(/^\d+$/, 'Hanya angka'),
});

const optionalPlayerSchema = z.object({
  full_name: z.string().max(50).optional(),
  nickname: z.string().max(20).optional(),
  mlbb_id: z.string().max(20).regex(/^\d*$/, 'Hanya angka').optional(),
  server_id: z.string().max(20).regex(/^\d*$/, 'Hanya angka').optional(),
});

const formSchema = z.object({
  team_name: z.string().min(1, 'Wajib memilih nama tim Pahlawan'),
  captain_name: z.string().min(3, 'Nama kapten minimal 3 karakter'),
  whatsapp: z.string().min(10, 'Nomor WA minimal 10 digit').regex(/^[0-9+]+$/, 'Nomor tidak valid'),
  players: z.array(playerSchema).length(5),
  substitutes: z.array(optionalPlayerSchema).max(2),
  agreed: z.boolean().refine((v) => v === true, { message: 'Wajib menyetujui peraturan' }),
});

type FormData = z.infer<typeof formSchema>;

interface RegistrationPageClientProps {
  remainingSlots: number;
  availableHeroTeams: HeroTeam[];
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: unknown) => void;
        onPending: (result: unknown) => void;
        onError: (result: unknown) => void;
        onClose: () => void;
      }) => void;
    };
  }
}

export default function RegistrationPageClient({ remainingSlots, availableHeroTeams }: RegistrationPageClientProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);

  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      team_name: '',
      captain_name: '',
      whatsapp: '',
      players: Array(5).fill({ full_name: '', nickname: '', mlbb_id: '', server_id: '' }),
      substitutes: Array(2).fill({ full_name: '', nickname: '', mlbb_id: '', server_id: '' }),
      agreed: false,
    },
    mode: 'onChange',
  });

  const { handleSubmit, trigger, watch } = methods;

  const scrollToTop = () => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validateStep = async (step: number): Promise<boolean> => {
    if (step === 1) {
      return await trigger(['team_name', 'captain_name', 'whatsapp']);
    }
    if (step === 2) {
      const results = await Promise.all(
        [0, 1, 2, 3, 4].map((i) =>
          trigger([
            `players.${i}.full_name`,
            `players.${i}.nickname`,
            `players.${i}.mlbb_id`,
            `players.${i}.server_id`,
          ] as Parameters<typeof trigger>[0])
        )
      );
      const players = watch('players');
      const ids = players.map((p) => p.mlbb_id).filter(Boolean);
      if (new Set(ids).size !== ids.length) {
        toast.error('Terdapat MLBB ID yang sama antar pemain!');
        return false;
      }
      return results.every(Boolean);
    }
    if (step === 3) return true;
    return true;
  };

  const handleNext = async () => {
    const valid = await validateStep(currentStep);
    if (!valid) {
      toast.error('Lengkapi data yang diperlukan');
      return;
    }
    setCurrentStep((s) => s + 1);
    scrollToTop();
  };

  const handleBack = () => {
    setCurrentStep((s) => s - 1);
    scrollToTop();
  };

  const onSubmit = async (data: FormData) => {
    if (remainingSlots <= 0) {
      toast.error('Maaf, slot pendaftaran sudah penuh!');
      return;
    }

    setIsSubmitting(true);

    try {
      const validSubs = (data.substitutes || []).filter(
        (s) => s.nickname && s.mlbb_id && s.full_name && s.server_id
      );

      const allPlayers = [
        ...data.players.map((p, i) => ({ ...p, player_type: 'core' as const, player_order: i + 1 })),
        ...validSubs.map((p, i) => ({
          full_name: p.full_name || '',
          nickname: p.nickname || '',
          mlbb_id: p.mlbb_id || '',
          server_id: p.server_id || '',
          player_type: 'substitute' as const,
          player_order: i + 1,
        })),
      ];

      const result = await registerTeam({
        team_name: data.team_name,
        captain_name: data.captain_name,
        whatsapp: data.whatsapp,
        players: allPlayers,
      });

      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }

      if ('warning' in result && result.warning) {
        toast(result.warning as string, { icon: '⚠️' });
      }

      if (result.snapToken) {
        const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true' || !midtransClientKey.startsWith('SB-');
        const snapUrl = isProduction
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js';

        if (!document.getElementById('snap-script')) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.id = 'snap-script';
            script.src = snapUrl;
            script.setAttribute('data-client-key', midtransClientKey || '');
            script.onload = () => resolve();
            script.onerror = () => reject();
            document.head.appendChild(script);
          });
        }

        if (window.snap && typeof window.snap.pay === 'function') {
          window.snap.pay(result.snapToken, {
            onSuccess: () => {
              router.push(`/payment/success?code=${result.registrationCode}&team=${encodeURIComponent(data.team_name)}`);
            },
            onPending: () => {
              router.push(`/payment/pending?code=${result.registrationCode}&team=${encodeURIComponent(data.team_name)}`);
            },
            onError: () => {
              toast.error('Pembayaran gagal. Silakan coba lagi.');
              router.push(`/payment/pending?code=${result.registrationCode}&team=${encodeURIComponent(data.team_name)}`);
            },
            onClose: () => {
              toast('Pembayaran dibatalkan. Kode registrasi kamu sudah tersimpan.', { icon: 'ℹ️' });
              router.push(`/payment/pending?code=${result.registrationCode}&team=${encodeURIComponent(data.team_name)}`);
            },
          });
        } else if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        }
      } else if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        router.push(`/payment/pending?code=${result.registrationCode}&team=${encodeURIComponent(data.team_name)}`);
      }
    } catch (err) {
      console.error('Registration submit error:', err);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 grid-bg py-8 px-4 sm:px-6">
      <div ref={formTopRef} className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-body font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/images/Logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded object-contain"
            />
            <span className="text-xs font-mono font-bold text-slate-700 hidden sm:inline">
              Fiesta Historia 2026
            </span>
          </div>
        </div>

        {/* Step Progress Bar */}
        <StepProgress currentStep={currentStep} />

        {/* Form Container */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl">
              {currentStep === 1 && <StepTeamInfo availableHeroTeams={availableHeroTeams} />}
              {currentStep === 2 && <StepPlayers />}
              {currentStep === 3 && <StepSubstitutes />}
              {currentStep === 4 && <StepReview />}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-sm font-body font-semibold transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Sebelumnya
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-display font-bold text-sm shadow-md transition-all"
                  >
                    <span>Lanjut</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-display font-bold text-sm shadow-md transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Daftar & Bayar</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
