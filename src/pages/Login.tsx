import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { useAuth } from "@/context/AuthContext";
import bcrypt from "bcryptjs";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async (e?: React.FormEvent) => {
    // Empêche le rechargement de la page si appelé via onSubmit
    if (e) e.preventDefault();

    if (!pseudo || !password) {
      toast.error(t("login.error_fields"));
      return;
    }

    // Récupération de l'utilisateur
    const { data, error } = await supabase
      .from("player")
      .select("*")
      .eq("name", pseudo)
      .maybeSingle();

    if (error || !data) {
      toast.error(t("login.error_invalid"));
      return;
    }

    // Vérification du mot de passe
    const valid = await bcrypt.compare(password, data.mdp);
    if (!valid) {
      toast.error(t("login.error_invalid"));
      return;
    }

    // Connexion réussie
    login(data.name, data.isAdmin);
    toast.success(t("login.success"));
    
    if (data.firstCo) {
      navigate("/change-password");
    } else {
      navigate("/wishlist");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md border-primary/20 shadow-glow-primary bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
          <CardDescription>
            {t("login.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onLogin}>
            {/* Pseudo */}
            <div className="space-y-2">
              <Label htmlFor="pseudo">{t("login.label_pseudo")}</Label>
              <Input
                id="pseudo"
                type="text"
                placeholder={t("login.placeholder_pseudo")}
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className="border-primary/30 focus:border-primary"
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-2 relative">
              <Label htmlFor="password">{t("login.label_password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-primary/30 focus:border-primary pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Bouton connexion */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 shadow-glow-primary font-bold"
              >
                {t("login.button_login")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;