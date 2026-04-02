import { Button } from "@/components/ui/button";
import { ShieldAlert, ScrollText} from "lucide-react";
import { useTranslation } from "react-i18next";

const Header = ({ onUnlockAll, onOpenHistory }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-fuchsia-500/20 pb-8 mb-6">
      <div className="space-y-1">
        {/* Titre Gold inchangé car il claque déjà bien */}
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter bg-gradient-gold bg-clip-text text-transparent drop-shadow-sm">
          {t("admin_header.title")}
        </h1>
        
        {/* Sous-titre avec une touche de violet pour l'harmonie */}
        <p className="text-fuchsia-400/60 font-medium flex items-center gap-2 text-sm md:text-base">
          <span className="w-8 h-[1px] bg-gaming-gold/30 hidden sm:block"></span>
          {t("admin_header.subtitle")}
        </p>
      </div>

      <Button
        onClick={onUnlockAll}
        variant="outline"
        className="group relative border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300 gap-2 px-6 py-6 h-auto font-bold uppercase tracking-widest text-xs w-full md:w-auto"
      >
        {/* Lueur rouge au survol uniquement */}
        <div className="absolute inset-0 bg-red-500/10 blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
        
        <ShieldAlert className="h-4 w-4 transition-transform group-hover:scale-110 relative z-10" />
        <span className="relative z-10">{t("admin_header.reset_all")}</span>
      </Button>

      <Button
        onClick={onOpenHistory}
        variant="outline"
        className="group relative border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-500 hover:bg-fuchsia-600 hover:text-white transition-all duration-300 gap-2 px-6 py-6 h-auto font-bold uppercase tracking-widest text-xs w-full md:w-auto"
      >
        {/* Lueur violet au survol uniquement */}
        <div className="absolute inset-0 bg-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-500 hover:bg-fuchsia-600 hover:text-white transition-all opacity-0 group-hover:opacity-100" />
        
        <ScrollText className="h-4 w-4 transition-transform group-hover:scale-110 relative z-10" />
        <span className="relative z-10">{t("admin_header.history")}</span>
      </Button>
    </div>
  );
};

export default Header;