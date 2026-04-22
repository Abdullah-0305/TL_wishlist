import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshCw, Target, Swords, Shield, Gem, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BossCountsProps {
  bossCounts: {
    armes: [string, number][];
    armures: [string, number][];
    accessoires: [string, number][];
    archbosses: [string, number][];
  };
  selectedBoss: string | null;
  onBossClick: (boss: string) => void;
  onReset: () => void;
}

const BossCounts: React.FC<BossCountsProps> = ({
  bossCounts,
  selectedBoss,
  onBossClick,
  onReset
}) => {
  const { t } = useTranslation();

  const sections = [
    { 
      label: t("boss_counts.weapons", "Armes"), 
      data: bossCounts.armes, 
      color: "text-amber-400", 
      icon: <Swords className="h-4 w-4" />,
      glow: "group-hover:shadow-[0_0_15px_rgba(251,191,36,0.3)]"
    },
    { 
      label: t("boss_counts.armors", "Armures"), 
      data: bossCounts.armures, 
      color: "text-blue-400", 
      icon: <Shield className="h-4 w-4" />,
      glow: "group-hover:shadow-[0_0_15px_rgba(96,165,250,0.3)]"
    },
    { 
      label: t("boss_counts.accessories", "Accessoires"), 
      data: bossCounts.accessoires, 
      color: "text-fuchsia-400", 
      icon: <Gem className="h-4 w-4" />,
      glow: "group-hover:shadow-[0_0_15px_rgba(217,70,239,0.3)]"
    },
    { 
      label: t("boss_counts.archbosses", "Archboss"), 
      data: bossCounts.archbosses, 
      color: "text-rose-500", 
      icon: <Skull className="h-4 w-4" />,
      glow: "group-hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]"
    },
  ];

  return (
    <div className="space-y-6 mb-10">
      <div className="flex items-center justify-between border-b border-fuchsia-500/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-fuchsia-500/10 rounded-lg border border-fuchsia-500/30">
            <Target className="h-5 w-5 text-fuchsia-500" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-white">
            {t("boss_counts.main_title", "Objectifs du Raid")}
          </h3>
        </div>
        
        {selectedBoss && (
          <Button
            variant="ghost"
            onClick={onReset}
            className="text-[10px] uppercase tracking-widest font-black h-8 text-fuchsia-400 hover:text-white hover:bg-fuchsia-500/20 gap-2 transition-all animate-in fade-in slide-in-from-right-4 border border-fuchsia-500/30"
          >
            <RefreshCw className="h-3 w-3" />
            {t("boss_counts.reset_filter", "Réinitialiser")}
          </Button>
        )}
      </div>

      {/* MODIFIÉ : grid-cols-4 sur grand écran pour aligner les 4 blocs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section) => (
          <div
            key={section.label}
            className={`group flex flex-col bg-[#1e1333]/60 backdrop-blur-xl border border-fuchsia-500/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:border-fuchsia-500/30 ${section.glow}`}
          >
            <div className="px-4 py-3 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
              <h4 className={cn("font-black text-[10px] uppercase tracking-[0.2em]", section.color)}>
                {section.label}
              </h4>
              <div className={cn("opacity-50", section.color)}>
                {section.icon}
              </div>
            </div>

            <div className="p-4 flex-grow">
              {section.data?.length === 0 ? (
                <div className="text-[10px] text-fuchsia-300/30 uppercase tracking-widest italic py-4 text-center">
                  {t("boss_counts.no_boss", "Aucun objectif")}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {section.data?.map(([boss, count]) => {
                    const isActive = selectedBoss === boss;

                    return (
                      <button
                        key={boss}
                        onClick={() => onBossClick(boss)}
                        className={cn(
                          "group/item w-full flex justify-between items-center text-xs px-3 py-2.5 rounded-xl transition-all duration-300 border",
                          isActive
                            ? "bg-gradient-to-r from-fuchsia-600 to-purple-700 border-gaming-gold text-white shadow-lg shadow-fuchsia-900/40 translate-x-1"
                            : "bg-black/20 border-white/5 text-fuchsia-100/70 hover:bg-fuchsia-500/10 hover:border-fuchsia-500/40 hover:text-white"
                        )}
                      >
                        <span className="font-bold tracking-tight truncate pr-2 uppercase italic">
                          {boss}
                        </span>
                        <span
                          className={cn(
                            "flex items-center justify-center min-w-[28px] h-6 px-2 rounded-lg text-[10px] font-black transition-all",
                            isActive 
                              ? "bg-gaming-gold text-black shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
                              : "bg-fuchsia-950/50 text-fuchsia-400 border border-fuchsia-500/20 group-hover/item:bg-fuchsia-500 group-hover/item:text-white"
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BossCounts;