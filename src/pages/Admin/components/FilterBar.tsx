import { Button } from "@/components/ui/button";
import { Swords, Shield, Gem, Skull, X, Filter, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useState } from "react";

const FilterBar = ({
  selectedFilter,
  setSelectedFilter,
  armes,
  armures,
  accessoires,
  archbosses,
  isArchbossEnabled = true // Ajout de la prop
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "fr" | "en";
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const categories = [
    { 
      id: "arme", 
      label: t("filter.weapons", "Armes"), 
      icon: <Swords className="h-4 w-4" />, 
      items: armes, 
      color: "text-amber-400", 
      border: "border-amber-500/30",
      itemStyle: "text-white-100/90 hover:text-amber-300 hover:border-amber-500/40 bg-amber-500/5"
    },
    { 
      id: "armure", 
      label: t("filter.armors", "Armures"), 
      icon: <Shield className="h-4 w-4" />, 
      items: armures, 
      color: "text-blue-400", 
      border: "border-blue-500/30",
      itemStyle: "text-white-100/90 hover:text-blue-300 hover:border-blue-500/40 bg-blue-500/5"
    },
    { 
      id: "accessoire", 
      label: t("filter.accessories", "Accessoires"), 
      icon: <Gem className="h-4 w-4" />, 
      items: accessoires, 
      color: "text-fuchsia-400", 
      border: "border-fuchsia-500/30",
      itemStyle: "text-white-100/90 hover:text-fuchsia-300 hover:border-fuchsia-500/40 bg-fuchsia-500/5"
    }
  ];

  // Ajout conditionnel de l'onglet Archboss
  if (isArchbossEnabled) {
    categories.push({ 
      id: "archboss", 
      label: t("filter.archbosses", "Archboss"), 
      icon: <Skull className="h-4 w-4" />, 
      items: archbosses, 
      color: "text-rose-500", 
      border: "border-rose-500/30",
      itemStyle: "text-white-100/90 hover:text-rose-300 hover:border-rose-500/40 bg-rose-500/5"
    });
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 shadow-sm">
          <Filter className="h-3 w-3 text-fuchsia-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
            {t("filter.label", "Filtres")}
          </span>
        </div>

        <div className="flex bg-[#1e1333]/80 p-1 rounded-xl border border-white/10 backdrop-blur-md shadow-lg flex-wrap sm:flex-nowrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(activeTab === cat.id ? null : cat.id)}
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest relative",
                activeTab === cat.id
                  ? `bg-white/10 ${cat.color} ${cat.border} shadow-[0_0_20px_rgba(0,0,0,0.3)]`
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              {cat.icon}
              <span className="hidden sm:inline">{cat.label}</span>
              {activeTab === cat.id && (
                <ChevronDown className="h-3 w-3 ml-1 animate-bounce" />
              )}
            </button>
          ))}
        </div>

        {selectedFilter && (
          <Button 
            variant="ghost" 
            onClick={() => { setSelectedFilter(""); setActiveTab(null); }}
            className="h-10 px-4 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white rounded-xl border border-red-500/30 gap-2 text-[10px] font-black uppercase tracking-widest transition-all animate-in zoom-in-95"
          >
            <X className="h-4 w-4" />
            <span className="hidden xs:inline">{t("filter.reset", "Reset")}</span>
          </Button>
        )}
      </div>

      {activeTab && (
        <div className="p-4 bg-[#1a1129] border border-fuchsia-500/20 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden">
          <div className={cn(
            "absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-b from-transparent to-black",
            categories.find(c => c.id === activeTab)?.id === "arme" ? "bg-amber-500/10" : 
            categories.find(c => c.id === activeTab)?.id === "armure" ? "bg-blue-500/10" : 
            categories.find(c => c.id === activeTab)?.id === "accessoire" ? "bg-fuchsia-500/10" : "bg-rose-500/10"
          )} />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 relative z-10">
            {categories.find(c => c.id === activeTab)?.items?.map((item) => {
              const name = item.name[lang] || item.name['fr'];
              const isSelected = selectedFilter === name;
              const currentCat = categories.find(c => c.id === activeTab);
              
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedFilter(isSelected ? "" : name)}
                  className={cn(
                    "px-4 py-3.5 rounded-xl text-[11px] font-black transition-all border text-left flex items-center justify-between shadow-sm",
                    "uppercase tracking-tight leading-tight",
                    isSelected
                      ? "bg-gaming-gold border-white text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-[1.03] z-20"
                      : cn("bg-black/40 border-white/10", currentCat?.itemStyle)
                  )}
                >
                  <span className="line-clamp-2">{name}</span>
                  {isSelected && <div className="w-2 h-2 bg-black rounded-full animate-pulse ml-2 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;