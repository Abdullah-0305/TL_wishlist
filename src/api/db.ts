import { supabase } from "../lib/supabase";

// --- Items & Players ---

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

  return updatePlayer(id, { [columnMap[itemType]]: value });
}

// --- Récupérer le nom d'un item ---

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
  return data?.name || null;
}

export async function getColorRoleById(id: string) {
  const { data, error } = await supabase.from("role").select("color").eq("id", id).maybeSingle();
  if (error) throw error;
  return data?.color || null;
}

// --- Récupérer les boss d’un item (plusieurs possibles) ---

// Pour une arme (1 boss max)
export async function getArmeBossById(id: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("armes")
    .select("boss:boss(name)")
    .eq("id", id);

  if (error) throw error;

  // data peut être [] ou [{ boss: { name: string } }]
  return data?.map(d => d.boss?.name).filter((n): n is string => !!n) || [];
}

// Pour une armure (plusieurs bosses possibles)
export async function getArmureBossById(id: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("armures_boss")
    .select("boss:boss(name)")
    .eq("idArmure", id);

  if (error) throw error;

  // data est un tableau de lignes, chacune avec boss.name
  return data?.map(d => d.boss?.name).filter((n): n is string => !!n) || [];
}

// Pour un accessoire (plusieurs bosses possibles)
export async function getAccessoireBossById(id: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("accessoires_boss")
    .select("boss:boss(name)")
    .eq("idAccessoire", id);

  if (error) throw error;

  return data?.map(d => d.boss?.name).filter((n): n is string => !!n) || [];
}

