import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { AuthProvider } from "../../../Auth";
import { JournalProvider } from "../../../JournalContext";
import Shell from "../../../Shell";
export const dynamic = "force-dynamic";
export default async function Page({ params }) {
  const { path = [] } = await params;
  const route = "/" + path.join("/");
  if (route === "/") redirect("/dashboard");
  if (
    ![
      "/dashboard",
      "/trades",
      "/analytics",
      "/profile",
      "/add-user",
      "/reset-password",
      "/settings",
      "/settings/connections",
      "/settings/preferences",
      "/settings/data",
      "/settings/appearance",
    ].includes(route)
  )
    notFound();
  if (route === "/settings") redirect("/settings/connections");
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");
  const { data: trades, error } = await supabase
    .from("trades")
    .select("*")
    .order("created_at", { ascending: false });
  return (
    <AuthProvider user={user}>
      <JournalProvider
        initialTrades={trades || []}
        initialError={error?.message || ""}
      >
        <Shell />
      </JournalProvider>
    </AuthProvider>
  );
}
