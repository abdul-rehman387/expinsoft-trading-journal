"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";
export async function login(previous, form) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email")).trim(),
    password: String(form.get("password")),
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
export async function signup(previous, form) {
  const supabase = await createClient();
  const name = String(form.get("name") || "").trim();
  if (!name) return { error: "Please enter your name." };
  const { data, error } = await supabase.auth.signUp({
    email: String(form.get("email")).trim(),
    password: String(form.get("password")),
    options: { data: { name } },
  });
  if (error) return { error: error.message };
  if (!data.session)
    return {
      message: "Check your email to confirm your account, then sign in.",
    };
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect("/login");
}
export async function createAnotherAccount() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  redirect("/signup");
}
export async function updateProfile(form) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    email: form.email,
    data: { name: form.name },
  });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
export async function updatePassword(form) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in again.");
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: form.current,
  });
  if (verifyError) throw new Error("Current password is incorrect.");
  if (form.next.length < 8 || form.next !== form.confirm)
    throw new Error(
      "New passwords must match and contain at least eight characters.",
    );
  const { error } = await supabase.auth.updateUser({ password: form.next });
  if (error) throw new Error(error.message);
}
