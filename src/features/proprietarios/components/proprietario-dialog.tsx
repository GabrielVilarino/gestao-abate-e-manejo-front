"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProprietarioForm } from "@/features/proprietarios/components/proprietario-form";
import type { Proprietario } from "@/features/proprietarios/types/proprietario";

type ProprietarioDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proprietario?: Proprietario;
  onSuccess: (message: string) => void;
};

export function ProprietarioDialog({ open, onOpenChange, proprietario, onSuccess }: ProprietarioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{proprietario ? "Editar proprietário" : "Novo proprietário"}</DialogTitle>
          <DialogDescription>Preencha os dados abaixo. O CPF será enviado somente com os 11 dígitos.</DialogDescription>
        </DialogHeader>
        <ProprietarioForm
          key={proprietario?.id ?? "new"}
          proprietario={proprietario}
          onCancel={() => onOpenChange(false)}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
