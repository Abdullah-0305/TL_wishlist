import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation, Trans } from "react-i18next";
import { Trash2, Eraser, Sparkles } from "lucide-react";

export type RemoveTargetType = "arme" | "armure" | "accessoire";

export interface RemoveTarget {
  playerId: string;
  itemType: RemoveTargetType;
  playerName?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  target: RemoveTarget | null;
}

const RemoveModal: React.FC<Props> = ({ open, onOpenChange, onConfirm, target }) => {
  const { t } = useTranslation();

  const itemLabel = target ? t(`remove_modal.item_${target.itemType}`) : "";
  const playerName = target?.playerName || "Joueur";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e1333] border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)] w-[95vw] sm:max-w-[440px] p-0 overflow-hidden border-t-0">
        
        {/* Barre de dégradé supérieure */}
        <div className="w-full h-1.5 bg-gradient-to-r from-fuchsia-600 via-purple-500 to-gaming-gold" />

        <div className="p-6 sm:p-10 flex flex-col items-center">
          <DialogHeader className="w-full flex flex-col items-center text-center space-y-4">
            {/* Icône centrée */}
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-fuchsia-500 blur-2xl opacity-20 animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-purple-900/40 border border-fuchsia-500/50 flex items-center justify-center text-fuchsia-400 shadow-lg">
                <Eraser className="h-8 w-8" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-gaming-gold animate-bounce" />
              </div>
            </div>

            <div className="space-y-3 w-full flex flex-col items-center">
              <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white drop-shadow-md text-center">
                {t("remove_modal.title")}
              </DialogTitle>

              {/* Texte centré de force */}
              <DialogDescription className="text-fuchsia-200/70 text-sm sm:text-base leading-relaxed text-center max-w-[320px] sm:max-w-none">
                {target ? (
                  <Trans 
                    i18nKey="remove_modal.desc"
                    values={{ item: itemLabel, name: playerName }}
                  >
                    Voulez-vous retirer <span className="text-white font-bold italic">item</span> pour <span className="text-gaming-gold font-black">name</span> ?
                  </Trans>
                ) : (
                  t("wishlist.modal_desc")
                )}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Actions centrées */}
          <div className="flex flex-col sm:flex-row items-center justify-center mt-8 gap-3 sm:gap-4 w-full">
            
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-1/2 order-2 sm:order-1 text-fuchsia-300/50 hover:text-white hover:bg-fuchsia-500/10 font-bold uppercase tracking-widest text-xs py-6 sm:py-2"
            >
              {t("add_player_modal.btn_cancel")}
            </Button>

            <Button
              onClick={async () => {
                await onConfirm();
                onOpenChange(false);
              }}
              className="w-full sm:w-1/2 order-1 sm:order-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-black px-4 py-6 sm:py-2 h-auto sm:h-10 shadow-lg shadow-fuchsia-900/20 gap-2 uppercase tracking-wide border-b-2 border-fuchsia-900/50 active:translate-y-0.5 transition-all text-xs sm:text-sm whitespace-nowrap flex justify-center items-center"
            >
              <Trash2 className="h-4 w-4" />
              <span className="truncate">{t("remove_modal.btn_confirm")}</span>
            </Button>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveModal;