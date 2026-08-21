'use server';

import { createServerSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

const SYSTEM_BRACKET_CODE = 'SYS-BRK';

export async function getBracketStateFromDb(): Promise<Record<string, string>> {
  const supabase = createServerSupabase();

  // 1. Try tournament_bracket table first
  try {
    const { data, error } = await supabase
      .from('tournament_bracket')
      .select('data')
      .eq('id', 'default')
      .single();

    if (!error && data?.data) {
      return data.data as Record<string, string>;
    }
  } catch (e) {}

  // 2. Fallback to storage in teams table (using logo_url to store JSON)
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('logo_url')
      .eq('registration_code', SYSTEM_BRACKET_CODE)
      .single();

    if (!error && data?.logo_url) {
      try {
        const parsed = JSON.parse(data.logo_url);
        return parsed;
      } catch (err) {
        console.error('Failed to parse bracket JSON from teams table', err);
      }
    }
  } catch (e) {}

  return {};
}

export async function saveBracketStateToDb(bracketData: Record<string, string>) {
  const supabase = createServerSupabase();
  const jsonString = JSON.stringify(bracketData);

  let savedInCustomTable = false;

  // 1. Try tournament_bracket table first
  try {
    const { error } = await supabase
      .from('tournament_bracket')
      .upsert({
        id: 'default',
        data: bracketData,
        updated_at: new Date().toISOString(),
      });

    if (!error) {
      savedInCustomTable = true;
    }
  } catch (e) {}

  // 2. Synchronize / Fallback to teams table
  try {
    const { data: existing } = await supabase
      .from('teams')
      .select('id')
      .eq('registration_code', SYSTEM_BRACKET_CODE)
      .single();

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from('teams')
        .update({
          team_name: '__SYSTEM_BRACKET__',
          captain_name: 'System',
          whatsapp: '0',
          logo_url: jsonString,
          payment_status: 'system_bracket',
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('teams')
        .insert({
          registration_code: SYSTEM_BRACKET_CODE,
          team_name: '__SYSTEM_BRACKET__',
          captain_name: 'System',
          whatsapp: '0',
          logo_url: jsonString,
          payment_status: 'system_bracket',
        });

      if (insertError) throw insertError;
    }
  } catch (err: any) {
    console.error('Fallback save error:', err);
    if (!savedInCustomTable) {
      return { error: err.message || 'Gagal menyimpan data bagan ke server.' };
    }
  }

  revalidatePath('/');
  revalidatePath('/bracket');
  revalidatePath('/admin/dashboard');
  return { success: true };
}
