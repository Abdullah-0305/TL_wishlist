// /Admin/components/UnlockAllModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface UnlockAllTarget {
  playerId: string;
  playerName?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  target: UnlockAllTarget | null;
}

const UnlockAllModal: React.FC<Props> = ({ open, onOpenChange, onConfirm, target }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-primary/30 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Débloquer tout</DialogTitle>
          <DialogDescription>
            {target ? (
              <>
                Débloquer <strong>tous les objets</strong> pour{" "}
                <strong>{target.playerName ?? target.playerId}</strong> ?
              </>
            ) : (
              <>Débloquer tous les objets ?</>
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

export default UnlockAllModal;
