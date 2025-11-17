import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Shield as ShieldIcon, Gem, Save } from "lucide-react";
import { toast } from "sonner";

// Mock data - exemples temporaires
const weapons = [
  { id: "sword1", name: "Épée du Dragon Noir", disabled: false },
  { id: "sword2", name: "Lame de l'Ombre", disabled: false },
  { id: "bow1", name: "Arc du Phénix", disabled: true },
  { id: "staff1", name: "Bâton des Arcanes", disabled: false },
];

const armors = [
  { id: "armor1", name: "Armure du Titan", disabled: false },
  { id: "armor2", name: "Cuirasse de Lumière", disabled: false },
  { id: "armor3", name: "Robe de l'Érudit", disabled: true },
];

const accessories = [
  { id: "acc1", name: "Anneau de Puissance", disabled: false },
  { id: "acc2", name: "Collier de Sagesse", disabled: false },
  { id: "acc3", name: "Boucles d'Oreille Mystiques", disabled: false },
  { id: "acc4", name: "Ceinture du Champion", disabled: true },
];

// Placeholder function
const saveWishlist = (data: any) => {
  console.log("Saving wishlist:", data);
  // TODO: Connect to backend
};

const Wishlist = () => {
  const [selectedWeapon, setSelectedWeapon] = useState("");
  const [selectedArmor, setSelectedArmor] = useState("");
  const [selectedAccessory, setSelectedAccessory] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    const wishlistData = {
      weapon: selectedWeapon,
      armor: selectedArmor,
      accessory: selectedAccessory,
      notes,
    };
    
    saveWishlist(wishlistData);
    toast.success("Wishlist sauvegardée !", {
      description: "Vos préférences ont été enregistrées avec succès.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
          Ma Wishlist
        </h1>
        <p className="text-muted-foreground">
          Sélectionnez vos équipements préférés et ajoutez des notes
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Armes */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Swords className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Armes</CardTitle>
            </div>
            <CardDescription>Choisissez votre arme favorite</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedWeapon} onValueChange={setSelectedWeapon}>
              <SelectTrigger className="border-primary/30">
                <SelectValue placeholder="Sélectionner une arme" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-primary/30 z-50">
                {weapons.map((weapon) => (
                  <SelectItem
                    key={weapon.id}
                    value={weapon.id}
                    disabled={weapon.disabled}
                    className={weapon.disabled ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {weapon.name}
                    {weapon.disabled && " (Bloqué)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Armures */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <ShieldIcon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Armures</CardTitle>
            </div>
            <CardDescription>Choisissez votre armure favorite</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedArmor} onValueChange={setSelectedArmor}>
              <SelectTrigger className="border-primary/30">
                <SelectValue placeholder="Sélectionner une armure" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-primary/30 z-50">
                {armors.map((armor) => (
                  <SelectItem
                    key={armor.id}
                    value={armor.id}
                    disabled={armor.disabled}
                    className={armor.disabled ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {armor.name}
                    {armor.disabled && " (Bloqué)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Accessoires */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <Gem className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Accessoires</CardTitle>
            </div>
            <CardDescription>Choisissez votre accessoire favori</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedAccessory} onValueChange={setSelectedAccessory}>
              <SelectTrigger className="border-primary/30">
                <SelectValue placeholder="Sélectionner un accessoire" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-primary/30 z-50">
                {accessories.map((acc) => (
                  <SelectItem
                    key={acc.id}
                    value={acc.id}
                    disabled={acc.disabled}
                    className={acc.disabled ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {acc.name}
                    {acc.disabled && " (Bloqué)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Notes</CardTitle>
          <CardDescription>
            Ajoutez des informations supplémentaires sur vos préférences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Exemple: Je préfère les équipements avec bonus de dégâts magiques..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-32 border-primary/30 focus:border-primary resize-none"
          />
        </CardContent>
      </Card>

      {/* Bouton sauvegarder */}
      <div className="flex justify-center">
        <Button
          onClick={handleSave}
          size="lg"
          className="bg-gradient-gold text-secondary-foreground hover:opacity-90 shadow-glow-gold"
        >
          <Save className="mr-2 h-5 w-5" />
          Sauvegarder ma wishlist
        </Button>
      </div>
    </div>
  );
};

export default Wishlist;
