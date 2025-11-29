import { Button } from "@/components/ui/button";
import { Swords, Shield, Gem, Lock, Unlock } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

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

  const bosses =
    type === "arme" ? player.armeBoss :
    type === "armure" ? player.armureBoss :
    player.accessoireBoss;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icons[type]}
        {name !== "Aucune" && name !== "Aucun" ? (
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="text-sm cursor-help">{name}</span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-primary text-white text-xs px-2 py-1 rounded shadow-lg"
                  sideOffset={5}
                >
                  {(bosses && bosses.length > 0 ? bosses.join(", ") : "Aucun boss")}
                  <Tooltip.Arrow className="fill-primary" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        ) : (
          <span className="text-sm">{name}</span>
        )}
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
