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

  const updates = {
    [columnMap[itemType]]: value,
  };

  return updatePlayer(id, updates);
}


// Récupérer le nom d'une arme à partir de son id
export async function getArmeNameById(id: string) {
  const { data, error } = await supabase
    .from("armes")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  
  if (error) throw error;
  return data?.name || null;
}

// Récupérer le nom d'une armure à partir de son id
export async function getArmureNameById(id: string) {
  const { data, error } = await supabase
    .from("armures")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data?.name || null;
}

// Récupérer le nom d'un accessoire à partir de son id
export async function getAccessoireNameById(id: string) {
  const { data, error } = await supabase
    .from("accessoires")
    .select("name")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data?.name || null;
}


