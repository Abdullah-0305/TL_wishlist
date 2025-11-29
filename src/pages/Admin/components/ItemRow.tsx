import { Button } from "@/components/ui/button";
import { Swords, Shield, Gem, Lock, Unlock } from "lucide-react";

const ItemRow = ({ type, player, openModal, openRemoveModal }) => {
  const icons = {
    arme: <Swords className="h-4 w-4 text-primary" />,
    armure: <Shield className="h-4 w-4 text-primary" />,
    accessoire: <Gem className="h-4 w-4 text-primary" />
  };

  const name =
    type === "arme" ? player.armeName ?? "Aucune" :
    type === "armure" ? player.armureName ?? "Aucune" :
    player.accessoireName ?? "Aucun";

  const hasLooted =
    type === "arme" ? player.has_looted_arme :
    type === "armure" ? player.has_looted_armure :
    player.has_looted_accessoires;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icons[type]}
        <span className="text-sm">{name}</span>
      </div>

      {(name !== "Aucune" && name !== "Aucun") && (
        <div className="flex gap-1">
          <Button size="sm" onClick={() => openModal(player.id, type)}>
            {hasLooted ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>

          <Button size="sm" variant="outline" onClick={() => openRemoveModal(player.id, type)}>
            ✕
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItemRow;
