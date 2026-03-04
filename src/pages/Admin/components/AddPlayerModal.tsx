import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { UserPlus, Key, ShieldCheck, Sparkles } from "lucide-react";

interface AddPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlayerAdded: (name: string, password: string) => void;
  loadPlayers: () => void;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  open,
  onOpenChange,
  onPlayerAdded,
  loadPlayers,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const previousOpen = useRef(false);

  useEffect(() => {
    if (previousOpen.current === true && open === false) {
      loadPlayers();
      setName("");
      setGeneratedPassword(null);
    }
    previousOpen.current = open;
  }, [open, loadPlayers]);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleAddPlayer = async () => {
    if (!name.trim()) {
      toast.error(t("add_player_modal.placeholder_name"));
      return;
    }

    const password = generatePassword();
    try {
      await onPlayerAdded(name.trim(), password);
      setGeneratedPassword(password);
      toast.success(t("add_player_modal.success_msg"));
    } catch (err) {
      toast.error(t("admin.action_error"));
    }
  };

  const isCreated = generatedPassword !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e1333] border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)] w-[95vw] sm:max-w-[460px] p-0 overflow-hidden border-t-0">
        
        {/* Barre de dégradé supérieure signature Néon Royal */}
        <div className="w-full h-1.5 bg-gradient-to-r from-fuchsia-600 via-purple-500 to-gaming-gold" />

        <div className="p-6 sm:p-10 flex flex-col items-center">
          <DialogHeader className="w-full flex flex-col items-center text-center space-y-4">
            
            {/* Icône Centrée avec Glow */}
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-fuchsia-500 blur-2xl opacity-20 animate-pulse rounded-full" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-purple-900/40 border border-fuchsia-500/50 flex items-center justify-center text-fuchsia-400 shadow-lg">
                {isCreated ? <ShieldCheck className="h-8 w-8 text-gaming-gold" /> : <UserPlus className="h-8 w-8" />}
                {isCreated && <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-gaming-gold animate-bounce" />}
              </div>
            </div>

            <div className="space-y-2 w-full flex flex-col items-center">
              <DialogTitle className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white drop-shadow-md text-center">
                {isCreated ? t("add_player_modal.title_created") : t("add_player_modal.title_add")}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="w-full mt-6">
            {!isCreated ? (
              <div className="space-y-4 w-full">
                <div className="space-y-2 flex flex-col items-center">
                  <Label htmlFor="name" className="text-fuchsia-300/70 uppercase text-[10px] font-black tracking-widest">
                    {t("add_player_modal.label_name")}
                  </Label>
                  <Input
                    id="name"
                    placeholder={t("add_player_modal.placeholder_name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black/40 border-fuchsia-500/20 focus:border-gaming-gold text-white text-center font-bold h-12"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full bg-black/40 border border-fuchsia-500/20 rounded-xl p-6 space-y-5 animate-in fade-in zoom-in-95">
                <div className="flex flex-col items-center border-b border-fuchsia-500/10 pb-3">
                  <span className="text-fuchsia-300/50 text-[10px] uppercase tracking-widest font-black mb-1">
                    {t("add_player_modal.label_name")}
                  </span>
                  <span className="text-white text-xl font-black">{name}</span>
                </div>
                
                <div className="space-y-2 flex flex-col items-center">
                  <span className="text-gaming-gold/70 text-[10px] uppercase font-black flex items-center gap-1 tracking-widest">
                    <Key className="h-3 w-3" /> {t("add_player_modal.password_label")}
                  </span>
                  <div className="w-full bg-fuchsia-950/30 p-4 rounded-lg border border-gaming-gold/30 text-center font-mono text-2xl text-gaming-gold tracking-[0.2em] shadow-inner select-all">
                    {generatedPassword}
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 italic text-center leading-relaxed px-4">
                  {t("add_player_modal.password_warning")}
                </p>
              </div>
            )}
          </div>

          {/* Boutons Symétriques 50/50 */}
          <div className="flex flex-col sm:flex-row items-center justify-center mt-8 gap-3 sm:gap-4 w-full">
            {!isCreated ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => onOpenChange(false)} 
                  className="w-full sm:w-1/2 order-2 sm:order-1 text-fuchsia-300/50 hover:text-white hover:bg-fuchsia-500/10 font-bold uppercase tracking-widest text-xs py-6 sm:py-2"
                >
                  {t("add_player_modal.btn_cancel")}
                </Button>
                <Button 
                  onClick={handleAddPlayer} 
                  className="w-full sm:w-1/2 order-1 sm:order-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-black py-6 sm:py-2 h-auto sm:h-10 uppercase tracking-wide border-b-2 border-fuchsia-900/50 active:translate-y-0.5 transition-all text-xs sm:text-sm shadow-lg shadow-fuchsia-900/20"
                >
                  {t("add_player_modal.btn_create")}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => onOpenChange(false)} 
                className="w-full bg-gaming-gold text-black font-black py-6 sm:py-2 h-auto sm:h-10 uppercase tracking-widest text-xs shadow-glow-gold hover:bg-white transition-all"
              >
                {t("wishlist.confirm")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlayerModal;