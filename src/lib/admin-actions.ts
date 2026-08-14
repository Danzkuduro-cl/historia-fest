'use server';

import { createServerSupabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';


const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function adminLogin(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return { error: 'Username atau password salah' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });

  redirect('/admin/dashboard');
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/admin/login');
}

export async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

export async function getAllTeams(filters?: {
  search?: string;
  paymentStatus?: string;
}) {
  const supabase = createServerSupabase();

  let query = supabase
    .from('teams')
    .select(`
      *,
      players (*),
      payments (*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.search) {
    query = query.or(
      `team_name.ilike.%${filters.search}%,captain_name.ilike.%${filters.search}%,registration_code.ilike.%${filters.search}%`
    );
  }

  if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
    query = query.eq('payment_status', filters.paymentStatus);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function updatePaymentStatus(teamId: string, status: string) {
  const supabase = createServerSupabase();

  const { error: teamError } = await supabase
    .from('teams')
    .update({ payment_status: status })
    .eq('id', teamId);

  if (teamError) return { error: 'Gagal update status pembayaran' };

  const { error: paymentError } = await supabase
    .from('payments')
    .update({ status })
    .eq('team_id', teamId);

  if (paymentError) return { error: 'Gagal update data pembayaran' };

  return { success: true };
}

export async function deleteTeam(teamId: string) {
  const supabase = createServerSupabase();

  // Players & payments akan terhapus otomatis via ON DELETE CASCADE di schema
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);

  if (error) {
    console.error('Delete team error:', error);
    return { error: 'Gagal menghapus data tim' };
  }

  revalidatePath('/admin/dashboard');
  return { success: true };
}


export async function getDashboardStats() {
  const supabase = createServerSupabase();
  const maxSlots = parseInt(process.env.NEXT_PUBLIC_MAX_SLOTS || '64');

  const { count: totalTeams } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true });

  const { count: paidTeams } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .eq('payment_status', 'paid');

  const { count: pendingTeams } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .eq('payment_status', 'pending');

  const totalRevenue = (paidTeams || 0) * parseInt(process.env.NEXT_PUBLIC_REGISTRATION_FEE || '50000');

  return {
    totalTeams: totalTeams || 0,
    paidTeams: paidTeams || 0,
    pendingTeams: pendingTeams || 0,
    remainingSlots: Math.max(0, maxSlots - (totalTeams || 0)),
    totalRevenue,
    maxSlots,
  };
}

export async function exportTeamsToExcel() {
  const teams = await getAllTeams();

  const teamsData = teams.map((team) => ({
    'Kode Registrasi': team.registration_code,
    'Nama Tim': team.team_name,
    'Nama Kapten': team.captain_name,
    'WhatsApp': team.whatsapp,
    'Status Pembayaran': team.payment_status,
    'Tanggal Daftar': new Date(team.created_at).toLocaleDateString('id-ID'),
  }));

  const playersData: Record<string, string>[] = [];
  teams.forEach((team) => {
    (team.players || []).forEach((player: {
      player_type: string;
      player_order?: number;
      full_name: string;
      nickname: string;
      mlbb_id: string;
      server_id: string;
    }) => {
      playersData.push({
        'Nama Tim': team.team_name,
        'Tipe Pemain': player.player_type === 'core' ? 'Inti' : 'Cadangan',
        'Urutan': String(player.player_order || ''),
        'Nama Lengkap': player.full_name,
        'Nickname': player.nickname,
        'MLBB ID': player.mlbb_id,
        'Server ID': player.server_id,
      });
    });
  });

  const wb = XLSX.utils.book_new();
  const wsTeams = XLSX.utils.json_to_sheet(teamsData);
  const wsPlayers = XLSX.utils.json_to_sheet(playersData);

  XLSX.utils.book_append_sheet(wb, wsTeams, 'Tim');
  XLSX.utils.book_append_sheet(wb, wsPlayers, 'Pemain');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

// ── Admin Create Team ───────────────────────────────────────────

export interface AdminCreateTeamPayload {
  team_name: string;
  captain_name: string;
  whatsapp: string;
  payment_status: 'paid' | 'pending';
  players: Array<{
    full_name: string;
    nickname: string;
    mlbb_id: string;
    server_id: string;
    player_type: 'core' | 'substitute';
    player_order: number;
  }>;
}

export async function createTeamManual(payload: AdminCreateTeamPayload) {
  const supabase = createServerSupabase();

  // Import hero teams for validation
  const { HERO_TEAMS } = await import('./hero-teams');

  const validHero = HERO_TEAMS.find(
    (ht) => ht.team_name.toLowerCase() === payload.team_name.trim().toLowerCase()
  );

  if (!validHero) {
    return { error: 'Nama tim Pahlawan tidak valid.' };
  }

  // Check if team name is already taken
  const { data: existingTeam } = await supabase
    .from('teams')
    .select('id')
    .ilike('team_name', payload.team_name)
    .single();

  if (existingTeam) {
    return { error: `Nama tim "${payload.team_name}" sudah terdaftar.` };
  }

  // Generate registration code
  const { generateRegistrationCode } = await import('./utils');
  const registrationCode = generateRegistrationCode(payload.team_name);
  const logoUrl = `/images/heroes/${validHero.id}.png`;

  // Insert team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      team_name: payload.team_name,
      captain_name: payload.captain_name,
      whatsapp: payload.whatsapp,
      logo_url: logoUrl,
      registration_code: registrationCode,
      payment_status: payload.payment_status,
    })
    .select()
    .single();

  if (teamError || !team) {
    console.error('Admin create team error:', teamError);
    return { error: 'Gagal membuat tim. Silakan coba lagi.' };
  }

  // Insert players
  const playersToInsert = payload.players.map((p) => ({
    team_id: team.id,
    player_type: p.player_type,
    full_name: p.full_name,
    nickname: p.nickname,
    mlbb_id: p.mlbb_id,
    server_id: p.server_id,
    player_order: p.player_order,
  }));

  const { error: playersError } = await supabase
    .from('players')
    .insert(playersToInsert);

  if (playersError) {
    await supabase.from('teams').delete().eq('id', team.id);
    console.error('Admin create players error:', playersError);
    return { error: 'Gagal menyimpan data pemain.' };
  }

  // Insert payment record if paid
  if (payload.payment_status === 'paid') {
    const fee = parseInt(process.env.NEXT_PUBLIC_REGISTRATION_FEE || '50000');
    await supabase.from('payments').insert({
      team_id: team.id,
      transaction_id: `ADMIN-${team.id.replace(/-/g, '').substring(0, 8).toUpperCase()}`,
      amount: fee,
      status: 'paid',
    });
  }

  revalidatePath('/admin/dashboard');
  revalidatePath('/register');

  return { success: true, registrationCode };
}

// ── Admin Update Team & Players ─────────────────────────────────

export interface AdminUpdateTeamPayload {
  captain_name: string;
  whatsapp: string;
  players: Array<{
    full_name: string;
    nickname: string;
    mlbb_id: string;
    server_id: string;
    player_type: 'core' | 'substitute';
    player_order: number;
  }>;
}

export async function updateTeamAndPlayers(teamId: string, payload: AdminUpdateTeamPayload) {
  const supabase = createServerSupabase();

  // Update team info
  const { error: teamError } = await supabase
    .from('teams')
    .update({
      captain_name: payload.captain_name,
      whatsapp: payload.whatsapp,
    })
    .eq('id', teamId);

  if (teamError) {
    console.error('Admin update team error:', teamError);
    return { error: 'Gagal mengupdate info tim.' };
  }

  // Delete old players and re-insert
  const { error: deleteError } = await supabase
    .from('players')
    .delete()
    .eq('team_id', teamId);

  if (deleteError) {
    console.error('Admin delete players error:', deleteError);
    return { error: 'Gagal menghapus data pemain lama.' };
  }

  const playersToInsert = payload.players.map((p) => ({
    team_id: teamId,
    player_type: p.player_type,
    full_name: p.full_name,
    nickname: p.nickname,
    mlbb_id: p.mlbb_id,
    server_id: p.server_id,
    player_order: p.player_order,
  }));

  const { error: insertError } = await supabase
    .from('players')
    .insert(playersToInsert);

  if (insertError) {
    console.error('Admin insert players error:', insertError);
    return { error: 'Gagal menyimpan data pemain baru.' };
  }

  revalidatePath('/admin/dashboard');

  return { success: true };
}

