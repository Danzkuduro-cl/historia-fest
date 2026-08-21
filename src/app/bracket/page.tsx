import { getRegisteredTeamsForBracket } from '@/lib/actions';
import BracketPageClient from '@/components/bracket/BracketPageClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Bagan Turnamen 59 Tim | Fiesta Historia 2026',
  description: 'Bagan Pertandingan dan Jadwal Turnamen Mobile Legends Bang Bang Piala Bupati Fiesta Historia Kabupaten Magelang 2026.',
};

export default async function BracketPage() {
  const teams = await getRegisteredTeamsForBracket();
  return <BracketPageClient initialTeams={teams} />;
}
