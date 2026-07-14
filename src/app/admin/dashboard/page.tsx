import { redirect } from 'next/navigation';
import { checkAdminAuth, getAllTeams, getDashboardStats } from '@/lib/admin-actions';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const isAuth = await checkAdminAuth();
  if (!isAuth) redirect('/admin/login');

  const [teams, stats] = await Promise.all([
    getAllTeams(),
    getDashboardStats(),
  ]);

  return <AdminDashboardClient teams={teams} stats={stats} />;
}
