import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

/**
 * Lazy server-only admin client. Returns null when Supabase env vars are
 * absent so the app builds and runs with zero configuration — the waitlist
 * route then answers in a logged dev mode instead of crashing at import
 * time (which a module-scope createClient(env!) would do).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client =
    url && key
      ? createClient(url, key, { auth: { persistSession: false } })
      : null;
  return client;
}
