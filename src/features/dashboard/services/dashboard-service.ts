import { apiFetch } from "@/lib/api-client";
import type { DashboardFilters, DashboardResponse } from "@/features/dashboard/types/dashboard";

export const dashboardService = {
  getAbates(filters: DashboardFilters) {
    const search = new URLSearchParams();
    if (filters.proprietarioId) search.set("proprietario_id", String(filters.proprietarioId));
    if (filters.fazendaId) search.set("fazenda_id", String(filters.fazendaId));
    if (filters.dataInicio) search.set("data_inicio", filters.dataInicio);
    if (filters.dataFim) search.set("data_fim", filters.dataFim);
    const query = search.toString();
    return apiFetch<DashboardResponse>(`/v1/dashboard/abates${query ? `?${query}` : ""}`);
  },
};
