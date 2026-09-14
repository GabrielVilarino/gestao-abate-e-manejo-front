export type Fazenda = {
  id: number;
  nome: string;
  cidade: string;
  inscricao_rural: string;
  observacao: string;
  id_proprietario: number;
  ativo: boolean;
};

export type FazendasResponse = {
  fazendas: Fazenda[];
};
