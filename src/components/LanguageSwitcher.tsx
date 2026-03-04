import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in zoom-in-95 duration-500">
      <div className="group relative">
        {/* Tooltip HUD à gauche */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="bg-[#1e1333]/90 backdrop-blur-md border border-fuchsia-500/30 px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">
              {i18n.language === 'fr' ? 'Switch to English' : 'Passer en Français'}
            </span>
          </div>
        </div>

        {/* Bouton Circulaire */}
        <button 
          onClick={toggleLanguage}
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300",
            "bg-[#1e1333]/80 backdrop-blur-xl border border-fuchsia-500/30 shadow-[0_0_20px_rgba(217,70,239,0.2)]",
            "hover:scale-110 hover:border-fuchsia-500 hover:shadow-fuchsia-500/30 active:scale-95",
            "text-2xl"
          )}
        >
          {/* Drapeau avec un petit effet de brillance */}
          <span className="drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] select-none">
            {i18n.language === 'fr' ? '🇫🇷' : '🇬🇧'}
          </span>

          {/* Anneau décoratif tournant au survol */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-fuchsia-500/20 group-hover:rotate-180 transition-transform duration-700" />
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;