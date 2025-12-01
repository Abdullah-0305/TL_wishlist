import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deletePlayer } from "@/api/db";

const DeletePlayerModal = ({ open, onOpenChange, player, loadPlayers }) => {
  const [inputName, setInputName] = useState("");

  if (!player) return null;

  const confirmDelete = async () => {
    if (inputName !== player.name) {
      toast.error("Le nom ne correspond pas !");
      return;
    }

    try {
      await deletePlayer(player.id);
      toast.success(`Joueur ${player.name} supprimé !`);
      onOpenChange(false);
      setInputName("");
      loadPlayers();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Supprimer {player.name}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm">
          Pour confirmer, écris le nom du joueur : <strong>{player.name}</strong>
        </p>

        <input
          type="text"
          className="mt-3 w-full p-2 border rounded text-black"
          placeholder="Tape le nom pour confirmer"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
        />

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button className="bg-red-600 hover:bg-red-500" onClick={confirmDelete}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePlayerModal;
