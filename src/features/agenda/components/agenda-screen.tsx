"use client";

import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";

import { StatusMessage } from "@/components/feedback/status-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AgendaCalendar } from "@/features/agenda/components/agenda-calendar";
import { AgendaDeleteDialog } from "@/features/agenda/components/agenda-delete-dialog";
import { AgendaDialog } from "@/features/agenda/components/agenda-dialog";
import { useAgendaOptions } from "@/features/agenda/hooks/use-agenda-options";
import { useAgendas } from "@/features/agenda/hooks/use-agendas";
import {
  formatCalendarTitle,
  getBrasiliaDateKey,
  getVisiblePeriod,
  moveAgendaDate,
} from "@/features/agenda/schemas/agenda-date";
import { agendaService } from "@/features/agenda/services/agenda-service";
import type { Agenda, AgendaView } from "@/features/agenda/types/agenda";
import { ApiError, getErrorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const views: { value: AgendaView; label: string }[] = [
  { value: "month", label: "Mês" },
  { value: "week", label: "Semana" },
  { value: "day", label: "Dia" },
];

function deletionErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
    if (error.status === 403) return "Seu perfil não tem permissão para excluir este agendamento.";
    if (error.status === 404) return "Este agendamento não existe mais. Atualize a agenda e tente novamente.";
  }
  return getErrorMessage(error);
}

export function AgendaScreen() {
  const today = getBrasiliaDateKey();
  const [view, setView] = useState<AgendaView>("month");
  const [dateKey, setDateKey] = useState(today);
  const period = useMemo(() => getVisiblePeriod(view, dateKey), [view, dateKey]);
  const { agendas, error, isLoading, reload } = useAgendas(period);
  const {
    farms,
    isLoading: optionsLoading,
    error: optionsError,
    reload: reloadOptions,
  } = useAgendaOptions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda>();
  const [openingId, setOpeningId] = useState<number>();
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Agenda>();
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  function openNewAgenda() {
    setSelectedAgenda(undefined);
    setActionError("");
    setDialogOpen(true);
  }

  async function openAgenda(agenda: Agenda) {
    if (openingId) return;
    setOpeningId(agenda.id);
    setActionError("");
    try {
      const detail = await agendaService.get(agenda.id);
      setSelectedAgenda(detail);
      setDialogOpen(true);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 404) {
        setActionError("Este agendamento não existe mais. A agenda foi atualizada.");
        await reload();
      } else {
        setActionError(getErrorMessage(loadError));
      }
    } finally {
      setOpeningId(undefined);
    }
  }

  async function handleSaved(message: string) {
    setDialogOpen(false);
    setSelectedAgenda(undefined);
    setSuccess(message);
    setActionError("");
    await reload();
  }

  function requestDelete(agenda: Agenda) {
    setDialogOpen(false);
    setDeleteTarget(agenda);
    setDeleteError("");
  }

  async function confirmDelete() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await agendaService.delete(deleteTarget.id);
      setDeleteTarget(undefined);
      setSelectedAgenda(undefined);
      setSuccess(response.message || "Agendamento excluído com sucesso.");
      await reload();
    } catch (deleteFailure) {
      setDeleteError(deletionErrorMessage(deleteFailure));
      if (deleteFailure instanceof ApiError && deleteFailure.status === 404) {
        await reload();
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const deleteFarm = farms.find((farm) => farm.id === deleteTarget?.fazenda_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600">Planejamento</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">Agenda</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Organize os abates no horário de Brasília.
          </p>
        </div>
        <Button type="button" className="h-10 w-full sm:w-auto" onClick={openNewAgenda}>
          <Plus className="size-5" /> Novo agendamento
        </Button>
      </div>

      {success ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <AlertTitle>{success}</AlertTitle>
        </Alert>
      ) : null}
      {actionError ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível abrir o agendamento</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      ) : null}

      <section aria-label="Controles da agenda" className="space-y-3 rounded-2xl border bg-white p-3 shadow-sm sm:p-4">
        <div className="grid grid-cols-3 rounded-xl bg-zinc-100 p-1 sm:ml-auto sm:w-fit">
          {views.map((item) => (
            <Button
              key={item.value}
              type="button"
              variant="ghost"
              className={cn(
                "h-9",
                view === item.value && "bg-white text-orange-700 shadow-sm hover:bg-white",
              )}
              aria-pressed={view === item.value}
              onClick={() => setView(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label={`Período ${view === "month" ? "anterior" : view === "week" ? "semanal anterior" : "do dia anterior"}`}
            onClick={() => setDateKey(moveAgendaDate(dateKey, view, -1))}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <div className="min-w-0 text-center">
            <h2 className="truncate text-base font-semibold capitalize text-zinc-900 sm:text-lg">
              {formatCalendarTitle(dateKey, view)}
            </h2>
            {dateKey !== today ? (
              <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => setDateKey(today)}>
                Ir para hoje
              </Button>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label={`Próximo ${view === "month" ? "período" : view === "week" ? "período semanal" : "dia"}`}
            onClick={() => setDateKey(moveAgendaDate(dateKey, view, 1))}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </section>

      {isLoading ? (
        <div role="status" aria-label="Carregando agenda" className="space-y-3">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-112 rounded-2xl" />
        </div>
      ) : error ? (
        <StatusMessage
          variant="error"
          title="Não foi possível carregar a agenda"
          description={error}
          onRetry={() => void reload()}
        />
      ) : (
        <div className="space-y-4">
          {agendas.length === 0 ? (
            <Alert>
              <AlertTitle>Nenhum agendamento neste período</AlertTitle>
              <AlertDescription>
                Crie um agendamento ou navegue para outro período da agenda.
              </AlertDescription>
            </Alert>
          ) : null}
          <AgendaCalendar
            view={view}
            dateKey={dateKey}
            today={today}
            agendas={agendas}
            farms={farms}
            openingId={openingId}
            onOpenAgenda={(agenda) => void openAgenda(agenda)}
          />
        </div>
      )}

      <AgendaDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedAgenda(undefined);
        }}
        agenda={selectedAgenda}
        defaultDate={dateKey}
        farms={farms}
        optionsLoading={optionsLoading}
        optionsError={optionsError}
        onRetryOptions={() => void reloadOptions()}
        onSuccess={(message) => void handleSaved(message)}
        onDeleteRequest={requestDelete}
      />

      <AgendaDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(undefined);
        }}
        farmName={deleteFarm?.nome ?? `Fazenda #${deleteTarget?.fazenda_id ?? ""}`}
        isPending={isDeleting}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
