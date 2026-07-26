'use client';

import { useState, useRef, useEffect } from 'react';
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
import { registerTeam, cancelRegistration } from '@/lib/actions';
import { AlertTriangle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
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

const STORAGE_KEY = 'historia-pending-payment';

interface PendingPayment {
  snapToken: string;
  registrationCode: string;
  teamId: string;
  teamName: string;
  paymentUrl?: string;
}

export default function RegistrationPageClient({ remainingSlots, availableHeroTeams }: RegistrationPageClientProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [storedPending, setStoredPending] = useState<PendingPayment | null>(null);
  const [isCancellingStored, setIsCancellingStored] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);

  // Load pending payment from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setStoredPending(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const savePendingToStorage = (payment: PendingPayment) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payment));
    } catch {
      // Ignore storage errors
    }
  };

  const clearPendingFromStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setStoredPending(null);
    } catch {
      // Ignore storage errors
    }
  };

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

  const openSnap = (payment: PendingPayment) => {
    window.snap.pay(payment.snapToken, {
      onSuccess: () => {
        clearPendingFromStorage();
        setPendingPayment(null);
        router.push(`/payment/success?code=${payment.registrationCode}&team=${encodeURIComponent(payment.teamName)}`);
      },
      onPending: () => {
        clearPendingFromStorage();
        setPendingPayment(null);
        router.push(`/payment/pending?code=${payment.registrationCode}&team=${encodeURIComponent(payment.teamName)}`);
      },
      onError: () => {
        toast.error('Pembayaran gagal. Silakan coba lagi.');
        setShowCancelModal(true);
      },
      onClose: () => {
        setShowCancelModal(true);
      },
    });
  };

  const handleContinuePayment = () => {
    if (!pendingPayment) return;
    setShowCancelModal(false);
    // Small delay so modal fully closes before snap reopens
    setTimeout(() => openSnap(pendingPayment), 300);
  };

  const handleConfirmCancel = async () => {
    if (!pendingPayment) return;
    setIsCancelling(true);
    try {
      await cancelRegistration(pendingPayment.teamId);
      clearPendingFromStorage();
      toast('Pendaftaran dibatalkan.', { icon: 'ℹ️' });
    } catch {
      toast.error('Gagal membatalkan data. Coba lagi.');
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
      setPendingPayment(null);
      setCurrentStep(4);
    }
  };

  const handleResumePendingPayment = () => {
    if (!storedPending?.paymentUrl) return;
    window.location.href = storedPending.paymentUrl;
  };

  const handleCancelStoredPending = async () => {
    if (!storedPending) return;
    setIsCancellingStored(true);
    try {
      await cancelRegistration(storedPending.teamId);
      clearPendingFromStorage();
      toast('Pendaftaran lama telah dibatalkan.', { icon: 'ℹ️' });
    } catch {
      toast.error('Gagal membatalkan. Coba lagi.');
    } finally {
      setIsCancellingStored(false);
    }
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

        const payment: PendingPayment = {
          snapToken: result.snapToken,
          registrationCode: result.registrationCode,
          teamId: result.teamId,
          teamName: data.team_name,
          paymentUrl: result.paymentUrl || '',
        };
        setPendingPayment(payment);
        savePendingToStorage(payment);

        if (window.snap && typeof window.snap.pay === 'function') {
          openSnap(payment);
        } else if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        }
      } else if (result.paymentUrl) {
        savePendingToStorage({
          snapToken: '',
          registrationCode: result.registrationCode,
          teamId: result.teamId,
          teamName: data.team_name,
          paymentUrl: result.paymentUrl,
        });
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
      {/* Cancel Payment Confirmation Modal */}
      {showCancelModal && pendingPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Batalkan Pembayaran?</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Apakah kamu yakin ingin membatalkan pembayaran? Data tidak akan tersimpan dan kamu berisiko mengulang pengisian pendaftaran dari awal.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleContinuePayment}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all text-sm"
                >
                  Lanjutkan Pembayaran
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="w-full px-4 py-3 border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl transition-all text-sm disabled:opacity-60"
                >
                  {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Pending Payment Resume Banner */}
      {storedPending && !pendingPayment && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4">
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-800">Ada pembayaran yang belum selesai!</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Tim: <span className="font-semibold">{storedPending.teamName}</span>
                  {' · '}Kode: <span className="font-mono font-semibold">{storedPending.registrationCode}</span>
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleResumePendingPayment}
                    className="flex-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-all"
                  >
                    Lanjutkan Pembayaran
                  </button>
                  <button
                    onClick={handleCancelStoredPending}
                    disabled={isCancellingStored}
                    className="flex-1 px-3 py-1.5 border border-amber-400 text-amber-700 hover:bg-amber-100 font-semibold rounded-lg text-xs transition-all disabled:opacity-60"
                  >
                    {isCancellingStored ? 'Membatalkan...' : 'Batalkan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
