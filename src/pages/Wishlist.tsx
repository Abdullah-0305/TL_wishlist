import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Swords, Shield as ShieldIcon, Gem, Save } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "../lib/supabase";
import { getArmes, getArmures, getAccessoires, getRoles } from "@/api/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation, Trans } from "react-i18next";

interface Item {
  id: number;
  name: string;
}

const Wishlist = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return <Navigate to="/login" replace />;

  const [loading, setLoading] = useState(true);
  const [weapons, setWeapons] = useState<Item[]>([]);
  const [armors, setArmors] = useState<Item[]>([]);
  const [accessories, setAccessories] = useState<Item[]>([]);
  const [roles, setRoles] = useState<Item[]>([]);

  const [role, setRole] = useState("");
  const [selectedWeapon, setSelectedWeapon] = useState("");
  const [selectedArmor, setSelectedArmor] = useState("");
  const [selectedAccessory, setSelectedAccessory] = useState("");

  const [weaponLocked, setWeaponLocked] = useState(false);
  const [armorLocked, setArmorLocked] = useState(false);
  const [accessoryLocked, setAccessoryLocked] = useState(false);

  const [hasLootedArme, setHasLootedArme] = useState(false);
  const [hasLootedArmure, setHasLootedArmure] = useState(false);
  const [hasLootedAccessoire, setHasLootedAccessoire] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: w } = await getArmes();
      const { data: a } = await getArmures();
      const { data: ac } = await getAccessoires();
      const { data: r } = await getRoles();

      setWeapons(w || []);
      setArmors(a || []);
      setAccessories(ac || []);
      setRoles(r || []);

      const { data: player, error } = await supabase
        .from("player")
        .select("*")
        .eq("name", user.name)
        .maybeSingle();

      if (error) throw error;
      if (!player) {
        toast.error(t("wishlist.user_not_found"));
        return;
      }

      if (player.idRole) setRole(player.idRole.toString());
      if (player.idArme) {
        setSelectedWeapon(player.idArme.toString());
        setWeaponLocked(true);
      }
      if (player.idArmure) {
        setSelectedArmor(player.idArmure.toString());
        setArmorLocked(true);
      }
      if (player.idAccesoires) {
        setSelectedAccessory(player.idAccesoires.toString());
        setAccessoryLocked(true);
      }

      setHasLootedArme(player.has_looted_arme);
      setHasLootedArmure(player.has_looted_armure);
      setHasLootedAccessoire(player.has_looted_accessoires);

    } catch (err) {
      console.error(err);
      toast.error(t("wishlist.load_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = () => {
    if (!role) {
      toast.error(t("wishlist.role_required"));
      return;
    }
    setModalOpen(true);
  };

  const confirmSave = async () => {
    setModalOpen(false);
    try {
      const { data: player, error: playerError } = await supabase
        .from("player")
        .select("id")
        .eq("name", user.name)
        .maybeSingle();

      if (playerError || !player) throw playerError || new Error("Joueur introuvable");

      const updateData: any = { idRole: parseInt(role) };
      if (!weaponLocked) updateData.idArme = selectedWeapon ? parseInt(selectedWeapon) : null;
      if (!armorLocked) updateData.idArmure = selectedArmor ? parseInt(selectedArmor) : null;
      if (!accessoryLocked) updateData.idAccesoires = selectedAccessory ? parseInt(selectedAccessory) : null;

      const { error } = await supabase
        .from("player")
        .update(updateData)
        .eq("id", player.id);

      if (error) throw error;

      toast.success(t("wishlist.save_success"));
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(t("wishlist.save_error"));
    }
  };

  if (loading) return <p className="text-center text-white">{t("wishlist.loading")}</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* 📌 RÈGLES DE LOOT */}
      <Card className="border-primary/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">{t("wishlist.rules_title")}</CardTitle>
          <CardDescription>
            {t("wishlist.rules_desc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            <Trans i18nKey="wishlist.basic_rule">
              💠 Vous pouvez mettre dans la wishlist <b>un seul item pour</b> les Armes, les Armures et les Accessoires.
            </Trans>
            <br />
            <Trans i18nKey="wishlist.lock_rule">
              🔒 Une fois la wishlist validée, <b>vous ne pourrez plus modifier vos choix</b>.
            </Trans>
          </p>

          <div className="border-t border-primary/20 pt-4 space-y-3">
            <h3 className="font-semibold text-lg">{t("wishlist.boss_rules_title")}</h3>

            <p>
              <strong>{t("wishlist.rule_1_title")}</strong><br />
              {t("wishlist.rule_1_desc")}
            </p>

            <p>
              <strong>{t("wishlist.rule_2_title")}</strong><br />
              {t("wishlist.rule_2_desc")}
            </p>

            <p>
              <strong>{t("wishlist.rule_3_title")}</strong><br />
              <Trans i18nKey="wishlist.rule_3_desc">
                Priorité aux joueurs <strong>présents, anciens et actifs.</strong> Une fois un loot obtenu, un délai de 7 jours est requis avant de pouvoir en recevoir un autre.
              </Trans>
            </p>

            <p>
              <strong>{t("wishlist.rule_4_title")}</strong><br />
              {t("wishlist.rule_4_desc")}
            </p>
          </div>

          <div className="border-t border-primary/20 pt-4 space-y-2">
            <h3 className="font-semibold text-lg">{t("wishlist.change_title")}</h3>

            <p>
              <Trans i18nKey="wishlist.change_request_desc">
                Si vous avez déjà obtenu <strong>un item de votre wishlist</strong> et que vous souhaitez
                <strong> modifier votre choix</strong>, vous devez impérativement
                <strong> contacter un membre de la Co-Gestion</strong> par message privé
                (Discord ou autre).
              </Trans>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ROLE */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>{t("wishlist.role_title")}</CardTitle>
          <CardDescription>{t("wishlist.role_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder={t("wishlist.role_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {roles.map(r => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* ITEMS */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* ARME */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Swords className="text-primary" />
              <CardTitle>{t("wishlist.weapons_title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select disabled={weaponLocked} value={selectedWeapon} onValueChange={setSelectedWeapon}>
              <SelectTrigger className={weaponLocked ? "opacity-50" : ""}>
                <SelectValue placeholder={t("wishlist.select_weapon")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">{t("wishlist.none")}</SelectItem>
                {weapons.map(w => (
                  <SelectItem
                    key={w.id}
                    value={w.id.toString()}
                    className={hasLootedArme && selectedWeapon == w.id.toString() ? "text-purple-400" : ""}
                  >
                    {w.name} {hasLootedArme && selectedWeapon == w.id.toString() && ` — ${t("wishlist.looted_tag")}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {weaponLocked && <p className="text-xs text-red-400 mt-2">{t("wishlist.already_chosen")}</p>}
            {hasLootedArme && <p className="text-xs text-purple-400 mt-1">{t("wishlist.already_looted")}</p>}
          </CardContent>
        </Card>

        {/* ARMURE */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldIcon className="text-primary" />
              <CardTitle>{t("wishlist.armors_title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select disabled={armorLocked} value={selectedArmor} onValueChange={setSelectedArmor}>
              <SelectTrigger className={armorLocked ? "opacity-50" : ""}>
                <SelectValue placeholder={t("wishlist.select_armor")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">{t("wishlist.none")}</SelectItem>
                {armors.map(a => (
                  <SelectItem
                    key={a.id}
                    value={a.id.toString()}
                    className={hasLootedArmure && selectedArmor == a.id.toString() ? "text-purple-400" : ""}
                  >
                    {a.name} {hasLootedArmure && selectedArmor == a.id.toString() && ` — ${t("wishlist.looted_tag")}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {armorLocked && <p className="text-xs text-red-400 mt-2">{t("wishlist.already_chosen")}</p>}
            {hasLootedArmure && <p className="text-xs text-purple-400 mt-1">{t("wishlist.already_looted")}</p>}
          </CardContent>
        </Card>

        {/* ACCESSOIRES */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gem className="text-primary" />
              <CardTitle>{t("wishlist.accessories_title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select disabled={accessoryLocked} value={selectedAccessory} onValueChange={setSelectedAccessory}>
              <SelectTrigger className={accessoryLocked ? "opacity-50" : ""}>
                <SelectValue placeholder={t("wishlist.select_accessory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">{t("wishlist.none")}</SelectItem>
                {accessories.map(acc => (
                  <SelectItem
                    key={acc.id}
                    value={acc.id.toString()}
                    className={hasLootedAccessoire && selectedAccessory == acc.id.toString() ? "text-purple-400" : ""}
                  >
                    {acc.name} {hasLootedAccessoire && selectedAccessory == acc.id.toString() && ` — ${t("wishlist.looted_tag")}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {accessoryLocked && <p className="text-xs text-red-400 mt-2">{t("wishlist.already_chosen")}</p>}
            {hasLootedAccessoire && <p className="text-xs text-purple-400 mt-1">{t("wishlist.already_looted")}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleSave}>
          <Save className="mr-2" /> {t("wishlist.save")}
        </Button>
      </div>

      {/* MODAL DE CONFIRMATION */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-primary/30 max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{t("wishlist.modal_title")}</DialogTitle>
            <DialogDescription>
              {t("wishlist.modal_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t("wishlist.cancel")}</Button>
            <Button className="bg-gradient-primary" onClick={confirmSave}>{t("wishlist.confirm")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wishlist;