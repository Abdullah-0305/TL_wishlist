import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserCog, MoreVertical } from "lucide-react";
import ItemRow from "./ItemRow";
import { useState, useRef, useEffect } from "react";
import DeletePlayerModal from "./DeletePlayerModal.tsx";

const PlayerCard = ({ player, openModal, openRemoveModal, togglePresence, loadPlayers }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const menuRef = useRef(null);

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <Card className="border-primary/20 hover:border-primary/40 transition-colors relative p-2 sm:p-3">

        {/* Bouton gérer FIXÉ en haut à droite */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Gérer"
          className="absolute right-3 top-3 p-1.5 rounded hover:bg-primary/10 transition z-20"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {/* MENU FLOTTANT */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-3 top-12 bg-primary shadow-lg rounded-md border z-30 w-44 dark:bg-slate-800 dark:border-slate-700 hover:bg-[hsl(var(--primary-hover))]"
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                setDeleteModalOpen(true);
              }}
              className="w-full text-left px-4 py-3 text-sm rounded transition
                        hover:text-white"
            >
              Supprimer le joueur
            </button>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 justify-between pr-12">

            {/* Partie gauche : icône + nom + rôle */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-primary flex-shrink-0">
                <UserCog className="h-6 w-6 text-primary-foreground" />
              </div>

              <CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium">{player.name}</span>
                  {player.roleName && (
                    <span
                      className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-white flex-shrink-0"
                      style={{ backgroundColor: player.roleColor }}
                    >
                      {player.roleName}
                    </span>
                  )}
                </div>
              </CardTitle>
            </div>

            {/* Checkbox présence */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-sm sm:text-base">Présent</span>
              <input
                type="checkbox"
                checked={player.isPresent || false}
                onChange={() => togglePresence(player.id)}
                className="w-6 h-6 rounded border-gray-300 checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/50 transition"
              />
            </label>
          </div>

          <CardDescription className="pt-1 text-sm sm:text-base">Choix actuels</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-5">
          <ItemRow type="arme" player={player} openModal={openModal} openRemoveModal={openRemoveModal} />
          <ItemRow type="armure" player={player} openModal={openModal} openRemoveModal={openRemoveModal} />
          <ItemRow type="accessoire" player={player} openModal={openModal} openRemoveModal={openRemoveModal} />
        </CardContent>
      </Card>

      {/* Modal */}
      <DeletePlayerModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        player={player}
        loadPlayers={loadPlayers}
      />
    </>
  );
};

export default PlayerCard;
