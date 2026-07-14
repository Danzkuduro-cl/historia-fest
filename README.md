# 🏆 ML Tournament Registration App

Aplikasi pendaftaran turnamen Mobile Legends Bang Bang berbasis Next.js 15, Supabase, dan Midtrans.

---

## 📋 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form**: React Hook Form + Zod
- **Database**: Supabase (PostgreSQL)
- **Payment**: Midtrans (QRIS, Transfer Bank, E-Wallet)
- **Deploy**: Vercel

---

## 🚀 Setup & Installation

### 1. Clone & Install

```bash
git clone <your-repo>
cd ml-tournament
npm install
```

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** dan jalankan file `supabase/schema.sql`
3. Buka **Settings > API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Setup Midtrans

1. Daftar di [midtrans.com](https://midtrans.com)
2. Buka **Settings > Access Keys**, copy:
   - `Server Key` → `MIDTRANS_SERVER_KEY`
   - `Client Key` → `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
3. Untuk testing gunakan Sandbox environment

**Setup Webhook Midtrans:**
- Buka Midtrans Dashboard → Settings → Configuration
- Set **Payment Notification URL**: `https://your-domain.vercel.app/api/midtrans`

### 4. Environment Variables

```bash
cp .env.example .env.local
```

Isi `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Midtrans
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
MIDTRANS_IS_PRODUCTION=false

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_TOURNAMENT_NAME=ML Championship 2025
NEXT_PUBLIC_TOURNAMENT_DATE=2025-02-15
NEXT_PUBLIC_REGISTRATION_FEE=50000
NEXT_PUBLIC_MAX_SLOTS=64
NEXT_PUBLIC_WHATSAPP_NUMBER=6281234567890

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ganti-dengan-password-aman
```

### 5. Run Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Project

```
ml-tournament/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Halaman utama (form registrasi)
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   ├── RegistrationPageClient.tsx  # Client wrapper multi-step form
│   │   ├── payment/
│   │   │   ├── success/page.tsx        # Halaman sukses bayar
│   │   │   └── pending/page.tsx        # Halaman pending bayar
│   │   ├── admin/
│   │   │   ├── login/page.tsx          # Admin login
│   │   │   └── dashboard/page.tsx      # Admin dashboard
│   │   └── api/
│   │       ├── midtrans/route.ts       # Webhook Midtrans
│   │       └── export/route.ts         # Export Excel
│   ├── components/
│   │   ├── TournamentHeader.tsx        # Header + countdown + stats
│   │   ├── StepProgress.tsx            # Progress step indicator
│   │   ├── form/
│   │   │   ├── StepTeamInfo.tsx        # Step 1: Info tim
│   │   │   ├── StepPlayers.tsx         # Step 2: Pemain inti
│   │   │   ├── StepSubstitutes.tsx     # Step 3: Pemain cadangan
│   │   │   ├── StepReview.tsx          # Step 4: Review & konfirmasi
│   │   │   └── PlayerCard.tsx          # Komponen kartu pemain
│   │   ├── admin/
│   │   │   ├── AdminDashboardClient.tsx # Dashboard client
│   │   │   ├── AdminStatCard.tsx        # Kartu statistik
│   │   │   └── TeamDetailModal.tsx      # Modal detail tim
│   │   └── ui/
│   │       ├── NeonInput.tsx           # Input dengan efek neon
│   │       └── NeonButton.tsx          # Tombol dengan efek neon
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client
│   │   ├── midtrans.ts                 # Midtrans integration
│   │   ├── actions.ts                  # Server actions (registrasi)
│   │   ├── admin-actions.ts            # Server actions (admin)
│   │   ├── validations.ts              # Zod schemas
│   │   └── utils.ts                    # Helper functions
│   ├── types/
│   │   └── index.ts                    # TypeScript types
│   └── middleware.ts                   # Admin route protection
├── supabase/
│   └── schema.sql                      # Database schema
├── public/
├── .env.example
├── next.config.mjs
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎮 Fitur

### Halaman Utama
- Header tournament (nama, logo, biaya, slot, tanggal)
- Countdown timer real-time
- Progress slot pendaftaran
- Tombol kontak WhatsApp admin

### Form Registrasi (4 Step)
- **Step 1**: Nama tim, kapten, WhatsApp, upload logo
- **Step 2**: 5 pemain inti (nama, nickname, MLBB ID, Server ID)
- **Step 3**: 0-2 pemain cadangan (opsional)
- **Step 4**: Review data + persetujuan rules + submit

### Pembayaran (Midtrans)
- QRIS, GoPay, DANA, Transfer Bank (BCA/BNI/BRI)
- Auto redirect ke halaman sukses/pending
- Webhook untuk update status otomatis

### Admin Dashboard
- Login protected
- Statistik total tim, sudah bayar, pending, revenue
- Tabel semua tim dengan search & filter status
- Modal detail tim + daftar pemain
- Manual update status pembayaran
- Export Excel (data tim + pemain)

---

## 🌐 Deploy ke Vercel

1. Push code ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Set semua environment variables
4. Deploy → otomatis!

**Ganti `NEXT_PUBLIC_APP_URL`** dengan URL Vercel kamu setelah deploy.

**Update Midtrans webhook URL** ke domain Vercel kamu.

---

## 🔒 Keamanan

- Admin session via HTTP-only cookie
- Server-side validation semua input
- Midtrans signature verification di webhook
- Supabase service role key hanya di server
- RLS (Row Level Security) aktif di Supabase

---

## 🎨 Customisasi

### Ubah nama/tanggal tournament:
Edit `.env.local`:
```env
NEXT_PUBLIC_TOURNAMENT_NAME=Nama Tournament Kamu
NEXT_PUBLIC_TOURNAMENT_DATE=2025-03-20
NEXT_PUBLIC_REGISTRATION_FEE=75000
NEXT_PUBLIC_MAX_SLOTS=32
```

### Ubah logo tournament:
Ganti icon di `TournamentHeader.tsx` atau tambah gambar di `/public/`.

### Ubah warna tema:
Edit `tailwind.config.js` bagian `colors.neon`.

---

## 🆘 Troubleshooting

**Midtrans tidak muncul:**
- Pastikan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` sudah diisi
- Cek apakah Snap script berhasil dimuat di console browser

**Upload logo gagal:**
- Pastikan bucket `team-logos` sudah dibuat di Supabase Storage
- Cek storage policy sudah benar

**Admin tidak bisa login:**
- Cek `ADMIN_USERNAME` dan `ADMIN_PASSWORD` di `.env.local`
- Pastikan tidak ada spasi di nilai env variable

**Payment status tidak terupdate otomatis:**
- Pastikan webhook URL sudah dikonfigurasi di Midtrans Dashboard
- URL webhook: `https://your-domain.vercel.app/api/midtrans`
