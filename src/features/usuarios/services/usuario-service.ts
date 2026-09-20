import type { UsuarioFormData } from "@/features/usuarios/schemas/usuario-schema";
import type { Usuario, UsuarioActionResponse, UsuariosResponse } from "@/features/usuarios/types/usuario";
import { apiFetch } from "@/lib/api-client";

function dadosUsuario(data: UsuarioFormData) {
  return {
    nome: data.nome.trim(),
    email: data.email.trim().toLowerCase(),
    role: Number(data.role),
  };
}

export const usuarioService = {
  list() {
    return apiFetch<UsuariosResponse>("/v1/users");
  },
  create(data: UsuarioFormData) {
    return apiFetch<UsuarioActionResponse>("/v1/user", {
      method: "POST",
      body: JSON.stringify({ ...dadosUsuario(data), password: data.password }),
    });
  },
  update(usuario: Usuario, data: UsuarioFormData) {
    return apiFetch<UsuarioActionResponse>("/v1/user", {
      method: "PUT",
      body: JSON.stringify({ id: usuario.id, ...dadosUsuario(data) }),
    });
  },
  setActive(id: number, active: boolean) {
    return apiFetch<UsuarioActionResponse>(`/v1/user/${active ? "activate" : "deactivate"}/${id}`, {
      method: "PUT",
    });
  },
};
