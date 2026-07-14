'use client';

import { useFormContext } from 'react-hook-form';
import { useRef, useState } from 'react';
import NeonInput from '@/components/ui/NeonInput';
import { Users, Phone, User, Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StepTeamInfo() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setValue('logo', e.target.files);
  };

  const removeLogo = () => {
    setPreview(null);
    setValue('logo', null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="mb-2">
        <h2 className="font-display text-xl font-bold text-white">
          Informasi Tim
        </h2>
        <p className="text-slate-400 text-sm font-body mt-1">
          Masukkan data tim dan kapten untuk pendaftaran.
        </p>
      </div>

      {/* Team Name */}
      <NeonInput
        label="Nama Tim"
        placeholder="Contoh: Alpha Warriors"
        required
        error={errors.team_name?.message as string}
        hint="3-30 karakter, huruf/angka/spasi/_/-"
        icon={<Users className="w-4 h-4" />}
        {...register('team_name')}
      />

      {/* Captain Name */}
      <NeonInput
        label="Nama Lengkap Kapten"
        placeholder="Nama asli kapten tim"
        required
        error={errors.captain_name?.message as string}
        icon={<User className="w-4 h-4" />}
        {...register('captain_name')}
      />

      {/* WhatsApp */}
      <NeonInput
        label="Nomor WhatsApp Kapten"
        placeholder="08xx atau +628xx"
        required
        type="tel"
        error={errors.whatsapp?.message as string}
        hint="Akan digunakan untuk konfirmasi pembayaran"
        icon={<Phone className="w-4 h-4" />}
        {...register('whatsapp')}
      />

      {/* Logo Upload */}
      <div className="space-y-1.5">
        <label className="block text-sm font-body font-medium text-slate-300">
          Logo Tim <span className="text-slate-500 font-normal">(Opsional)</span>
        </label>

        {preview ? (
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-xl overflow-hidden border border-neon-blue/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Logo preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={removeLogo}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              'w-full border-2 border-dashed border-dark-400 rounded-xl p-6',
              'flex flex-col items-center gap-2 text-slate-500',
              'hover:border-neon-blue/40 hover:text-neon-blue/70 transition-all',
              'cursor-pointer'
            )}
          >
            <Upload className="w-6 h-6" />
            <span className="text-sm font-body">Klik untuk upload logo tim</span>
            <span className="text-xs">PNG, JPG, WEBP · Maks 2MB</span>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Tips */}
      <div className="glass-card rounded-xl p-4 border border-neon-blue/10">
        <div className="flex gap-3">
          <ImageIcon className="w-4 h-4 text-neon-blue shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-body text-slate-400">
              <span className="text-neon-blue font-semibold">Tips:</span> Nama tim tidak dapat diubah setelah pendaftaran. Pastikan nama tim sudah benar sebelum melanjutkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
