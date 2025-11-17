import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { toast } from "sonner";

// Placeholder functions - à connecter au backend
const handleLogin = (pseudo: string, password: string) => {
  console.log("Login attempt:", { pseudo, password });
  // TODO: Connect to backend
  return true;
};

const handleRegister = (pseudo: string, password: string) => {
  console.log("Register attempt:", { pseudo, password });
  // TODO: Connect to backend
  return true;
};

const Login = () => {
  const navigate = useNavigate();
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    const success = handleLogin(pseudo, password);
    if (success) {
      toast.success("Connexion réussie !");
      navigate("/wishlist");
    }
  };

  const onRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    const success = handleRegister(pseudo, password);
    if (success) {
      toast.success("Compte créé avec succès !");
      navigate("/wishlist");
    }
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
          <form className="space-y-4">
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
