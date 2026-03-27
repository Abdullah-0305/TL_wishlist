import { supabase } from "../lib/supabase";

export interface Player {
  id: string;
  discord_name: string;
  avatar_url: string | null;
  role: string | null;
  wishlist: {
    id_arme?: string | null;
    id_armure?: string | null;
    id_accessoire?: string | null;
    has_looted_arme?: boolean;
    has_looted_armure?: boolean;
    has_looted_accessoires?: boolean;
    date_demand_arme?: Date | null;
    date_demand_armure?: Date | null;
    date_demand_accessoires?: Date | null;
    date_last_looted_item?: string | null;
  } | null;
  is_online: boolean;
  is_admin: boolean;
}

export async function getArmes() { return await supabase.from("armes").select("*").order("name"); }
export async function getArmures() { return await supabase.from("armures").select("*").order("name"); }
export async function getAccessoires() { return await supabase.from("accessoires").select("*").order("name"); }
export async function getRoles() { return await supabase.from("role").select("*").order("name"); }

export async function getPlayers() {
  return await supabase.from("players").select("*").order("discord_name");
}

export async function getPlayerById(id: string) {
  return await supabase.from("players").select("*").eq("id", id).maybeSingle();
}

export async function updatePlayer(id: string, updates: Partial<Player>) {
  return await supabase.from("players").update(updates).eq("id", id).select();
}

export async function deletePlayer(id: string) {
  return await supabase.from("players").delete().eq("id", id);
}

export async function setPlayerHasLooted(id: string, value: boolean, itemType: "arme" | "armure" | "accessoire" = "arme") {
  const columnMap = { arme: "has_looted_arme", armure: "has_looted_armure", accessoire: "has_looted_accessoires" } as const;
  const today = new Date().toISOString().split("T")[0];
  
  const { data: player } = await getPlayerById(id);
  const currentWishlist = player?.wishlist || {};
  const newWishlist = { ...currentWishlist, [columnMap[itemType]]: value, date_last_looted_item: value ? today : null };

  return updatePlayer(id, { wishlist: newWishlist });
}

export const resetLastLootDate = async (playerId: string) => {
  const { data: player } = await getPlayerById(playerId);
  const currentWishlist = player?.wishlist || {};
  const newWishlist = { ...currentWishlist, date_last_looted_item: null };

  return updatePlayer(playerId, { wishlist: newWishlist });
};

export async function getArmeNameById(id: string) {
  const { data } = await supabase.from("armes").select("name").eq("id", id).maybeSingle();
  return data?.name || null;
}
export async function getArmureNameById(id: string) {
  const { data } = await supabase.from("armures").select("name").eq("id", id).maybeSingle();
  return data?.name || null;
}
export async function getAccessoireNameById(id: string) {
  const { data } = await supabase.from("accessoires").select("name").eq("id", id).maybeSingle();
  return data?.name || null;
}
export async function getRoleById(id: string) {
  const { data } = await supabase.from("role").select("name").eq("id", id).maybeSingle();
  return data?.name || null;
}
export async function getColorRoleById(id: string) {
  const { data } = await supabase.from("role").select("color").eq("id", id).maybeSingle();
  return data?.color || null;
}

export async function getArmeBossById(id: string): Promise<string[]> {
  const { data, error } = await supabase.from("armes").select("boss:boss(name)").eq("id", id);
  if (error) throw error;
  return data?.map(d => (d.boss as any)?.name).filter(Boolean) || [];
}
export async function getArmureBossById(id: string): Promise<string[]> {
  const { data, error } = await supabase.from("armures_boss").select("boss:boss(name)").eq("idArmure", id);
  if (error) throw error;
  return data?.map(d => (d.boss as any)?.name).filter(Boolean) || [];
}
export async function getAccessoireBossById(id: string): Promise<string[]> {
  const { data, error } = await supabase.from("accessoires_boss").select("boss:boss(name)").eq("idAccessoire", id);
  if (error) throw error;
  return data?.map(d => (d.boss as any)?.name).filter(Boolean) || [];
}

export async function updateAdmin(id:string) {
  return await supabase.from("players").update({ is_admin: true }).eq("id", id).select();
}