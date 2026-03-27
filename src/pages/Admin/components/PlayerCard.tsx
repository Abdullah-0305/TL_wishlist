import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserCog, MoreVertical, Calendar } from "lucide-react";
import ItemRow from "./ItemRow";
import { useState, useRef, useEffect } from "react";
import DeletePlayerModal from "./DeletePlayerModal.tsx";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const PlayerCard = ({ player, openModal, openRemoveModal, togglePresence, loadPlayers }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "fr" | "en";
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedDate = player.date_last_looted_item
    ? new Date(player.date_last_looted_item).toLocaleString(lang === "fr" ? "fr-FR" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  return (
    <>
      <Card className={cn(
        "relative p-3 sm:p-4 transition-all duration-300 border border-fuchsia-500/30 bg-[#1e1333] shadow-[0_8px_32px_rgba(217,70,239,0.1)] group/card",
        player.isPresent 
          ? "ring-2 ring-gaming-gold border-gaming-gold bg-[#2a1a45] shadow-[0_0_25px_rgba(217,70,239,0.25)]" 
          : "hover:border-fuchsia-500/60"
      )}>
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-600 via-purple-500 to-gaming-gold rounded-t-xl" />

        {player.roleName && (
          <div
            className="absolute -top-3 -left-1 px-3 py-1 rounded-md text-[10px] sm:text-xs font-black text-white z-20 shadow-lg uppercase tracking-wider border border-white/20"
            style={{ 
              backgroundColor: player.roleColor || '#444',
              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0) 100%)',
              boxShadow: `0 4px 15px ${player.roleColor}88` 
            }}
          >
            {player.roleName[lang] || player.roleName['fr']}
          </div>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute right-2 top-3 p-2 rounded-full hover:bg-fuchsia-500/20 text-fuchsia-300 hover:text-gaming-gold transition-all z-20"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-2 top-11 bg-[#2d1b4d] shadow-2xl rounded-lg border border-fuchsia-500/40 z-30 w-48 overflow-hidden animate-in fade-in zoom-in-95"
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                setDeleteModalOpen(true);
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 transition font-bold"
            >
              {t("player_card.delete_player")}
            </button>
          </div>
        )}

        <CardHeader className="pb-4 pt-6">
          <div className="flex flex-col gap-4">
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                {/* --- AVATAR DU JOUEUR --- */}
                <div className="relative flex-shrink-0 group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative h-12 w-12 rounded-xl border border-white/10 overflow-hidden bg-zinc-900 flex items-center justify-center shadow-2xl">
                    {player.avatar_url ? (
                      <img 
                        src={player.avatar_url} 
                        alt={player.name} 
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = ""; }} // Fallback si URL morte
                      />
                    ) : (
                      <UserCog className="h-6 w-6 text-fuchsia-400" />
                    )}
                  </div>
                </div>

                <CardTitle className="text-xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {player.name}
                </CardTitle>
              </div>

              <label className="flex items-center gap-2 cursor-pointer group/pres">
                <span className={cn(
                  "text-[10px] uppercase font-black tracking-widest transition-colors",
                  player.isPresent ? "text-gaming-gold" : "text-fuchsia-400/50"
                )}>
                  {t("player_card.present")}
                </span>
                <input
                  type="checkbox"
                  checked={player.isPresent || false}
                  onChange={() => togglePresence(player.id)}
                  className="w-5 h-5 rounded border-fuchsia-500/50 bg-black/40 text-fuchsia-500 focus:ring-gaming-gold transition cursor-pointer"
                />
              </label>
            </div>

            <div className="h-[2px] w-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-gaming-gold opacity-50" />
            
            <CardDescription className="text-[11px] uppercase tracking-[0.2em] font-black text-fuchsia-300">
              {t("player_card.choices")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative">
          {/* On passe les dates de demande spécifiques à chaque ligne d'objet */}
          <ItemRow 
            type="arme" 
            player={player} 
            dateDemand={player.date_demand_arme} 
            openModal={openModal} 
            openRemoveModal={openRemoveModal} 
          />
          <ItemRow 
            type="armure" 
            player={player} 
            dateDemand={player.date_demand_armure} 
            openModal={openModal} 
            openRemoveModal={openRemoveModal} 
          />
          <ItemRow 
            type="accessoire" 
            player={player} 
            dateDemand={player.date_demand_accessoire} 
            openModal={openModal} 
            openRemoveModal={openRemoveModal} 
          />

          {formattedDate && (
            <div className="mt-4 pt-3 border-t border-fuchsia-500/20 flex items-center justify-between text-[10px] text-fuchsia-200/60 font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gaming-gold" />
                <span>{formattedDate}</span>
              </div>
              <span className="text-gaming-gold/50 tracking-tighter italic">Last Loot</span>
            </div>
          )}
        </CardContent>
      </Card>

      <DeletePlayerModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        player={player}
        loadPlayers={loadPlayers}
      />
    </>
  );
};

export default PlayerCard;