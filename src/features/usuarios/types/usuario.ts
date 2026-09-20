export type Usuario = {
  id: number;
  nome: string;
  email: string;
  role: 1 | 2;
  ativo: boolean;
};

export type UsuariosResponse = {
  users: Usuario[];
};

export type UsuarioActionResponse = {
  id?: number;
  message?: string;
};
