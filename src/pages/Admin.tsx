import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserCog, Lock, Unlock, Swords, Shield as ShieldIcon, Gem } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { getPlayers, setPlayerHasLooted, getArmeNameById, getArmureNameById, getAccessoireNameById, updatePlayer } from "@/api/db";

interface Player {
  id: string;
  name: string;
  idArme?: string | null;
  idArmure?: string | null;
  idAccessoires?: string | null;
  has_looted_arme?: boolean;
  has_looted_armure?: boolean;
  has_looted_accessoires?: boolean;
  armeName?: string;
  armureName?: string;
  accessoireName?: string;
}

interface LootTarget {
  playerId: string;
  itemType: "arme" | "armure" | "accessoire";
}

const Admin = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<LootTarget | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const loadPlayers = async () => {
    const { data, error } = await getPlayers();
    if (error) return toast.error("Erreur lors du chargement des joueurs");
    if (!data) return;

    const playersWithNames: Player[] = await Promise.all(
      data.map(async (player) => ({
        ...player,
        armeName: player.idArme ? await getArmeNameById(player.idArme) : "Aucune",
        armureName: player.idArmure ? await getArmureNameById(player.idArmure) : "Aucune",
        accessoireName: player.idAccesoires ? await getAccessoireNameById(player.idAccesoires) : "Aucun",
      }))
    );
    setPlayers(playersWithNames);
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const openModal = (playerId: string, itemType: LootTarget["itemType"]) => {
    setTarget({ playerId, itemType });
    setModalOpen(true);
  };

  const confirmBlock = async () => {
    if (!target) return;
    const player = players.find(p => p.id === target.playerId);
    if (!player) return;

    try {
      await setPlayerHasLooted(target.playerId, true, target.itemType);
      toast.success(`${target.itemType.toUpperCase()} de ${player.name} bloqué avec succès !`);
      await loadPlayers();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du blocage");
    } finally {
      setModalOpen(false);
      setTarget(null);
    }
  };

  const unlockAll = async () => {
    try {
      await Promise.all(players.map(p => updatePlayer(p.id, {
        has_looted_arme: false,
        has_looted_armure: false,
        has_looted_accessoires: false,
        idArme: null,
        idArmure: null,
        idAccesoires: null
      })));
      toast.success("Tous les items ont été débloqués !");
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            Administration
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les wishlists des membres de la guilde
          </p>
        </div>
        <Button 
          onClick={() => setUnlockModalOpen(true)}
          className="border-primary/20 hover:border-primary/40 text-white shadow-md flex items-center gap-2 px-4 py-2 rounded"
        >
          <Unlock className="h-4 w-4" /> Tout vider et débloquer
        </Button>
      </div>

      {/* Liste des joueurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <Card key={player.id} className="border-primary/20 hover:border-primary/40 transition-colors break-words">
            <CardHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="p-2 rounded-lg bg-gradient-primary flex-shrink-0">
                  <UserCog className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle className="truncate">{player.name}</CardTitle>
              </div>
              <CardDescription>Choix actuels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["arme", "armure", "accessoire"].map((type) => {
                const icon =
                  type === "arme" ? <Swords className="h-4 w-4 text-primary flex-shrink-0" /> :
                  type === "armure" ? <ShieldIcon className="h-4 w-4 text-primary flex-shrink-0" /> :
                  <Gem className="h-4 w-4 text-primary flex-shrink-0" />;

                const name =
                  type === "arme" ? player.armeName :
                  type === "armure" ? player.armureName :
                  player.accessoireName;

                const hasLooted =
                  type === "arme" ? player.has_looted_arme :
                  type === "armure" ? player.has_looted_armure :
                  player.has_looted_accessoires;

                return (
                  <div key={type} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {icon}
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-medium capitalize">{type}</p>
                        
                        {/* Nom de l'item avec tooltip */}
                        <p
                          className="text-sm text-muted-foreground truncate cursor-pointer"
                          data-tooltip-target={`tooltip-${player.id}-${type}`}
                        >
                          {name || "Aucun"}
                        </p>

                        {/* Tooltip */}
                        <div
                          id={`tooltip-${player.id}-${type}`}
                          className="absolute z-50 whitespace-normal break-words rounded-lg bg-black py-1.5 px-3 text-sm text-white invisible group-hover:visible"
                        >
                          {name || "Aucun"}
                        </div>
                      </div>
                    </div>

                    {name && name !== "Aucune" && name !== "Aucun" && (
                      <Button
                        size="sm"
                        onClick={() => openModal(player.id, type as LootTarget["itemType"])}
                        disabled={hasLooted}
                        className="flex-shrink-0"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de confirmation blocage */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-primary/30 max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Bloquer l'item</DialogTitle>
            <DialogDescription>
              {target && (
                <>
                  Êtes-vous sûr de vouloir bloquer{" "}
                  <span className="font-semibold">
                    {target.itemType === "arme" ? "l'arme" :
                     target.itemType === "armure" ? "l'armure" : "l'accessoire"}
                  </span>{" "}
                  pour le joueur <span className="font-semibold">{players.find(p => p.id === target.playerId)?.name}</span> ?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={confirmBlock} className="bg-gradient-primary">Confirmer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de déblocage global */}
      <Dialog open={unlockModalOpen} onOpenChange={setUnlockModalOpen}>
        <DialogContent className="bg-card border-primary/30 max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Débloquer tous les items</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir débloquer tous les items pour tous les joueurs ?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setUnlockModalOpen(false)}>Annuler</Button>
            <Button onClick={unlockAll} className="bg-purple-600 hover:bg-purple-700 text-white">Confirmer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
