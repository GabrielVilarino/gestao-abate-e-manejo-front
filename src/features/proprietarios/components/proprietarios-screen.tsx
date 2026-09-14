"use client";

import { Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { ConfirmStatusDialog } from "@/components/feedback/confirm-status-dialog";
import { StatusMessage } from "@/components/feedback/status-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProprietarioCard } from "@/features/proprietarios/components/proprietario-card";
import { ProprietarioDialog } from "@/features/proprietarios/components/proprietario-dialog";
import { useProprietarios } from "@/features/proprietarios/hooks/use-proprietarios";
import { onlyDigits } from "@/features/proprietarios/schemas/proprietario-schema";
import type { Proprietario } from "@/features/proprietarios/types/proprietario";
import { proprietarioService } from "@/features/proprietarios/services/proprietario-service";
import { getErrorMessage } from "@/lib/api-client";

export function ProprietariosScreen() {
  const { proprietarios, isLoading, error, reload } = useProprietarios();
  const [nameFilter, setNameFilter] = useState("");
  const [cpfFilter, setCpfFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Proprietario>();
  const [success, setSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [statusTarget, setStatusTarget] = useState<Proprietario>();
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const filtered = useMemo(() => {
    const name = nameFilter.trim().toLocaleLowerCase("pt-BR");
    const cpf = onlyDigits(cpfFilter);
    return proprietarios.filter(
      (item) =>
        (!name || item.nome.toLocaleLowerCase("pt-BR").includes(name)) &&
        (!cpf || onlyDigits(item.cpf).includes(cpf)),
    );
  }, [cpfFilter, nameFilter, proprietarios]);

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(proprietario: Proprietario) {
    setEditing(proprietario);
    setDialogOpen(true);
  }

  async function handleSuccess(message: string) {
    setDialogOpen(false);
    setSuccess(message);
    await reload();
  }

  async function handleStatusChange() {
    if (!statusTarget) return;
    setIsChangingStatus(true);
    setActionError("");
    try {
      const response = await proprietarioService.setActive(statusTarget.id, !statusTarget.ativo);
      setSuccess(response.message || `Proprietário ${statusTarget.ativo ? "desativado" : "ativado"} com sucesso.`);
      setStatusTarget(undefined);
      await reload();
    } catch (actionError) {
      setActionError(getErrorMessage(actionError));
    } finally {
      setIsChangingStatus(false);
    }
  }

  const hasFilters = Boolean(nameFilter || cpfFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600">Cadastros</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">Proprietários</h1>
          <p className="mt-2 text-sm text-zinc-600">Consulte e mantenha os proprietários rurais.</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="size-5" /> Novo proprietário
        </Button>
      </div>

      {success ? <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800"><AlertTitle>{success}</AlertTitle></Alert> : null}
      {actionError ? <Alert variant="destructive"><AlertTitle>Não foi possível alterar a situação</AlertTitle><AlertDescription>{actionError}</AlertDescription></Alert> : null}

      <section aria-label="Filtros" className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
          <div className="flex items-center gap-3 rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring/50">
            <Search className="size-5 shrink-0 text-zinc-400" />
            <Input value={nameFilter} onChange={(event) => setNameFilter(event.target.value)} placeholder="Filtrar por nome" aria-label="Filtrar por nome" className="border-0 px-0 shadow-none focus-visible:ring-0" />
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring/50">
            <Search className="size-5 shrink-0 text-zinc-400" />
            <Input value={cpfFilter} onChange={(event) => setCpfFilter(event.target.value)} placeholder="Filtrar por CPF" aria-label="Filtrar por CPF" inputMode="numeric" className="border-0 px-0 shadow-none focus-visible:ring-0" />
          </div>
          {hasFilters ? <Button variant="outline" onClick={() => { setNameFilter(""); setCpfFilter(""); }}><X className="size-4" /> Limpar</Button> : null}
        </div>
      </section>

      {isLoading ? (
        <div role="status" aria-label="Carregando proprietários" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-44 rounded-2xl" />)}
        </div>
      ) : error ? (
        <StatusMessage variant="error" title="Não foi possível carregar os proprietários" description={error} onRetry={() => void reload()} />
      ) : filtered.length === 0 ? (
        <StatusMessage title={hasFilters ? "Nenhum proprietário encontrado" : "Nenhum proprietário cadastrado"} description={hasFilters ? "Revise os filtros informados." : "Cadastre o primeiro proprietário para começar."} />
      ) : (
        <section aria-label="Lista de proprietários">
          <p className="mb-3 text-sm text-zinc-500">{filtered.length} {filtered.length === 1 ? "proprietário" : "proprietários"}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => <ProprietarioCard key={item.id} proprietario={item} onEdit={() => openEdit(item)} onToggleStatus={() => setStatusTarget(item)} />)}
          </div>
        </section>
      )}

      <ProprietarioDialog open={dialogOpen} onOpenChange={setDialogOpen} proprietario={editing} onSuccess={(message) => void handleSuccess(message)} />
      {statusTarget ? <ConfirmStatusDialog open onOpenChange={(open) => { if (!open && !isChangingStatus) setStatusTarget(undefined); }} itemName={statusTarget.nome} itemType="proprietário" isActive={statusTarget.ativo} isPending={isChangingStatus} onConfirm={() => void handleStatusChange()} /> : null}
    </div>
  );
}
