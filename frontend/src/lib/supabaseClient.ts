// @ts-nocheck
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | undefined = undefined;

function getSupabaseInstance(): SupabaseClient {
  if (supabaseInstance !== undefined) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Build-time: return a mock that won't be used in actual runtime
    console.warn('Supabase env vars not available, using placeholder');
    supabaseInstance = createClient('https://placeholder.supabase.co', 'placeholder-key');
    return supabaseInstance;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Use getter pattern to delay initialization
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const instance = getSupabaseInstance();
    const value = instance[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
