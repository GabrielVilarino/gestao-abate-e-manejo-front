import type { ProprietarioFormData } from "@/features/proprietarios/schemas/proprietario-schema";
import { onlyDigits } from "@/features/proprietarios/schemas/proprietario-schema";
import type { Proprietario, ProprietariosResponse } from "@/features/proprietarios/types/proprietario";
import { apiFetch } from "@/lib/api-client";

function payload(data: ProprietarioFormData) {
  return {
    nome: data.nome.trim(),
    cpf: onlyDigits(data.cpf),
    observacao: data.observacao.trim(),
  };
}

export const proprietarioService = {
  list() {
    return apiFetch<ProprietariosResponse>("/v1/proprietarios");
  },
  create(data: ProprietarioFormData) {
    return apiFetch<{ id?: number; message: string }>("/v1/proprietario", {
      method: "POST",
      body: JSON.stringify(payload(data)),
    });
  },
  update(proprietario: Proprietario, data: ProprietarioFormData) {
    return apiFetch<{ message: string }>("/v1/proprietario", {
      method: "PUT",
      body: JSON.stringify({ id: proprietario.id, ...payload(data) }),
    });
  },
  setActive(id: number, active: boolean) {
    return apiFetch<{ message: string }>(`/v1/proprietario/${active ? "activate" : "deactivate"}/${id}`, {
      method: "PUT",
    });
  },
};
