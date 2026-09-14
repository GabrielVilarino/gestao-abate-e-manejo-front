"use client";

import { ArrowLeft, MapPin, Pencil, Plus, Power, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ConfirmStatusDialog } from "@/components/feedback/confirm-status-dialog";
import { StatusMessage } from "@/components/feedback/status-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FazendaCard } from "@/features/fazendas/components/fazenda-card";
import { FazendaDialog } from "@/features/fazendas/components/fazenda-dialog";
import { useFazendas } from "@/features/fazendas/hooks/use-fazendas";
import { fazendaService } from "@/features/fazendas/services/fazenda-service";
import type { Fazenda } from "@/features/fazendas/types/fazenda";
import { ProprietarioDialog } from "@/features/proprietarios/components/proprietario-dialog";
import { useProprietarios } from "@/features/proprietarios/hooks/use-proprietarios";
import { proprietarioService } from "@/features/proprietarios/services/proprietario-service";
import { formatCpf } from "@/features/proprietarios/schemas/proprietario-schema";
import { getErrorMessage } from "@/lib/api-client";

export function ProprietarioDetailScreen({ id }: { id: string }) {
  const numericId = Number(id);
  const { proprietarios, isLoading: ownersLoading, error: ownersError, reload: reloadOwners } = useProprietarios();
  const proprietario = Number.isInteger(numericId) ? proprietarios.find((item) => item.id === numericId) : undefined;
  const ownerResolved = !ownersLoading && !ownersError && Boolean(proprietario);
  const { fazendas, isLoading: farmsLoading, error: farmsError, reload: reloadFarms } = useFazendas(ownerResolved ? numericId : undefined);
  const [ownerDialogOpen, setOwnerDialogOpen] = useState(false);
  const [farmDialogOpen, setFarmDialogOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Fazenda>();
  const [success, setSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [ownerStatusOpen, setOwnerStatusOpen] = useState(false);
  const [farmStatusTarget, setFarmStatusTarget] = useState<Fazenda>();
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  if (ownersLoading) {
    return <div role="status" aria-label="Carregando proprietário" className="space-y-5"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-48 rounded-2xl" /></div>;
  }

  if (ownersError) {
    return <StatusMessage variant="error" title="Não foi possível carregar o proprietário" description={ownersError} onRetry={() => void reloadOwners()} />;
  }

  if (!proprietario) {
    return (
      <StatusMessage
        variant="error"
        title="Proprietário não encontrado"
        description="O cadastro solicitado não existe ou não está mais disponível."
      />
    );
  }

  async function handleOwnerSuccess(message: string) {
    setOwnerDialogOpen(false);
    setSuccess(message);
    await reloadOwners();
  }

  async function handleFarmSuccess(message: string) {
    setFarmDialogOpen(false);
    setSuccess(message);
    await reloadFarms();
  }

  function openFarm(fazenda?: Fazenda) {
    setEditingFarm(fazenda);
    setFarmDialogOpen(true);
  }

  async function handleOwnerStatusChange() {
    if (!proprietario) return;
    setIsChangingStatus(true);
    setActionError("");
    try {
      const response = await proprietarioService.setActive(proprietario.id, !proprietario.ativo);
      setSuccess(response.message || `Proprietário ${proprietario.ativo ? "desativado" : "ativado"} com sucesso.`);
      setOwnerStatusOpen(false);
      await reloadOwners();
    } catch (actionError) {
      setActionError(getErrorMessage(actionError));
    } finally {
      setIsChangingStatus(false);
    }
  }

  async function handleFarmStatusChange() {
    if (!farmStatusTarget) return;
    setIsChangingStatus(true);
    setActionError("");
    try {
      const response = await fazendaService.setActive(farmStatusTarget.id, !farmStatusTarget.ativo);
      setSuccess(response.message || `Fazenda ${farmStatusTarget.ativo ? "desativada" : "ativada"} com sucesso.`);
      setFarmStatusTarget(undefined);
      await reloadFarms();
    } catch (actionError) {
      setActionError(getErrorMessage(actionError));
    } finally {
      setIsChangingStatus(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/proprietarios" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-zinc-600 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
        <ArrowLeft className="size-4" /> Voltar para proprietários
      </Link>

      {success ? (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{success}</span>
          <Button type="button" variant="ghost" size="icon-sm" className="hover:bg-emerald-100" onClick={() => setSuccess("")} aria-label="Fechar mensagem"><X className="size-4" /></Button>
        </div>
      ) : null}
      {actionError ? <Alert variant="destructive"><AlertTitle>Não foi possível alterar a situação</AlertTitle><AlertDescription>{actionError}</AlertDescription></Alert> : null}

      <Card>
        <CardContent className="sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-orange-50 text-orange-600"><UserRound className="size-7" /></div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-orange-600">Proprietário</p>
                <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">{proprietario.nome}</h1>
                <p className="mt-2 text-sm text-zinc-500">CPF {formatCpf(proprietario.cpf)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setOwnerDialogOpen(true)}><Pencil className="size-4" /> Editar proprietário</Button>
              <Button variant={proprietario.ativo ? "destructive" : "default"} onClick={() => setOwnerStatusOpen(true)}><Power className="size-4" /> {proprietario.ativo ? "Desativar" : "Ativar"}</Button>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 border-t border-zinc-100 pt-5 sm:grid-cols-2">
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Situação</dt><dd className="mt-1"><Badge variant="outline" className={proprietario.ativo ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}>{proprietario.ativo ? "Ativo" : "Inativo"}</Badge></dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Observação</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{proprietario.observacao || "Sem observações cadastradas."}</dd></div>
          </dl>
        </CardContent>
      </Card>

      <section className="space-y-4" aria-labelledby="farms-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><MapPin className="size-4" /> Propriedades vinculadas</p>
            <h2 id="farms-title" className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">Fazendas</h2>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => openFarm()}><Plus className="size-5" /> Nova fazenda</Button>
        </div>

        {farmsLoading ? (
          <div role="status" aria-label="Carregando fazendas" className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-56 rounded-2xl" />)}
          </div>
        ) : farmsError ? (
          <StatusMessage variant="error" title="Não foi possível carregar as fazendas" description={farmsError} onRetry={() => void reloadFarms()} />
        ) : fazendas.length === 0 ? (
          <StatusMessage title="Nenhuma fazenda vinculada" description="Cadastre a primeira fazenda deste proprietário." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {fazendas.map((fazenda) => <FazendaCard key={fazenda.id} fazenda={fazenda} onEdit={() => openFarm(fazenda)} onToggleStatus={() => setFarmStatusTarget(fazenda)} />)}
          </div>
        )}
      </section>

      <ProprietarioDialog open={ownerDialogOpen} onOpenChange={setOwnerDialogOpen} proprietario={proprietario} onSuccess={(message) => void handleOwnerSuccess(message)} />
      <FazendaDialog open={farmDialogOpen} onOpenChange={setFarmDialogOpen} idProprietario={proprietario.id} fazenda={editingFarm} onSuccess={(message) => void handleFarmSuccess(message)} />
      <ConfirmStatusDialog open={ownerStatusOpen} onOpenChange={(open) => { if (!open && !isChangingStatus) setOwnerStatusOpen(false); }} itemName={proprietario.nome} itemType="proprietário" isActive={proprietario.ativo} isPending={isChangingStatus} onConfirm={() => void handleOwnerStatusChange()} />
      {farmStatusTarget ? <ConfirmStatusDialog open onOpenChange={(open) => { if (!open && !isChangingStatus) setFarmStatusTarget(undefined); }} itemName={farmStatusTarget.nome} itemType="fazenda" isActive={farmStatusTarget.ativo} isPending={isChangingStatus} onConfirm={() => void handleFarmStatusChange()} /> : null}
    </div>
  );
}
