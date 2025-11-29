import PlayerCard from "./PlayerCard";

const PlayerGrid = ({
  players,
  openModal,
  openRemoveModal
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          openModal={openModal}
          openRemoveModal={openRemoveModal}
        />
      ))}
    </div>
  );
};

export default PlayerGrid;
