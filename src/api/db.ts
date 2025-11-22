import { supabase } from "../lib/supabase";

export async function getArmes() {
  return supabase.from("armes").select("*").order("name");
}

export async function getArmures() {
  return supabase.from("armures").select("*").order("name");
}

export async function getAccessoires() {
  return supabase.from("accessoires").select("*").order("name");
}

export async function getPlayers() {
  const { data, error } = await supabase.from("player").select("*").order("name");
  return { data, error };
}

export async function updatePlayer(id: string, updates: any) {
  const { data, error } = await supabase
    .from("player")
    .update(updates)
    .eq("id", id)
    .select();

  return { data, error };
}

export async function setPlayerHasLooted(id: string, value: boolean) {
  return updatePlayer(id, { has_looted_arme: value });
}
