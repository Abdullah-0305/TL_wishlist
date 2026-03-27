import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const Login = () => {
  const { t } = useTranslation();
  const { signInWithDiscord } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDiscordLogin = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await signInWithDiscord();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la connexion avec Discord");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] bg-[radial-gradient(circle_at_50%_0%,_rgba(88,28,135,0.15)_0%,_rgba(10,11,16,1)_75%)] flex items-center justify-center p-6">
      
      <div className="relative w-full max-w-[360px] animate-in fade-in zoom-in-95 duration-500">
        {/* Glow discret en arrière-plan */}
        <div className="absolute -inset-0.5 bg-fuchsia-500/20 blur-2xl rounded-3xl" />
        
        <div className="relative bg-[#1a1129]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Ligne de tête ultra-fine */}
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-50" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-4 shadow-glow-fuchsia">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-[0.2em] text-white text-center">
                {t("login.title")}
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 text-center">
                {t("login.description")}
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-black">
                </div>
              </div>

              <Button
                onClick={handleDiscordLogin}
                disabled={isSubmitting}
                className={cn(
                  "w-full h-12 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black uppercase tracking-widest text-[11px] rounded-lg transition-all flex items-center justify-center gap-3",
                  "shadow-lg shadow-[#5865F2]/20 active:scale-[0.98] disabled:opacity-50"
                )}
              >
                {/* SVG Logo Discord Officiel */}
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={isSubmitting ? "animate-pulse" : ""}
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.864-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                </svg>
                {isSubmitting ? "..." : t("login.button_login") || "Se connecter avec Discord"}
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-[9px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
          Access Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};

export default Login;