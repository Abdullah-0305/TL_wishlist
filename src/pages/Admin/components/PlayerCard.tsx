import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserCog } from "lucide-react";
import ItemRow from "./ItemRow";

const PlayerCard = ({ player, openModal, openRemoveModal, togglePresence }) => {
  return (
    <Card className="border-primary/20 hover:border-primary/40 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-2 justify-between">

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <UserCog className="h-5 w-5 text-primary-foreground" />
            </div>

            <CardTitle>
              <div className="flex items-center gap-2">
                {player.name}
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

          {/* ---- CHECKBOX PRÉSENT ---- */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm">Présent</span>
            <input
              type="checkbox"
              checked={player.isPresent || false}
              onChange={() => togglePresence(player.id)}
              className="
                w-5 h-5 rounded border-gray-300 checked:bg-primary checked:border-primary
                focus:ring-2 focus:ring-primary/50 transition
              "
            />
          </label>

        </div>

        <CardDescription>Choix actuels</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <ItemRow type="arme" player={player} openModal={openModal} openRemoveModal={openRemoveModal} />
        <ItemRow type="armure" player={player} openModal={openModal} openRemoveModal={openRemoveModal} />
        <ItemRow type="accessoire" player={player} openModal={openModal} openRemoveModal={openRemoveModal} />
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
