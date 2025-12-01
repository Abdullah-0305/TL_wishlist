import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

interface AddPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlayerAdded: (name: string, password: string) => void;
  loadPlayers: () => void;
}

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  open,
  onOpenChange,
  onPlayerAdded,
  loadPlayers,
}) => {
  const [name, setName] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  // Pour détecter "open passe de true → false"
  const previousOpen = useRef(false);

  useEffect(() => {
    if (previousOpen.current === true && open === false) {
      // Le modal vient d’être fermé
      loadPlayers();
      setName("");
      setGeneratedPassword(null);
    }
    previousOpen.current = open;
  }, [open, loadPlayers]);

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleAddPlayer = async () => {
    if (!name.trim()) {
      toast.error("Le nom est obligatoire !");
      return;
    }

    const password = generatePassword();
    setGeneratedPassword(password);

    try {
      await onPlayerAdded(name.trim(), password);

      toast.success(
        <div>
          Joueur créé !<br />
          <strong>Mot de passe :</strong> {password}
        </div>
      );
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la création du joueur");
    }
  };

  const isCreated = generatedPassword !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCreated ? "Joueur ajouté" : "Ajouter un joueur"}
          </DialogTitle>
        </DialogHeader>

        {!isCreated && (
          <input
            type="text"
            className="mt-2 w-full p-2 border rounded text-black"
            placeholder="Nom du joueur"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        {isCreated && (
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <strong>Nom :</strong> {name}
            </p>
            <p>
              <strong>Mot de passe :</strong>{" "}
              <span className="font-bold">{generatedPassword}</span>
            </p>
            <p className="text-xs opacity-70">
              Donne ce mot de passe au joueur — il ne sera plus visible ensuite.
            </p>
          </div>
        )}

        {!isCreated && (
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddPlayer}>Créer</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddPlayerModal;
