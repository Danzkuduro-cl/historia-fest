import { getRemainingSlots } from '@/lib/actions';
import RegistrationPageClient from './RegistrationPageClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const remainingSlots = await getRemainingSlots();

  return <RegistrationPageClient remainingSlots={remainingSlots} />;
}
