import { z } from "zod";

import {
  ACABAMENTO_CARCACA_VALUES,
  CLASSIFICACAO_FRIGORIFICO_VALUES,
  DISTRIBUICAO_PESO_VALUES,
} from "@/features/abates/types/abate-options";

const requiredText = (message: string) => z.string().trim().min(1, message);

const positiveNumberText = (message: string, integer = false) =>
  requiredText(message).refine((value) => {
    const number = Number(value.replace(",", "."));
    return Number.isFinite(number) && number > 0 && (!integer || Number.isInteger(number));
  }, message);

const positiveId = (message: string) => z.number().int(message).positive(message);

const nonNegativeNumberText = (message: string, integer = false) =>
  requiredText(message).refine((value) => {
    const number = Number(value.replace(",", "."));
    return Number.isFinite(number) && number >= 0 && (!integer || Number.isInteger(number));
  }, message);

const optionalPositiveIntegerText = z
  .string()
  .trim()
  .refine(
    (value) => !value || (Number.isInteger(Number(value)) && Number(value) > 0),
    "Informe um número de lote inteiro e positivo.",
  );

const dateText = requiredText("Informe a data do abate.").refine(isValidDate, "Informe uma data válida.");
const optionalDateText = z.string().refine((value) => !value || isValidDate(value), "Informe uma data válida.");

const optionalStageNumber = z.string().trim();

const photoSchema = z
  .custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Selecione um arquivo válido.",
  )
  .refine((file) => file.size <= 10 * 1024 * 1024, "Cada foto deve ter no máximo 10 MiB.")
  .refine((file) => file.type.startsWith("image/"), "Selecione apenas arquivos de imagem.");

const quantidadeAnimalSchema = z.object({
  denticao: optionalStageNumber,
  qtd_animais: optionalStageNumber,
});

const acabamentoCarcacaSchema = z.object({
  acabamento: z.enum(ACABAMENTO_CARCACA_VALUES),
  qtd_animais: optionalStageNumber,
});

const classificacaoFrigorificoSchema = z.object({
  classificacao: z.enum(CLASSIFICACAO_FRIGORIFICO_VALUES),
  qtd_animais: optionalStageNumber,
});

const distribuicaoPesoSchema = z.object({
  classificacao: z.enum(DISTRIBUICAO_PESO_VALUES),
  qtd_animais: optionalStageNumber,
  peso_total: optionalStageNumber,
});

export const abateSchema = z
  .object({
    proprietario_id: positiveId("Selecione o proprietário."),
    fazenda_id: positiveId("Selecione a fazenda."),
    data_abate: dateText,
    numero_lote: positiveNumberText("Informe um lote inteiro e positivo.", true),
    nome_frigorifico: requiredText("Informe o nome do frigorífico."),
    distancia_frigorifico: nonNegativeNumberText("Informe uma distância válida."),
    categoria_animal: requiredText("Informe a categoria animal."),
    preco_funrural: nonNegativeNumberText("Informe um preço válido."),
    preco_sem_funrural: nonNegativeNumberText("Informe um preço válido."),
    incluir_etapa_fazenda: z.boolean(),
    peso_total_fazenda: optionalStageNumber,
    quantidade_animal: z.array(quantidadeAnimalSchema),
    fotos_fazenda: z.array(photoSchema),
    incluir_etapa_frigorifico: z.boolean(),
    peso_total_frigorifico: optionalStageNumber,
    balancao: optionalStageNumber,
    acabamento_carcaca: z.array(acabamentoCarcacaSchema),
    classificacao_frigorifico: z.array(classificacaoFrigorificoSchema),
    distribuicao_peso: z.array(distribuicaoPesoSchema),
    fotos_frigorifico: z.array(photoSchema),
  })
  .superRefine((data, context) => {
    if (data.incluir_etapa_fazenda) {
      validateNonNegative(data.peso_total_fazenda, ["peso_total_fazenda"], "Informe o peso total da fazenda.", context);
      data.quantidade_animal.forEach((item, index) => {
        validateNonNegative(item.denticao, ["quantidade_animal", index, "denticao"], "Informe uma dentição válida.", context, true);
        validateNonNegative(item.qtd_animais, ["quantidade_animal", index, "qtd_animais"], "Informe uma quantidade válida.", context, true);
      });
    }

    if (data.incluir_etapa_frigorifico) {
      validateNonNegative(data.peso_total_frigorifico, ["peso_total_frigorifico"], "Informe o peso total do frigorífico.", context);
      validateNonNegative(data.balancao, ["balancao"], "Informe um valor de balancão válido.", context);
      data.acabamento_carcaca.forEach((item, index) => {
        validateNonNegative(item.qtd_animais, ["acabamento_carcaca", index, "qtd_animais"], "Informe uma quantidade válida.", context, true);
      });
      data.classificacao_frigorifico.forEach((item, index) => {
        validateNonNegative(item.qtd_animais, ["classificacao_frigorifico", index, "qtd_animais"], "Informe uma quantidade válida.", context, true);
      });
      data.distribuicao_peso.forEach((item, index) => {
        validateNonNegative(item.qtd_animais, ["distribuicao_peso", index, "qtd_animais"], "Informe uma quantidade válida.", context, true);
        validateNonNegative(item.peso_total, ["distribuicao_peso", index, "peso_total"], "Informe um peso válido.", context);
      });
    }
  });

function addIssue(context: z.RefinementCtx, path: PropertyKey[], message: string) {
  context.addIssue({ code: "custom", path, message });
}

function validateNonNegative(
  value: string,
  path: PropertyKey[],
  message: string,
  context: z.RefinementCtx,
  integer = false,
) {
  const number = Number(value.replace(",", "."));
  if (!value || !Number.isFinite(number) || number < 0 || (integer && !Number.isInteger(number))) {
    addIssue(context, path, message);
  }
}

export const abateFiltersSchema = z
  .object({
    proprietario_id: z.string(),
    fazenda_id: z.string(),
    numero_lote: optionalPositiveIntegerText,
    data_inicio: optionalDateText,
    data_fim: optionalDateText,
  })
  .superRefine((data, context) => {
    if (data.fazenda_id && !data.proprietario_id) {
      addIssue(context, ["fazenda_id"], "Selecione o proprietário antes da fazenda.");
    }
    if (data.data_inicio && data.data_fim && data.data_inicio > data.data_fim) {
      addIssue(context, ["data_fim"], "A data final deve ser igual ou posterior à data inicial.");
    }
  });

export type AbateFormData = z.infer<typeof abateSchema>;
export type AbateFilterFormData = z.infer<typeof abateFiltersSchema>;

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
