// /Admin/components/RemoveModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type RemoveTargetType = "arme" | "armure" | "accessoire";

export interface RemoveTarget {
  playerId: string;
  itemType: RemoveTargetType;
  playerName?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  target: RemoveTarget | null;
}

const RemoveModal: React.FC<Props> = ({ open, onOpenChange, onConfirm, target }) => {
  const label =
    target?.itemType === "arme"
      ? "l'arme"
      : target?.itemType === "armure"
      ? "l'armure"
      : "l'accessoire";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary/30 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Retirer l'item</DialogTitle>
          <DialogDescription>
            {target ? (
              <>
                Retirer <strong>{label}</strong> de{" "}
                <strong>{target.playerName ?? target.playerId}</strong> ?
              </>
            ) : (
              <>Retirer cet item ?</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            className="bg-gradient-primary"
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
          >
            Confirmer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveModal;
