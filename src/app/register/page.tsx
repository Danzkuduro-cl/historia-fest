import { getRemainingSlots, getAvailableHeroTeams } from '@/lib/actions';
import RegistrationPageClient from '../RegistrationPageClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Daftar Tim | Fiesta Historia E-Sport Tournament 2026',
  description: 'Daftarkan tim Mobile Legends kamu untuk Piala Bupati Fiesta Historia E-Sport Tournament Kabupaten Magelang 2026.',
};

export default async function RegisterPage() {
  redirect('/');

  const [remainingSlots, availableHeroTeams] = await Promise.all([
    getRemainingSlots(),
    getAvailableHeroTeams(),
  ]);

  return (
    <RegistrationPageClient
      remainingSlots={remainingSlots}
      availableHeroTeams={availableHeroTeams}
    />
  );
}
