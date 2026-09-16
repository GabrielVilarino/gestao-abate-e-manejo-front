"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isoToAgendaFormDate } from "@/features/agenda/schemas/agenda-date";
import {
  agendaSchema,
  type AgendaFormData,
} from "@/features/agenda/schemas/agenda-schema";
import { agendaService } from "@/features/agenda/services/agenda-service";
import type {
  Agenda,
  AgendaFarmOption,
} from "@/features/agenda/types/agenda";
import { getErrorMessage } from "@/lib/api-client";

type AgendaFormProps = {
  agenda?: Agenda;
  defaultDate: string;
  farms: AgendaFarmOption[];
  optionsLoading: boolean;
  optionsError: string;
  onRetryOptions: () => void;
  onSuccess: (message: string) => void;
  onCancel: () => void;
  onDeleteRequest?: () => void;
};

export function AgendaForm({
  agenda,
  defaultDate,
  farms,
  optionsLoading,
  optionsError,
  onRetryOptions,
  onSuccess,
  onCancel,
  onDeleteRequest,
}: AgendaFormProps) {
  const [serverError, setServerError] = useState("");
  const editDate = agenda ? isoToAgendaFormDate(agenda.data_hora) : undefined;
  const selectableFarms = farms.filter(
    (farm) => farm.ativo || farm.id === agenda?.fazenda_id,
  );
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AgendaFormData>({
    resolver: zodResolver(agendaSchema),
    defaultValues: {
      fazendaId: agenda ? String(agenda.fazenda_id) : "",
      data: editDate?.data ?? defaultDate,
      hora: editDate?.hora ?? "08:00",
      observacao: agenda?.observacao ?? "",
    },
  });

  async function onSubmit(data: AgendaFormData) {
    setServerError("");
    try {
      const response = agenda
        ? await agendaService.update(agenda.id, data)
        : await agendaService.create(data);
      onSuccess(
        response.message ||
          `Agendamento ${agenda ? "atualizado" : "criado"} com sucesso.`,
      );
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {optionsError ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar as fazendas</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{optionsError}</p>
            <Button type="button" variant="outline" onClick={onRetryOptions}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="agenda-farm">Fazenda</Label>
        <Controller
          name="fazendaId"
          control={control}
          render={({ field }) => (
            <Select
              id="agenda-farm"
              value={field.value}
              onValueChange={field.onChange}
              options={selectableFarms.map((farm) => ({
                value: String(farm.id),
                label: `${farm.nome} — ${farm.proprietarioNome}${farm.ativo ? "" : " (inativa)"}`,
              }))}
              placeholder={
                optionsLoading ? "Carregando fazendas..." : "Selecione a fazenda"
              }
              disabled={optionsLoading || Boolean(optionsError)}
              invalid={Boolean(errors.fazendaId)}
              describedBy={errors.fazendaId ? "agenda-farm-error" : undefined}
            />
          )}
        />
        {errors.fazendaId ? (
          <p id="agenda-farm-error" className="text-sm text-red-600">
            {errors.fazendaId.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="agenda-date">Data</Label>
          <Input
            id="agenda-date"
            type="date"
            aria-invalid={Boolean(errors.data)}
            aria-describedby={errors.data ? "agenda-date-error" : undefined}
            {...register("data")}
          />
          {errors.data ? (
            <p id="agenda-date-error" className="text-sm text-red-600">
              {errors.data.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="agenda-time">Horário</Label>
          <Input
            id="agenda-time"
            type="time"
            aria-invalid={Boolean(errors.hora)}
            aria-describedby={errors.hora ? "agenda-time-error" : undefined}
            {...register("hora")}
          />
          {errors.hora ? (
            <p id="agenda-time-error" className="text-sm text-red-600">
              {errors.hora.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="agenda-note">Observação</Label>
        <Textarea
          id="agenda-note"
          placeholder="Informações adicionais (opcional)"
          aria-invalid={Boolean(errors.observacao)}
          aria-describedby={errors.observacao ? "agenda-note-error" : undefined}
          {...register("observacao")}
        />
        {errors.observacao ? (
          <p id="agenda-note-error" className="text-sm text-red-600">
            {errors.observacao.message}
          </p>
        ) : null}
      </div>

      {serverError ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
        {agenda && onDeleteRequest ? (
          <Button
            type="button"
            variant="destructive"
            className="sm:mr-auto"
            onClick={onDeleteRequest}
            disabled={isSubmitting}
          >
            <Trash2 className="size-4" /> Excluir
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || optionsLoading || Boolean(optionsError)}
        >
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isSubmitting ? "Salvando..." : "Salvar agendamento"}
        </Button>
      </div>
    </form>
  );
}
