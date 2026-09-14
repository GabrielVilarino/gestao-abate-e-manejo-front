export type Proprietario = {
  id: number;
  nome: string;
  cpf: string;
  observacao: string;
  ativo: boolean;
};

export type ProprietariosResponse = {
  proprietarios: Proprietario[];
};
