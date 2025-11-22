import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

const ChangePassword = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Si pas connecté, on redirige vers login
  if (!user) return <Navigate to="/login" replace />;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    if (!oldPassword || !newPassword || !confirm) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères");
      return;
    }

    try {
      setLoading(true);

      // Récupération du joueur
      const { data: player, error } = await supabase
        .from("player")
        .select("*")
        .eq("name", user.name)
        .maybeSingle();

      if (error || !player) {
        toast.error("Utilisateur introuvable");
        return;
      }

      // Vérification ancien mot de passe
      const validOld = await bcrypt.compare(oldPassword, player.mdp);
      if (!validOld) {
        toast.error("L'ancien mot de passe est incorrect");
        return;
      }

      // Hash du nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);

      // Mise à jour
      const { error: updateError } = await supabase
        .from("player")
        .update({
          mdp: hashed,
          firstCo: false
        })
        .eq("id", player.id);

      if (updateError) throw updateError;

      toast.success("Mot de passe mis à jour !");
      navigate("/wishlist");

    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Changer votre mot de passe</CardTitle>
          <p className="text-sm text-muted-foreground">
            Vous devez définir un mot de passe personnel avant continuer.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Ancien mot de passe"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <Button
            onClick={handleChange}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Chargement..." : "Mettre à jour"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
