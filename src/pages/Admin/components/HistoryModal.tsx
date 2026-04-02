import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Import shadcn corrigé
import { getLootHistory } from "@/api/db";
import { useTranslation } from "react-i18next";
import { History, Swords, Shield, Gem, UserCircle, Calendar } from "lucide-react";

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Typage pour t'aider avec l'autocomplétion
interface LootHistoryItem {
  id: string;
  created_at: string;
  item_name_fr: string;
  item_name_en: string;
  item_type: "arme" | "armure" | "accessoire";
  player: { discord_name: string; avatar_url: string };
  admin: { discord_name: string };
}

const HistoryModal: React.FC<HistoryModalProps> = ({ open, onOpenChange }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] as "fr" | "en" || "fr";

  const [history, setHistory] = useState<LootHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // --- ÉTAPE 2 : FETCH DATA ---
  useEffect(() => {
    if (open) {
      const fetchHistory = async () => {
        setLoading(true);
        const data = await getLootHistory(50); // On limite aux 50 derniers pour les perfs
        setHistory(data as unknown as LootHistoryItem[]);
        setLoading(false);
      };
      fetchHistory();
    } else {
      // Optionnel : On vide l'historique quand on ferme pour forcer un rafraîchissement la prochaine fois
      setHistory([]); 
    }
  }, [open]);

  // --- PETITS HELPERS VISUELS ---
  const getIcon = (type: string) => {
    switch (type) {
      case "arme": return <Swords className="h-5 w-5 text-amber-400" />;
      case "armure": return <Shield className="h-5 w-5 text-purple-400" />;
      case "accessoire": return <Gem className="h-5 w-5 text-fuchsia-400" />;
      default: return <History className="h-5 w-5 text-zinc-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* J'ai élargi un peu le modal (max-w-[600px]) pour que la liste respire */}
      <DialogContent className="bg-[#1e1333] border-fuchsia-500/30 shadow-[0_0_50px_rgba(217,70,239,0.2)] w-[95vw] sm:max-w-[600px] p-0 overflow-hidden border-t-0 animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* Barre de dégradé supérieure */}
        <div className="w-full h-1.5 bg-gradient-to-r from-fuchsia-600 via-purple-500 to-gaming-gold" />

        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fuchsia-500/10 rounded-lg border border-fuchsia-500/30">
              <History className="h-5 w-5 text-fuchsia-500" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white">
                Historique des Loots
              </DialogTitle>
              <DialogDescription className="text-[10px] text-fuchsia-200/60 font-bold uppercase tracking-widest mt-1">
                Les 50 dernières distributions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* --- ÉTAPE 4 : LA LISTE --- */}
        {/* On met un scroll (overflow-y-auto) pour ne pas que le modal sorte de l'écran s'il y a 50 lignes */}
        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 italic text-sm">
              Aucun historique disponible pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-white/5 hover:border-fuchsia-500/30 transition-colors group">
                  
                  {/* Icône de l'Item */}
                  <div className="flex-shrink-0 p-2 bg-[#1e1333] rounded-lg border border-white/10 group-hover:border-white/20 transition-colors">
                    {getIcon(item.item_type)}
                  </div>

                  {/* Infos (Joueur + Item) */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.player?.avatar_url ? (
                        <img src={item.player.avatar_url} alt="avatar" className="w-4 h-4 rounded-full" />
                      ) : (
                        <UserCircle className="w-4 h-4 text-zinc-400" />
                      )}
                      <span className="text-sm font-bold text-white truncate">
                        {item.player?.discord_name || "Joueur Inconnu"}
                      </span>
                    </div>
                    <div className="text-xs text-fuchsia-300 truncate font-medium">
                      {lang === 'en' ? item.item_name_en : item.item_name_fr}
                    </div>
                  </div>

                  {/* Date & Admin */}
                  <div className="flex flex-col items-end flex-shrink-0 gap-1.5">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-gaming-gold/70 border border-gaming-gold/20 px-1.5 py-0.5 rounded bg-gaming-gold/5">
                      Par {item.admin?.discord_name || "Admin"}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;