import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";
export async function GET(request) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (
    token_hash &&
    ["signup", "email", "email_change", "recovery", "invite"].includes(type)
  ) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error)
      return NextResponse.redirect(
        new URL(
          type === "recovery" ? "/reset-password" : "/dashboard",
          url.origin,
        ),
      );
  }
  return NextResponse.redirect(
    new URL("/login?error=confirmation_failed", url.origin),
  );
}
