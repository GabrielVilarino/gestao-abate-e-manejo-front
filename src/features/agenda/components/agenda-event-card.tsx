import { Building2, Clock3, LoaderCircle, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatAgendaDateTime,
} from "@/features/agenda/schemas/agenda-date";
import type {
  Agenda,
  AgendaFarmOption,
} from "@/features/agenda/types/agenda";

type AgendaEventCardProps = {
  agenda: Agenda;
  farm?: AgendaFarmOption;
  isOpening: boolean;
  onOpen: (agenda: Agenda) => void;
};

export function AgendaEventCard({
  agenda,
  farm,
  isOpening,
  onOpen,
}: AgendaEventCardProps) {
  return (
    <Card size="sm" className="border-l-4 border-l-orange-500">
      <CardContent className="space-y-3">
        <div>
          <p className="flex items-center gap-2 font-semibold text-zinc-950">
            <Clock3 className="size-4 text-orange-600" />
            {formatAgendaDateTime(agenda.data_hora)}
          </p>
          <p className="mt-2 flex items-center gap-2 text-zinc-700">
            <Building2 className="size-4 shrink-0 text-zinc-400" />
            {farm?.nome ?? `Fazenda #${agenda.fazenda_id}`}
          </p>
          <p className="mt-1 flex items-center gap-2 text-zinc-600">
            <UserRound className="size-4 shrink-0 text-zinc-400" />
            {farm?.proprietarioNome ?? "Proprietário não identificado"}
          </p>
        </div>
        {agenda.observacao ? (
          <p className="line-clamp-2 text-sm leading-6 text-zinc-600">
            {agenda.observacao}
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full"
          onClick={() => onOpen(agenda)}
          disabled={isOpening}
        >
          {isOpening ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isOpening ? "Abrindo..." : "Ver e editar"}
        </Button>
      </CardContent>
    </Card>
  );
}
