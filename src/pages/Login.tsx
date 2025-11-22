import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { useAuth } from "@/context/AuthContext";

const Login = () => {

  const test = async () => {
  const { data, error } = await supabase.from("player").select("*").limit(1);
  if(data){
    console.log("data : " ,data)
  }
  else{
    console.log("error : ", error)
  }
};

test();

  const navigate = useNavigate();
  const { login } = useAuth();
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    if (!pseudo || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Récupère l'utilisateur par pseudo uniquement
    const { data, error } = await supabase
      .from("player")
      .select("*")
      .eq("name", pseudo)
      .maybeSingle();

    if (error || !data) {
      toast.error("Pseudo ou mot de passe incorrect");
      return;
    }

    // Vérifie le mot de passe côté JS
    if (data.mdp !== password) {
      toast.error("Pseudo ou mot de passe incorrect");
      return;
    }

    // Connexion réussie
    login(data.name, data.isAdmin);
    toast.success("Connexion réussie !");
    navigate("/wishlist");
  };

  const onRegister = async () => {
    if (!pseudo || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    // Vérifie si le pseudo existe déjà
    const { data: existing } = await supabase
      .from("player")
      .select("name")
      .eq("name", pseudo)
      .single();

    if (existing) {
      toast.error("Ce pseudo est déjà utilisé");
      return;
    }

    // Crée le nouvel utilisateur (isAdmin = false par défaut)
    const { data: newUser, error } = await supabase
      .from("player")
      .insert({ name: pseudo, mdp: password, isAdmin: false })
      .select()
      .single();

    if (error || !newUser) {
      toast.error("Erreur lors de la création du compte");
      return;
    }

    login(newUser.name, newUser.isAdmin);
    toast.success("Compte créé avec succès !");
    navigate("/wishlist");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md border-primary/20 shadow-glow-primary">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Bienvenue sur Akatsushi</CardTitle>
          <CardDescription>
            Connectez-vous ou créez un compte pour gérer votre wishlist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="pseudo">Pseudo</Label>
              <Input
                id="pseudo"
                type="text"
                placeholder="Votre pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className="border-primary/30 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-primary/30 focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={onLogin}
                className="w-full bg-gradient-primary hover:opacity-90 shadow-glow-primary"
              >
                Se connecter
              </Button>
              <Button
                onClick={onRegister}
                variant="outline"
                className="w-full border-primary/30 hover:bg-primary/10"
              >
                Créer un compte
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
