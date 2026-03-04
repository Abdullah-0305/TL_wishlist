import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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
    id: string,
    label: string,
    value: string,
    setValue: any,
    placeholder: string,
    show: boolean,
    setShow: any
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="bg-black/40 border-white/5 focus:border-fuchsia-500/50 text-white h-10 text-xs rounded-lg pr-10 transition-all placeholder:text-zinc-700"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-zinc-600 hover:text-fuchsia-400 transition-colors"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0b10] bg-[radial-gradient(circle_at_50%_0%,_rgba(88,28,135,0.15)_0%,_rgba(10,11,16,1)_75%)] flex items-center justify-center p-6">
      
      <div className="relative w-full max-w-[360px] animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute -inset-0.5 bg-fuchsia-500/20 blur-2xl rounded-3xl" />
        
        <div className="relative bg-[#1a1129]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-50" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-[0.2em] text-white">
                {t("change_password.title")}
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 text-center">
                {t("change_password.subtitle")}
              </p>
            </div>

            <div className="space-y-4">
              {renderPasswordInput(
                "new",
                t("change_password.placeholder_new"),
                newPassword, 
                setNewPassword, 
                "••••••••", 
                showNew, 
                setShowNew
              )}
              {renderPasswordInput(
                "confirm",
                t("change_password.placeholder_confirm"),
                confirm, 
                setConfirm, 
                "••••••••", 
                showConfirm, 
                setShowConfirm
              )}

              <Button 
                onClick={handleChange} 
                disabled={loading}
                className={cn(
                  "w-full h-11 mt-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black uppercase tracking-widest text-[10px] rounded-lg transition-all",
                  "shadow-lg shadow-fuchsia-900/20 active:scale-[0.98] disabled:opacity-50"
                )}
              >
                {loading ? "..." : t("change_password.button_update")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;