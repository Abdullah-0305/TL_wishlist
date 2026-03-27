import { Swords } from "lucide-react";
import { useTranslation } from "react-i18next";

const Maintenance = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 rounded-full bg-gaming-gold/20 flex items-center justify-center mb-6 animate-pulse border border-gaming-gold/50">
        <Swords className="h-10 w-10 text-gaming-gold" />
      </div>
      <h1 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-4">
        {t("maintenance.title")}
      </h1>
      <p className="text-muted-foreground max-w-md">
        {t("maintenance.message")}
      </p>
      <div className="mt-8 text-xs text-gaming-gold/50 uppercase tracking-widest">
        Trinity Guild • Throne and Liberty
      </div>
    </div>
  );
};

export default Maintenance;