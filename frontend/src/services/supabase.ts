import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';

export const isSupabaseConfigured =
  supabaseUrl !== '' &&
  supabaseUrl !== 'placeholder' &&
  !supabaseUrl.includes('your-project-id') &&
  supabaseAnonKey !== '' &&
  supabaseAnonKey !== 'placeholder';

let client: SupabaseClient;

if (isSupabaseConfigured) {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Safe stub for local compilation and graceful fallback when credentials are not yet set
  client = createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabase = client;
