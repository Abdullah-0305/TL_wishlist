import { Button } from "@/components/ui/button";
import { ShieldAlert, ScrollText, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

const Header = ({ onUnlockAll, onOpenHistory, onOpenChangeRequest, requestCount = 0 }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-fuchsia-500/20 pb-8 mb-6">
      
      {/* --- ZONE TITRE --- */}
      <div className="space-y-1">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter bg-gradient-gold bg-clip-text text-transparent drop-shadow-sm">
          {t("admin_header.title")}
        </h1>
        <p className="text-fuchsia-400/60 font-medium flex items-center gap-2 text-sm md:text-base">
          <span className="w-8 h-[1px] bg-gaming-gold/30 hidden sm:block"></span>
          {t("admin_header.subtitle")}
        </p>
      </div>

      {/* --- ZONE BOUTONS D'ACTION --- */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
        
        {/* Bouton: Demandes (Gold) */}
        <div className="relative flex-1 sm:flex-none">
          <Button
            onClick={onOpenChangeRequest}
            variant="outline"
            className="group relative w-full border-gaming-gold/30 bg-gaming-gold/5 text-gaming-gold hover:bg-gaming-gold hover:text-black transition-all duration-300 gap-2 px-4 sm:px-6 py-5 h-auto font-bold uppercase tracking-widest text-xs"
          >
            <div className="absolute inset-0 bg-gaming-gold/20 blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 relative z-10" />
            <span className="relative z-10">{t("admin_header.requests", "Demandes")}</span>
          </Button>

          {/* LA PASTILLE (Badge) */}
          {requestCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 z-20">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border-2 border-[#0a0b10] text-[10px] font-black text-white items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                {requestCount}
              </span>
            </span>
          )}
        </div>

        {/* Bouton: Historique (Fuchsia) */}
        <Button
          onClick={onOpenHistory}
          variant="outline"
          className="group relative border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-500 hover:bg-fuchsia-600 hover:text-white transition-all duration-300 gap-2 px-4 sm:px-6 py-5 h-auto font-bold uppercase tracking-widest text-xs flex-1 sm:flex-none"
        >
          <div className="absolute inset-0 bg-fuchsia-500/20 blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
          <ScrollText className="h-4 w-4 transition-transform group-hover:scale-110 relative z-10" />
          <span className="relative z-10">{t("admin_header.history", "Historique")}</span>
        </Button>

        {/* Bouton: Reset (Rouge) */}
        <Button
          onClick={onUnlockAll}
          variant="outline"
          className="group relative border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300 gap-2 px-4 sm:px-6 py-5 h-auto font-bold uppercase tracking-widest text-xs w-full sm:w-auto mt-2 sm:mt-0"
        >
          <div className="absolute inset-0 bg-red-500/20 blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
          <ShieldAlert className="h-4 w-4 transition-transform group-hover:scale-110 relative z-10" />
          <span className="relative z-10">{t("admin_header.reset_all", "Reset")}</span>
        </Button>

      </div>
    </div>
  );
};

export default Header;