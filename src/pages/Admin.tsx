import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserCog, Lock, Swords, Shield as ShieldIcon, Gem } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

// Mock data - liste fictive de joueurs
const mockPlayers = [
  {
    id: 1,
    pseudo: "DragonSlayer",
    weapon: "Épée du Dragon Noir",
    armor: "Armure du Titan",
    accessory: "Anneau de Puissance",
  },
  {
    id: 2,
    pseudo: "MageSupreme",
    weapon: "Bâton des Arcanes",
    armor: "Robe de l'Érudit",
    accessory: "Collier de Sagesse",
  },
  {
    id: 3,
    pseudo: "ShadowArcher",
    weapon: "Lame de l'Ombre",
    armor: "Cuirasse de Lumière",
    accessory: "Boucles d'Oreille Mystiques",
  },
];

const allItems = {
  weapons: ["Épée du Dragon Noir", "Lame de l'Ombre", "Arc du Phénix", "Bâton des Arcanes"],
  armors: ["Armure du Titan", "Cuirasse de Lumière", "Robe de l'Érudit"],
  accessories: ["Anneau de Puissance", "Collier de Sagesse", "Boucles d'Oreille Mystiques", "Ceinture du Champion"],
};

// Placeholder functions
const loadAdminData = () => {
  console.log("Loading admin data");
  // TODO: Connect to backend
};

const blockItem = (playerId: number, item: string, category: string) => {
  console.log("Blocking item:", { playerId, item, category });
  // TODO: Connect to backend
};

const Admin = () => {

  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />

  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleBlockItem = () => {
    if (!selectedPlayer || !selectedItem || !selectedCategory) {
      toast.error("Veuillez sélectionner tous les champs");
      return;
    }

    blockItem(parseInt(selectedPlayer), selectedItem, selectedCategory);
    toast.success("Item bloqué !", {
      description: `${selectedItem} a été bloqué pour le joueur sélectionné.`,
    });
    
    // Reset form
    setSelectedPlayer("");
    setSelectedCategory("");
    setSelectedItem("");
    setIsDialogOpen(false);
  };

  const getCategoryItems = () => {
    switch (selectedCategory) {
      case "weapons":
        return allItems.weapons;
      case "armors":
        return allItems.armors;
      case "accessories":
        return allItems.accessories;
      default:
        return [];
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            Administration
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les wishlists des membres de la guilde
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-glow-primary">
              <Lock className="mr-2 h-4 w-4" />
              Bloquer un item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary/30">
            <DialogHeader>
              <DialogTitle>Bloquer un item</DialogTitle>
              <DialogDescription>
                Empêchez un joueur de sélectionner un item spécifique
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Joueur</Label>
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                  <SelectTrigger className="border-primary/30">
                    <SelectValue placeholder="Sélectionner un joueur" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-primary/30 z-50">
                    {mockPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.pseudo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-primary/30">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-primary/30 z-50">
                    <SelectItem value="weapons">Armes</SelectItem>
                    <SelectItem value="armors">Armures</SelectItem>
                    <SelectItem value="accessories">Accessoires</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <div className="space-y-2">
                  <Label>Item</Label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger className="border-primary/30">
                      <SelectValue placeholder="Sélectionner un item" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-primary/30 z-50">
                      {getCategoryItems().map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button onClick={handleBlockItem} className="w-full bg-gradient-primary">
              <Lock className="mr-2 h-4 w-4" />
              Confirmer le blocage
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des joueurs */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPlayers.map((player) => (
          <Card key={player.id} className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-primary">
                  <UserCog className="h-5 w-5 text-primary-foreground" />
                </div>
                <CardTitle>{player.pseudo}</CardTitle>
              </div>
              <CardDescription>Choix actuels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Swords className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Arme</p>
                  <p className="text-sm text-muted-foreground truncate">{player.weapon}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <ShieldIcon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Armure</p>
                  <p className="text-sm text-muted-foreground truncate">{player.armor}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Gem className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Accessoire</p>
                  <p className="text-sm text-muted-foreground truncate">{player.accessory}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Admin;
