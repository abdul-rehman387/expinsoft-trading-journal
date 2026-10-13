import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookieOptions } from "./cookie-options";
export async function updateSession(request) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookieOptions,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values, headers) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers || {}).forEach(([name, value]) =>
            response.headers.set(name, value),
          );
        },
      },
    },
  );
  const { data, error } = await supabase.auth.getClaims();
  const publicRoute = ["/login", "/signup", "/auth/confirm"].includes(
    request.nextUrl.pathname,
  );
  if ((error || !data?.claims) && !publicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    for (const name of ["cache-control", "expires", "pragma"]) {
      const value = response.headers.get(name);
      if (value) redirect.headers.set(name, value);
    }
    return redirect;
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
