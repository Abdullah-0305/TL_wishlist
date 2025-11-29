// /Admin/components/BlockModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ItemType = "arme" | "armure" | "accessoire";

export interface BlockTarget {
  playerId: string;
  itemType: ItemType;
  playerName?: string; // optional: if you already know the player's name, pass it to avoid a lookup
}

/**
 * Props:
 * - open: boolean - whether the dialog is open
 * - onOpenChange: (open: boolean) => void - same shape as setState so you can pass setModalOpen directly
 * - onConfirm: () => Promise<void> | void - called when user confirms the block
 * - target: BlockTarget | null - the item/player to block (can be null while closing)
 */
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  target: BlockTarget | null;
}

const BlockModal: React.FC<Props> = ({ open, onOpenChange, onConfirm, target }) => {
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
          <DialogTitle>Bloquer l'item</DialogTitle>
          <DialogDescription>
            {target ? (
              <>
                Bloquer <strong>{label}</strong> pour{" "}
                <strong>{target.playerName ?? target.playerId}</strong> ?
              </>
            ) : (
              <>Bloquer cet item ?</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={async () => {
            await onConfirm();
            // close after confirm — keep behavior same as original Admin
            onOpenChange(false);
          }} className="bg-gradient-primary">
            Confirmer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockModal;
