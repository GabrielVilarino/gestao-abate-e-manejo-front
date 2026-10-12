import { z } from "zod";

const optionalDate = z.string().refine((value) => !value || isValidDate(value), "Informe uma data válida.");

export const dashboardFiltersSchema = z.object({
  proprietario_id: z.string(),
  fazenda_id: z.string(),
  data_inicio: optionalDate,
  data_fim: optionalDate,
}).superRefine((data, context) => {
  if (data.fazenda_id && !data.proprietario_id) context.addIssue({ code: "custom", path: ["fazenda_id"], message: "Selecione o proprietário antes da fazenda." });
  if (data.data_inicio && data.data_fim && data.data_inicio > data.data_fim) context.addIssue({ code: "custom", path: ["data_fim"], message: "A data final deve ser igual ou posterior à data inicial." });
});

export type DashboardFilterFormData = z.infer<typeof dashboardFiltersSchema>;

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
