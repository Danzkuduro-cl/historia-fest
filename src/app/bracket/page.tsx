import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Trophy } from 'lucide-react';
import { getRegisteredTeamsForBracket } from '@/lib/actions';
import { getBracketStateFromDb } from '@/lib/bracket-actions';
import PublicBracketView from '@/components/bracket/PublicBracketView';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bagan Turnamen 58 Tim | Fiesta Historia 2026',
  description: 'Bagan Pertandingan dan Jadwal Turnamen Mobile Legends Bang Bang Piala Bupati Fiesta Historia Kabupaten Magelang 2026.',
};

export default async function BracketPage() {
  const [teams, initialBracketData] = await Promise.all([
    getRegisteredTeamsForBracket(),
    getBracketStateFromDb(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 grid-bg text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Beranda</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <Image
                src="/images/Logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-lg object-contain"
              />
              <span className="font-display font-bold text-sm tracking-wider text-slate-900">
                FIESTA<span className="text-red-600">HISTORIA</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-red-600" />
              <span>Bagan Resmi (58 Tim)</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Bracket Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        <PublicBracketView 
          initialTeams={teams} 
          initialData={initialBracketData} 
        />
      </main>
    </div>
  );
}
