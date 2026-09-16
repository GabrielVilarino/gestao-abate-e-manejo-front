"use client";

import { LoaderCircle, Trash2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AgendaDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmName: string;
  isPending: boolean;
  error: string;
  onConfirm: () => void;
};

export function AgendaDeleteDialog({
  open,
  onOpenChange,
  farmName,
  isPending,
  error,
  onConfirm,
}: AgendaDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir agendamento</DialogTitle>
          <DialogDescription>
            Deseja realmente excluir o agendamento da fazenda{" "}
            <strong>{farmName}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível excluir</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {isPending ? "Excluindo..." : "Excluir agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
