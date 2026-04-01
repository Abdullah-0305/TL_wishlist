import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { toggleAdmin } from "@/api/db";
import { useTranslation, Trans } from "react-i18next";
import { UserPlus, UserMinus, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react"; 
import { cn } from "@/lib/utils"; // Ajout de cn pour simplifier les classes dynamiques

interface NewAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any; 
  loadPlayers: () => Promise<void>; 
}

const NewAdminModal: React.FC<NewAdminModalProps> = ({ open, onOpenChange, player , loadPlayers}) => {
    const { t } = useTranslation();
    const [inputName, setInputName] = useState("");
  
    useEffect(() => {
      if (!open) setInputName("");
    }, [open]);
  
    if (!player) return null;

    // --- VARIABLES DYNAMIQUES SELON LE MODE ---
    const isDemoting = player.is_admin; // True si on retire les droits

    const themeColors = {
      gradientBar: isDemoting ? "from-orange-600 via-red-500 to-rose-600" : "from-fuchsia-600 via-purple-500 to-gaming-gold",
      iconColor: isDemoting ? "text-red-500" : "text-gaming-gold",
      glowColor: isDemoting ? "bg-red-500" : "bg-gaming-gold",
      shadowBox: isDemoting ? "shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
      buttonBg: isDemoting ? "from-red-600 to-orange-600" : "from-gaming-gold to-fuchsia-600",
      focusRing: isDemoting ? "focus:border-red-500 focus:ring-red-500" : "focus:border-gaming-gold focus:ring-gaming-gold",
      particleColor: isDemoting ? "text-red-500/10" : "text-fuchsia-500/10",
      particleColor2: isDemoting ? "text-orange-500/10" : "text-gaming-gold/10",
    };

    const MainIcon = isDemoting ? UserMinus : UserPlus;
    const BtnIcon = isDemoting ? ShieldAlert : ShieldCheck;
  
    const confirmIsAdmin = async () => {
      if (inputName.trim() !== player.name) {
        toast.error(t("new_admin.error_mismatch", "Le nom ne correspond pas."));
        return;
      }
  
      try {
        await toggleAdmin(player.id, player.is_admin);
        const successMsg = isDemoting 
          ? t("new_admin.success_demote", `${player.name} n'est plus admin.`)
          : t("new_admin.success", { name: player.name });
        
        toast.success(successMsg);
        onOpenChange(false);
        await loadPlayers();
      } catch (err) {
        console.error(err);
        toast.error(t("new_admin.error_api", "Erreur lors de la modification."));
      }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#1e1333] border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] w-[95vw] sm:max-w-[480px] p-0 overflow-hidden border-t-0 animate-in fade-in-0 zoom-in-95 duration-300">
          
          {/* Barre de dégradé supérieure dynamique */}
          <div className={cn("w-full h-2 bg-gradient-to-r", themeColors.gradientBar)} />

          <div className="p-6 sm:p-10 flex flex-col items-center relative">
            
            {/* Particules décoratives */}
            <Sparkles className={cn("absolute top-10 right-10 h-20 w-20 pointer-events-none", themeColors.particleColor)} />
            <Sparkles className={cn("absolute bottom-10 left-10 h-16 w-16 pointer-events-none", themeColors.particleColor2)} />

            <DialogHeader className="w-full flex flex-col items-center text-center space-y-6 z-10">
              
              {/* Icône Centrale avec Lueur */}
              <div className="relative flex justify-center group">
                <div className={cn("absolute inset-0 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity rounded-full", themeColors.glowColor)} />
                <div className={cn("relative w-20 h-20 rounded-2xl bg-gradient-to-br from-black/80 to-black border-2 border-white/10 flex items-center justify-center transition-all", themeColors.shadowBox, themeColors.iconColor)}>
                  <MainIcon className="h-10 w-10 animate-pulse" />
                </div>
              </div>

              <div className="space-y-3 w-full flex flex-col items-center">
                <DialogTitle className={cn(
                  "text-2xl sm:text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text text-center leading-tight bg-gradient-to-b from-white",
                  isDemoting ? "to-red-500 drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]" : "to-gaming-gold drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]"
                )}>
                  {isDemoting ? t("new_admin.title_demote", "Rétrograder") : t("new_admin.title", "Nouvel Admin")}
                </DialogTitle>

              <DialogDescription className="text-zinc-300/80 text-sm sm:text-base leading-relaxed text-center max-w-[340px] sm:max-w-none font-medium">
                {isDemoting ? (
                  <Trans i18nKey="new_admin.description_demote" values={{ name: player.name }}>
                    Vous allez retirer les droits d'administration de <span className="text-white font-extrabold text-base px-1 bg-red-500/20 rounded">{player.name}</span>. Tapez son nom pour valider.
                  </Trans>
                ) : (
                  <Trans i18nKey="new_admin.description" values={{ name: player.name }}>
                    Vous allez élever <span className="text-white font-extrabold text-base px-1 bg-fuchsia-500/20 rounded">{player.name}</span> au rang de Co-Gestionnaire. Tapez son nom pour valider cette promotion.
                  </Trans>
                )}
              </DialogDescription>
              </div>
            </DialogHeader>

            {/* Input de confirmation */}
            <div className="w-full mt-8 relative group z-10">
              <div className={cn("absolute -inset-0.5 rounded-xl blur opacity-10 group-focus-within:opacity-30 transition duration-300", themeColors.glowColor)}></div>
              <Input
                type="text"
                className={cn("relative bg-black/50 border-white/10 text-white text-center font-bold placeholder:text-zinc-700 h-14 rounded-xl text-lg shadow-inner", themeColors.focusRing)}
                placeholder={player.name}
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row items-center justify-center mt-10 gap-3 sm:gap-5 w-full z-10">
              <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-1/2 order-2 sm:order-1 text-zinc-400 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs py-7 sm:py-3 rounded-xl transition-all"
              >
                {t("new_admin.btn_cancel", "Annuler")}
              </Button>

              <Button 
                disabled={inputName.trim() !== player.name}
                onClick={confirmIsAdmin}
                className={cn(
                  "w-full sm:w-1/2 order-1 sm:order-2 h-auto sm:h-12 py-7 sm:py-3 rounded-xl bg-gradient-to-r text-white font-black uppercase tracking-wider transition-all duration-300 text-sm flex justify-center items-center gap-2.5 shadow-lg disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed group",
                  themeColors.buttonBg
                )} 
              >
                <BtnIcon className="h-5 w-5 text-white group-hover:rotate-12 transition-transform" />
                <span className="truncate">
                  {isDemoting ? t("new_admin.btn_confirm_demote", "Rétrograder") : t("new_admin.btn_confirm", "Confirmer")}
                </span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
}

export default NewAdminModal;