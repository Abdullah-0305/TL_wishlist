import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserCog, Lock, Unlock, Swords, Shield as ShieldIcon, Gem, Filter } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

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
  armeBoss?: string;
  armureBoss?: string;
  accessoireBoss?: string;
  idRole?: string;
  roleName?: string;
  roleColor?: string;
}

const Admin = () => {
  const { user } = useAuth();

  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  const [armes, setArmes] = useState<{ id: string; name: string }[]>([]);
  const [armures, setArmures] = useState<{ id: string; name: string }[]>([]);
  const [accessoires, setAccessoires] = useState<{ id: string; name: string }[]>([]);

  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [target, setTarget] = useState<{ playerId: string; itemType: "arme" | "armure" | "accessoire" } | null>(null);

  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ playerId: string; itemType: "arme" | "armure" | "accessoire" } | null>(null);

  if (!user) return <Navigate to="/login" replace />;

  // ----------- LOAD ITEMS -------------
  const loadItems = async () => {
    const armesRes = await getArmes();
    const armuresRes = await getArmures();
    const accessoiresRes = await getAccessoires();

    setArmes(armesRes.data ?? []);
    setArmures(armuresRes.data ?? []);
    setAccessoires(accessoiresRes.data ?? []);
  };

  // ----------- LOAD PLAYERS -------------
  const loadPlayers = async () => {
    const { data, error } = await getPlayers();
    if (error) return toast.error("Erreur lors du chargement des joueurs");
    if (!data) return;

    const playersWithNames = await Promise.all(
      data.map(async (p) => ({
        ...p,
        armeName: p.idArme ? await getArmeNameById(p.idArme) : "Aucune",
        armureName: p.idArmure ? await getArmureNameById(p.idArmure) : "Aucune",
        accessoireName: p.idAccesoires ? await getAccessoireNameById(p.idAccesoires) : "Aucun",
        armeBoss: p.idArme ? (await getArmeBossById(p.idArme)) ?? null : null,
        armureBoss: p.idArmure ? (await getArmureBossById(p.idArmure)) ?? null : null,
        accessoireBoss: p.idAccesoires ? (await getAccessoireBossById(p.idAccesoires)) ?? null : null,
        roleName: p.idRole ? await getRoleById(p.idRole) : "Aucun",
        roleColor: p.idRole ? await getColorRoleById(p.idRole) : "#9CA3AF"
      }))
    );

    setPlayers(playersWithNames);
    setFilteredPlayers(playersWithNames);
  };

  useEffect(() => {
    loadPlayers();
    loadItems();
  }, []);

  // ----------- APPLY FILTER -------------
  useEffect(() => {
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
  }, [selectedFilter, players]);

  // ----------- GET BOSS COUNTS -------------
  const bossCounts = useMemo(() => {
    const bosses: {
      armes: Record<string, number>;
      armures: Record<string, number>;
      accessoires: Record<string, number>;
    } = { armes: {}, armures: {}, accessoires: {} };

    players.forEach((p) => {
      if (p.armeBoss) bosses.armes[p.armeBoss] = (bosses.armes[p.armeBoss] || 0) + 1;

      if (p.armureBoss) {
        p.armureBoss.split(", ").forEach((boss) => {
          bosses.armures[boss] = (bosses.armures[boss] || 0) + 1;
        });
      }

      if (p.accessoireBoss) {
        p.accessoireBoss.split(", ").forEach((boss) => {
          bosses.accessoires[boss] = (bosses.accessoires[boss] || 0) + 1;
        });
      }
    });

    const filterEntries = (obj: Record<string, number>) =>
      Object.entries(obj).filter(([, count]) => count > 0) as [string, number][];

    return {
      armes: filterEntries(bosses.armes),
      armures: filterEntries(bosses.armures),
      accessoires: filterEntries(bosses.accessoires),
    };
  }, [players]);

  // -------- BLOCK ----------
  const openModal = (playerId: string, itemType: "arme" | "armure" | "accessoire") => {
    setTarget({ playerId, itemType });
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

  // -------- REMOVE ITEM ----------
  const openRemoveModal = (playerId: string, itemType: "arme" | "armure" | "accessoire") => {
    setRemoveTarget({ playerId, itemType });
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            Administration
          </h1>
          <p className="text-muted-foreground mt-2">Gérez les wishlists des membres de la guilde</p>
        </div>

        <Button
          onClick={() => setUnlockModalOpen(true)}
          className="border-primary/20 hover:border-primary/40 text-white shadow-md flex items-center gap-2 px-4 py-2 rounded"
        >
          <Unlock className="h-4 w-4" /> Tout vider et débloquer
        </Button>
      </div>

      {/* BOSS COUNTS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {(["Armes", "Armures", "Accessoires"] as const).map((type) => {
          const data =
            type === "Armes"
              ? bossCounts.armes
              : type === "Armures"
              ? bossCounts.armures
              : bossCounts.accessoires;

          return (
            <div
              key={type}
              className="p-4 bg-card border border-primary/20 rounded-xl shadow-sm"
            >
              <h4 className="font-semibold mb-3">{type}</h4>
              {data.length === 0 ? (
                <div className="text-sm text-muted-foreground">Aucun boss</div>
              ) : (
                <div className="space-y-2">
                  {data.map(([boss, count]) => (
                    <div
                      key={boss}
                      className="flex justify-between items-center text-sm text-muted-foreground"
                    >
                      <span>{boss}</span>
                      <span className="px-2 py-1 bg-primary/30 rounded-full text-xs font-medium text-primary-foreground">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FILTER BAR */}
      <div className="w-full p-4 bg-card border border-primary/20 rounded-xl shadow-sm">

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <span className="font-medium text-sm sm:hidden">Filtrer</span>
          </div>

          <select
            className="flex-grow bg-background border border-primary/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="">— Filtrer par item —</option>

            <optgroup label="Armes">
              {armes.map((a) => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </optgroup>

            <optgroup label="Armures">
              {armures.map((a) => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </optgroup>

            <optgroup label="Accessoires">
              {accessoires.map((a) => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </optgroup>
          </select>

          {selectedFilter && (
            <Button
              variant="outline"
              onClick={() => setSelectedFilter("")}
              className="sm:ml-auto"
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* PLAYERS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.map((player) => (
          <Card key={player.id} className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-primary">
                  <UserCog className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    {player.name} -
                    {player.roleName && (
                      <span
                        className="px-4 py-1 mt-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: player.roleColor }}
                      >
                        {player.roleName}
                      </span>
                    )}
                  </div>
                </CardTitle>
              </div>
              <CardDescription>Choix actuels</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {(["arme", "armure", "accessoire"] as const).map((type) => {
                const icon =
                  type === "arme" ? (
                    <Swords className="h-4 w-4 text-primary" />
                  ) : type === "armure" ? (
                    <ShieldIcon className="h-4 w-4 text-primary" />
                  ) : (
                    <Gem className="h-4 w-4 text-primary" />
                  );

                const name =
                  type === "arme"
                    ? player.armeName
                    : type === "armure"
                    ? player.armureName
                    : player.accessoireName;

                const hasLooted =
                  type === "arme"
                    ? player.has_looted_arme
                    : type === "armure"
                    ? player.has_looted_armure
                    : player.has_looted_accessoires;

                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="text-sm">{name}</span>
                    </div>

                    {name !== "Aucune" && name !== "Aucun" && (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => openModal(player.id, type)}>
                          {hasLooted ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRemoveModal(player.id, type)}
                        >
                          ✕
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CONFIRM BLOCK MODAL */}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="bg-card border-primary/30 max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>Bloquer l'item</DialogTitle>
              <DialogDescription>
                {target && (
                  <>
                    Bloquer{" "}
                    <strong>
                      {target.itemType === "arme"
                        ? "l'arme"
                        : target.itemType === "armure"
                        ? "l'armure"
                        : "l'accessoire"}
                    </strong>{" "}
                    pour <strong>{players.find((p) => p.id === target.playerId)?.name}</strong> ?
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={confirmBlock} className="bg-gradient-primary">
                Confirmer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* CONFIRM REMOVE MODAL */}
      {removeModalOpen && (
        <Dialog open={removeModalOpen} onOpenChange={setRemoveModalOpen}>
          <DialogContent className="bg-card border-primary/30 max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>Retirer l'item</DialogTitle>
              <DialogDescription>
                {removeTarget && (
                  <>
                    Retirer{" "}
                    <strong>
                      {removeTarget.itemType === "arme"
                        ? "l'arme"
                        : removeTarget.itemType === "armure"
                        ? "l'armure"
                        : "l'accessoire"}
                    </strong>{" "}
                    pour <strong>{players.find((p) => p.id === removeTarget.playerId)?.name}</strong> ?
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={() => setRemoveModalOpen(false)}>
                Annuler
              </Button>
              <Button
                className="bg-purple-600 text-white hover:bg-purple-700"
                onClick={confirmRemove}
              >
                Confirmer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* UNLOCK ALL MODAL */}
      {unlockModalOpen && (
        <Dialog open={unlockModalOpen} onOpenChange={setUnlockModalOpen}>
          <DialogContent className="bg-card border-primary/30 max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>Débloquer tous les items</DialogTitle>
              <DialogDescription>
                Réinitialiser <strong>toutes</strong> les wishlists ?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={() => setUnlockModalOpen(false)}>
                Annuler
              </Button>
              <Button
                className="bg-purple-600 text-white hover:bg-purple-700"
                onClick={unlockAll}
              >
                Confirmer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

export default Admin;
