import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Users, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";

import Header from "./components/Header";
import BossCounts from "./components/BossCounts";
import FilterBar from "./components/FilterBar";
import PlayerGrid from "./components/PlayerGrid";
import BlockModal, { BlockTarget } from "./components/BlockModal";
import RemoveModal, { RemoveTarget } from "./components/RemoveModal";
import UnlockAllModal from "./components/UnlockAllModal";
import { Button } from "@/components/ui/button";

import {
  getPlayers,
  setPlayerHasLooted,
  updatePlayer,
  getArmes,
  getArmures,
  getAccessoires,
  getPlayerById,
  resetLastLootDate
} from "@/api/db";

// --- INTERFACES ---
interface MultiLangText { fr: string; en: string; }

interface Player {
  id: string;
  name: string;
  idArme?: string | number | null;
  idArmure?: string | number | null;
  idAccesoires?: string | number | null;
  has_looted_arme?: boolean;
  has_looted_armure?: boolean;
  has_looted_accessoires?: boolean;
  armeName?: MultiLangText | null;
  armureName?: MultiLangText | null;
  accessoireName?: MultiLangText | null;
  armeBoss?: MultiLangText[];
  armureBoss?: MultiLangText[];
  accessoireBoss?: MultiLangText[];
  idRole?: string | number | null;
  roleName?: MultiLangText | null;
  roleColor?: string;
  isPresent?: boolean;
  date_last_looted_item: Date | null;
  date_demand_arme?: Date | null;
  date_demand_armure?: Date | null;
  date_demand_accessoire?: Date | null;
  wishlist?: any;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] as "fr" | "en" || "fr";

  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [items, setItems] = useState({ armes: [], armures: [], accessoires: [] });
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [selectedBoss, setSelectedBoss] = useState<string | null>(null);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<BlockTarget | null>(null);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  // --- CHARGEMENT OPTIMISÉ ---
  const loadData = async () => {
    try {
      setLoading(true);
      // AJOUT : On récupère aussi la table "boss"
      const [armesRes, armuresRes, accRes, rolesRes, playersRes, bossRes] = await Promise.all([
        getArmes(),
        getArmures(),
        getAccessoires(),
        supabase.from('role').select('*'),
        getPlayers(),
        supabase.from('boss').select('*') // Récupération des boss
      ]);

      // Dictionnaires
      const weaponsMap = new Map(armesRes.data?.map(i => [i.id.toString(), i]));
      const armorsMap = new Map(armuresRes.data?.map(i => [i.id.toString(), i]));
      const accMap = new Map(accRes.data?.map(i => [i.id.toString(), i]));
      const rolesMap = new Map(rolesRes.data?.map(r => [r.id.toString(), r]));
      
      // AJOUT : Dictionnaire des boss (id -> nom JSONB {fr, en})
      const bossesMap = new Map(bossRes.data?.map(b => [b.id.toString(), b.name]));

      setItems({ 
        armes: armesRes.data || [], 
        armures: armuresRes.data || [], 
        accessoires: accRes.data || [] 
      });

      if (playersRes.data) {
        const enriched = playersRes.data.map((p: any) => {
          const wl = p.wishlist || {};

          if (wl.date_last_looted_item && (new Date().getTime() - new Date(wl.date_last_looted_item).getTime()) / 86400000 > 7) {
            resetLastLootDate(p.id);
            wl.date_last_looted_item = null;
          }

          const wData = weaponsMap.get(wl.id_arme?.toString());
          const aData = armorsMap.get(wl.id_armure?.toString());
          const acData = accMap.get(wl.id_accessoire?.toString());
          const rData = rolesMap.get(p.role?.toString());

          // AJOUT : Fonction pour extraire le nom du boss depuis idBoss
          const getBossArray = (itemData: any) => {
            if (!itemData || !itemData.idBoss) return [];
            const bossName = bossesMap.get(itemData.idBoss.toString());
            return bossName ? [bossName] : []; // On renvoie sous forme de tableau
          };

          return {
            ...p,
            name: p.discord_name,
            isPresent: false,
            wishlist: wl,

            idArme: wl.id_arme,
            idArmure: wl.id_armure,
            idAccesoires: wl.id_accessoire,
            has_looted_arme: wl.has_looted_arme || false,
            has_looted_armure: wl.has_looted_armure || false,
            has_looted_accessoires: wl.has_looted_accessoires || false,
            
            date_last_looted_item: wl.date_last_looted_item ? new Date(wl.date_last_looted_item) : null,
            date_demand_arme: wl.date_demand_arme ? new Date(wl.date_demand_arme) : null,
            date_demand_armure: wl.date_demand_armure ? new Date(wl.date_demand_armure) : null,
            date_demand_accessoire: wl.date_demand_accessoire ? new Date(wl.date_demand_accessoire) : null,

            armeName: wData?.name || null,
            armureName: aData?.name || null,
            accessoireName: acData?.name || null,
            
            // On utilise notre nouvelle fonction
            armeBoss: getBossArray(wData), 
            armureBoss: getBossArray(aData),
            accessoireBoss: getBossArray(acData),
            
            idRole: p.role,
            roleName: rData?.name || null,
            roleColor: rData?.color || "#9CA3AF"
          };
        });
        
        setPlayers(enriched);
        setFilteredPlayers(enriched);
      }
    } catch (err) { 
      console.error(err);
      toast.error(t("admin.load_error")); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- FILTRAGE ---
  useEffect(() => {
    let result = players;
    if (selectedBoss) {
      result = result.filter(p => p.isPresent && (
        p.armeBoss?.some(b => b[lang] === selectedBoss) ||
        p.armureBoss?.some(b => b[lang] === selectedBoss) ||
        p.accessoireBoss?.some(b => b[lang] === selectedBoss)
      ));
    } else if (selectedFilter) {
      result = result.filter(p => p.armeName?.[lang] === selectedFilter || p.armureName?.[lang] === selectedFilter || p.accessoireName?.[lang] === selectedFilter);
    }
    setFilteredPlayers(result);
  }, [selectedFilter, selectedBoss, players, lang]);

  // --- COMPTAGE BOSS ---
  const bossCounts = useMemo(() => {
    const c: Record<string, Record<string, number>> = { armes: {}, armures: {}, accessoires: {} };
    
    players.filter(p => p.isPresent).forEach(p => {
      if (!p.has_looted_arme) p.armeBoss?.forEach(b => c.armes[b[lang]] = (c.armes[b[lang]] || 0) + 1);
      if (!p.has_looted_armure) p.armureBoss?.forEach(b => c.armures[b[lang]] = (c.armures[b[lang]] || 0) + 1);
      if (!p.has_looted_accessoires) p.accessoireBoss?.forEach(b => c.accessoires[b[lang]] = (c.accessoires[b[lang]] || 0) + 1);
    });

    const sort = (obj: Record<string, number>): [string, number][] => 
      Object.entries(obj).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);

    return { armes: sort(c.armes), armures: sort(c.armures), accessoires: sort(c.accessoires) };
  }, [players, lang]);

  const confirmBlock = async () => {
    if (!target) return;
    try {
      await setPlayerHasLooted(target.playerId, target.mode === "block", target.itemType, user.id);
      toast.success(t("admin.action_success"));
      await loadData();
    } catch { toast.error(t("admin.action_error")); }
    setModalOpen(false);
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#0a0b10] bg-[radial-gradient(ellipse_at_top,_rgba(88,28,135,0.15)_0%,_rgba(10,11,16,1)_80%)] text-zinc-100 pb-20">
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-10 animate-in fade-in duration-500">
        
        <Header onUnlockAll={() => setUnlockModalOpen(true)} />
        
        <BossCounts 
          bossCounts={bossCounts} 
          selectedBoss={selectedBoss} 
          onBossClick={setSelectedBoss} 
          onReset={() => setSelectedBoss(null)} 
        />

        <div className="space-y-4">
          <FilterBar selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} {...items} />

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-start gap-4">
            <div className="grid grid-cols-2 lg:flex items-center gap-2 bg-[#1e1333]/60 p-1.5 rounded-xl border border-white/5 shadow-inner w-full lg:w-fit">
              <Button 
                variant="ghost" 
                onClick={() => setPlayers(p => p.map(x => ({...x, isPresent: false})))}
                className="flex items-center justify-center gap-2 text-fuchsia-300/70 hover:text-white text-[10px] font-black uppercase tracking-widest h-10 px-6 hover:bg-fuchsia-600/20 transition-all active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" /> {t("admin.reset_presence")}
              </Button>
              <div className="hidden lg:block w-[1px] h-6 bg-white/10 mx-1" />
              <Button 
                variant="ghost" 
                onClick={() => setPlayers(p => p.map(x => ({...x, isPresent: true})))}
                className="flex items-center justify-center gap-2 text-fuchsia-300/70 hover:text-white text-[10px] font-black uppercase tracking-widest h-10 px-6 hover:bg-fuchsia-600/20 transition-all active:scale-95"
              >
                <Users className="h-3.5 w-3.5" /> {t("admin.set_all_presence")}
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 relative">
          <div className="absolute -inset-10 bg-fuchsia-600/5 blur-[120px] pointer-events-none opacity-50" />
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
            </div>
          ) : (
            <PlayerGrid
              players={filteredPlayers}
              openModal={(id, type) => {
                const p = players.find(x => x.id === id);
                if (!p) return;
                const has = type === "arme" ? p.has_looted_arme : type === "armure" ? p.has_looted_armure : p.has_looted_accessoires;
                setTarget({ playerId: id, itemType: type, mode: has ? "unblock" : "block", playerName: p.name });
                setModalOpen(true);
              }}
              openRemoveModal={(id, type) => {
                const p = players.find(x => x.id === id);
                setRemoveTarget({ playerId: id, itemType: type, playerName: p?.name });
                setRemoveModalOpen(true);
              }}
              togglePresence={(id) => setPlayers(prev => prev.map(p => p.id === id ? { ...p, isPresent: !p.isPresent } : p))}
              loadPlayers={loadData}
            />
          )}
        </div>
      </div>

      <BlockModal open={modalOpen} onOpenChange={setModalOpen} target={target} onConfirm={confirmBlock} />
      
      <RemoveModal 
        open={removeModalOpen} 
        onOpenChange={setRemoveModalOpen} 
        target={removeTarget} 
        onConfirm={async () => {
          if (!removeTarget) return;
          try {
            const { data: currentPlayer } = await getPlayerById(removeTarget.playerId);
            const newWishlist = { ...currentPlayer?.wishlist };
            
            if (removeTarget.itemType === "arme") { newWishlist.id_arme = null; newWishlist.has_looted_arme = false; }
            else if (removeTarget.itemType === "armure") { newWishlist.id_armure = null; newWishlist.has_looted_armure = false; }
            else if (removeTarget.itemType === "accessoire") { newWishlist.id_accessoire = null; newWishlist.has_looted_accessoires = false; }

            await updatePlayer(removeTarget.playerId, { wishlist: newWishlist });
            toast.success(t("admin.action_success"));
            await loadData();
          } catch { toast.error(t("admin.action_error")); }
          setRemoveModalOpen(false);
        }} 
      />

      <UnlockAllModal 
        open={unlockModalOpen} 
        onOpenChange={setUnlockModalOpen} 
        target={null} 
        onConfirm={async () => {
          try {
            await Promise.all(players.map(async p => {
               const { data: currentPlayer } = await getPlayerById(p.id);
               const newWishlist = {
                 ...currentPlayer?.wishlist,
                 has_looted_arme: false,
                 has_looted_armure: false,
                 has_looted_accessoires: false,
                 id_arme: null,
                 id_armure: null,
                 id_accessoire: null,
                 date_demand_arme: null,
                 date_demand_armure: null,
                 date_demand_accessoire: null,
                 date_last_looted_item: null
               };
               return updatePlayer(p.id, { wishlist: newWishlist });
            }));
            toast.success(t("admin.reset_success"));
            await loadData();
          } catch { toast.error(t("admin.action_error")); }
          setUnlockModalOpen(false);
        }} 
      />
    </div>
  );
};

export default Admin;