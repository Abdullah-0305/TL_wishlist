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
import { Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

export type ItemType = "arme" | "armure" | "accessoire";
export type BlockMode = "block" | "unblock";

export interface BlockTarget {
  playerId: string;
  itemType: ItemType;
  mode: BlockMode;
  playerName?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  target: BlockTarget | null;
}

const BlockModal: React.FC<Props> = ({
  open,
  onOpenChange,
  onConfirm,
  target,
}) => {
  const { t } = useTranslation();
  const isUnblock = target?.mode === "unblock";

  const itemLabel = target ? t(`block_modal.item_${target.itemType}`) : "";
  const playerName = target?.playerName || "Joueur";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e1333] border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)] w-[95vw] sm:max-w-[440px] p-0 overflow-hidden border-t-0">
        
        {/* Barre de dégradé supérieure signature */}
        <div className="w-full h-1.5 bg-gradient-to-r from-fuchsia-600 via-purple-500 to-gaming-gold" />

        <div className="p-6 sm:p-10 flex flex-col items-center">
          <DialogHeader className="w-full flex flex-col items-center text-center space-y-4">
            
            {/* Icône dynamique avec halo de couleur */}
            <div className="relative flex justify-center">
              <div className={cn(
                "absolute inset-0 blur-2xl opacity-20 animate-pulse rounded-full",
                isUnblock ? "bg-emerald-500" : "bg-red-500"
              )} />
              <div className={cn(
                "relative w-16 h-16 rounded-2xl border flex items-center justify-center shadow-lg transition-colors duration-500",
                isUnblock 
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                  : "bg-red-500/10 border-red-500/50 text-red-400"
              )}>
                {isUnblock ? <Unlock className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
              </div>
            </div>

            <div className="space-y-3 w-full flex flex-col items-center">
              <DialogTitle className={cn(
                "text-xl sm:text-2xl font-black uppercase tracking-tighter drop-shadow-md text-center",
                isUnblock ? "text-emerald-400" : "text-red-400"
              )}>
                {isUnblock ? t("block_modal.title_unblock") : t("block_modal.title_block")}
              </DialogTitle>

              <DialogDescription className="text-fuchsia-200/70 text-sm sm:text-base leading-relaxed text-center max-w-[320px] sm:max-w-none">
                {target ? (
                  <Trans 
                    i18nKey={isUnblock ? "block_modal.desc_unblock" : "block_modal.desc_block"}
                    values={{ item: itemLabel, name: playerName }}
                  >
                    Voulez-vous actionner <span className="text-white font-bold italic">item</span> pour <span className="text-gaming-gold font-black">name</span> ?
                  </Trans>
                ) : (
                  t("wishlist.modal_desc")
                )}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Boutons symétriques et centrés */}
          <div className="flex flex-col sm:flex-row items-center justify-center mt-8 gap-3 sm:gap-4 w-full">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-1/2 order-2 sm:order-1 text-fuchsia-300/50 hover:text-white hover:bg-fuchsia-500/10 font-bold uppercase tracking-widest text-xs py-6 sm:py-2"
            >
              {t("block_modal.btn_cancel")}
            </Button>

            <Button
              onClick={async () => {
                await onConfirm();
                onOpenChange(false);
              }}
              className={cn(
                "w-full sm:w-1/2 order-1 sm:order-2 font-black py-6 sm:py-2 h-auto sm:h-10 uppercase tracking-wide border-b-2 active:translate-y-0.5 transition-all text-xs sm:text-sm flex justify-center items-center gap-2 shadow-lg",
                isUnblock 
                  ? "bg-emerald-600 border-emerald-800 hover:bg-emerald-500 text-white shadow-emerald-900/20" 
                  : "bg-red-600 border-red-800 hover:bg-red-500 text-white shadow-red-900/20"
              )}
            >
              {isUnblock ? t("block_modal.btn_unblock") : t("block_modal.btn_block")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockModal;