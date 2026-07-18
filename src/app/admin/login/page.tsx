'use client';

import { useState } from 'react';
import Image from 'next/image';
import { adminLogin } from '@/lib/admin-actions';
import { Eye, EyeOff, Shield, Lock, User } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo & Icon */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <Image
            src="/images/Logo.png"
            alt="Logo Fiesta Historia 2026"
            width={64}
            height={64}
            className="rounded-xl object-contain"
          />
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center shadow-sm">
            <Shield className="w-7 h-7 text-red-600" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            {process.env.NEXT_PUBLIC_TOURNAMENT_NAME}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-sm font-body font-medium text-slate-700">
                Username <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  name="username"
                  type="text"
                  placeholder="Masukkan username"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm font-body text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all bg-slate-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-body font-medium text-slate-700">
                Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm font-body text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-body flex items-center gap-1.5">
                <span>⚠</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-display font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-sm"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Masuk...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 font-body">
          Area terbatas · Hanya untuk admin tournament
        </p>
      </div>
    </div>
  );
}
