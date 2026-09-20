"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UsuarioForm } from "@/features/usuarios/components/usuario-form";
import type { Usuario } from "@/features/usuarios/types/usuario";

type UsuarioDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario?: Usuario;
  lockRoleReason?: string;
  onSuccess: (message: string) => void;
};

export function UsuarioDialog({ open, onOpenChange, usuario, lockRoleReason, onSuccess }: UsuarioDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isSaving) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isSaving}>
        <DialogHeader>
          <DialogTitle>{usuario ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          <DialogDescription>
            {usuario
              ? "Atualize os dados e o perfil de acesso. Se o usuário estiver conectado, o menu pode exigir novo login para refletir o perfil atualizado."
              : "Preencha os dados para criar um acesso ao sistema."}
          </DialogDescription>
        </DialogHeader>
        <UsuarioForm
          key={usuario?.id ?? "novo"}
          usuario={usuario}
          lockRoleReason={lockRoleReason}
          onSubmittingChange={setIsSaving}
          onCancel={() => handleOpenChange(false)}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
