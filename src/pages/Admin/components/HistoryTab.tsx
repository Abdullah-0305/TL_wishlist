import React, { useState, useEffect } from "react";
import { getLootHistory } from "@/api/db";
import { useTranslation } from "react-i18next";
import { ScrollText, Swords, Shield, Gem, UserCircle, Calendar } from "lucide-react";

interface LootHistoryItem {
  id: string;
  created_at: string;
  item_name_fr: string;
  item_name_en: string;
  item_type: "arme" | "armure" | "accessoire";
  player: { discord_name: string; avatar_url: string };
  admin: { discord_name: string };
}

const HistoryTab: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] as "fr" | "en" || "fr";

  const [history, setHistory] = useState<LootHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Le chargement s'effectue automatiquement au montage du composant
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const data = await getLootHistory(50);
      setHistory(data as unknown as LootHistoryItem[]);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "arme": return <Swords className="h-5 w-5 text-amber-400" />;
      case "armure": return <Shield className="h-5 w-5 text-blue-400" />;
      case "accessoire": return <Gem className="h-5 w-5 text-fuchsia-400" />;
      default: return <ScrollText className="h-5 w-5 text-zinc-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-[#1e1333]/80 border border-fuchsia-500/30 rounded-2xl shadow-[0_0_50px_rgba(217,70,239,0.1)] overflow-hidden animate-in fade-in-0 duration-300 relative">
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 via-purple-500 to-gaming-gold" />

      <div className="p-6 md:p-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/30">
            <ScrollText className="h-6 w-6 text-fuchsia-500" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white drop-shadow-md">
              Historique des Loots
            </h2>
            <p className="text-xs md:text-sm text-fuchsia-200/60 font-bold uppercase tracking-widest mt-1">
              Les 50 dernières distributions
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 italic text-sm md:text-base border border-dashed border-white/10 rounded-xl bg-black/20">
            Aucun historique disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-fuchsia-500/30 hover:bg-white/5 transition-all group">
                
                <div className="flex-shrink-0 p-3 bg-[#1e1333] rounded-lg border border-white/10 group-hover:border-white/20 transition-colors shadow-inner">
                  {getIcon(item.item_type)}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.player?.avatar_url ? (
                      <img src={item.player.avatar_url} alt="avatar" className="w-5 h-5 rounded-full ring-2 ring-white/10" />
                    ) : (
                      <UserCircle className="w-5 h-5 text-zinc-400" />
                    )}
                    <span className="text-sm font-bold text-white truncate">
                      {item.player?.discord_name || "Joueur Inconnu"}
                    </span>
                  </div>
                  <div className="text-sm text-fuchsia-300 truncate font-medium">
                    {lang === 'en' ? item.item_name_en : item.item_name_fr}
                  </div>
                </div>

                <div className="flex flex-col items-end flex-shrink-0 gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium bg-black/30 px-2 py-1 rounded-md">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-gaming-gold/70 border border-gaming-gold/20 px-2 py-0.5 rounded bg-gaming-gold/5">
                    Par {item.admin?.discord_name || "Admin"}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryTab;