import { z } from "zod";

function isValidDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const agendaSchema = z.object({
  fazendaId: z
    .string()
    .min(1, "Selecione uma fazenda.")
    .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, {
      message: "Selecione uma fazenda válida.",
    }),
  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.")
    .refine(isValidDate, "Informe uma data válida."),
  hora: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe um horário válido."),
  observacao: z.string(),
});

export type AgendaFormData = z.infer<typeof agendaSchema>;
