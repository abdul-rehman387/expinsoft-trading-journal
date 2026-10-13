import { NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function proxy(request) {
  try {
    return await updateSession(request);
  } catch (error) {
    console.error("Proxy Supabase Error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
