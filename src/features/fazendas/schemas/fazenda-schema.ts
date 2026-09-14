import { z } from "zod";

export const fazendaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da fazenda."),
  cidade: z.string().trim().min(2, "Informe a cidade."),
  inscricao_rural: z.string().trim().max(80, "Use no máximo 80 caracteres."),
  observacao: z.string().trim().max(500, "Use no máximo 500 caracteres."),
});

export type FazendaFormData = z.infer<typeof fazendaSchema>;
