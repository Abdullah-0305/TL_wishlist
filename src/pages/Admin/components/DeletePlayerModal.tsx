import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { deletePlayer } from "@/api/db";
import { useTranslation, Trans } from "react-i18next";
import { UserX, AlertTriangle } from "lucide-react";

const DeletePlayerModal = ({ open, onOpenChange, player, loadPlayers }) => {
  const { t } = useTranslation();
  const [inputName, setInputName] = useState("");

  useEffect(() => {
    if (!open) setInputName("");
  }, [open]);

  if (!player) return null;

  const confirmDelete = async () => {
    if (inputName !== player.name) {
      toast.error(t("delete_player.error_mismatch"));
      return;
    }

    try {
      await deletePlayer(player.id);
      toast.success(t("delete_player.success", { name: player.name }));
      onOpenChange(false);
      loadPlayers();
    } catch (err) {
      console.error(err);
      toast.error(t("admin.action_error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e1333] border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)] w-[95vw] sm:max-w-[440px] p-0 overflow-hidden border-t-0">
        
        {/* Barre de dégradé supérieure signature */}
        <div className="w-full h-1.5 bg-gradient-to-r from-red-600 via-fuchsia-500 to-gaming-gold" />

        <div className="p-6 sm:p-10 flex flex-col items-center">
          <DialogHeader className="w-full flex flex-col items-center text-center space-y-4">
            
            {/* Icône Danger Centrée */}
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse rounded-full" />
              <div className="relative w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/50 flex items-center justify-center text-red-500 shadow-lg">
                <UserX className="h-8 w-8" />
              </div>
            </div>

            <div className="space-y-3 w-full flex flex-col items-center">
              <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white drop-shadow-md text-center">
                {t("delete_player.title")}
              </DialogTitle>

              <DialogDescription className="text-fuchsia-200/70 text-sm sm:text-base leading-relaxed text-center max-w-[320px] sm:max-w-none">
                <Trans i18nKey="delete_player.warning" values={{ name: player.name }}>
                  Action critique. Tapez <span className="text-white font-bold italic">name</span> pour confirmer.
                </Trans>
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Input de confirmation centré */}
          <div className="w-full mt-6">
            <Input
              type="text"
              className="bg-black/40 border-fuchsia-500/20 focus:border-red-500 text-white text-center font-bold placeholder:text-zinc-600 h-12"
              placeholder={t("delete_player.placeholder")}
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Boutons symétriques 50/50 */}
          <div className="flex flex-col sm:flex-row items-center justify-center mt-8 gap-3 sm:gap-4 w-full">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-1/2 order-2 sm:order-1 text-fuchsia-300/50 hover:text-white hover:bg-fuchsia-500/10 font-bold uppercase tracking-widest text-xs py-6 sm:py-2"
            >
              {t("add_player_modal.btn_cancel")}
            </Button>

            <Button 
              disabled={inputName !== player.name}
              onClick={confirmDelete}
              className="w-full sm:w-1/2 order-1 sm:order-2 bg-red-600 border-b-2 border-red-800 hover:bg-red-500 text-white font-black py-6 sm:py-2 h-auto sm:h-10 uppercase tracking-wide active:translate-y-0.5 transition-all text-xs sm:text-sm flex justify-center items-center gap-2 shadow-lg shadow-red-900/20 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed" 
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="truncate">{t("delete_player.btn_confirm")}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePlayerModal;