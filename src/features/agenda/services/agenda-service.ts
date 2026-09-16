import type { AgendaFormData } from "@/features/agenda/schemas/agenda-schema";
import {
  agendaDateKeyToFilterIso,
  brasiliaDateTimeToIso,
} from "@/features/agenda/schemas/agenda-date";
import type {
  Agenda,
  AgendaPeriod,
  AgendasResponse,
} from "@/features/agenda/types/agenda";
import { apiFetch } from "@/lib/api-client";

function payload(data: AgendaFormData) {
  return {
    fazenda_id: Number(data.fazendaId),
    data_hora: brasiliaDateTimeToIso(data.data, data.hora),
    observacao: data.observacao.trim(),
  };
}

export const agendaService = {
  async listAll(period: AgendaPeriod) {
    const agendas: Agenda[] = [];
    const limit = 100;
    let page = 1;
    let total = 0;

    do {
      const query = new URLSearchParams({
        // A API recebe RFC 3339, mas o usuário filtra pelo dia inteiro em Brasília.
        data_inicio: agendaDateKeyToFilterIso(period.dataInicio, "start"),
        data_fim: agendaDateKeyToFilterIso(period.dataFim, "end"),
        pagina: String(page),
        limite: String(limit),
      });
      const response = await apiFetch<AgendasResponse>(`/v1/agendas?${query}`);
      const currentPage = response.agendas ?? [];
      agendas.push(...currentPage);
      total = response.total ?? agendas.length;
      if (currentPage.length === 0) break;
      page += 1;
    } while (agendas.length < total);

    return agendas.sort(
      (first, second) =>
        new Date(first.data_hora).getTime() - new Date(second.data_hora).getTime(),
    );
  },
  get(id: number) {
    return apiFetch<Agenda>(`/v1/agenda/${id}`);
  },
  create(data: AgendaFormData) {
    return apiFetch<{ id?: number; message: string }>("/v1/agenda", {
      method: "POST",
      body: JSON.stringify(payload(data)),
    });
  },
  update(id: number, data: AgendaFormData) {
    return apiFetch<{ message: string }>(`/v1/agenda/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload(data)),
    });
  },
  delete(id: number) {
    return apiFetch<{ message: string }>(`/v1/agenda/${id}`, {
      method: "DELETE",
    });
  },
};
