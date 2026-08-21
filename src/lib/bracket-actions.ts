'use server';

import { createServerSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function getBracketStateFromDb(): Promise<Record<string, string>> {
  const supabase = createServerSupabase();
  try {
    const { data, error } = await supabase
      .from('tournament_bracket')
      .select('data')
      .eq('id', 'default')
      .single();

    if (error) {
      return {};
    }

    return (data?.data as Record<string, string>) || {};
  } catch (e) {
    return {};
  }
}

export async function saveBracketStateToDb(bracketData: Record<string, string>) {
  const supabase = createServerSupabase();
  try {
    const { error } = await supabase
      .from('tournament_bracket')
      .upsert({
        id: 'default',
        data: bracketData,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('Could not save bracket to DB:', error.message);
      return { error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/bracket');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
