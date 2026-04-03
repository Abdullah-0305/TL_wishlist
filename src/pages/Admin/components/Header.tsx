// src/pages/admin/components/Header.tsx
import { useTranslation } from "react-i18next";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = ({ onUnlockAll }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-fuchsia-500/20 pb-6 mb-6">
      
      {/* ZONE TITRE */}
      <div className="space-y-1">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter bg-gradient-gold bg-clip-text text-transparent drop-shadow-sm">
          {t("admin_header.title", "Panneau de Commandement")}
        </h1>
        <p className="text-fuchsia-400/60 font-medium flex items-center gap-2 text-sm md:text-base">
          <span className="w-8 h-[1px] bg-gaming-gold/30 hidden sm:block"></span>
          {t("admin_header.subtitle", "Gestion du raid et des butins")}
        </p>
      </div>

      {/* BOUTON DANGER ISOLÉ */}
      <Button
        onClick={onUnlockAll}
        variant="outline"
        className="group relative border-red-500/30 bg-red-500/5 text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300 gap-2 font-bold uppercase tracking-widest text-xs"
      >
        <ShieldAlert className="h-4 w-4 transition-transform group-hover:scale-110" />
        <span>{t("admin_header.reset_all", "Reset Total")}</span>
      </Button>
    </div>
  );
};

export default Header;