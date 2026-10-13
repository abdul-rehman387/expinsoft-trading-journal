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
  let supabase;
  let user;
  try {
    supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    user = data?.user;
  } catch (error) {
    console.error("Auth Session Error:", error);
  }
  // Keep redirects outside try/catch: Next.js implements them by throwing.
  if (!user) redirect("/login");

  let trades;
  try {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    trades = data;
  } catch (error) {
    console.error("Data Fetch Error:", error);
    return <div>Error loading trades. Please check connection.</div>;
  }
  return (
    <AuthProvider key={user.id} user={user}>
      <JournalProvider initialTrades={trades || []} initialError="">
        <Shell />
      </JournalProvider>
    </AuthProvider>
  );
}
