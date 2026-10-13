import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
import RecoveryForm from "../components/RecoveryForm";

export const dynamic = "force-dynamic";

export default async function Page() {
  let user;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (!error) user = data?.user;
  } catch (error) {
    console.error("Recovery Session Error:", error);
  }
  if (!user) redirect("/login?error=recovery_expired");
  return <RecoveryForm />;
}
