"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FazendaForm } from "@/features/fazendas/components/fazenda-form";
import type { Fazenda } from "@/features/fazendas/types/fazenda";

type FazendaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idProprietario: number;
  fazenda?: Fazenda;
  onSuccess: (message: string) => void;
};

export function FazendaDialog({ open, onOpenChange, idProprietario, fazenda, onSuccess }: FazendaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{fazenda ? "Editar fazenda" : "Nova fazenda"}</DialogTitle>
          <DialogDescription>A fazenda ficará vinculada ao proprietário desta página.</DialogDescription>
        </DialogHeader>
        <FazendaForm key={fazenda?.id ?? "new"} idProprietario={idProprietario} fazenda={fazenda} onCancel={() => onOpenChange(false)} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
