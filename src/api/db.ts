import { useAuth } from "@/context/AuthContext";
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
    id_archboss?: string | null;
    has_looted_arme?: boolean;
    has_looted_armure?: boolean;
    has_looted_accessoires?: boolean;
    has_looted_archboss?: boolean;
    date_demand_arme?: Date | null;
    date_demand_armure?: Date | null;
    date_demand_accessoires?: Date | null;
    date_demande_archboss?: Date | null;
    date_last_looted_item?: string | null;
  } | null;
  is_online: boolean;
  is_admin: boolean;
}

export async function getArmes() { return await supabase.from("armes").select("*").order("name"); }
export async function getArmures() { return await supabase.from("armures").select("*").order("name"); }
export async function getAccessoires() { return await supabase.from("accessoires").select("*").order("name"); }
export async function getArchboss() { return await supabase.from("archboss").select("*").order("name");}
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

// Ajoute "adminId" en paramètre
export async function setPlayerHasLooted(
  id: string, 
  value: boolean, 
  itemType: "arme" | "armure" | "accessoire",
  adminId: string // <--- On le récupère depuis le composant React
) {
  const columnMap = { 
    arme: "has_looted_arme", 
    armure: "has_looted_armure", 
    accessoire: "has_looted_accessoires" 
  } as const;
  
  const tableMap = {
    arme: "armes",
    armure: "armures",
    accessoire: "accessoires"
  } as const;

  const today = new Date().toISOString().split("T")[0];
  
  // 1. Récupérer le joueur et sa wishlist
  const { data: player } = await getPlayerById(id);
  const currentWishlist = player?.wishlist || {};
  
  // 2. Mettre à jour la wishlist du joueur
  const newWishlist = { 
    ...currentWishlist, 
    [columnMap[itemType]]: value, 
    date_last_looted_item: value ? today : currentWishlist.date_last_looted_item 
  };
  await updatePlayer(id, { wishlist: newWishlist });

  // 3. HISTORIQUE (Uniquement si value est TRUE, on n'historise pas les décochages)
  if (value) {
    const itemId = currentWishlist[itemType === "arme" ? "id_arme" : itemType === "armure" ? "id_armure" : "id_accessoire"];
    
    if (itemId) {
      // On va chercher le nom de l'item dans sa table respective
      const { data: itemData } = await supabase
        .from(tableMap[itemType])
        .select("name")
        .eq("id", itemId)
        .maybeSingle();

      if (itemData) {
        const historyData = {
          player_id: id,
          admin_id: adminId, // Reçu en paramètre
          item_name_fr: itemData.name.fr,
          item_name_en: itemData.name.en,
          item_type: itemType
        };
        await addLootToHistory(historyData);
      }
    }
  }

  return { success: true };
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

export async function toggleAdmin(id: string, currentStatus: boolean) {
  const { data, error } = await supabase
    .from("players")
    .update({ is_admin: !currentStatus })
    .eq("id", id)
    .select(); // Enlève .single() pour le debug, utilise juste .select()

  if (error) {
    console.error("Erreur Toggle Admin:", error);
    return { error };
  }

  return { data: data?.[0] }; // On prend le premier élément manuellement
}

export async function addLootToHistory(data: { 
  player_id: string, 
  admin_id: string,
  item_name_fr: string,
  item_name_en: string
}) {
  return await supabase.from("loot_history").insert([data]);
}

// Récupérer l'historique complet avec les pseudos
// Récupérer l'historique complet avec les pseudos
// Récupérer l'historique complet avec les pseudos
export async function getLootHistory(limit = 100) {
  const { data, error } = await supabase
    .from("loot_history")
    .select(`
      id,
      created_at,
      item_name_fr,
      item_name_en,
      item_type,
      player:players!fk_loot_player(discord_name, avatar_url),
      admin:players!fk_loot_admin(discord_name)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erreur récupération historique:", error);
    return [];
  }
  
  return data;
}

// ---------------------------------------------
// GESTION DES DEMANDES DE CHANGEMENT (WISHLIST)
// ---------------------------------------------

// 1. Le joueur crée une demande
export async function createChangeRequest(data: { player_id: string; item_type: string; new_item_id: string | number }) {
  const { error } = await supabase
    .from("change_requests")
    .insert([{ ...data, status: "pending" }]);
    
  if (error) throw error;
  return true;
}

// 2. L'Admin récupère les demandes en attente
export async function getPendingChangeRequests() {
  const { data, error } = await supabase
    .from("change_requests")
    .select(`
      id,
      player_id,
      item_type,
      new_item_id,
      created_at,
      player:players!player_id (discord_name, avatar_url, wishlist)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true }); // Les plus anciennes en premier

  if (error) throw error;
  return data;
}

// 3. L'Admin valide ou refuse la demande
export async function resolveChangeRequest(
  requestId: string,
  status: "approved" | "rejected",
  playerId?: string,
  itemType?: string,
  newItemId?: string | number
) {
  // A. On change le statut de la requête
  const { error: reqError } = await supabase
    .from("change_requests")
    .update({ status })
    .eq("id", requestId);

  if (reqError) throw reqError;

  // B. Si c'est approuvé, on met à jour la wishlist du joueur !
  if (status === "approved" && playerId && itemType && newItemId) {
    const { data: player } = await getPlayerById(playerId);
    const wishlist = player?.wishlist || {};

    // On remplace l'ancien item par le nouveau et on reset la date de demande
    if (itemType === "arme") {
      wishlist.id_arme = isNaN(Number(newItemId)) ? newItemId : Number(newItemId);
      wishlist.date_demand_arme = new Date();
    } else if (itemType === "armure") {
      wishlist.id_armure = isNaN(Number(newItemId)) ? newItemId : Number(newItemId);
      wishlist.date_demand_armure = new Date();
    } else if (itemType === "accessoire") {
      wishlist.id_accessoire = isNaN(Number(newItemId)) ? newItemId : Number(newItemId);
      wishlist.date_demand_accessoire = new Date();
    }

    const { error: playerError } = await updatePlayer(playerId, { wishlist });
    if (playerError) throw playerError;
  }

  return true;
}

