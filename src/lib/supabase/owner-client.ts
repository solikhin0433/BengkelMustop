import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let sessionExpiresAt = 0;

/**
 * Returns an authenticated Supabase client as owner (solikhinfile@gmail.com).
 * This ensures all PostgreSQL functions, triggers, and RLS policies execute with owner rights.
 */
export async function getOwnerClient(): Promise<SupabaseClient> {
  const now = Date.now();
  if (cachedClient && now < sessionExpiresAt) {
    return cachedClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
    },
  });

  const { data, error } = await client.auth.signInWithPassword({
    email: "solikhinfile@gmail.com",
    password: "BengkelKu2026Password!",
  });

  if (error) {
    console.error("Owner auth failed in getOwnerClient:", error.message);
    throw error;
  }

  // Cache for 50 minutes (tokens last 1 hour)
  sessionExpiresAt = now + 50 * 60 * 1000;
  cachedClient = client;

  return client;
}
