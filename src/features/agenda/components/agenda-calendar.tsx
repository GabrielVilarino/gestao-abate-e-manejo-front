import { LoaderCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgendaEventCard } from "@/features/agenda/components/agenda-event-card";
import {
  agendaDateKey,
  formatAgendaTime,
  formatDayLabel,
  getMonthGridDays,
  getWeekDays,
  parseDateKey,
} from "@/features/agenda/schemas/agenda-date";
import type {
  Agenda,
  AgendaFarmOption,
  AgendaView,
} from "@/features/agenda/types/agenda";
import { cn } from "@/lib/utils";

type AgendaCalendarProps = {
  view: AgendaView;
  dateKey: string;
  today: string;
  agendas: Agenda[];
  farms: AgendaFarmOption[];
  openingId?: number;
  onOpenAgenda: (agenda: Agenda) => void;
};

const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function groupByDay(agendas: Agenda[]) {
  return agendas.reduce<Map<string, Agenda[]>>((groups, agenda) => {
    const key = agendaDateKey(agenda);
    groups.set(key, [...(groups.get(key) ?? []), agenda]);
    return groups;
  }, new Map());
}

function findFarm(farms: AgendaFarmOption[], farmId: number) {
  return farms.find((farm) => farm.id === farmId);
}

function EmptyDay() {
  return (
    <p className="rounded-xl border border-dashed bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
      Nenhum agendamento neste dia.
    </p>
  );
}

export function AgendaCalendar({
  view,
  dateKey,
  today,
  agendas,
  farms,
  openingId,
  onOpenAgenda,
}: AgendaCalendarProps) {
  const byDay = groupByDay(agendas);

  if (view === "day") {
    const dayAgendas = byDay.get(dateKey) ?? [];
    return (
      <section aria-label={`Agenda de ${formatDayLabel(dateKey)}`} className="space-y-3">
        {dayAgendas.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dayAgendas.map((agenda) => (
              <AgendaEventCard
                key={agenda.id}
                agenda={agenda}
                farm={findFarm(farms, agenda.fazenda_id)}
                isOpening={openingId === agenda.id}
                onOpen={onOpenAgenda}
              />
            ))}
          </div>
        ) : (
          <EmptyDay />
        )}
      </section>
    );
  }

  if (view === "week") {
    return (
      <section aria-label="Agenda semanal" className="grid gap-3 lg:grid-cols-7">
        {getWeekDays(dateKey).map((day) => {
          const dayAgendas = byDay.get(day) ?? [];
          return (
            <Card key={day} className={cn(day === today && "border-orange-300 bg-orange-50/30")}>
              <CardHeader className="flex flex-row items-center justify-between lg:block">
                <CardTitle className="capitalize">{formatDayLabel(day)}</CardTitle>
                {day === today ? <Badge variant="secondary">Hoje</Badge> : null}
              </CardHeader>
              <CardContent className="space-y-2">
                {dayAgendas.length ? (
                  dayAgendas.map((agenda) => {
                    const farm = findFarm(farms, agenda.fazenda_id);
                    return (
                      <button
                        key={agenda.id}
                        type="button"
                        className="w-full rounded-xl border border-orange-200 bg-white p-3 text-left transition hover:border-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-60"
                        onClick={() => onOpenAgenda(agenda)}
                        disabled={openingId === agenda.id}
                        aria-label={`Editar agendamento de ${farm?.nome ?? `fazenda ${agenda.fazenda_id}`} às ${formatAgendaTime(agenda.data_hora)}`}
                      >
                        <span className="flex items-center gap-1 font-semibold text-orange-700">
                          {openingId === agenda.id ? <LoaderCircle className="size-3 animate-spin" /> : null}
                          {formatAgendaTime(agenda.data_hora)}
                        </span>
                        <span className="mt-1 block truncate text-xs text-zinc-700">
                          {farm?.nome ?? `Fazenda #${agenda.fazenda_id}`}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-zinc-500">
                          {farm?.proprietarioNome ?? "Proprietário não identificado"}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="py-3 text-center text-xs text-zinc-400">Sem eventos</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>
    );
  }

  const month = parseDateKey(dateKey).getUTCMonth();
  return (
    <section aria-label="Agenda mensal" className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="grid grid-cols-7 border-b bg-zinc-50">
        {weekdays.map((weekday) => (
          <div key={weekday} className="px-1 py-2 text-center text-xs font-semibold text-zinc-500 sm:text-sm">
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {getMonthGridDays(dateKey).map((day) => {
          const dayAgendas = byDay.get(day) ?? [];
          const isCurrentMonth = parseDateKey(day).getUTCMonth() === month;
          return (
            <div
              key={day}
              className={cn(
                "min-h-24 border-r border-b p-1 last:border-r-0 sm:min-h-32 sm:p-2",
                !isCurrentMonth && "bg-zinc-50/70 text-zinc-400",
                day === today && "bg-orange-50/70",
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-semibold sm:text-sm",
                    day === today && "bg-orange-600 text-white",
                  )}
                >
                  {parseDateKey(day).getUTCDate()}
                </span>
                {dayAgendas.length > 2 ? (
                  <span className="text-[10px] text-zinc-500">+{dayAgendas.length - 2}</span>
                ) : null}
              </div>
              <div className="space-y-1">
                {dayAgendas.slice(0, 2).map((agenda) => {
                  const farm = findFarm(farms, agenda.fazenda_id);
                  return (
                    <button
                      key={agenda.id}
                      type="button"
                      onClick={() => onOpenAgenda(agenda)}
                      disabled={openingId === agenda.id}
                      className="block w-full truncate rounded-md bg-orange-100 px-1 py-1 text-left text-[10px] font-medium text-orange-900 transition hover:bg-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-60 sm:text-xs"
                      title={`${formatAgendaTime(agenda.data_hora)} — ${farm?.nome ?? `Fazenda #${agenda.fazenda_id}`}`}
                    >
                      {openingId === agenda.id ? "Abrindo..." : `${formatAgendaTime(agenda.data_hora)} ${farm?.nome ?? "Fazenda"}`}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
