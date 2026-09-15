import { z } from "zod";

import {
  ACABAMENTO_CARCACA_VALUES,
  CLASSIFICACAO_FRIGORIFICO_VALUES,
  DISTRIBUICAO_PESO_VALUES,
} from "@/features/abates/types/abate-options";

const numericText = (message: string, options: { positive?: boolean; integer?: boolean } = {}) =>
  z.string().trim().min(1, message).refine((value) => {
    const number = Number(value.replace(",", "."));
    const validLimit = options.positive ? number > 0 : number >= 0;
    return Number.isFinite(number) && validLimit && (!options.integer || Number.isInteger(number));
  }, message);

const photoSchema = z
  .custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Selecione um arquivo válido.",
  )
  .refine((file) => file.size <= 10 * 1024 * 1024, "Cada foto deve ter no máximo 10 MiB.")
  .refine((file) => file.type.startsWith("image/"), "Selecione apenas arquivos de imagem.");

export const etapaFazendaSchema = z.object({
  peso_total: numericText("Informe um peso total válido."),
  quantidade_animal: z.array(z.object({
    denticao: numericText("Informe uma dentição válida.", { integer: true }),
    qtd_animais: numericText("Informe uma quantidade válida.", { integer: true }),
  })),
  fotos: z.array(photoSchema),
});

export const etapaFrigorificoSchema = z.object({
  peso_total: numericText("Informe um peso total válido."),
  balancao: numericText("Informe um valor de balancão válido."),
  acabamento_carcaca: z.array(z.object({
    acabamento: z.enum(ACABAMENTO_CARCACA_VALUES, "Informe o acabamento."),
    qtd_animais: numericText("Informe uma quantidade válida.", { integer: true }),
  })),
  classificacao_frigorifico: z.array(z.object({
    classificacao: z.enum(CLASSIFICACAO_FRIGORIFICO_VALUES, "Informe a classificação."),
    qtd_animais: numericText("Informe uma quantidade válida.", { integer: true }),
  })),
  distribuicao_peso: z.array(z.object({
    classificacao: z.enum(DISTRIBUICAO_PESO_VALUES, "Informe a classificação."),
    qtd_animais: numericText("Informe uma quantidade válida.", { integer: true }),
    peso_total: numericText("Informe um peso válido."),
  })),
  fotos: z.array(photoSchema),
});

export type EtapaFazendaFormData = z.infer<typeof etapaFazendaSchema>;
export type EtapaFrigorificoFormData = z.infer<typeof etapaFrigorificoSchema>;
