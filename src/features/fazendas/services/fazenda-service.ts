import type { FazendaFormData } from "@/features/fazendas/schemas/fazenda-schema";
import type { Fazenda, FazendasResponse } from "@/features/fazendas/types/fazenda";
import { apiFetch } from "@/lib/api-client";

function payload(data: FazendaFormData) {
  return {
    nome: data.nome.trim(),
    cidade: data.cidade.trim(),
    inscricao_rural: data.inscricao_rural.trim(),
    observacao: data.observacao.trim(),
  };
}

export const fazendaService = {
  listByProprietario(idProprietario: number) {
    return apiFetch<FazendasResponse>(`/v1/fazendas/${idProprietario}`);
  },
  create(idProprietario: number, data: FazendaFormData) {
    return apiFetch<{ id?: number; message: string }>("/v1/fazenda", {
      method: "POST",
      body: JSON.stringify({ ...payload(data), id_proprietario: idProprietario }),
    });
  },
  update(fazenda: Fazenda, data: FazendaFormData) {
    return apiFetch<{ message: string }>("/v1/fazenda", {
      method: "PUT",
      body: JSON.stringify({ id: fazenda.id, ...payload(data) }),
    });
  },
  setActive(id: number, active: boolean) {
    return apiFetch<{ message: string }>(`/v1/fazenda/${active ? "activate" : "deactivate"}/${id}`, {
      method: "PUT",
    });
  },
};
