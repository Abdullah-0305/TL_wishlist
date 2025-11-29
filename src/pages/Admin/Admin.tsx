// /Admin/Admin.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

import Header from "./components/Header";
import BossCounts from "./components/BossCounts";
import FilterBar from "./components/FilterBar";
import PlayerGrid from "./components/PlayerGrid";
import BlockModal, { BlockTarget } from "./components/BlockModal";
import RemoveModal, { RemoveTarget } from "./components/RemoveModal";
import UnlockAllModal, { UnlockAllTarget } from "./components/UnlockAllModal";

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
  getAccessoireBossById
} from "@/api/db";

interface Player {
  id: string;
  name: string;
  idArme?: string | null;
  idArmure?: string | null;
  idAccesoires?: string | null;
  has_looted_arme?: boolean;
  has_looted_armure?: boolean;
  has_looted_accessoires?: boolean;
  armeName?: string;
  armureName?: string;
  accessoireName?: string;
  armeBoss?: string[];
  armureBoss?: string[];
  accessoireBoss?: string[];
  idRole?: string | null;
  roleName?: string;
  roleColor?: string;
  isPresent?: boolean;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  // Data
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  const [armes, setArmes] = useState<{ id: string; name: string }[]>([]);
  const [armures, setArmures] = useState<{ id: string; name: string }[]>([]);
  const [accessoires, setAccessoires] = useState<{ id: string; name: string }[]>([]);

  // Filter
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [selectedBoss, setSelectedBoss] = useState<string | null>(null);

