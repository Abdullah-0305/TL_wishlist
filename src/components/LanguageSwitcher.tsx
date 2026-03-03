// LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  return (
    // On le place en bas à droite (bottom-6, right-6)
    // On s'assure qu'il est en fixed et avec un z-index très élevé
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button 
        onClick={toggleLanguage}
        className={cn(
          "group relative flex items-center justify-center w-14 h-14 rounded-full",
          "bg-[#1a1c23]/80 backdrop-blur-md border border-gaming-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.3)]",
          "hover:border-gaming-gold hover:scale-110 transition-all duration-300",
          "text-2xl"
        )}
      >
        <span>{i18n.language === 'fr' ? '🇫🇷' : '🇺🇸'}</span>
        
        {/* Tooltip qui apparaît sur la gauche au survol */}
        <span className="absolute right-full mr-4 px-3 py-1 rounded bg-black/90 text-gaming-gold text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-gaming-gold/30">
          {i18n.language === 'fr' ? 'Switch to English' : 'Passer en Français'}
        </span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;