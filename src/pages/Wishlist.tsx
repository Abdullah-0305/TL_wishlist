import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Swords, Shield as ShieldIcon, Gem, Save } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "../lib/supabase";
import { getArmes, getArmures, getAccessoires, getRoles, getPlayerByName, updatePlayer } from "@/api/db";

interface Item {
  id: number;
  name: string;
}

const Wishlist = () => {
  const { user } = useAuth();
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

  const loadData = async () => {
    try {
      setLoading(true);

      // Récupération des items
      const { data: w } = await getArmes();
      const { data: a } = await getArmures();
      const { data: ac } = await getAccessoires();
      const { data: r } = await getRoles();

      setWeapons(w || []);
      setArmors(a || []);
      setAccessories(ac || []);
      setRoles(r || []);

      // Récupération du joueur
      const { data: player, error } = await supabase
        .from("player")
        .select("*")
        .eq("name", user.name)
        .maybeSingle();

      if (error) throw error;
      if (!player) {
        toast.error("Utilisateur non trouvé !");
        return;
      }

      // Role
      if (player.idRole) {
        setRole(player.idRole.toString());
      }

      // Armes
      if (player.idArme) {
        setSelectedWeapon(player.idArme.toString());
        setWeaponLocked(true);
      }

      // Armures
      if (player.idArmure) {
        setSelectedArmor(player.idArmure.toString());
        setArmorLocked(true);
      }

      // Accessoires
      if (player.idAccessoires) {
        setSelectedAccessory(player.idAccessoires.toString());
        setAccessoryLocked(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!role) {
      toast.error("Vous devez choisir un rôle.");
      return;
    }

    try {
      // Récupérer l'id du joueur
      const { data: player, error: playerError } = await supabase
        .from("player")
        .select("id")
        .eq("name", user.name)
        .maybeSingle();
      if (playerError || !player) throw playerError || new Error("Joueur introuvable");

      // Préparer les données à mettre à jour
      const updateData: any = { idRole: parseInt(role) };

      if (!weaponLocked && selectedWeapon) updateData.idArme = parseInt(selectedWeapon);
      if (!armorLocked && selectedArmor) updateData.idArmure = parseInt(selectedArmor);
      if (!accessoryLocked && selectedAccessory) updateData.idAccessoires = parseInt(selectedAccessory);

      const { error } = await supabase
        .from("player")
        .update(updateData)
        .eq("id", player.id);

      if (error) throw error;

      toast.success("Wishlist sauvegardée !");
      // Recharger les infos pour bloquer les items choisis
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la sauvegarde.");
    }
  };

  if (loading) return <p className="text-center text-white">Chargement...</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ROLE */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Rôle</CardTitle>
          <CardDescription>Obligatoire pour valider</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un rôle" />
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

      <div className="grid md:grid-cols-3 gap-6">
        {/* ARME */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Swords className="text-primary" />
              <CardTitle>Armes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              disabled={weaponLocked}
              value={selectedWeapon}
              onValueChange={setSelectedWeapon}
            >
              <SelectTrigger className={weaponLocked ? "opacity-50" : ""}>
                <SelectValue placeholder="Choisir une arme" />
              </SelectTrigger>
              <SelectContent>
                {weapons.map(w => (
                  <SelectItem key={w.id} value={w.id.toString()}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {weaponLocked && <p className="text-xs text-red-400 mt-2">Déjà choisi</p>}
          </CardContent>
        </Card>

        {/* ARMURE */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldIcon className="text-primary" />
              <CardTitle>Armures</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              disabled={armorLocked}
              value={selectedArmor}
              onValueChange={setSelectedArmor}
            >
              <SelectTrigger className={armorLocked ? "opacity-50" : ""}>
                <SelectValue placeholder="Choisir une armure" />
              </SelectTrigger>
              <SelectContent>
                {armors.map(a => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {armorLocked && <p className="text-xs text-red-400 mt-2">Déjà choisi</p>}
          </CardContent>
        </Card>

        {/* ACCESSOIRES */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gem className="text-primary" />
              <CardTitle>Accessoires</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              disabled={accessoryLocked}
              value={selectedAccessory}
              onValueChange={setSelectedAccessory}
            >
              <SelectTrigger className={accessoryLocked ? "opacity-50" : ""}>
                <SelectValue placeholder="Choisir un accessoire" />
              </SelectTrigger>
              <SelectContent>
                {accessories.map(acc => (
                  <SelectItem key={acc.id} value={acc.id.toString()}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {accessoryLocked && <p className="text-xs text-red-400 mt-2">Déjà choisi</p>}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleSave}>
          <Save className="mr-2" /> Sauvegarder
        </Button>
      </div>
    </div>
  );
};

export default Wishlist;
