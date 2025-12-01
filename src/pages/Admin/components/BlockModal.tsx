// ---- BlockModal.tsx ----
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
export type BlockMode = "block" | "unblock";


export interface BlockTarget {
playerId: string;
itemType: ItemType;
mode: BlockMode;
playerName?: string;
}


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


const isUnblock = target?.mode === "unblock";


return (
<Dialog open={open} onOpenChange={onOpenChange}>
<DialogContent className="bg-card border-primary/30 max-w-sm mx-auto">
<DialogHeader>
<DialogTitle>
{isUnblock ? "Débloquer l'item" : "Bloquer l'item"}
</DialogTitle>


<DialogDescription>
{target ? (
<>
{isUnblock ? (
<>
Débloquer <strong>{label}</strong> pour <strong>{target.playerName ?? target.playerId}</strong> ?
</>
) : (
<>
Bloquer <strong>{label}</strong> pour <strong>{target.playerName ?? target.playerId}</strong> ?
</>
)}
</>
) : (
<>Confirmer cette action ?</>
)}
</DialogDescription>
</DialogHeader>


<div className="flex justify-end mt-4 gap-2">
<Button variant="outline" onClick={() => onOpenChange(false)}>
Annuler
</Button>


<Button
onClick={async () => {
await onConfirm();
onOpenChange(false);
}}
className="bg-gradient-primary"
>
{isUnblock ? "Débloquer" : "Bloquer"}
</Button>
</div>
</DialogContent>
</Dialog>
);
};


export default BlockModal;