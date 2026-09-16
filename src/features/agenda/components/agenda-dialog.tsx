"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgendaForm } from "@/features/agenda/components/agenda-form";
import type {
  Agenda,
  AgendaFarmOption,
} from "@/features/agenda/types/agenda";

type AgendaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agenda?: Agenda;
  defaultDate: string;
  farms: AgendaFarmOption[];
  optionsLoading: boolean;
  optionsError: string;
  onRetryOptions: () => void;
  onSuccess: (message: string) => void;
  onDeleteRequest: (agenda: Agenda) => void;
};

export function AgendaDialog({
  open,
  onOpenChange,
  agenda,
  defaultDate,
  farms,
  optionsLoading,
  optionsError,
  onRetryOptions,
  onSuccess,
  onDeleteRequest,
}: AgendaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {agenda ? "Editar agendamento" : "Novo agendamento"}
          </DialogTitle>
          <DialogDescription>
            Data e horário são apresentados no fuso de Brasília.
          </DialogDescription>
        </DialogHeader>
        <AgendaForm
          key={agenda?.id ?? `new-${defaultDate}`}
          agenda={agenda}
          defaultDate={defaultDate}
          farms={farms}
          optionsLoading={optionsLoading}
          optionsError={optionsError}
          onRetryOptions={onRetryOptions}
          onCancel={() => onOpenChange(false)}
          onSuccess={onSuccess}
          onDeleteRequest={
            agenda ? () => onDeleteRequest(agenda) : undefined
          }
        />
      </DialogContent>
    </Dialog>
  );
}
