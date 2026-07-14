'use client';

import { useState } from 'react';
import { adminLogin } from '@/lib/admin-actions';
import { Eye, EyeOff, Shield, Lock, User, Loader2 } from 'lucide-react';
import NeonInput from '@/components/ui/NeonInput';
import NeonButton from '@/components/ui/NeonButton';
import { useFormState } from 'react-dom';

type State = { error?: string } | undefined;

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await adminLogin(formData);
      if (result && 'error' in result) {
        setError(result.error || 'Username atau password salah');
        setIsPending(false);
      }
    } catch {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 grid-bg flex items-center justify-center px-4">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-neon-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl glass-card border border-neon-blue/30 flex items-center justify-center shadow-neon-blue">
              <Shield className="w-10 h-10 text-neon-blue" />
            </div>
            <div className="absolute -inset-2 rounded-2xl border border-neon-blue/15 animate-pulse" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-500 text-sm font-body mt-1">
            {process.env.NEXT_PUBLIC_TOURNAMENT_NAME}
          </p>
        </div>

        {/* Form */}
        <div className="glass-card rounded-2xl border border-neon-blue/10 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <NeonInput
              label="Username"
              name="username"
              type="text"
              placeholder="Masukkan username"
              required
              autoComplete="username"
              icon={<User className="w-4 h-4" />}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-body font-medium text-slate-300">
                Password <span className="text-neon-blue">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                  className="neon-input w-full rounded-lg pl-10 pr-10 py-2.5 text-sm font-body"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-body flex items-center gap-1.5 animate-slide-up">
                <span>⚠</span> {error}
              </div>
            )}

            <NeonButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={isPending}
              icon={isPending ? undefined : <Shield className="w-4 h-4" />}
            >
              {isPending ? 'Masuk...' : 'Masuk ke Dashboard'}
            </NeonButton>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6 font-body">
          Area terbatas · Hanya untuk admin tournament
        </p>
      </div>
    </div>
  );
}
