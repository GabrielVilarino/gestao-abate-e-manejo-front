import type { Agenda, AgendaView } from "@/features/agenda/types/agenda";

export const BRASILIA_TIME_ZONE = "America/Sao_Paulo";

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BRASILIA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateTimePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BRASILIA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function partsMap(formatter: Intl.DateTimeFormat, date: Date) {
  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

export function getBrasiliaDateKey(date = new Date()) {
  const parts = partsMap(dateKeyFormatter, date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function isoToAgendaFormDate(isoDate: string) {
  const parts = partsMap(dateTimePartsFormatter, new Date(isoDate));
  return {
    data: `${parts.year}-${parts.month}-${parts.day}`,
    hora: `${parts.hour}:${parts.minute}`,
  };
}

function getTimeZoneOffset(timestamp: number) {
  const parts = partsMap(dateTimePartsFormatter, new Date(timestamp));
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - timestamp;
}

export function brasiliaDateTimeToIso(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second = 0] = time.split(":").map(Number);
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  let timestamp = desiredUtc - getTimeZoneOffset(desiredUtc);
  timestamp = desiredUtc - getTimeZoneOffset(timestamp);
  return new Date(timestamp).toISOString();
}

/** Converte uma data de calendário em um limite RFC 3339 do dia em Brasília. */
export function agendaDateKeyToFilterIso(
  dateKey: string,
  boundary: "start" | "end",
) {
  return brasiliaDateTimeToIso(dateKey, boundary === "start" ? "00:00:00" : "23:59:59");
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toDateKey(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function addDays(dateKey: string, amount: number) {
  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + amount);
  return toDateKey(date);
}

export function addMonths(dateKey: string, amount: number) {
  const date = parseDateKey(dateKey);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + amount);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return toDateKey(date);
}

export function startOfWeek(dateKey: string) {
  const date = parseDateKey(dateKey);
  return addDays(dateKey, -date.getUTCDay());
}

export function endOfMonth(dateKey: string) {
  const date = parseDateKey(dateKey);
  return toDateKey(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)),
  );
}

export function getVisiblePeriod(view: AgendaView, dateKey: string) {
  if (view === "day") return { dataInicio: dateKey, dataFim: dateKey };
  if (view === "week") {
    const dataInicio = startOfWeek(dateKey);
    return { dataInicio, dataFim: addDays(dataInicio, 6) };
  }
  const date = parseDateKey(dateKey);
  const dataInicio = toDateKey(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
  );
  return { dataInicio, dataFim: endOfMonth(dateKey) };
}

export function getMonthGridDays(dateKey: string) {
  const period = getVisiblePeriod("month", dateKey);
  const gridStart = startOfWeek(period.dataInicio);
  const endWeekStart = startOfWeek(period.dataFim);
  const gridEnd = addDays(endWeekStart, 6);
  const days: string[] = [];
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) days.push(day);
  return days;
}

export function getWeekDays(dateKey: string) {
  const firstDay = startOfWeek(dateKey);
  return Array.from({ length: 7 }, (_, index) => addDays(firstDay, index));
}

export function agendaDateKey(agenda: Agenda) {
  return getBrasiliaDateKey(new Date(agenda.data_hora));
}

export function moveAgendaDate(dateKey: string, view: AgendaView, direction: -1 | 1) {
  if (view === "month") return addMonths(dateKey, direction);
  return addDays(dateKey, view === "week" ? direction * 7 : direction);
}

export function formatCalendarTitle(dateKey: string, view: AgendaView) {
  const date = parseDateKey(dateKey);
  if (view === "month") {
    const label = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  if (view === "day") {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }
  const first = parseDateKey(startOfWeek(dateKey));
  const last = parseDateKey(addDays(startOfWeek(dateKey), 6));
  return `${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(first)} – ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(last)}`;
}

export function formatDayLabel(dateKey: string, weekday = true) {
  return new Intl.DateTimeFormat("pt-BR", {
    ...(weekday ? { weekday: "short" as const } : {}),
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(parseDateKey(dateKey));
}

export function formatAgendaTime(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BRASILIA_TIME_ZONE,
  }).format(new Date(isoDate));
}

export function formatAgendaDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BRASILIA_TIME_ZONE,
  }).format(new Date(isoDate));
}
