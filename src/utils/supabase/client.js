"use client";
import { createBrowserClient } from "@supabase/ssr";
import { cookieOptions } from "./cookie-options";
import { getSupabaseConfig } from "./config";
export function createClient() {
  const { url, key } = getSupabaseConfig();
  return createBrowserClient(
    url,
    key,
    { cookieOptions },
  );
}