  // Modals & targets
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<BlockTarget | null>(null);

  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);

  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState<UnlockAllTarget | null>(null);

  // ----------- LOAD ITEMS -------------
  const loadItems = async () => {
    try {
      const armesRes = await getArmes();
      const armuresRes = await getArmures();
      const accessoiresRes = await getAccessoires();

      setArmes(armesRes.data ?? []);
      setArmures(armuresRes.data ?? []);
      setAccessoires(accessoiresRes.data ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des items");
    }
  };

  // ----------- LOAD PLAYERS -------------
  const loadPlayers = async () => {
    try {
      const { data, error } = await getPlayers();
      if (error) {
        toast.error("Erreur lors du chargement des joueurs");
        return;
      }
      if (!data) return;

      const playersWithNames = await Promise.all(
        data.map(async (p: any) => ({
          ...p,
          isPresent: false, // par défaut aucun joueur présent
          armeName: p.idArme ? await getArmeNameById(p.idArme) : "Aucune",
          armureName: p.idArmure ? await getArmureNameById(p.idArmure) : "Aucune",
          accessoireName: p.idAccesoires ? await getAccessoireNameById(p.idAccesoires) : "Aucun",
          armeBoss: p.idArme ? await getArmeBossById(p.idArme) : [],
          armureBoss: p.idArmure ? await getArmureBossById(p.idArmure) : [],
          accessoireBoss: p.idAccesoires ? await getAccessoireBossById(p.idAccesoires) : [],
          roleName: p.idRole ? await getRoleById(p.idRole) : "Aucun",
          roleColor: p.idRole ? await getColorRoleById(p.idRole) : "#9CA3AF"
        }))
      );

      setPlayers(playersWithNames);
      setFilteredPlayers(playersWithNames);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des joueurs");
    }
  };

  useEffect(() => {
    loadPlayers();
    loadItems();
  }, []);

  // ----------- FILTER PLAYERS -------------
  useEffect(() => {
    if (selectedBoss) return;

    if (!selectedFilter) {
      setFilteredPlayers(players);
      return;
    }

    const results = players.filter(
      (p) =>
        p.armeName === selectedFilter ||
        p.armureName === selectedFilter ||
        p.accessoireName === selectedFilter
    );

    setFilteredPlayers(results);
  }, [selectedFilter, players, selectedBoss]);

  // ----------- FILTER BY BOSS -------------
  const handleBossClick = (boss: string) => {
    setSelectedBoss(boss);

    const filtered = players.filter(p =>
      p.isPresent &&
      (p.armeBoss?.includes(boss) ||
       p.armureBoss?.includes(boss) ||
       p.accessoireBoss?.includes(boss))
    );

    setFilteredPlayers(filtered);
  };

  // ----------- RESET BOSS FILTER -------------
  const resetBossFilter = () => {
    setSelectedBoss(null);
    setFilteredPlayers(players.filter(p => p.isPresent));
  };

  // ----------- TOGGLE PRESENCE -------------
  const togglePresence = (playerId: string) => {
    const updated = players.map(p =>
      p.id === playerId ? { ...p, isPresent: !p.isPresent } : p
    );

    setPlayers(updated);

    if (selectedBoss) {
      const filtered = updated.filter(p =>
        p.isPresent &&
        (p.armeBoss?.includes(selectedBoss) ||
         p.armureBoss?.includes(selectedBoss) ||
         p.accessoireBoss?.includes(selectedBoss))
      );
      setFilteredPlayers(filtered);
    } else if (selectedFilter) {
      const filtered = updated.filter(
        (p) =>
          p.isPresent &&
          (p.armeName === selectedFilter ||
           p.armureName === selectedFilter ||
           p.accessoireName === selectedFilter)
      );
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers(updated.filter(p => p.isPresent));
    }
  };

  // ----------- RESET PLAYER FILTER -------------
  const resetPresence = () => {
    const resetPlayers = players.map(p => ({ ...p, isPresent: false }));
    setPlayers(resetPlayers);
    setFilteredPlayers(resetPlayers);
  };

    // ----------- RESET PLAYER FILTER -------------
  const setAllPresence = () => {
    const resetPlayers = players.map(p => ({ ...p, isPresent: true }));
    setPlayers(resetPlayers);
    setFilteredPlayers(resetPlayers);
  };


  // ----------- GET BOSS COUNTS -------------
  const bossCounts = useMemo(() => {
    const bosses: {
      armes: Record<string, number>;
      armures: Record<string, number>;
      accessoires: Record<string, number>;
    } = { armes: {}, armures: {}, accessoires: {} };

    players
      .filter(p => p.isPresent)
      .forEach((p) => {
        // Arme : compter seulement si non looté
        if (!p.has_looted_arme) {
          p.armeBoss?.forEach(b => {
            bosses.armes[b] = (bosses.armes[b] || 0) + 1;
          });
        }

        // Armure : compter seulement si non looté
        if (!p.has_looted_armure) {
          p.armureBoss?.forEach(b => {
            bosses.armures[b] = (bosses.armures[b] || 0) + 1;
          });
        }

        // Accessoire : compter seulement si non looté
        if (!p.has_looted_accessoires) {
          p.accessoireBoss?.forEach(b => {
            bosses.accessoires[b] = (bosses.accessoires[b] || 0) + 1;
          });
        }
      });

    const entrySort = (obj: Record<string, number>) =>
      Object.entries(obj)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);

    return {
      armes: entrySort(bosses.armes),
      armures: entrySort(bosses.armures),
      accessoires: entrySort(bosses.accessoires)
    };
  }, [players]);

  // -------- BLOCK ----------
  const openModal = (playerId: string, itemType: "arme" | "armure" | "accessoire") => {
    const player = players.find((p) => p.id === playerId);
    setTarget({ playerId, itemType, playerName: player?.name });
    setModalOpen(true);
  };

  const confirmBlock = async () => {
    if (!target) return;
    const player = players.find((p) => p.id === target.playerId);
    if (!player) return;

    try {
      await setPlayerHasLooted(target.playerId, true, target.itemType);
      toast.success(`Élément bloqué pour ${player.name}`);
      await loadPlayers();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du blocage");
    } finally {
      setModalOpen(false);
      setTarget(null);
    }
  };

  // -------- REMOVE ----------
  const openRemoveModal = (playerId: string, itemType: "arme" | "armure" | "accessoire") => {
    const player = players.find((p) => p.id === playerId);
    setRemoveTarget({ playerId, itemType, playerName: player?.name });
    setRemoveModalOpen(true);
  };

  const removeItem = async (playerId: string, itemType: "arme" | "armure" | "accessoire") => {
    try {
      await updatePlayer(playerId, {
        [itemType === "arme" ? "idArme" : itemType === "armure" ? "idArmure" : "idAccesoires"]: null,
        [itemType === "arme" ? "has_looted_arme" : itemType === "armure" ? "has_looted_armure" : "has_looted_accessoires"]: false
      });
      toast.success("Item retiré !");
      await loadPlayers();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du retrait");
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    await removeItem(removeTarget.playerId, removeTarget.itemType);
    setRemoveModalOpen(false);
    setRemoveTarget(null);
  };

  // -------- UNLOCK ALL ----------
  const unlockAll = async () => {
    try {
      await Promise.all(
        players.map((p) =>
          updatePlayer(p.id, {
            has_looted_arme: false,
            has_looted_armure: false,
            has_looted_accessoires: false,
            idArme: null,
            idArmure: null,
            idAccesoires: null,
            idRole: null
          })
        )
      );
      toast.success("Tous les items ont été réinitialisés !");
      await loadPlayers();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du déblocage");
    } finally {
      setUnlockModalOpen(false);
    }
  };

  // -------- Render ----------
  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <Header onUnlockAll={() => setUnlockModalOpen(true)} />

      <BossCounts
        bossCounts={bossCounts}
        selectedBoss={selectedBoss}
        onBossClick={handleBossClick}
        onReset={resetBossFilter}
      />

      {/* Section filtres + reset */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <FilterBar
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          armes={armes}
          armures={armures}
          accessoires={accessoires}
        />

        <button
          onClick={resetPresence}
          className="px-4 pt-1 pb-1 rounded bg-primary/90 text-primary-foreground font-medium hover:bg-primary/80 transition-colors w-full sm:w-auto"
        >
          Reset Présence
        </button>

        <button
          onClick={setAllPresence}
          className="px-4 pt-1 pb-1 rounded bg-primary/90 text-primary-foreground font-medium hover:bg-primary/80 transition-colors w-full sm:w-auto"
        >
          Tout mettre Présent
        </button>
      </div>

      <PlayerGrid
        players={filteredPlayers}
        openModal={openModal}
        openRemoveModal={openRemoveModal}
        togglePresence={togglePresence}
      />

      <BlockModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        target={target}
        onConfirm={confirmBlock}
      />

      <RemoveModal
        open={removeModalOpen}
        onOpenChange={setRemoveModalOpen}
        target={removeTarget}
        onConfirm={confirmRemove}
      />

      <UnlockAllModal
        open={unlockModalOpen}
        onOpenChange={setUnlockModalOpen}
        target={unlockTarget}
        onConfirm={unlockAll}
      />
    </div>
  );
};

export default Admin;
