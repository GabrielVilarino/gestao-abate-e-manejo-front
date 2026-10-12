export type DashboardFilters = {
  proprietarioId?: number;
  fazendaId?: number;
  dataInicio?: string;
  dataFim?: string;
};

export type DashboardResumo = {
  total_abates: number;
  total_cabecas: number;
  media_cabecas_por_abate: number;
  peso_medio_fazenda: number;
  peso_medio_frigorifico: number;
  rendimento_medio_carcaca: number;
  distancia_media_frigorifico: number;
};

export type DashboardPorFazenda = {
  fazenda_id: number;
  nome_fazenda: string;
  total_abates: number;
  total_cabecas: number;
  media_cabecas_por_abate: number;
};

export type DashboardEvolucao = {
  data: string;
  total_abates: number;
  total_cabecas: number;
};

export type DashboardPorCategoria = {
  categoria_animal: string;
  total_abates: number;
  total_cabecas: number;
};

export type DashboardResponse = {
  resumo: DashboardResumo;
  por_fazenda: DashboardPorFazenda[];
  evolucao: DashboardEvolucao[];
  por_categoria_animal: DashboardPorCategoria[];
};
