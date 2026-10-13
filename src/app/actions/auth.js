"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";
export async function login(previous, form) {
  let result;
  try {
    const supabase = await createClient();
    result = await supabase.auth.signInWithPassword({
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
    });
  } catch (error) {
    console.error("Supabase Login Error:", error);
    return {
      error: error.code === "SUPABASE_CONFIG_ERROR"
        ? "Sign-in is unavailable because Supabase is not configured. Please contact the administrator."
        : "Unable to connect to sign-in. Please try again shortly.",
    };
  }
  const { data, error } = result;
  if (error) {
    console.error("Supabase Auth Error:", error.message);
    if (
      error.code === "email_not_confirmed" ||
      /email.*not confirmed/i.test(error.message)
    ) {
      return {
        error:
          "Please confirm your email address or check your Supabase Auth settings.",
      };
    }
    if (
      error.message === "Invalid login credentials" ||
      error.code === "invalid_credentials"
    ) {
      return {
        error:
          "Invalid login credentials. Please check your email and password.",
      };
    }
    return { error: error.message };
  }
  if (!data?.session || !data?.user) {
    return { error: "Sign-in did not create a session. Please try again." };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
export async function signup(previous, form) {
  const name = String(form.get("name") || "").trim();
  if (!name) return { error: "Please enter your name." };
  let result;
  try {
    const supabase = await createClient();
    result = await supabase.auth.signUp({
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
      options: { data: { name } },
    });
  } catch (error) {
    console.error("Supabase Signup Error:", error);
    return { error: "Unable to create your account. Please check the Supabase configuration or try again shortly." };
  }
  const { data, error } = result;
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