// --- GESTION GÉNÉRIQUE DES PARAMÈTRES (CRUD + LIAISON BOSS) ---

export async function getTableItems(table: string) {
  const { data, error } = await supabase.from(table).select("*").order("id");
  if (error) throw error;
  return data;
}

export async function deleteTableItem(table: string, id: string) {
  // 1. Si on supprime une armure ou un accessoire -> on nettoie la table de liaison
  if (table === "armures" || table === "accessoires") {
    const relationTable = table + "_boss";
    const idColumn = table === "armures" ? "idArmure" : "idAccessoire";
    await supabase.from(relationTable).delete().eq(idColumn, id);
  }

  // 2. Si on supprime un boss -> on nettoie TOUTES ses références
  if (table === "boss") {
    await supabase.from("armures_boss").delete().eq("idBoss", id);
    await supabase.from("accessoires_boss").delete().eq("idBoss", id);
    await supabase.from("armes").update({ idBoss: null }).eq("idBoss", id);
    await supabase.from("archboss").update({ idBoss: null }).eq("idBoss", id);
  }

  // 3. NOUVEAU : Nettoyer les Wishlists des joueurs et les Demandes d'échange
  if (["armes", "armures", "accessoires", "archboss"].includes(table)) {
    // A. Trouver le bon format de nom pour la demande (ex: "armes" -> "arme")
    const itemType = table === "accessoires" ? "accessoire" : table.replace(/s$/, ""); 
    
    // On supprime les demandes d'échange en cours qui demandaient cet item
    await supabase
      .from("change_requests")
      .delete()
      .eq("item_type", itemType)
      .eq("new_item_id", id);

    // B. Nettoyer les Wishlists JSONB des joueurs
    const { data: players } = await supabase.from("players").select("id, wishlist");
    
    if (players) {
      const updatePromises = players.map(async (player) => {
        const wl = player.wishlist;
        if (!wl) return;
        
        let needsUpdate = false;
        const newWl = { ...wl };

        // On utilise '==' et non '===' car l'id du JSON peut être un nombre, et le 'id' reçu est un string
        if (table === "armes" && newWl.id_arme == id) {
          newWl.id_arme = null;
          newWl.has_looted_arme = false;
          needsUpdate = true;
        } else if (table === "armures" && newWl.id_armure == id) {
          newWl.id_armure = null;
          newWl.has_looted_armure = false;
          needsUpdate = true;
        } else if (table === "accessoires" && newWl.id_accessoire == id) {
          newWl.id_accessoire = null;
          newWl.has_looted_accessoires = false;
          needsUpdate = true;
        } else if (table === "archboss" && newWl.id_archboss == id) {
          newWl.id_archboss = null;
          newWl.has_looted_archboss = false;
          needsUpdate = true;
        }

        // Si ce joueur avait l'item supprimé, on met à jour sa ligne dans Supabase
        if (needsUpdate) {
          return supabase.from("players").update({ wishlist: newWl }).eq("id", player.id);
        }
      });

      // On attend que toutes les mises à jour de joueurs soient terminées
      await Promise.all(updatePromises.filter(Boolean));
    }
  }

  // 4. Maintenant que tous les liens sont coupés, on peut supprimer l'élément en toute sécurité !
  const { error } = await supabase.from(table).delete().eq("id", id);
  
  if (error) {
    console.error("Erreur de suppression:", error);
    throw error;
  }
  
  return true;
}

// Fonction intelligente qui gère les relations de boss !
export async function saveItemWithBosses(
  table: string,
  id: string | null,
  nameFr: string,
  nameEn: string,
  bossIds: string[]
) {
  const payload: any = { name: { fr: nameFr, en: nameEn } };

  // 1. Pour les Armes et Archboss, on met l'idBoss directement dans la table
  if (table === "armes" || table === "archboss") {
    payload.idBoss = bossIds.length > 0 ? Number(bossIds[0]) : null;
  }

  let savedId = id;

  // 2. Sauvegarde ou Création de l'item
  if (id) {
    const { error } = await supabase.from(table).update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from(table).insert([payload]).select().single();
    if (error) throw error;
    savedId = data.id;
  }

  // 3. Pour les Armures et Accessoires, on met à jour les tables de liaison
  if (table === "armures" || table === "accessoires") {
    const relationTable = table + "_boss";
    const idColumn = table === "armures" ? "idArmure" : "idAccessoire";

    // A. On supprime les anciennes liaisons
    if (id) {
      await supabase.from(relationTable).delete().eq(idColumn, id);
    }

    // B. On insère les nouvelles liaisons
    if (bossIds.length > 0) {
      const relPayload = bossIds.map(bId => ({
        [idColumn]: savedId,
        idBoss: Number(bId)
      }));
      await supabase.from(relationTable).insert(relPayload);
    }
  }

  return true;
}

// --- GESTION DES FONCTIONNALITÉS (FEATURE FLAGS) ---

export async function getAppSettings() {
  const { data, error } = await supabase.from("app_settings").select("*");
  if (error) throw error;
  return data;
}

export async function toggleSetting(id: string, is_active: boolean) {
  const { error } = await supabase.from("app_settings").update({ is_active }).eq("id", id);
  if (error) throw error;
  return true;
}