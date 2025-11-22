import { supabase } from "../lib/supabase";

export async function getArmes() {
  const { data, error } = await supabase.from("armes").select("*").order("name");
  return { data, error };
}

export async function getArmures() {
  const { data, error } = await supabase.from("armures").select("*").order("name");
  return { data, error };
}

export async function getAccessoires() {
  const { data, error } = await supabase.from("accessoires").select("*").order("name");
  return { data, error };
}

export async function getRoles() {
  const { data, error } = await supabase.from("role").select("*").order("name");
  return { data, error };
}

export async function getPlayers() {
  const { data, error } = await supabase.from("player").select("*").order("name");
  return { data, error };
}

// Récupère un joueur par son name
export async function getPlayerByName(name: string) {
  const { data, error } = await supabase
    .from("player")
    .select("*")
    .eq("name", name)
    .maybeSingle();
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
