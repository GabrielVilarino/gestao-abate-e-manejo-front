export const ACABAMENTO_CARCACA_VALUES = [
  "AUSENTE",
  "ESCASSO",
  "ESCASSO POSITIVA",
  "MEDIANO",
  "UNIFORME",
  "EXCESSIVO",
] as const;

export const DENTICAO_VALUES = [0, 2, 4, 6, 8] as const;

export const CLASSIFICACAO_FRIGORIFICO_VALUES = [
  "BOI FRACO",
  "BOI LEVE",
  "BOI MÉDIO / NORMAL",
  "BOI PESADO",
] as const;

export const DISTRIBUICAO_PESO_VALUES = [
  "18 a 19.9",
  "20 a 21.9",
  "22 a 23.9",
  "acima de 24",
] as const;

export type AcabamentoCarcacaValue = (typeof ACABAMENTO_CARCACA_VALUES)[number];
export type DenticaoValue = (typeof DENTICAO_VALUES)[number];
export type ClassificacaoFrigorificoValue = (typeof CLASSIFICACAO_FRIGORIFICO_VALUES)[number];
export type DistribuicaoPesoValue = (typeof DISTRIBUICAO_PESO_VALUES)[number];
