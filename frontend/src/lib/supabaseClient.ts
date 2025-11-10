// @ts-nocheck
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function initSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Build-time: env vars yoksa dummy client (sadece tip kontrolü için)
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
      // Server-side build: dummy client döndür
      return createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
    throw new Error(
      `Supabase configuration missing. URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

export const supabase = initSupabase();
