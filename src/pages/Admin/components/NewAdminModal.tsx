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
import { updateAdmin } from "@/api/db";
import { useTranslation, Trans } from "react-i18next";
import { UserPlus, ShieldCheck, Sparkles } from "lucide-react"; // Nouvelles icônes

interface NewAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any; // Ajuste le type selon ton interface Player
  loadPlayers: () => Promise<void>; // Correction faute de frappe
}

const NewAdminModal: React.FC<NewAdminModalProps> = ({ open, onOpenChange, player , loadPlayers}) => {
    const { t } = useTranslation();
    const [inputName, setInputName] = useState("");
  
    useEffect(() => {
      if (!open) setInputName("");
    }, [open]);
  
    if (!player) return null;
  
    const confirmIsAdmin = async () => {
      // Sécurité supplémentaire : trim pour éviter les espaces accidentels
      if (inputName.trim() !== player.name) {
        toast.error(t("new_admin.error_mismatch"));
        return;
      }
  
      try {
        await updateAdmin(player.id);
        toast.success(t("new_admin.success", { name: player.name }));
        onOpenChange(false);
        loadPlayers();
      } catch (err) {
        console.error(err);
        toast.error(t("new_admin.error_api"));
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#1e1333] border-gaming-gold/30 shadow-[0_0_50px_rgba(217,70,239,0.2)] w-[95vw] sm:max-w-[480px] p-0 overflow-hidden border-t-0 animate-in fade-in-0 zoom-in-95 duration-300">
          
          {/* Barre de dégradé supérieure signature : Fuchsia vers Or */}
          <div className="w-full h-2 bg-gradient-to-r from-fuchsia-600 via-purple-500 to-gaming-gold" />

          <div className="p-6 sm:p-10 flex flex-col items-center relative">
            
            {/* Particules décoratives en arrière-plan */}
            <Sparkles className="absolute top-10 right-10 h-20 w-20 text-fuchsia-500/10 pointer-events-none" />
            <Sparkles className="absolute bottom-10 left-10 h-16 w-16 text-gaming-gold/10 pointer-events-none" />

            <DialogHeader className="w-full flex flex-col items-center text-center space-y-6">
              
              {/* Icône Élévation Centrée avec Lueur Dorée */}
              <div className="relative flex justify-center group">
                <div className="absolute inset-0 bg-gaming-gold blur-3xl opacity-30 group-hover:opacity-50 transition-opacity rounded-full" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-fuchsia-950 to-black border-2 border-gaming-gold/50 flex items-center justify-center text-gaming-gold shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                  <UserPlus className="h-10 w-10 animate-pulse" />
                </div>
              </div>

              <div className="space-y-3 w-full flex flex-col items-center">
                <DialogTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gaming-gold drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)] text-center leading-tight">
                  {t("new_admin.title")}
                </DialogTitle>

                <DialogDescription className="text-fuchsia-100/80 text-sm sm:text-base leading-relaxed text-center max-w-[340px] sm:max-w-none font-medium">
                  <Trans i18nKey="new_admin.description" values={{ name: player.name }}>
                    Vous allez élever <span className="text-white font-extrabold text-base px-1 bg-fuchsia-500/20 rounded">name</span> au rang de Co-Gestionnaire. Tapez son nom pour valider cette promotion.
                  </Trans>
                </DialogDescription>
              </div>
            </DialogHeader>

            {/* Input de confirmation centré avec bordure Gold au focus */}
            <div className="w-full mt-8 relative group">
              <div className="absolute -inset-0.5 bg-gaming-gold rounded-xl blur opacity-10 group-focus-within:opacity-30 transition transition-duration-300"></div>
              <Input
                type="text"
                className="relative bg-black/50 border-fuchsia-500/30 focus:border-gaming-gold focus:ring-gaming-gold text-white text-center font-bold placeholder:text-zinc-700 h-14 rounded-xl text-lg shadow-inner"
                placeholder={player.name}
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Boutons symétriques Fuchsia/Gold */}
            <div className="flex flex-col sm:flex-row items-center justify-center mt-10 gap-3 sm:gap-5 w-full">
              <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-1/2 order-2 sm:order-1 text-fuchsia-300/60 hover:text-white hover:bg-fuchsia-500/15 font-bold uppercase tracking-widest text-xs py-7 sm:py-3 rounded-xl transition-all"
              >
                {t("new_admin.btn_cancel")}
              </Button>

              <Button 
                disabled={inputName.trim() !== player.name}
                onClick={confirmIsAdmin}
                className="w-full sm:w-1/2 order-1 sm:order-2 h-auto sm:h-12 py-7 sm:py-3 rounded-xl bg-gradient-to-r from-gaming-gold to-fuchsia-600 hover:from-white hover:to-white text-black font-black uppercase tracking-wider transition-all duration-300 text-sm flex justify-center items-center gap-2.5 shadow-[0_5px_20px_rgba(251,191,36,0.3)] disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed group" 
              >
                <ShieldCheck className="h-5 w-5 text-black group-hover:rotate-12 transition-transform" />
                <span className="truncate">{t("new_admin.btn_confirm")}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
}

export default NewAdminModal;