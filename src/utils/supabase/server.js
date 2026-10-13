import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cookieOptions } from "./cookie-options";
import { getSupabaseConfig } from "./config";
export async function createClient() {
  const { url, key } = getSupabaseConfig();
  const store = await cookies();
  return createServerClient(
    url,
    key,
    {
      cookieOptions,
      cookies: {
        getAll: () => store.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) =>
              store.set(name, value, options),
            );
          } catch {
            /* Server Components cannot write cookies; middleware refreshes them. */
          }
        },
      },
    },
  );
}
