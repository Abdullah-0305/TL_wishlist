import PlayerCard from "./PlayerCard";
import { useTranslation } from "react-i18next";
import { Users2 } from "lucide-react";

const PlayerGrid = ({
  players,
  openModal,
  openRemoveModal,
  togglePresence,
  loadPlayers
}) => {
  const { t } = useTranslation();

  // Si aucun joueur ne correspond au filtre
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-gaming-gold/10 rounded-3xl bg-[#0f1117]/30">
        <div className="p-4 rounded-full bg-gaming-gold/5 mb-4">
          <Users2 className="h-10 w-10 text-gaming-gold/40" />
        </div>
        <h3 className="text-xl font-bold text-zinc-300">{t("player_grid.no_players")}</h3>
        <p className="text-zinc-500 text-sm mt-1">{t("player_grid.try_other_filter")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          openModal={openModal}
          openRemoveModal={openRemoveModal}
          togglePresence={togglePresence}
          loadPlayers={loadPlayers}
        />
      ))}
    </div>
  );
};

export default PlayerGrid;