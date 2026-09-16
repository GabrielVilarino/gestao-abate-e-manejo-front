export type Agenda = {
  id: number;
  fazenda_id: number;
  data_hora: string;
  observacao: string;
};

export type AgendasResponse = {
  agendas: Agenda[];
  pagina: number;
  limite: number;
  total: number;
};

export type AgendaPeriod = {
  dataInicio: string;
  dataFim: string;
};

export type AgendaFarmOption = {
  id: number;
  nome: string;
  proprietarioId: number;
  proprietarioNome: string;
  ativo: boolean;
};

export type AgendaView = "month" | "week" | "day";
