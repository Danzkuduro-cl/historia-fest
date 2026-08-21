import { getRemainingSlots } from '@/lib/actions';
import { getBracketStateFromDb } from '@/lib/bracket-actions';
import LandingPageClient from './LandingPageClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [remainingSlots, initialBracketData] = await Promise.all([
    getRemainingSlots(),
    getBracketStateFromDb(),
  ]);

  return (
    <LandingPageClient 
      remainingSlots={remainingSlots} 
      initialBracketData={initialBracketData}
    />
  );
}
