export type AbateFoto = {
  id: number;
  etapa: "FAZENDA" | "FRIGORIFICO";
  nome_original: string;
  content_type: string;
  tamanho: number;
  sha256: string;
};

export type QuantidadeAnimal = {
  denticao: number;
  qtd_animais: number;
};

export type AcabamentoCarcaca = {
  acabamento: AcabamentoCarcacaValue;
  qtd_animais: number;
};

export type ClassificacaoFrigorifico = {
  classificacao: ClassificacaoFrigorificoValue;
  qtd_animais: number;
};

export type DistribuicaoPeso = {
  classificacao: DistribuicaoPesoValue;
  qtd_animais: number;
  peso_total: number;
};

export type AbateDadosGerais = {
  data_abate: string;
  fazenda_id: number;
  numero_lote: number;
  nome_frigorifico: string;
  distancia_frigorifico: number;
  categoria_animal: string;
  preco_funrural: number;
  preco_sem_funrural: number;
  observacao: string;
};

export type AbateEtapaFazenda = {
  peso_total: number;
  quantidade_animal: QuantidadeAnimal[];
  fotos: AbateFoto[];
};

export type AbateEtapaFrigorifico = {
  peso_total: number;
  balancao: number;
  acabamento_carcaca: AcabamentoCarcaca[];
  classificacao_frigorifico: ClassificacaoFrigorifico[];
  distribuicao_peso: DistribuicaoPeso[];
  fotos: AbateFoto[];
};

export type Abate = {
  id: number;
  proprietario_id: number;
  nome_proprietario: string;
  nome_fazenda: string;
  dados_gerais: AbateDadosGerais;
  etapa_fazenda?: AbateEtapaFazenda | null;
  etapa_frigorifico?: AbateEtapaFrigorifico | null;
};

export type AbatesResponse = {
  abates: Abate[];
  pagina: number;
  limite: number;
};

export type AbateFilters = {
  proprietarioId?: number;
  fazendaId?: number;
  numeroLote?: number;
  dataInicio?: string;
  dataFim?: string;
};

export type CreateAbatePayload = {
  dados_gerais: AbateDadosGerais;
  etapa_fazenda?: Omit<AbateEtapaFazenda, "fotos">;
  etapa_frigorifico?: Omit<AbateEtapaFrigorifico, "fotos">;
};

export type FotoEtapa = AbateFoto["etapa"];

export type AbateReportRequest = {
  abate_ids: number[];
};
import type {
  AcabamentoCarcacaValue,
  ClassificacaoFrigorificoValue,
  DistribuicaoPesoValue,
} from "@/features/abates/types/abate-options";
