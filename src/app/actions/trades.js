"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "../../utils/supabase/server";
import { validateTrade } from "../../lib/trades";
async function session() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Please sign in again.");
  return { supabase, user };
}
function refresh() {
  for (const path of ["/dashboard", "/trades", "/analytics", "/settings/data"])
    revalidatePath(path);
}
export async function createTrade(input) {
  const { supabase, user } = await session();
  const { data, error } = await supabase
    .from("trades")
    .insert({ ...validateTrade(input), user_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  refresh();
  return data;
}
export async function updateTrade(id, input) {
  const { supabase, user } = await session();
  const { data, error } = await supabase
    .from("trades")
    .update(validateTrade(input))
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  refresh();
  return data;
}
export async function deleteTrade(id) {
  const { supabase, user } = await session();
  const { data, error } = await supabase
    .from("trades")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  refresh();
  return data;
}
export async function clearManual() {
  const { supabase, user } = await session();
  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("user_id", user.id)
    .eq("source", "Manual");
  if (error) throw new Error(error.message);
  refresh();
}
export async function importTrades(inputs) {
  if (!Array.isArray(inputs) || inputs.length > 5000)
    throw new Error("Import at most 5000 trades at a time.");
  const { supabase, user } = await session();
  const rows = inputs.map((input) => ({
    ...validateTrade(input),
    user_id: user.id,
  }));
  if (!rows.length) return [];
  const { data, error } = await supabase.from("trades").insert(rows).select();
  if (error) throw new Error(error.message);
  refresh();
  return data;
}
