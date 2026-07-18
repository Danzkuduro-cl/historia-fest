import { getRemainingSlots } from '@/lib/actions';
import LandingPageClient from './LandingPageClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const remainingSlots = await getRemainingSlots();

  return <LandingPageClient remainingSlots={remainingSlots} />;
}
