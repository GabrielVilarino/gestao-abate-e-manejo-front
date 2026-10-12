export type Fazenda = {
  id: number;
  nome: string;
  cidade: string;
  inscricao_rural: string;
  observacao: string;
  distancia_frigorifico: number;
  quantidade_rebanho: number;
  id_proprietario: number;
  ativo: boolean;
};

export type FazendasResponse = {
  fazendas: Fazenda[];
};
