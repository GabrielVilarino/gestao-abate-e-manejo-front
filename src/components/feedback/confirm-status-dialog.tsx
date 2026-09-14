"use client";

import { LoaderCircle, Power } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: "proprietário" | "fazenda";
  isActive: boolean;
  isPending?: boolean;
  onConfirm: () => void;
};

export function ConfirmStatusDialog({
  open,
  onOpenChange,
  itemName,
  itemType,
  isActive,
  isPending = false,
  onConfirm,
}: ConfirmStatusDialogProps) {
  const action = isActive ? "desativar" : "ativar";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isActive ? "Desativar" : "Ativar"} {itemType}</DialogTitle>
          <DialogDescription>
            Deseja realmente {action} {itemType === "proprietário" ? "o" : "a"} <strong>{itemName}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
          <Button type="button" variant={isActive ? "destructive" : "default"} onClick={onConfirm} disabled={isPending}>
            {isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Power className="size-4" />}
            {isPending ? "Salvando..." : `${isActive ? "Desativar" : "Ativar"} ${itemType}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
