import { createClient } from "@supabase/supabase-js";

function getEnv(name: string) {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

export function getSupabaseClient() {
  const url =
    getEnv("NEXT_PUBLIC_SUPABASE_URL") ||
    getEnv("SUPABASE_URL");

  const anon =
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    getEnv("SUPABASE_ANON_KEY");

  if (!url) {
    throw new Error(
      "supabaseUrl is required. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL"
    );
  }

  if (!anon) {
    throw new Error(
      "supabase anon key is required. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY"
    );
  }

  return createClient(url, anon);
}
