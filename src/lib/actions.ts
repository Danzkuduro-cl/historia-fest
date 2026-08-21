'use server';

import { createServerSupabase } from '@/lib/supabase';
import { createMidtransTransaction } from '@/lib/midtrans';
import { generateRegistrationCode } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { HERO_TEAMS, HeroTeam } from './hero-teams';

const REGISTRATION_FEE = parseInt(process.env.NEXT_PUBLIC_REGISTRATION_FEE || '50000');
const TOURNAMENT_NAME = process.env.NEXT_PUBLIC_TOURNAMENT_NAME || 'ML Championship 2026';

export interface RegistrationPayload {
  team_name: string;
  captain_name: string;
  whatsapp: string;
  logo_url?: string;
  players: Array<{
    full_name: string;
    nickname: string;
    mlbb_id: string;
    server_id: string;
    player_type: 'core' | 'substitute';
    player_order: number;
  }>;
}

export async function getAvailableHeroTeams(): Promise<HeroTeam[]> {
  const supabase = createServerSupabase();
  const { data: takenTeams } = await supabase
    .from('teams')
    .select('team_name')
    .in('payment_status', ['paid', 'pending']);

  const takenSet = new Set((takenTeams || []).map((t) => t.team_name.toLowerCase()));
  return HERO_TEAMS.filter((ht) => !takenSet.has(ht.team_name.toLowerCase()));
}

export async function registerTeam(payload: RegistrationPayload) {
  const isRegistrationClosed = true;
  if (isRegistrationClosed) {
    return { error: 'Pendaftaran turnamen telah resmi ditutup oleh panitia.' };
  }

  const supabase = createServerSupabase();

  // Validate hero team name selection
  const validHero = HERO_TEAMS.find(
    (ht) => ht.team_name.toLowerCase() === payload.team_name.trim().toLowerCase()
  );

  if (!validHero) {
    return { error: 'Nama tim Pahlawan tidak valid. Pilih dari daftar yang tersedia.' };
  }

  // Check if chosen team name is already taken
  const { data: existingTeam } = await supabase
    .from('teams')
    .select('id')
    .ilike('team_name', payload.team_name)
    .single();

  if (existingTeam) {
    return { error: `Nama tim "${payload.team_name}" sudah terdaftar oleh tim lain. Silakan pilih nama tim Pahlawan lainnya.` };
  }

  // Check for duplicate MLBB IDs
  const mlbbIds = payload.players.map((p) => p.mlbb_id);
  const uniqueIds = new Set(mlbbIds);
  if (uniqueIds.size !== mlbbIds.length) {
    return { error: 'Terdapat MLBB ID yang duplikat antar pemain.' };
  }

  // Check remaining slots
  const { count } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .in('payment_status', ['paid', 'pending']);

  const maxSlots = parseInt(process.env.NEXT_PUBLIC_MAX_SLOTS || '64');
  if ((count ?? 0) >= maxSlots) {
    return { error: 'Slot pendaftaran sudah penuh.' };
  }

  // Generate registration code
  const registrationCode = generateRegistrationCode(payload.team_name);

  // Set default hero logo if logo_url not specified
  const logoUrl = payload.logo_url || `/images/heroes/${validHero.id}.png`;

  // Insert team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      team_name: payload.team_name,
      captain_name: payload.captain_name,
      whatsapp: payload.whatsapp,
      logo_url: logoUrl,
      registration_code: registrationCode,
      payment_status: 'pending',
    })
    .select()
    .single();

  if (teamError || !team) {
    console.error('Team insert error:', teamError);
    return { error: 'Gagal mendaftarkan tim. Silakan coba lagi.' };
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
    // Rollback team
    await supabase.from('teams').delete().eq('id', team.id);
    console.error('Players insert error:', playersError);
    return { error: 'Gagal menyimpan data pemain. Silakan coba lagi.' };
  }

  try {
    // Midtrans order_id: max 50 chars, no special characters
    const shortTeamId = team.id.replace(/-/g, '').substring(0, 8).toUpperCase();
    const orderId = `MLT-${shortTeamId}-${Date.now().toString(36).toUpperCase()}`;
    
    const midtransResponse = await createMidtransTransaction({
      orderId,
      amount: REGISTRATION_FEE,
      customerName: payload.captain_name,
      customerPhone: payload.whatsapp,
      itemName: `Pendaftaran ${TOURNAMENT_NAME} - ${payload.team_name}`,
    });

    // Save payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        team_id: team.id,
        transaction_id: orderId,
        amount: REGISTRATION_FEE,
        status: 'pending',
        snap_token: midtransResponse.token,
        payment_url: midtransResponse.redirect_url,
      });

    if (paymentError) {
      console.error('Payment insert error:', paymentError);
    }

    revalidatePath('/admin/dashboard');

    return {
      success: true,
      teamId: team.id,
      registrationCode,
      snapToken: midtransResponse.token,
      paymentUrl: midtransResponse.redirect_url,
    };
  } catch (midtransError: unknown) {
    const errorMsg = midtransError instanceof Error ? midtransError.message : 'Gagal terhubung ke Midtrans';
    console.error('Midtrans transaction creation failed:', errorMsg);
    
    return {
      success: true,
      teamId: team.id,
      registrationCode,
      snapToken: null,
      paymentUrl: null,
      warning: `Pendaftaran berhasil, tetapi pembayaran gagal dibuat: ${errorMsg}`,
    };
  }
}

export async function uploadTeamLogo(formData: FormData) {
  const supabase = createServerSupabase();
  const file = formData.get('logo') as File;

  if (!file || file.size === 0) return { url: null };

  const fileExt = file.name.split('.').pop();
  const fileName = `logos/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error } = await supabase.storage
    .from('team-logos')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error('Logo upload error:', error);
    return { url: null };
  }

  const { data } = supabase.storage
    .from('team-logos')
    .getPublicUrl(fileName);

  return { url: data.publicUrl };
}

export async function getRemainingSlots() {
  return 0;
}

export async function getTeamByRegistrationCode(code: string) {
  const supabase = createServerSupabase();

  const { data } = await supabase
    .from('teams')
    .select(`
      *,
      players (*),
      payments (*)
    `)
    .eq('registration_code', code)
    .single();

  return data;
}

export async function cancelRegistration(teamId: string) {
  const supabase = createServerSupabase();

  // Delete players first (FK constraint)
  await supabase.from('players').delete().eq('team_id', teamId);

  // Delete payments
  await supabase.from('payments').delete().eq('team_id', teamId);

  // Delete team
  const { error } = await supabase.from('teams').delete().eq('id', teamId);

  if (error) {
    console.error('Cancel registration error:', error);
    return { success: false, error: 'Gagal membatalkan pendaftaran.' };
  }

  revalidatePath('/admin/dashboard');
  revalidatePath('/register');

  return { success: true };
}

export interface BracketTeamData {
  id: string;
  team_name: string;
  captain_name: string;
  logo_url?: string;
  registration_code: string;
  payment_status: string;
}

export async function getRegisteredTeamsForBracket(): Promise<BracketTeamData[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('teams')
    .select('id, team_name, captain_name, logo_url, registration_code, payment_status')
    .neq('registration_code', 'SYS-BRK')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching teams for bracket:', error);
    return [];
  }

  return data || [];
}
