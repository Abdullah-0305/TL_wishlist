import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, Swords, Shield, Gem, UserCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { 
  getPendingChangeRequests, 
  resolveChangeRequest, 
  getArmes, 
  getArmures, 
  getAccessoires 
} from "@/api/db";

interface ChangeRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataChanged: () => Promise<void>; // Pour rafraîchir la grille des joueurs derrière
}

const ChangeRequestsModal: React.FC<ChangeRequestsModalProps> = ({ open, onOpenChange, onDataChanged }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] as "fr" | "en" || "fr";

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Dictionnaires pour traduire les IDs en noms
  const [dictionaries, setDictionaries] = useState({
    armes: new Map(),
    armures: new Map(),
    accessoires: new Map()
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
      // On charge les requêtes ET les items en parallèle
      const [reqs, armesRes, armuresRes, accRes] = await Promise.all([
        getPendingChangeRequests(),
        getArmes(),
        getArmures(),
        getAccessoires()
      ]);

      const dict = {
        armes: new Map(armesRes.data?.map(i => [i.id.toString(), i.name])),
        armures: new Map(armuresRes.data?.map(i => [i.id.toString(), i.name])),
        accessoires: new Map(accRes.data?.map(i => [i.id.toString(), i.name]))
      };
      
      setDictionaries(dict);
      setRequests(reqs || []);
    } catch (error) {
      console.error(error);
      toast.error(t("admin.load_error", "Erreur lors du chargement des demandes."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadRequests();
    else setRequests([]);
  }, [open]);

  // Helpers visuels et de données
  const getIcon = (type: string) => {
    switch (type) {
      case "arme": return <Swords className="h-5 w-5 text-amber-400" />;
      case "armure": return <Shield className="h-5 w-5 text-purple-400" />;
      case "accessoire": return <Gem className="h-5 w-5 text-fuchsia-400" />;
      default: return null;
    }
  };

  const getItemName = (type: string, itemId: string | number | null | undefined) => {
    if (!itemId) return <span className="italic text-zinc-500">Aucun (Vide)</span>;
    
    let nameObj;
    if (type === "arme") nameObj = dictionaries.armes.get(itemId.toString());
    else if (type === "armure") nameObj = dictionaries.armures.get(itemId.toString());
    else if (type === "accessoire") nameObj = dictionaries.accessoires.get(itemId.toString());

    if (!nameObj) return <span className="italic text-zinc-500">Item inconnu</span>;
    return nameObj[lang] || nameObj.fr;
  };

  const handleResolve = async (req: any, status: "approved" | "rejected") => {
    try {
      setProcessingId(req.id);
      await resolveChangeRequest(req.id, status, req.player_id, req.item_type, req.new_item_id);
      
      toast.success(status === "approved" ? "Demande validée et wishlist mise à jour !" : "Demande refusée.");
      
      // On retire la requête de la liste visuelle et on met à jour l'admin grid
      setRequests(prev => prev.filter(r => r.id !== req.id));
      await onDataChanged();

      if (requests.length === 1) onOpenChange(false); // Si c'était la dernière, on ferme le modal
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'action.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1e1333] border-gaming-gold/30 shadow-[0_0_50px_rgba(251,191,36,0.15)] w-[95vw] sm:max-w-[600px] p-0 overflow-hidden border-t-0 animate-in fade-in-0 zoom-in-95 duration-300">
        
        <div className="w-full h-1.5 bg-gradient-to-r from-gaming-gold via-orange-500 to-red-500" />

        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gaming-gold/10 rounded-lg border border-gaming-gold/30">
              <RefreshCw className="h-5 w-5 text-gaming-gold" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gaming-gold">
                Demandes d'échange
              </DialogTitle>
              <DialogDescription className="text-[10px] text-fuchsia-200/60 font-bold uppercase tracking-widest mt-1">
                {requests.length} demande(s) en attente
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-gaming-gold/20 border-t-gaming-gold rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 italic text-sm">
              Aucune demande en attente.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                // On récupère l'ancien item depuis la wishlist actuelle du joueur
                const wishlist = req.player?.wishlist || {};
                const oldItemId = req.item_type === "arme" ? wishlist.id_arme : req.item_type === "armure" ? wishlist.id_armure : wishlist.id_accessoire;

                return (
                  <div key={req.id} className="flex flex-col gap-3 p-4 rounded-xl bg-black/40 border border-white/5 relative group">
                    
                    {/* Header: Joueur & Type */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        {req.player?.avatar_url ? (
                          <img src={req.player.avatar_url} alt="avatar" className="w-6 h-6 rounded-md object-cover" />
                        ) : (
                          <UserCircle className="w-6 h-6 text-zinc-400" />
                        )}
                        <span className="text-sm font-bold text-white uppercase tracking-wider">
                          {req.player?.discord_name || "Inconnu"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                        {getIcon(req.item_type)}
                        {req.item_type}
                      </div>
                    </div>

                    {/* Comparaison Ancien vs Nouveau */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 py-2">
                      <div className="flex-1 w-full text-center sm:text-right p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                        <span className="block text-[9px] uppercase tracking-widest text-red-400/70 mb-1 font-bold">Actuel</span>
                        <span className="text-xs font-semibold text-zinc-300 line-through decoration-red-500/50">
                          {getItemName(req.item_type, oldItemId)}
                        </span>
                      </div>

                      <ArrowRight className="h-5 w-5 text-zinc-600 rotate-90 sm:rotate-0 flex-shrink-0" />

                      <div className="flex-1 w-full text-center sm:text-left p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                        <span className="block text-[9px] uppercase tracking-widest text-emerald-400/70 mb-1 font-bold">Demandé</span>
                        <span className="text-xs font-bold text-emerald-300">
                          {getItemName(req.item_type, req.new_item_id)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-2 pt-3 border-t border-white/5">
                      <Button
                        variant="ghost"
                        disabled={processingId === req.id}
                        onClick={() => handleResolve(req, "rejected")}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 uppercase tracking-widest text-[10px] font-black h-9"
                      >
                        <X className="h-4 w-4 mr-1.5" /> Refuser
                      </Button>
                      <Button
                        disabled={processingId === req.id}
                        onClick={() => handleResolve(req, "approved")}
                        className="flex-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 uppercase tracking-widest text-[10px] font-black h-9 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                      >
                        <Check className="h-4 w-4 mr-1.5" /> Accepter
                      </Button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRequestsModal;