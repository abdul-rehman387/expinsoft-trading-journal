export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    const error = new Error(
      "Missing Supabase configuration: set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY, or their NEXT_PUBLIC_ equivalents (anon keys are also supported).",
    );
    error.code = "SUPABASE_CONFIG_ERROR";
    throw error;
  }
  return { url, key };
}
