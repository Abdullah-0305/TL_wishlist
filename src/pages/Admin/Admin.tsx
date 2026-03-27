import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { UserPlus, Users, RotateCcw } from "lucide-react";

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
  getArmeNameById,
  getArmureNameById,
  getAccessoireNameById,
  getArmes,
  getArmures,
  getAccessoires,
  getRoleById,
  getColorRoleById,
  getArmeBossById,
  getArmureBossById,
  getAccessoireBossById,
  getPlayerById,
  resetLastLootDate
} from "@/api/db";

// --- INTERFACES ---
interface MultiLangText { fr: string; en: string; }
interface Player {
  id: string;
  name: string;
  idArme?: string | null;
  idArmure?: string | null;
  idAccesoires?: string | null;
  has_looted_arme?: boolean;
  has_looted_armure?: boolean;
  has_looted_accessoires?: boolean;
  armeName?: MultiLangText | null;
  armureName?: MultiLangText | null;
  accessoireName?: MultiLangText | null;
  armeBoss?: MultiLangText[];
  armureBoss?: MultiLangText[];
  accessoireBoss?: MultiLangText[];
  idRole?: string | null;
  roleName?: MultiLangText | null;
  roleColor?: string;
  isPresent?: boolean;
  date_last_looted_item: Date | null;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] as "fr" | "en" || "fr";

  // Protection
  if (!user) return <Navigate to="/login" replace />;

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

  const loadData = async () => {
    try {
      const [a, ar, ac, pRes] = await Promise.all([
        getArmes(), getArmures(), getAccessoires(), getPlayers()
      ]);
      setItems({ armes: a.data || [], armures: ar.data || [], accessoires: ac.data || [] });
      
      if (pRes.data) {
        const enriched = await Promise.all(pRes.data.map(async (p: any) => {
          // 🛠️ On extrait la wishlist de la BDD
          const wl = p.wishlist || {};

          if (wl.date_last_looted_item && (new Date().getTime() - new Date(wl.date_last_looted_item).getTime()) / 86400000 > 7) {
            await resetLastLootDate(p.id);
            wl.date_last_looted_item = null;
          }

          // 🛠️ On renvoie un objet "plat" pour que PlayerGrid n'ait rien à changer
          return {
            ...p,
            name: p.discord_name, // On utilise le discord_name pour l'affichage
            isPresent: false,
            
            // On mappe le JSON wishlist vers les variables attendues par l'interface
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


            armeName: wl.id_arme ? await getArmeNameById(wl.id_arme) : null,
            armureName: wl.id_armure ? await getArmureNameById(wl.id_armure) : null,
            accessoireName: wl.id_accessoire ? await getAccessoireNameById(wl.id_accessoire) : null,
            armeBoss: wl.id_arme ? await getArmeBossById(wl.id_arme) : [],
            armureBoss: wl.id_armure ? await getArmureBossById(wl.id_armure) : [],
            accessoireBoss: wl.id_accessoire ? await getAccessoireBossById(wl.id_accessoire) : [],
            
            idRole: p.role,
            roleName: p.role ? await getRoleById(p.role) : null,
            roleColor: p.role ? await getColorRoleById(p.role) : "#9CA3AF"
          };
        }));
        
        setPlayers(enriched);
        setFilteredPlayers(enriched);
      }
    } catch (err) { 
      console.error(err);
      toast.error(t("admin.load_error")); 
    }
  };

  useEffect(() => { loadData(); }, []);

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

  const bossCounts = useMemo(() => {
    const c: Record<string, Record<string, number>> = { armes: {}, armures: {}, accessoires: {} };
    
    players.filter(p => p.isPresent).forEach(p => {
      if (!p.has_looted_arme) p.armeBoss?.forEach(b => c.armes[b[lang]] = (c.armes[b[lang]] || 0) + 1);
      if (!p.has_looted_armure) p.armureBoss?.forEach(b => c.armures[b[lang]] = (c.armures[b[lang]] || 0) + 1);
      if (!p.has_looted_accessoires) p.accessoireBoss?.forEach(b => c.accessoires[b[lang]] = (c.accessoires[b[lang]] || 0) + 1);
    });

    const sort = (obj: Record<string, number>): [string, number][] => 
      Object.entries(obj)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1]);

    return { 
        armes: sort(c.armes), 
        armures: sort(c.armures), 
        accessoires: sort(c.accessoires) 
    };
  }, [players, lang]);

  const confirmBlock = async () => {
    if (!target) return;
    try {
      // Celle-ci on l'avait déjà modifiée côté api/db.ts pour qu'elle gère le JSON !
      await setPlayerHasLooted(target.playerId, target.mode === "block", target.itemType);
      toast.success(t("admin.action_success"));
      await loadData();
    } catch { toast.error(t("admin.action_error")); }
    setModalOpen(false);
  };

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

        {/* --- ZONE DE CONTRÔLE --- */}
        <div className="space-y-4">
          <FilterBar 
            selectedFilter={selectedFilter} 
            setSelectedFilter={setSelectedFilter} 
            {...items} 
          />

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-start gap-4">
            
            <div className="grid grid-cols-2 lg:flex items-center gap-2 bg-[#1e1333]/60 p-1.5 rounded-xl border border-white/5 shadow-inner w-full lg:w-fit">
              <Button 
                variant="ghost" 
                onClick={() => setPlayers(p => p.map(x => ({...x, isPresent: false})))}
                className="flex items-center justify-center gap-2 text-fuchsia-300/70 hover:text-white text-[9px] xs:text-[10px] font-black uppercase tracking-widest h-12 lg:h-10 px-4 sm:px-6 hover:bg-fuchsia-600/20 transition-all active:scale-95 text-center min-w-0"
              >
                <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" /> 
                <span className="leading-tight break-words py-1 overflow-hidden">
                  {t("admin.reset_presence")}
                </span>
              </Button>
              
              <div className="hidden lg:block w-[1px] h-6 bg-white/10 mx-1 flex-shrink-0" />

              <Button 
                variant="ghost" 
                onClick={() => setPlayers(p => p.map(x => ({...x, isPresent: true})))}
                className="flex items-center justify-center gap-2 text-fuchsia-300/70 hover:text-white text-[9px] xs:text-[10px] font-black uppercase tracking-widest h-12 lg:h-10 px-4 sm:px-6 hover:bg-fuchsia-600/20 transition-all active:scale-95 text-center min-w-0"
              >
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" /> 
                <span className="leading-tight break-words py-1 overflow-hidden">
                  {t("admin.set_all_presence")}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* --- GRILLE DES JOUEURS --- */}
        <div className="pt-4 relative">
          <div className="absolute -inset-10 bg-fuchsia-600/5 blur-[120px] pointer-events-none opacity-50" />
          
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
        </div>
      </div>

      <BlockModal open={modalOpen} onOpenChange={setModalOpen} target={target} onConfirm={confirmBlock} />
      
      {/* 🛠️ CORRECTION : Le modal de suppression met à jour le JSON */}
      <RemoveModal 
        open={removeModalOpen} 
        onOpenChange={setRemoveModalOpen} 
        target={removeTarget} 
        onConfirm={async () => {
          if (!removeTarget) return;

          try {
            const { data: currentPlayer } = await getPlayerById(removeTarget.playerId);
            const currentWishlist = currentPlayer?.wishlist || {};
            const newWishlist = { ...currentWishlist };
            
            if (removeTarget.itemType === "arme") {
              newWishlist.id_arme = null;
              newWishlist.has_looted_arme = false;
            } else if (removeTarget.itemType === "armure") {
              newWishlist.id_armure = null;
              newWishlist.has_looted_armure = false;
            } else if (removeTarget.itemType === "accessoire") {
              newWishlist.id_accessoire = null;
              newWishlist.has_looted_accessoires = false;
            }

            // On update avec le nouveau JSON !
            await updatePlayer(removeTarget.playerId, { wishlist: newWishlist });
            
            toast.success(t("admin.action_success"));
            await loadData();
          } catch (error) {
            toast.error(t("admin.action_error"));
          } finally {
            setRemoveModalOpen(false);
          }
        }} 
      />

      {/* 🛠️ CORRECTION : Le modal de reset global met à jour tous les JSON */}
      <UnlockAllModal open={unlockModalOpen} onOpenChange={setUnlockModalOpen} target={null} onConfirm={async () => {
        await Promise.all(players.map(async p => {
           const { data: currentPlayer } = await getPlayerById(p.id);
           const currentWishlist = currentPlayer?.wishlist || {};
           const newWishlist = {
             ...currentWishlist,
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
        await loadData();
        setUnlockModalOpen(false);
      }} />

    </div>
  );
};

export default Admin;