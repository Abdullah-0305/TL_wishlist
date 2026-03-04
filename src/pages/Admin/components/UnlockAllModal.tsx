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
import { Flame, AlertOctagon, RotateCcw } from "lucide-react";

export interface UnlockAllTarget {
  playerId: string;
  playerName?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  target: UnlockAllTarget | null;
}

const UnlockAllModal: React.FC<Props> = ({ open, onOpenChange, onConfirm, target }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e1333] border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)] w-[95vw] sm:max-w-[440px] p-0 overflow-hidden border-t-0">
        
        {/* Barre de dégradé supérieure Danger Néon */}
        <div className="w-full h-1.5 bg-gradient-to-r from-red-600 via-fuchsia-500 to-gaming-gold" />

        <div className="p-6 sm:p-10 flex flex-col items-center">
          <DialogHeader className="w-full flex flex-col items-center text-center space-y-4">
            
            {/* Icône de réinitialisation avec halo Néon */}
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse rounded-full" />
              <div className="relative w-20 h-20 rounded-2xl bg-red-600/10 border border-red-600/50 flex items-center justify-center text-red-500 rotate-3">
                <RotateCcw className="h-10 w-10 animate-[spin_6s_linear_infinite]" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1.5 rounded-lg border-2 border-[#1e1333]">
                <AlertOctagon className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-3 w-full flex flex-col items-center">
              <DialogTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-red-500 italic drop-shadow-md">
                {t("unlock_all_modal.title")}
              </DialogTitle>

              <DialogDescription className="text-fuchsia-200/70 text-sm sm:text-base leading-relaxed text-center max-w-[320px] sm:max-w-none">
                {target ? (
                  <Trans 
                    i18nKey="unlock_all_modal.desc_single"
                    values={{ name: target.playerName || target.playerId }}
                  >
                    Voulez-vous réinitialiser entièrement la fiche de <span className="text-white font-bold">name</span> ?
                  </Trans>
                ) : (
                  <span className="block border border-red-500/30 bg-red-500/10 p-4 rounded-xl text-red-400 text-xs sm:text-sm font-bold uppercase tracking-tight italic">
                    {t("unlock_all_modal.desc_all")}
                  </span>
                )}
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Boutons symétriques 50/50 centrés */}
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
              className="w-full sm:w-1/2 order-1 sm:order-2 bg-red-600 border-b-2 border-red-800 hover:bg-red-500 text-white font-black py-6 sm:py-2 h-auto sm:h-10 shadow-lg shadow-red-900/20 gap-2 uppercase tracking-wide active:translate-y-0.5 transition-all text-xs sm:text-sm flex justify-center items-center"
            >
              <Flame className="h-4 w-4" />
              <span className="truncate">{t("unlock_all_modal.btn_confirm")}</span>
            </Button>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnlockAllModal;