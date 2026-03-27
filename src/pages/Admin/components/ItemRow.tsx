import { Button } from "@/components/ui/button";
import { Swords, Shield, Gem, Lock, Unlock, Calendar } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useTranslation } from "react-i18next";

const ItemRow = ({ type, player, dateDemand, openModal, openRemoveModal }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "fr" | "en";

  const icons = {
    arme: <Swords className="h-4 w-4 text-primary" />,
    armure: <Shield className="h-4 w-4 text-primary" />,
    accessoire: <Gem className="h-4 w-4 text-primary" />
  };

  // --- LOGIQUE JSONB POUR LE NOM ---
  const itemData =
    type === "arme" ? player.armeName :
    type === "armure" ? player.armureName :
    player.accessoireName;

  // Si itemData existe, on prend la langue, sinon texte "Aucun" traduit
  const displayName = itemData ? (itemData[lang] || itemData['fr']) : t("item_row.none");

  const hasLooted =
    type === "arme" ? player.has_looted_arme :
    type === "armure" ? player.has_looted_armure :
    player.has_looted_accessoires;

  // --- LOGIQUE JSONB POUR LES BOSS ---
  const bosses =
    type === "arme" ? player.armeBoss :
    type === "armure" ? player.armureBoss :
    player.accessoireBoss;

  // On transforme le tableau d'objets [{fr, en}] en une seule chaîne de caractères
  const bossNamesList = bosses && bosses.length > 0 
    ? bosses.map((b: any) => b[lang] || b['fr']).join(", ") 
    : t("item_row.no_boss");

  console.log(player)
  const hasItem = !!itemData;

  const formattedDemand = dateDemand 
    ? new Date(dateDemand).toLocaleDateString() // Ou un format plus court style "12/03"
    : null;

  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="flex-shrink-0">{icons[type]}</div>
        
        {hasItem ? (
          <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <div className="flex flex-col gap-0.5 cursor-help min-w-0">
                  {/* Nom de l'item */}
                  <span className="text-sm truncate hover:text-fuchsia-400 transition-colors font-semibold text-zinc-100">
                    {displayName}
                  </span>
                  
                  {/* Date de demande (Petit badge discret) */}
                  {dateDemand && (
                    <div className="flex items-center gap-1 text-[9px] text-fuchsia-400/50 uppercase font-black tracking-tighter">
                      <Calendar className="h-2.5 w-2.5" />
                      <span>
                        {new Date(dateDemand).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="z-[100] bg-zinc-900 text-zinc-100 text-[10px] sm:text-xs px-2 py-1.5 rounded-md shadow-2xl border border-primary/20 animate-in fade-in zoom-in-95 duration-200"
                  sideOffset={8}
                >
                  <div className="font-semibold text-primary mb-0.5 uppercase tracking-tighter text-[9px]">Boss :</div>
                  {bossNamesList}
                  <Tooltip.Arrow className="fill-zinc-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        ) : (
          <span className="text-sm text-muted-foreground italic">{displayName}</span>
        )}
      </div>

      {hasItem && (
        <div className="flex gap-1.5 items-center ml-2">
          {/* Bouton Lock/Unlock */}
          <Button 
            size="sm" 
            variant={hasLooted ? "secondary" : "outline"}
            className="h-8 w-8 p-0"
            onClick={() => openModal(player.id, type)}
            title={hasLooted ? t("item_row.status_looted") : t("item_row.status_available")}
          >
            {hasLooted ? (
              <Lock className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <Unlock className="h-3.5 w-3.5 text-emerald-500" />
            )}
          </Button>

          {/* Bouton Supprimer */}
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
            onClick={() => openRemoveModal(player.id, type)}
            title={t("item_row.remove_item")}
          >
            <span className="text-xs">✕</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItemRow;