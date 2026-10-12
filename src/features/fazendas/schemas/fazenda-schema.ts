import { z } from "zod";

const nonNegativeNumberText = (message: string, integer = false) =>
  z.string().trim().refine((value) => {
    const number = Number(value.replace(",", "."));
    return Number.isFinite(number) && number >= 0 && (!integer || Number.isInteger(number));
  }, message);

export const fazendaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da fazenda."),
  cidade: z.string().trim().min(2, "Informe a cidade."),
  inscricao_rural: z.string().trim().max(80, "Use no máximo 80 caracteres."),
  observacao: z.string().trim().max(500, "Use no máximo 500 caracteres."),
  distancia_frigorifico: nonNegativeNumberText("Informe uma distância válida."),
  quantidade_rebanho: nonNegativeNumberText("Informe uma quantidade inteira e válida.", true),
});

export type FazendaFormData = z.infer<typeof fazendaSchema>;
