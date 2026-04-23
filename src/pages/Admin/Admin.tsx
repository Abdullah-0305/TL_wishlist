import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Users, RotateCcw, Mic, ScrollText, RefreshCw, Swords, Zap, Skull } from "lucide-react"; // <-- Ajout de Skull ici
import { supabase } from "@/lib/supabase";

import Header from "./components/Header";
import BossCounts from "./components/BossCounts";
import FilterBar from "./components/FilterBar";
import PlayerGrid from "./components/PlayerGrid";
import BlockModal, { BlockTarget } from "./components/BlockModal";
import RemoveModal, { RemoveTarget } from "./components/RemoveModal";
import UnlockAllModal from "./components/UnlockAllModal";
import { Button } from "@/components/ui/button";

// Nouveaux imports des onglets
import HistoryTab from "./components/HistoryTab"; 
import ChangeRequestsTab from "./components/ChangeRequestsTab"; 

import {
  getPlayers, setPlayerHasLooted, updatePlayer, getArmes, getArmures,
  getAccessoires, getPlayerById, resetLastLootDate, getPendingChangeRequests,
  getArchboss, getAppSettings
} from "@/api/db";

// --- INTERFACES ---
interface MultiLangText { fr: string; en: string; }

interface Player {
  id: string;
  name: string;
  idArme?: string | number | null;
  idArmure?: string | number | null;
  idAccesoires?: string | number | null;
  idArchboss?: string | number | null;
  has_looted_arme?: boolean;
  has_looted_armure?: boolean;
  has_looted_accessoires?: boolean;
  has_looted_archboss?: boolean;
  armeName?: MultiLangText | null;
  armureName?: MultiLangText | null;
  accessoireName?: MultiLangText | null;
  archbossName?: MultiLangText | null;
  armeBoss?: MultiLangText[];
  armureBoss?: MultiLangText[];
  accessoireBoss?: MultiLangText[];
  archbossBoss?: MultiLangText[];
  idRole?: string | number | null;
  roleName?: MultiLangText | null;
  roleColor?: string;
  isPresent?: boolean;
  date_last_looted_item: Date | null;
  date_demand_arme?: Date | null;
  date_demand_armure?: Date | null;
  date_demand_accessoire?: Date | null;
  date_demand_archboss?: Date | null;
  wishlist?: any;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] as "fr" | "en" || "fr";

  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  
  // Ajout de archbosses dans le state items
  const [items, setItems] = useState({ armes: [], armures: [], accessoires: [], archbosses: [] });
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [selectedBoss, setSelectedBoss] = useState<string | null>(null);

  // --- NAVIGATION (Onglets) ---
  const [activeTab, setActiveTab] = useState<"raid" | "requests" | "history">("raid");

  // Modals de confirmation
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<BlockTarget | null>(null);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const [isArchbossEnabled, setIsArchbossEnabled] = useState(false);


  // --- CHARGEMENT OPTIMISÉ ---
  const loadData = async () => {
    try {
      setLoading(true);
      const [
        armesRes, armuresRes, accRes, abRes, rolesRes, playersRes, bossRes, requestsRes,
        armuresBossRes, accBossRes, settingsRes
      ] = await Promise.all([
        getArmes(),
        getArmures(),
        getAccessoires(),
        getArchboss(),
        supabase.from('role').select('*'),
        getPlayers(),
        supabase.from('boss').select('*'),
        getPendingChangeRequests(),
        supabase.from('armures_boss').select('*'),
        supabase.from('accessoires_boss').select('*'),
        getAppSettings()
      ]);

      // Vérification du Feature Flag
      const archbossSetting = settingsRes.find(s => s.id === 'enable_archboss');
      if (archbossSetting) {
        setIsArchbossEnabled(archbossSetting.is_active);
      }

      const weaponsMap = new Map(armesRes.data?.map(i => [i.id.toString(), i]));
      const armorsMap = new Map(armuresRes.data?.map(i => [i.id.toString(), i]));
      const accMap = new Map(accRes.data?.map(i => [i.id.toString(), i]));
      const abMap = new Map(abRes.data?.map(i => [i.id.toString(), i]));
      const rolesMap = new Map(rolesRes.data?.map(r => [r.id.toString(), r]));
      const bossesMap = new Map(bossRes.data?.map(b => [b.id.toString(), b.name]));

      const armuresBossMap = new Map<string, string[]>();
      armuresBossRes.data?.forEach(row => {
        const key = row.idArmure?.toString();
        if (!armuresBossMap.has(key)) armuresBossMap.set(key, []);
        armuresBossMap.get(key)?.push(row.idBoss?.toString());
      });

      const accBossMap = new Map<string, string[]>();
      accBossRes.data?.forEach(row => {
        const key = row.idAccessoire?.toString();
        if (!accBossMap.has(key)) accBossMap.set(key, []);
        accBossMap.get(key)?.push(row.idBoss?.toString());
      });

      // Ajout archbosses
      setItems({ 
        armes: armesRes.data || [], 
        armures: armuresRes.data || [], 
        accessoires: accRes.data || [],
        archbosses: abRes.data || []
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
          const abData = abMap.get(wl.id_archboss?.toString());
          const rData = rolesMap.get(p.role?.toString());

          const getArmeBossArray = (itemData: any) => {
            if (!itemData || !itemData.idBoss) return [];
            const bossName = bossesMap.get(itemData.idBoss.toString());
            return bossName ? [bossName] : []; 
          };

          const getArmureBossArray = (idArmure: any) => {
            if (!idArmure) return [];
            const bossIds = armuresBossMap.get(idArmure.toString()) || [];
            return bossIds.map(bId => bossesMap.get(bId)).filter(Boolean); 
          };

          const getAccessoireBossArray = (idAccessoire: any) => {
            if (!idAccessoire) return [];
            const bossIds = accBossMap.get(idAccessoire.toString()) || [];
            return bossIds.map(bId => bossesMap.get(bId)).filter(Boolean);
          };

          // Archboss fonctionne comme les armes
          const getArchbossBossArray = (itemData: any) => {
            if (!itemData || !itemData.idBoss) return [];
            const bossName = bossesMap.get(itemData.idBoss.toString());
            return bossName ? [bossName] : []; 
          };

          return {
            ...p,
            name: p.discord_name,
            isPresent: false,
            wishlist: wl,
            idArme: wl.id_arme,
            idArmure: wl.id_armure,
            idAccesoires: wl.id_accessoire,
            idArchboss: wl.id_archboss,
            has_looted_arme: wl.has_looted_arme || false,
            has_looted_armure: wl.has_looted_armure || false,
            has_looted_accessoires: wl.has_looted_accessoires || false,
            has_looted_archboss: wl.has_looted_archboss || false,
            date_last_looted_item: wl.date_last_looted_item ? new Date(wl.date_last_looted_item) : null,
            date_demand_arme: wl.date_demand_arme ? new Date(wl.date_demand_arme) : null,
            date_demand_armure: wl.date_demand_armure ? new Date(wl.date_demand_armure) : null,
            date_demand_accessoire: wl.date_demand_accessoire ? new Date(wl.date_demand_accessoire) : null,
            date_demand_archboss: wl.date_demand_archboss ? new Date(wl.date_demand_archboss) : null,
            armeName: wData?.name || null,
            armureName: aData?.name || null,
            accessoireName: acData?.name || null,
            archbossName: abData?.name || null,
            
            armeBoss: getArmeBossArray(wData), 
            armureBoss: getArmureBossArray(wl.id_armure),
            accessoireBoss: getAccessoireBossArray(wl.id_accessoire),
            archbossBoss: getArchbossBossArray(abData),
            
            idRole: p.role,
            roleName: rData?.name || null,
            roleColor: rData?.color || "#9CA3AF"
          };
        });
        
        setPlayers(enriched);
        setFilteredPlayers(enriched);
        setPendingCount(requestsRes?.length || 0);
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
        p.accessoireBoss?.some(b => b[lang] === selectedBoss) ||
        p.archbossBoss?.some(b => b[lang] === selectedBoss) // Ajout Archboss
      ));
    } else if (selectedFilter) {
      result = result.filter(p => 
        p.armeName?.[lang] === selectedFilter || 
        p.armureName?.[lang] === selectedFilter || 
        p.accessoireName?.[lang] === selectedFilter ||
        p.archbossName?.[lang] === selectedFilter // Ajout Archboss
      );
    }
    setFilteredPlayers(result);
  }, [selectedFilter, selectedBoss, players, lang]);

  // --- COMPTAGE BOSS ---
  const bossCounts = useMemo(() => {
    const c: Record<string, Record<string, number>> = { armes: {}, armures: {}, accessoires: {}, archbosses: {} };
    players.filter(p => p.isPresent).forEach(p => {
      if (!p.has_looted_arme) p.armeBoss?.forEach(b => c.armes[b[lang]] = (c.armes[b[lang]] || 0) + 1);
      if (!p.has_looted_armure) p.armureBoss?.forEach(b => c.armures[b[lang]] = (c.armures[b[lang]] || 0) + 1);
      if (!p.has_looted_accessoires) p.accessoireBoss?.forEach(b => c.accessoires[b[lang]] = (c.accessoires[b[lang]] || 0) + 1);
      if (!p.has_looted_archboss) p.archbossBoss?.forEach(b => c.archbosses[b[lang]] = (c.archbosses[b[lang]] || 0) + 1); // Ajout Archboss
    });
    const sort = (obj: Record<string, number>): [string, number][] => Object.entries(obj).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    return { armes: sort(c.armes), armures: sort(c.armures), accessoires: sort(c.accessoires), archbosses: sort(c.archbosses) };
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

  const wakeUpBot = async () => {
    const toastId = toast.loading("Réveil du bot en cours (peut prendre jusqu'à 60s)...");
    try {
      await fetch("https://wishlist-bot-lyy7.onrender.com/", { mode: 'no-cors' });
      toast.success("Signal envoyé ! Attendez quelques secondes puis faites le Scan.", { id: toastId, duration: 5000 });
    } catch (error) {
      console.error("Erreur Wake Bot:", error);
      toast.error("Erreur lors de l'appel au bot.", { id: toastId });
    }
  };

  const syncWithBot = async () => {
    const toastId = toast.loading("Interrogation du Bot...");
    try {
      const { data: dbPlayers, error } = await supabase.from('players').select('id, is_online');
      if (error) throw error;

      let matchCount = 0;
      setPlayers((currentPlayers) => {
        return currentPlayers.map((player) => {
          const freshData = dbPlayers.find(dbP => dbP.id === player.id);
          if (freshData && freshData.is_online) {
            matchCount++;
            return { ...player, isPresent: true }; 
          }
          return player;
        });
      });

      if (matchCount > 0) {
        toast.success(`${matchCount} joueurs cochés pour le Boss !`, { id: toastId });
      } else {
        toast.info("Le bot n'a détecté personne en vocal.", { id: toastId });
      }
    } catch (error) {
      console.error("Erreur Sync Bot:", error);
      toast.error("Erreur lors de la lecture de la base de données.", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] bg-[radial-gradient(ellipse_at_top,_rgba(88,28,135,0.15)_0%,_rgba(10,11,16,1)_80%)] text-zinc-100 pb-20">
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-10 animate-in fade-in duration-500">
        
        <Header onUnlockAll={() => setUnlockModalOpen(true)} />        

        {/* --- MENU DES ONGLETS --- */}
        <div className="flex flex-wrap sm:flex-nowrap space-y-2 sm:space-y-0 sm:space-x-2 bg-[#1e1333]/60 p-1.5 rounded-xl border border-white/5 shadow-inner w-full md:w-fit mb-8">
          
          <Button
            variant="ghost"
            onClick={() => setActiveTab("raid")}
            className={`flex-1 md:flex-none gap-2 px-6 h-10 transition-all border ${
              activeTab === "raid" 
                ? "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.15)] hover:bg-fuchsia-500/25 hover:text-fuchsia-200" 
                : "border-transparent text-zinc-400 hover:bg-fuchsia-500/10 hover:text-fuchsia-300"
            }`}
          >
            <Swords className="h-4 w-4" /> {t("admin.actifs")}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveTab("requests")}
            className={`relative flex-1 md:flex-none gap-2 px-6 h-10 transition-all border ${
              activeTab === "requests" 
                ? "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:bg-amber-500/25 hover:text-amber-200" 
                : "border-transparent text-zinc-400 hover:bg-amber-500/10 hover:text-amber-300"
            }`}
          >
            <RefreshCw className="h-4 w-4" /> {t("admin.requests")}
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border border-[#0a0b10] text-[10px] font-black text-white items-center justify-center">
                  {pendingCount}
                </span>
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setActiveTab("history")}
            className={`flex-1 md:flex-none gap-2 px-6 h-10 transition-all border ${
              activeTab === "history" 
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:bg-cyan-500/25 hover:text-cyan-200" 
                : "border-transparent text-zinc-400 hover:bg-cyan-500/10 hover:text-cyan-300"
            }`}
          >
            <ScrollText className="h-4 w-4" /> {t("admin.history")}
          </Button>
        </div>

        {/* --- CONTENU DE L'ONGLET SÉLECTIONNÉ --- */}
        <div className="relative">
          <div className="absolute -inset-10 bg-fuchsia-600/5 blur-[120px] pointer-events-none opacity-50" />
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === "raid" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                  <BossCounts 
                    bossCounts={bossCounts} 
                    selectedBoss={selectedBoss} 
                    onBossClick={setSelectedBoss} 
                    onReset={() => setSelectedBoss(null)} 
                    isArchbossEnabled={isArchbossEnabled}
                  />

                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="flex-1 w-full lg:w-auto">
                      <FilterBar selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} {...items} isArchbossEnabled={isArchbossEnabled} />
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto mt-2 lg:mt-0">
                      <Button 
                        onClick={wakeUpBot}
                        variant="outline"
                        className="bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500 hover:text-white font-bold h-10 px-4 flex-1 lg:flex-none gap-2 transition-all"
                      >
                        <Zap className="h-4 w-4" /> Réveiller Bot
                      </Button>

                      <Button 
                        onClick={syncWithBot}
                        className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black font-bold h-10 px-4 flex-1 lg:flex-none gap-2 transition-all"
                      >
                        <Mic className="h-4 w-4" /> Scan Vocal
                      </Button>
                      <div className="w-[1px] h-6 bg-white/10 mx-1 hidden lg:block" />
                      <Button variant="ghost" onClick={() => setPlayers(p => p.map(x => ({...x, isPresent: false})))} className="h-10 px-3 hover:bg-white/5" title="Reset présence">
                        <RotateCcw className="h-4 w-4 text-zinc-400" />
                      </Button>
                      <Button variant="ghost" onClick={() => setPlayers(p => p.map(x => ({...x, isPresent: true})))} className="h-10 px-3 hover:bg-white/5" title="Tout cocher">
                        <Users className="h-4 w-4 text-zinc-400" />
                      </Button>
                    </div>
                  </div>

                  <PlayerGrid
                    players={filteredPlayers}
                    openModal={(id, type) => {
                      const p = players.find(x => x.id === id);
                      if (!p) return;
                      // Gestion de l'archboss
                      const has = type === "arme" ? p.has_looted_arme : 
                                  type === "armure" ? p.has_looted_armure : 
                                  type === "accessoire" ? p.has_looted_accessoires : 
                                  p.has_looted_archboss;
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
                    isArchbossEnabled={isArchbossEnabled}
                  />
                </div>
              )}

              {activeTab === "requests" && (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <ChangeRequestsTab onDataChanged={loadData} />
                </div>
              )}

              {activeTab === "history" && (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <HistoryTab />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BlockModal open={modalOpen} onOpenChange={setModalOpen} target={target} onConfirm={confirmBlock} />
      <RemoveModal open={removeModalOpen} onOpenChange={setRemoveModalOpen} target={removeTarget} onConfirm={async () => {
          if (!removeTarget) return;
          try {
            const { data: currentPlayer } = await getPlayerById(removeTarget.playerId);
            const newWishlist = { ...currentPlayer?.wishlist };
            
            if (removeTarget.itemType === "arme") { newWishlist.id_arme = null; newWishlist.has_looted_arme = false; }
            else if (removeTarget.itemType === "armure") { newWishlist.id_armure = null; newWishlist.has_looted_armure = false; }
            else if (removeTarget.itemType === "accessoire") { newWishlist.id_accessoire = null; newWishlist.has_looted_accessoires = false; }
            else if (removeTarget.itemType === "archboss") { newWishlist.id_archboss = null; newWishlist.has_looted_archboss = false; }

            await updatePlayer(removeTarget.playerId, { wishlist: newWishlist });
            toast.success(t("admin.action_success"));
            await loadData();
          } catch { toast.error(t("admin.action_error")); }
          setRemoveModalOpen(false);
      }} />
      <UnlockAllModal open={unlockModalOpen} onOpenChange={setUnlockModalOpen} target={null} onConfirm={async () => {
          try {
            await Promise.all(players.map(async p => {
               const { data: currentPlayer } = await getPlayerById(p.id);
               const newWishlist = {
                 ...currentPlayer?.wishlist,
                 has_looted_arme: false,
                 has_looted_armure: false,
                 has_looted_accessoires: false,
                 has_looted_archboss: false, // Reset Archboss
                 id_arme: null,
                 id_armure: null,
                 id_accessoire: null,
                 id_archboss: null, // Reset Archboss
                 date_demand_arme: null,
                 date_demand_armure: null,
                 date_demand_accessoire: null,
                 date_demand_archboss: null, // Reset Archboss
                 date_last_looted_item: null
               };
               return updatePlayer(p.id, { wishlist: newWishlist });
            }));
            toast.success(t("admin.reset_success"));
            await loadData();
          } catch { toast.error(t("admin.action_error")); }
          setUnlockModalOpen(false);
      }} />
    </div>
  );
};

export default Admin;