import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { useAuth } from "@/context/AuthContext";
import bcrypt from "bcryptjs";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    if (!pseudo || !password) {
      toast.error(t("login.error_fields"));
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("player")
      .select("*")
      .eq("name", pseudo)
      .maybeSingle();

    if (error || !data) {
      toast.error(t("login.error_invalid"));
      setIsSubmitting(false);
      return;
    }

    const valid = await bcrypt.compare(password, data.mdp);
    if (!valid) {
      toast.error(t("login.error_invalid"));
      setIsSubmitting(false);
      return;
    }

    login(data.name, data.isAdmin);
    toast.success(t("login.success"));
    setIsSubmitting(false);
    
    if (data.firstCo) navigate("/change-password");
    else navigate("/wishlist");
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
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-4">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-[0.2em] text-white">
                {t("login.title")}
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                {t("login.description")}
              </p>
            </div>

            <form className="space-y-4" onSubmit={onLogin}>
              <div className="space-y-1.5">
                <Label htmlFor="pseudo" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                  {t("login.label_pseudo")}
                </Label>
                <Input
                  id="pseudo"
                  placeholder={t("login.placeholder_pseudo")}
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  className="bg-black/40 border-white/5 focus:border-fuchsia-500/50 text-white h-10 text-xs rounded-lg transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                  {t("login.label_password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/40 border-white/5 focus:border-fuchsia-500/50 text-white h-10 text-xs rounded-lg pr-10 transition-all placeholder:text-zinc-700"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-zinc-600 hover:text-fuchsia-400 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full h-11 mt-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase tracking-widest text-[10px] rounded-lg transition-all",
                  "shadow-lg shadow-fuchsia-900/20 active:scale-[0.98] disabled:opacity-50"
                )}
              >
                {isSubmitting ? "..." : t("login.button_login")}
              </Button>
            </form>
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