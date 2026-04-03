import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, Swords, Shield, Gem, UserCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { 
  getPendingChangeRequests, 
  resolveChangeRequest, 
  getArmes, 
  getArmures, 
  getAccessoires 
} from "@/api/db";

interface ChangeRequestsTabProps {
  onDataChanged: () => Promise<void>;
}

const ChangeRequestsTab: React.FC<ChangeRequestsTabProps> = ({ onDataChanged }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] as "fr" | "en" || "fr";

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [dictionaries, setDictionaries] = useState({
    armes: new Map(),
    armures: new Map(),
    accessoires: new Map()
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
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

  // Charge directement quand on affiche l'onglet
  useEffect(() => {
    loadRequests();
  }, []);

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
      
      setRequests(prev => prev.filter(r => r.id !== req.id));
      await onDataChanged(); // On met à jour l'état de l'Admin en background
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'action.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-[#1e1333]/80 border border-gaming-gold/30 rounded-2xl shadow-[0_0_50px_rgba(251,191,36,0.1)] overflow-hidden animate-in fade-in-0 duration-300 relative">
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gaming-gold via-orange-500 to-red-500" />

      <div className="p-6 md:p-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gaming-gold/10 rounded-xl border border-gaming-gold/30">
            <RefreshCw className="h-6 w-6 text-gaming-gold" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gaming-gold drop-shadow-md">
              Demandes d'échange
            </h2>
            <p className="text-xs md:text-sm text-gaming-gold/60 font-bold uppercase tracking-widest mt-1">
              {requests.length} demande(s) en attente
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gaming-gold/20 border-t-gaming-gold rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 italic text-sm md:text-base border border-dashed border-white/10 rounded-xl bg-black/20">
            Aucune demande en attente pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => {
              const wishlist = req.player?.wishlist || {};
              const oldItemId = req.item_type === "arme" ? wishlist.id_arme : req.item_type === "armure" ? wishlist.id_armure : wishlist.id_accessoire;

              return (
                <div key={req.id} className="flex flex-col gap-4 p-5 rounded-xl bg-black/40 border border-white/5 relative group hover:border-gaming-gold/30 transition-all shadow-xl">
                  
                  {/* Header: Joueur & Type */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      {req.player?.avatar_url ? (
                        <img src={req.player.avatar_url} alt="avatar" className="w-8 h-8 rounded-md object-cover ring-2 ring-white/10" />
                      ) : (
                        <UserCircle className="w-8 h-8 text-zinc-400" />
                      )}
                      <span className="text-sm md:text-base font-bold text-white uppercase tracking-wider">
                        {req.player?.discord_name || "Inconnu"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-zinc-300">
                      {getIcon(req.item_type)}
                      {req.item_type}
                    </div>
                  </div>

                  {/* Comparaison Ancien vs Nouveau */}
                  <div className="flex flex-col gap-3 py-2 flex-grow">
                    <div className="w-full text-left p-3 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-red-400/70 font-bold">Actuel</span>
                      <span className="text-sm font-semibold text-zinc-400 line-through decoration-red-500/50 max-w-[60%] truncate text-right">
                        {getItemName(req.item_type, oldItemId)}
                      </span>
                    </div>

                    <div className="flex justify-center -my-3 relative z-10">
                      <div className="bg-[#1e1333] p-1 rounded-full border border-white/10">
                         <ArrowRight className="h-5 w-5 text-zinc-500 rotate-90" />
                      </div>
                    </div>

                    <div className="w-full text-left p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)] flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-emerald-400/70 font-bold">Nouveau</span>
                      <span className="text-sm font-bold text-emerald-300 max-w-[60%] truncate text-right">
                        {getItemName(req.item_type, req.new_item_id)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto pt-4 border-t border-white/5">
                    <Button
                      variant="ghost"
                      disabled={processingId === req.id}
                      onClick={() => handleResolve(req, "rejected")}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 uppercase tracking-widest text-xs font-black h-10"
                    >
                      <X className="h-4 w-4 mr-2" /> Refuser
                    </Button>
                    <Button
                      disabled={processingId === req.id}
                      onClick={() => handleResolve(req, "approved")}
                      className="flex-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 uppercase tracking-widest text-xs font-black h-10 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    >
                      <Check className="h-4 w-4 mr-2" /> Accepter
                    </Button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangeRequestsTab;