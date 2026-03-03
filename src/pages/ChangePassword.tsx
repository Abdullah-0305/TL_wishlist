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
import { useTranslation } from "react-i18next";

const ChangePassword = () => {
  const { t } = useTranslation();
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
      toast.error(t("change_password.error_required"));
      return;
    }
    if (newPassword !== confirm) {
      toast.error(t("change_password.error_mismatch"));
      return;
    }
    if (newPassword.length < 6) {
      toast.error(t("change_password.error_length"));
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
        toast.error(t("change_password.error_user"));
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);

      const { error: updateError } = await supabase
        .from("player")
        .update({ mdp: hashed, firstCo: false })
        .eq("id", player.id);

      if (updateError) throw updateError;

      toast.success(t("change_password.success"));
      navigate("/wishlist");
    } catch (err) {
      console.error(err);
      toast.error(t("change_password.error_update"));
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
        className="pr-10 border-primary/30 focus:border-primary"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-2 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md border-primary/20 shadow-glow-primary bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t("change_password.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("change_password.subtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderPasswordInput(
            newPassword, 
            setNewPassword, 
            t("change_password.placeholder_new"), 
            showNew, 
            setShowNew
          )}
          {renderPasswordInput(
            confirm, 
            setConfirm, 
            t("change_password.placeholder_confirm"), 
            showConfirm, 
            setShowConfirm
          )}

          <Button 
            onClick={handleChange} 
            className="w-full bg-gradient-primary hover:opacity-90 shadow-glow-primary font-bold" 
            disabled={loading}
          >
            {loading ? t("change_password.loading") : t("change_password.button_update")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;