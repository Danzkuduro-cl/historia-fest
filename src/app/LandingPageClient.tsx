'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trophy, Calendar, MapPin, Zap, Info, Shield, Award, Music, Coffee, Clock, MessageCircle
} from 'lucide-react';
import TournamentHeader from '@/components/TournamentHeader';
import NeonButton from '@/components/ui/NeonButton';

interface LandingPageClientProps {
  remainingSlots: number;
}

interface TimelineItemProps {
  time: string;
  title: string;
  location: string;
  highlight?: boolean;
}

function TimelineItem({ time, title, location, highlight = false }: TimelineItemProps) {
  return (
    <div className="flex gap-4 items-start">
      <div className="min-w-[90px] text-xs font-mono font-bold text-red-600 pt-1">
        {time}
      </div>
      <div className="relative pb-2 pl-4 border-l border-slate-200 last:border-0 flex-1">
        {/* Dot */}
        <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
          highlight ? 'bg-red-600 border-red-600' : 'bg-slate-300 border-white'
        }`} />
        <div className="space-y-0.5">
          <p className={`text-sm font-body font-semibold ${
            highlight ? 'text-red-600 font-bold' : 'text-slate-800'
          }`}>
            {title}
          </p>
          <p className="text-xs text-slate-400 font-body">
            {location}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPageClient({ remainingSlots }: LandingPageClientProps) {
  const [activeTab, setActiveTab] = useState<'day1' | 'day2'>('day1');

  return (
    <div className="min-h-screen bg-slate-50 grid-bg text-slate-900">
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Branding logo */}
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

          {/* Navigation links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-body font-semibold text-red-600 hover:text-red-700 transition-colors">Beranda</a>
            <a href="#about" className="text-sm font-body font-medium text-slate-500 hover:text-red-600 transition-colors">Tentang & Aturan</a>
            <a href="#hadiah" className="text-sm font-body font-medium text-slate-500 hover:text-red-600 transition-colors">Hadiah & Jadwal</a>
            <a href="#festival" className="text-sm font-body font-medium text-slate-500 hover:text-red-600 transition-colors">Festival Rakyat</a>
          </nav>

          {/* CTA Button to Register Route */}
          <div>
            <Link href="/register">
              <NeonButton variant="primary" size="sm" className="font-bold text-xs">
                Daftar Tim
              </NeonButton>
            </Link>
          </div>
        </div>
      </header>

      {/* Tournament Header / Hero */}
      <TournamentHeader remainingSlots={remainingSlots} />

      {/* Floating CTA for Mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Link href="/register">
          <NeonButton variant="primary" size="lg" className="shadow-lg font-bold">
            Daftar Sekarang
          </NeonButton>
        </Link>
      </div>

      {/* Landing Page Content Sections */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* Section: Tentang & Aturan */}
        <section id="about" className="space-y-6 scroll-mt-20">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full uppercase">
              Tentang Event
            </span>
            <h2 className="font-display font-bold text-3xl text-slate-900">
              Piala Bupati Fiesta Historia 2026
            </h2>
            <div className="w-12 h-1 bg-red-600 mx-auto rounded-full" />
          </div>

          <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6 bg-white border border-slate-200">
            <p className="font-body text-slate-600 leading-relaxed text-center text-sm md:text-base">
              Diselenggarakan oleh <strong>Komunitas Via Historia Magelang</strong> bekerja sama dengan <strong>DISPARPORA Kabupaten Magelang</strong>, event ini hadir memperingati HUT Kemerdekaan RI ke-81. Membawa tema besar <span className="text-red-600 font-semibold">"Melawan Amnesia Sejarah Bangsa"</span>, kami memadukan olahraga e-sport modern, festival kuliner UMKM, dan malam refleksi kebangsaan dalam satu festival rakyat yang megah.
            </p>

            {/* Unique Hero Rule Card */}
            <div className="bg-red-50/70 border border-red-200 rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-slate-900 text-lg">
                    Aturan Khusus: Sistem Nama Pahlawan ⚔️
                  </h3>
                  <p className="text-slate-700 text-xs md:text-sm font-body leading-relaxed">
                    Setiap tim yang bertanding memilih <strong>1 nama Pahlawan Nasional</strong> saat pendaftaran (misal: <em>Maramis Knights</em>, <em>Chalim Sentinels</em>, <em>Sudirman Paladins</em>). Panitia akan membacakan profil singkat pahlawan tersebut setiap kali tim bertanding di panggung, dan setiap tim wajib mengetahui sejarah pahlawan yang nama mereka sandang!
                  </p>
                </div>
              </div>
            </div>

            {/* Tournament Mode details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <Zap className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-slate-500 font-body">Format Turnamen</p>
                  <p className="text-sm font-display font-bold text-slate-900">5 VS 5 DRAFT PICK</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <MapPin className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-slate-500 font-body">Lokasi Offline</p>
                  <p className="text-sm font-display font-bold text-slate-900">Kaliangkrik, Magelang</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <Clock className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-slate-500 font-body">Batas Pendaftaran</p>
                  <p className="text-sm font-display font-bold text-slate-900">15 Agustus 2026</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Hadiah & Registrasi */}
        <section id="hadiah" className="space-y-6 scroll-mt-20">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full uppercase">
              Prizepool & Biaya
            </span>
            <h2 className="font-display font-bold text-3xl text-slate-900">
              Total Hadiah Rp 10.000.000
            </h2>
            <div className="w-12 h-1 bg-red-600 mx-auto rounded-full" />
          </div>

          {/* Cash Prize Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 text-center border-2 border-red-600 bg-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-bl">JUARA 1</div>
              <Trophy className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-body">Juara 1</p>
              <p className="text-xl font-display font-bold text-slate-900 mt-1">Rp 4.000.000</p>
              <p className="text-[10px] text-slate-400 font-body mt-0.5">Trophy + Sertifikat</p>
            </div>

            <div className="glass-card rounded-2xl p-5 text-center border border-slate-200 bg-white shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-bl">JUARA 2</div>
              <Award className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-body">Juara 2</p>
              <p className="text-xl font-display font-bold text-slate-900 mt-1">Rp 3.000.000</p>
              <p className="text-[10px] text-slate-400 font-body mt-0.5">Trophy + Sertifikat</p>
            </div>

            <div className="glass-card rounded-2xl p-5 text-center border border-slate-200 bg-white shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-800 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-bl">JUARA 3</div>
              <Award className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-body">Juara 3</p>
              <p className="text-xl font-display font-bold text-slate-900 mt-1">Rp 2.000.000</p>
              <p className="text-[10px] text-slate-400 font-body mt-0.5">Trophy + Sertifikat</p>
            </div>

            <div className="glass-card rounded-2xl p-5 text-center border border-slate-200 bg-white shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-bl">MVP</div>
              <Zap className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-body">Pemain Terbaik</p>
              <p className="text-xl font-display font-bold text-slate-900 mt-1">Rp 1.000.000</p>
              <p className="text-[10px] text-slate-400 font-body mt-0.5">Sertifikat</p>
            </div>
          </div>

          {/* Maps & Offline Venue */}
          <div className="glass-card rounded-2xl p-6 bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <h3 className="font-display font-bold text-slate-900 text-lg">Roemah Kopi Kalipan, Kaliangkrik</h3>
              <p className="text-slate-500 text-xs md:text-sm font-body leading-relaxed">
                Pertandingan babak penyisihan turnamen akan dilaksanakan secara offline di Roemah Kopi Kalipan, Girirejo, Kaliangkrik, Kabupaten Magelang.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://maps.google.com/?q=Roemah+Kopi+Kalipan+Kaliangkrik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-body font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-600" /> Google Maps
                </a>
              </div>
            </div>
            <div className="h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-body">
              [ Peta Lokasi Kaliangkrik ]
            </div>
          </div>

          {/* Registration CTA card */}
          <div className="p-6 md:p-8 rounded-2xl bg-red-600 text-white text-center space-y-4 shadow-lg">
            <h3 className="font-display font-bold text-2xl">Sudah Siap Membawa Tim Kamu Juara?</h3>
            <p className="text-red-50 text-xs md:text-sm font-body max-w-lg mx-auto">
              Segera kunci slot pendaftaran tim kamu sebelum batas akhir 15 Agustus 2026 atau kuota 64 slot tim habis terpenuhi!
            </p>
            <div className="pt-2">
              <Link href="/register">
                <button className="px-8 py-3 rounded-xl bg-white text-red-600 font-display font-bold hover:bg-red-50 transition-all shadow-md">
                  Daftarkan Tim Sekarang
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Section: Festival Rakyat */}
        <section id="festival" className="space-y-6 scroll-mt-20">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full uppercase">
              Rangkaian Acara
            </span>
            <h2 className="font-display font-bold text-3xl text-slate-900">
              Festival Kuliner & Panggung Hiburan
            </h2>
            <div className="w-12 h-1 bg-red-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* UMKM Box */}
            <div className="glass-card rounded-2xl p-6 bg-white border border-slate-200 space-y-3">
              <Coffee className="w-6 h-6 text-red-600" />
              <h3 className="font-display font-bold text-slate-900 text-lg">Pasar Jadoel Kuliner UMKM</h3>
              <p className="text-slate-500 text-xs md:text-sm font-body leading-relaxed">
                Menghadirkan <strong>24 booth kuliner tradisional Magelang</strong> dengan nuansa tempo dulu. Seluruh pelapak dan panitia mengenakan pakaian pejuang/pahlawan nasional untuk memeriahkan festival sejarah.
              </p>
            </div>

            {/* Music Concert Box */}
            <div className="glass-card rounded-2xl p-6 bg-white border border-slate-200 space-y-3">
              <Music className="w-6 h-6 text-red-600" />
              <h3 className="font-display font-bold text-slate-900 text-lg">Panggung Hiburan Rakyat</h3>
              <p className="text-slate-500 text-xs md:text-sm font-body leading-relaxed">
                Live music dangdut klasik oleh <strong>Om Janema</strong>, dangdut modern oleh <strong>Qasima</strong>, dan ditutup meriah oleh penampilan bintang tamu nasional <strong>Woro Widowati</strong> di malam puncak.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Rundown (Timeline) — HIDDEN: belum final */}
        <section id="rundown" className="hidden space-y-6 scroll-mt-20">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full uppercase">
              Rundown Event
            </span>
            <h2 className="font-display font-bold text-3xl text-slate-900">
              Jadwal & Agenda Kegiatan
            </h2>
            <div className="w-12 h-1 bg-red-600 mx-auto rounded-full" />
          </div>

          {/* Tab navigation */}
          <div className="flex border-b border-slate-200 max-w-sm mx-auto">
            <button
              onClick={() => setActiveTab('day1')}
              className={`flex-1 py-3 text-center text-sm font-display font-bold border-b-2 transition-all ${
                activeTab === 'day1'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              HARI 1 (22 AGUSTUS)
            </button>
            <button
              onClick={() => setActiveTab('day2')}
              className={`flex-1 py-3 text-center text-sm font-display font-bold border-b-2 transition-all ${
                activeTab === 'day2'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              HARI 2 (23 AGUSTUS)
            </button>
          </div>

          {/* Timeline content */}
          <div className="glass-card rounded-2xl p-6 bg-white border border-slate-200">
            {activeTab === 'day1' ? (
              <div className="space-y-6">
                <TimelineItem time="09.30 - 10.00" title="Registrasi Ulang & Briefing Turnamen" location="Markas Historia Fest" />
                <TimelineItem time="09.30 - Selesai" title="Setup & Pembukaan Booth UMKM" location="Lapangan Pinus Candisari" />
                <TimelineItem time="10.00 - 12.30" title="Babak Penyisihan 64 Besar (Sesi 1 & 2)" location="Markas Historia Fest" highlight />
                <TimelineItem time="12.30 - 13.15" title="Istirahat Siang & Sholat Dzuhur" location="Markas Historia Fest" />
                <TimelineItem time="13.15 - 14.30" title="Babak Penyisihan 32 Besar" location="Markas Historia Fest" highlight />
                <TimelineItem time="14.45 - 16.00" title="Babak Penyisihan 16 Besar" location="Markas / Arena Utama" highlight />
                <TimelineItem time="16.30 - 19.00" title="Babak 8 Besar & Babak 4 Besar" location="Markas / Arena Utama" highlight />
                <TimelineItem time="19.00 - 20.30" title="Perebutan Juara Ke-3" location="Markas / Arena Utama" highlight />
              </div>
            ) : (
              <div className="space-y-6">
                <TimelineItem time="13.00 - 14.30" title="GRAND FINAL MLBB (Format BO5)" location="Panggung Utama" highlight />
                <TimelineItem time="13.00 - Selesai" title="Festival Kuliner UMKM Nepal van Java" location="Area Kuliner UMKM" />
                <TimelineItem time="15.00 - 17.30" title="Penampilan Live Musik Om Janema" location="Panggung Utama" />
                <TimelineItem time="17.30 - 18.30" title="Break Maghrib & Istirahat" location="Lapangan Pinus" />
                <TimelineItem time="18.30 - 19.00" title="Malam Refleksi & Doa Bersama Pahlawan" location="Panggung Utama" highlight />
                <TimelineItem time="19.00 - 20.00" title="Menyanyikan Lagu Kebangsaan & Pesan Pahlawan" location="Lapangan Pinus" />
                <TimelineItem time="20.15 - 21.00" title="Pembagian Hadiah Juara & Apresiasi Peserta" location="Panggung Utama" highlight />
                <TimelineItem time="21.15 - 22.15" title="Penampilan Live Musik Qasima" location="Panggung Utama" />
                <TimelineItem time="22.15 - 23.15" title="Konser Bintang Tamu Woro Widowati" location="Panggung Utama" highlight />
                <TimelineItem time="23.15 - 23.30" title="Penutupan & Sesi Foto Bersama" location="Panggung Utama" />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <p className="font-display font-bold text-sm text-slate-800">
            FIESTA HISTORIA 2026 · KABUPATEN MAGELANG
          </p>
          <p className="font-body text-xs text-slate-400">
            Didukung oleh DISPARPORA & Komunitas Via Historia Magelang
          </p>
        </div>
      </footer>
    </div>
  );
}
