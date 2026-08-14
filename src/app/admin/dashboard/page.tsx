import { redirect } from 'next/navigation';
import { checkAdminAuth, getAllTeams, getDashboardStats } from '@/lib/admin-actions';
import { getAvailableHeroTeams } from '@/lib/actions';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) redirect('/admin/login');

  const [teams, stats, availableHeroTeams] = await Promise.all([
    getAllTeams(),
    getDashboardStats(),
    getAvailableHeroTeams(),
  ]);

  return <AdminDashboardClient teams={teams} stats={stats} availableHeroTeams={availableHeroTeams} />;
}

