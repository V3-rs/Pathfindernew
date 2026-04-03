import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Fallback URL is safe to hardcode — it's already public (NEXT_PUBLIC_)
const SUPABASE_URL = "https://dmdtnmvmnkzrarkdrknx.supabase.co";

export function getSupabase(): SupabaseClient | null {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) return null;
  return createClient(SUPABASE_URL, key);
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(SUPABASE_URL, key);
}
