import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { Eye, EyeOff } from "lucide-react";

const ChangePassword = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = async () => {
    if (!newPassword || !confirm) {
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

      const { data: player, error } = await supabase
        .from("player")
        .select("*")
        .eq("name", user.name)
        .maybeSingle();

      if (error || !player) {
        toast.error("Utilisateur introuvable");
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);

      const { error: updateError } = await supabase
        .from("player")
        .update({ mdp: hashed, firstCo: false })
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

  const renderPasswordInput = (
    value: string,
    setValue: any,
    placeholder: string,
    show: boolean,
    setShow: any
  ) => (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pr-10" // espace pour le bouton œil
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-2 flex items-center justify-center text-muted-foreground"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Changer votre mot de passe</CardTitle>
          <p className="text-sm text-muted-foreground">
            Vous devez définir un mot de passe personnel avant de continuer.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderPasswordInput(newPassword, setNewPassword, "Nouveau mot de passe", showNew, setShowNew)}
          {renderPasswordInput(confirm, setConfirm, "Confirmer le mot de passe", showConfirm, setShowConfirm)}

          <Button onClick={handleChange} className="w-full" disabled={loading}>
            {loading ? "Chargement..." : "Mettre à jour"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
