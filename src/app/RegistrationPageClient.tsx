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
import { registerTeam, uploadTeamLogo } from '@/lib/actions';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

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
  team_name: z.string().min(3, 'Nama tim minimal 3 karakter').max(30, 'Nama tim maksimal 30 karakter').regex(/^[a-zA-Z0-9\s_-]+$/, 'Karakter tidak valid'),
  captain_name: z.string().min(3, 'Nama kapten minimal 3 karakter'),
  whatsapp: z.string().min(10, 'Nomor WA minimal 10 digit').regex(/^[0-9+]+$/, 'Nomor tidak valid'),
  logo: z.any().optional(),
  logoPreview: z.string().optional(),
  players: z.array(playerSchema).length(5),
  substitutes: z.array(optionalPlayerSchema).max(2),
  agreed: z.boolean().refine((v) => v === true, { message: 'Wajib menyetujui peraturan' }),
});

type FormData = z.infer<typeof formSchema>;

interface RegistrationPageClientProps {
  remainingSlots: number;
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

export default function RegistrationPageClient({ remainingSlots }: RegistrationPageClientProps) {
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
      // Check duplicate MLBB IDs
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
      // Upload logo if present
      let logoUrl: string | undefined;
      if (data.logo && data.logo[0]) {
        const logoFormData = new FormData();
        logoFormData.append('logo', data.logo[0]);
        const uploadResult = await uploadTeamLogo(logoFormData);
        logoUrl = uploadResult.url || undefined;
      }

      // Filter valid substitutes
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
        logo_url: logoUrl,
        players: allPlayers,
      });

      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }

      if ('warning' in result && result.warning) {
        toast(result.warning as string, { icon: '⚠️' });
      }

      // Open Midtrans Snap
      if (result.snapToken) {
        const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
        // Deteksi production dari prefix client key (SB- = sandbox, tanpa SB- = production)
        const isProduction = !midtransClientKey.startsWith('SB-');
        const snapUrl = isProduction
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js';

        // Load Snap script
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
      } else {
        router.push(`/payment/pending?code=${result.registrationCode}&team=${encodeURIComponent(data.team_name)}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-slate-50 grid-bg text-slate-900">
        {/* Registration Page Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <Image
                src="/images/Logo.png"
                alt="Logo Fiesta Historia 2026"
                width={40}
                height={40}
                className="rounded-lg object-contain"
              />
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg tracking-wider text-slate-900">
                  FIESTA<span className="text-red-600">HISTORIA</span>
                </span>
                <span className="text-xs bg-red-50 text-red-600 border border-red-200/50 px-2 py-0.5 rounded-full font-mono font-bold">
                  2026
                </span>
              </div>
            </div>

            {/* Back to landing */}
            <a
              href="/"
              className="flex items-center gap-1.5 text-sm font-body font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali ke Beranda
            </a>
          </div>
        </header>

        {/* Form Section */}
        <div className="max-w-2xl mx-auto px-4 pb-32 md:pb-12 pt-8" ref={formTopRef}>
          <div className="text-center space-y-2 mb-6">
            <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full uppercase">
              Formulir Pendaftaran
            </span>
            <h2 className="font-display font-bold text-3xl text-slate-900">
              Daftarkan Tim Kamu
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-body max-w-sm mx-auto mt-1">
              Lengkapi data tim, 5 pemain utama, dan cadangan untuk mengunci slot turnamen.
            </p>
          </div>

          {/* Step Progress */}
          <div className="glass-card rounded-2xl p-4 mb-4 border border-slate-200 bg-white shadow-sm">
            <StepProgress currentStep={currentStep} />
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            <div className="p-5 md:p-6">
              {currentStep === 1 && <StepTeamInfo />}
              {currentStep === 2 && <StepPlayers />}
              {currentStep === 3 && <StepSubstitutes />}
              {currentStep === 4 && <StepReview />}
            </div>

            {/* Navigation - Desktop */}
            <div className="hidden md:flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              {currentStep > 1 ? (
                <NeonButton
                  variant="ghost"
                  icon={<ChevronLeft className="w-4 h-4" />}
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Kembali
                </NeonButton>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <NeonButton
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  icon={<ChevronRight className="w-4 h-4 order-last" />}
                >
                  Lanjut
                </NeonButton>
              ) : (
                <NeonButton
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                  icon={<Send className="w-4 h-4 order-last" />}
                  disabled={remainingSlots === 0}
                >
                  {isSubmitting ? 'Mendaftarkan...' : 'Daftar & Bayar'}
                </NeonButton>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sticky Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-6"
          style={{ background: 'linear-gradient(to top, #F9FAFB 70%, transparent)' }}>
          <div className="flex gap-3">
            {currentStep > 1 && (
              <NeonButton
                variant="secondary"
                size="lg"
                className="flex-shrink-0"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Balik
              </NeonButton>
            )}

            {currentStep < 4 ? (
              <NeonButton
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleNext}
                icon={<ChevronRight className="w-4 h-4 order-last" />}
              >
                Lanjut →
              </NeonButton>
            ) : (
              <NeonButton
                variant="primary"
                size="lg"
                className="flex-1"
                loading={isSubmitting}
                onClick={handleSubmit(onSubmit)}
                icon={<Send className="w-4 h-4 order-last" />}
                disabled={remainingSlots === 0}
              >
                {isSubmitting ? 'Memproses...' : 'Daftar & Bayar Sekarang'}
              </NeonButton>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
