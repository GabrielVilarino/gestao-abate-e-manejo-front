"use client";

import { LoaderCircle, Power } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Usuario } from "@/features/usuarios/types/usuario";

type UsuarioStatusDialogProps = {
  usuario: Usuario;
  pending: boolean;
  error: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function UsuarioStatusDialog({ usuario, pending, error, onOpenChange, onConfirm }: UsuarioStatusDialogProps) {
  const action = usuario.ativo ? "Desativar" : "Ativar";

  return (
    <Dialog open onOpenChange={(open) => { if (!pending) onOpenChange(open); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action} usuário</DialogTitle>
          <DialogDescription>
            Deseja realmente {action.toLowerCase()} <strong>{usuario.nome}</strong>?
            {usuario.ativo ? " O acesso ao sistema será interrompido." : " O acesso ao sistema será restabelecido."}
          </DialogDescription>
        </DialogHeader>
        {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Cancelar</Button>
          <Button type="button" variant={usuario.ativo ? "destructive" : "default"} onClick={onConfirm} disabled={pending}>
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Power className="size-4" />}
            {pending ? "Salvando..." : `${action} usuário`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
