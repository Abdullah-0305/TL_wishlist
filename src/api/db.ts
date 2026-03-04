import { supabase } from "../lib/supabase";
import bcrypt from "bcryptjs";

// --- Items & Players ---

export async function getArmes() {
  // On trie par la clé 'fr' à l'intérieur du JSONB
  const { data, error } = await supabase.from("armes").select("*").order("name->>fr");
  return { data, error };
}

export async function getArmures() {
  const { data, error } = await supabase.from("armures").select("*").order("name->>fr");
  return { data, error };
}

export async function getAccessoires() {
  const { data, error } = await supabase.from("accessoires").select("*").order("name->>fr");
  return { data, error };
}

export async function getRoles() {
  const { data, error } = await supabase.from("role").select("*").order("name->>fr");
  return { data, error };
}

export async function getPlayers() {
  // Les joueurs sont triés par leur nom (qui reste un texte simple)
  const { data, error } = await supabase.from("player").select("*").order("name");
  return { data, error };
}

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

export async function setPlayerHasLooted(
  id: string,
  value: boolean,
  itemType: "arme" | "armure" | "accessoire" = "arme"
) {
  const columnMap = {
    arme: "has_looted_arme",
    armure: "has_looted_armure",
    accessoire: "has_looted_accessoires",
  } as const;

  const today = new Date().toISOString().split("T")[0];

  const updates = {
    [columnMap[itemType]]: value,
    date_last_looted_item: value ? today : null,
  };

  return updatePlayer(id, updates);
}

// --- Récupérer l'objet name d'un item ---
// Note : Ces fonctions renvoient maintenant l'objet {fr, en}

export async function getArmeNameById(id: string) {
  const { data, error } = await supabase.from("armes").select("name").eq("id", id).maybeSingle();
  if (error) throw error;
  return data?.name || null; 
}

export async function getArmureNameById(id: string) {
  const { data, error } = await supabase.from("armures").select("name").eq("id", id).maybeSingle();
  if (error) throw error;
  return data?.name || null;
}

export async function getAccessoireNameById(id: string) {
  const { data, error } = await supabase.from("accessoires").select("name").eq("id", id).maybeSingle();
  if (error) throw error;
  return data?.name || null;
}

// --- Récupérer les rôles ---

export async function getRoleById(id: string) {
  const { data, error } = await supabase.from("role").select("name").eq("id", id).maybeSingle();
  if (error) throw error;
  return data?.name || null; // Renvoie l'objet {fr, en}
}

export async function getColorRoleById(id: string) {
  const { data, error } = await supabase.from("role").select("color").eq("id", id).maybeSingle();
  if (error) throw error;
  return data?.color || null;
}

// --- Récupérer les boss d’un item ---
// Attention : boss.name est aussi un objet JSONB maintenant

export async function getArmeBossById(id: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("armes")
    .select("boss:boss(name)")
    .eq("id", id);

  if (error) throw error;
  return data?.map(d => d.boss?.name).filter(n => !!n) || [];
}

export async function getArmureBossById(id: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("armures_boss")
    .select("boss:boss(name)")
    .eq("idArmure", id);

  if (error) throw error;
  return data?.map(d => d.boss?.name).filter(n => !!n) || [];
}

export async function getAccessoireBossById(id: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("accessoires_boss")
    .select("boss:boss(name)")
    .eq("idAccessoire", id);

  if (error) throw error;
  return data?.map(d => d.boss?.name).filter(n => !!n) || [];
}

export async function deletePlayer(id: string) {
  const { data, error } = await supabase
    .from("player")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return data;
}

export const createPlayer = async (name: string, password: string) => {
  const hashed = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("player")
    .insert([{ name, mdp: hashed, firstCo: true }]); // On s'assure que firstCo est true à la création

  if (error) throw error;
  return data?.[0] ?? null;
};

export const resetLastLootDate = async (playerId: string) => {
  return await supabase
    .from("player")
    .update({ date_last_looted_item: null })
    .eq("id", playerId);
};