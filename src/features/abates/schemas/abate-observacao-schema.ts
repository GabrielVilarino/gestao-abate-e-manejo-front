import { z } from "zod";

export const abateObservacaoSchema = z.object({
  observacao: z.string().trim(),
});

export type AbateObservacaoFormData = z.infer<typeof abateObservacaoSchema>;
