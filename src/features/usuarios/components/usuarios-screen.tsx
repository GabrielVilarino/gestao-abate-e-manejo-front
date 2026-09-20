"use client";

import { Pencil, Plus, Power, UsersRound } from "lucide-react";
import { useState } from "react";

import { StatusMessage } from "@/components/feedback/status-message";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UsuarioDialog } from "@/features/usuarios/components/usuario-dialog";
import { UsuarioStatusDialog } from "@/features/usuarios/components/usuario-status-dialog";
import { useUsuarios } from "@/features/usuarios/hooks/use-usuarios";
import { usuarioService } from "@/features/usuarios/services/usuario-service";
import type { Usuario } from "@/features/usuarios/types/usuario";
import { getErrorMessage } from "@/lib/api-client";

export function UsuariosScreen({ currentUserId }: { currentUserId: number }) {
  const { usuarios, isLoading, error, reload } = useUsuarios();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario>();
  const [statusTarget, setStatusTarget] = useState<Usuario>();
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [success, setSuccess] = useState("");
  const activeAdminCount = usuarios.filter((usuario) => usuario.role === 1 && usuario.ativo).length;

  function isLastActiveAdmin(usuario: Usuario) {
    return usuario.role === 1 && usuario.ativo && activeAdminCount <= 1;
  }

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(usuario: Usuario) {
    setEditing(usuario);
    setDialogOpen(true);
  }

  async function handleSaved(message: string) {
    setDialogOpen(false);
    setSuccess(message);
    await reload();
  }

  async function handleStatusChange() {
    if (!statusTarget || isChangingStatus) return;
    if (statusTarget.ativo && statusTarget.id === currentUserId) {
      setStatusError("Você não pode desativar sua própria conta.");
      return;
    }
    if (statusTarget.ativo && isLastActiveAdmin(statusTarget)) {
      setStatusError("É necessário manter ao menos um administrador ativo.");
      return;
    }
    setIsChangingStatus(true);
    setStatusError("");
    try {
      const response = await usuarioService.setActive(statusTarget.id, !statusTarget.ativo);
      setSuccess(response.message || `Usuário ${statusTarget.ativo ? "desativado" : "ativado"} com sucesso.`);
      setStatusTarget(undefined);
      await reload();
    } catch (actionError) {
      setStatusError(getErrorMessage(actionError));
    } finally {
      setIsChangingStatus(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600">Administração</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">Usuários</h1>
          <p className="mt-2 text-sm text-zinc-600">Gerencie os acessos e perfis dos usuários.</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="size-5" /> Novo usuário
        </Button>
      </div>

      {success ? <Alert role="status" className="border-emerald-200 bg-emerald-50 text-emerald-800"><AlertTitle>{success}</AlertTitle></Alert> : null}

      {isLoading ? (
        <div role="status" aria-label="Carregando usuários" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-44 rounded-2xl" />)}
        </div>
      ) : error ? (
        <StatusMessage variant="error" title="Não foi possível carregar os usuários" description={error} onRetry={() => void reload()} />
      ) : usuarios.length === 0 ? (
        <StatusMessage title="Nenhum usuário cadastrado" description="Cadastre o primeiro usuário para começar." />
      ) : (
        <section aria-label="Lista de usuários">
          <p className="mb-3 text-sm text-zinc-500">{usuarios.length} {usuarios.length === 1 ? "usuário" : "usuários"}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {usuarios.map((usuario) => (
              <Card key={usuario.id} className="flex min-h-44 flex-col justify-between gap-4 p-5 transition hover:border-orange-200 hover:shadow-md">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600"><UsersRound className="size-5" /></div>
                  <div className="min-w-0">
                    <h2 className="truncate font-bold text-zinc-950">{usuario.nome}</h2>
                    <p className="break-all text-sm text-zinc-500">{usuario.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{usuario.role === 1 ? "Administrador" : "Usuário"}</Badge>
                    <Badge variant="outline" className={usuario.ativo ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}>
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(usuario)} aria-label={`Editar ${usuario.nome}`}><Pencil className="size-4" /></Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setStatusError(""); setStatusTarget(usuario); }}
                      disabled={usuario.ativo && (usuario.id === currentUserId || isLastActiveAdmin(usuario))}
                      aria-label={`${usuario.ativo ? "Desativar" : "Ativar"} ${usuario.nome}`}
                    >
                      <Power className="size-4" />
                    </Button>
                  </div>
                </div>
                {usuario.ativo && usuario.id === currentUserId ? <p className="text-xs text-zinc-500">Você não pode desativar sua própria conta.</p> : null}
                {usuario.ativo && usuario.id !== currentUserId && isLastActiveAdmin(usuario) ? <p className="text-xs text-zinc-500">É necessário manter ao menos um administrador ativo.</p> : null}
              </Card>
            ))}
          </div>
        </section>
      )}

      <UsuarioDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        usuario={editing}
        lockRoleReason={editing?.id === currentUserId ? "Você não pode alterar seu próprio perfil." : editing && isLastActiveAdmin(editing) ? "É necessário manter ao menos um administrador ativo." : undefined}
        onSuccess={(message) => void handleSaved(message)}
      />
      {statusTarget ? (
        <UsuarioStatusDialog
          usuario={statusTarget}
          pending={isChangingStatus}
          error={statusError}
          onOpenChange={(open) => { if (!open) setStatusTarget(undefined); }}
          onConfirm={() => void handleStatusChange()}
        />
      ) : null}
    </div>
  );
}
