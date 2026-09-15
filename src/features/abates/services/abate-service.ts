import type { AbateFormData } from "@/features/abates/schemas/abate-schema";
import type { AbateObservacaoFormData } from "@/features/abates/schemas/abate-observacao-schema";
import type {
  EtapaFazendaFormData,
  EtapaFrigorificoFormData,
} from "@/features/abates/schemas/abate-stage-schema";
import type {
  Abate,
  AbateDadosGerais,
  AbateFilters,
  AbateReportRequest,
  AbatesResponse,
  CreateAbatePayload,
  FotoEtapa,
} from "@/features/abates/types/abate";
import { apiFetch, apiFetchBlob } from "@/lib/api-client";

const toNumber = (value: string) => Number(value.replace(",", "."));
const REPORT_PAGE_SIZE = 100;
const MAX_REPORT_PAGES = 1000;

function createPayload(data: AbateFormData): CreateAbatePayload {
  const payload: CreateAbatePayload = {
    dados_gerais: {
      data_abate: data.data_abate,
      fazenda_id: Number(data.fazenda_id),
      numero_lote: Number(data.numero_lote),
      nome_frigorifico: data.nome_frigorifico.trim(),
      distancia_frigorifico: toNumber(data.distancia_frigorifico),
      categoria_animal: data.categoria_animal.trim(),
      preco_funrural: toNumber(data.preco_funrural),
      preco_sem_funrural: toNumber(data.preco_sem_funrural),
      observacao: "",
    },
  };

  if (data.incluir_etapa_fazenda) {
    payload.etapa_fazenda = {
      peso_total: toNumber(data.peso_total_fazenda),
      quantidade_animal: data.quantidade_animal.map((item) => ({
        denticao: toNumber(item.denticao),
        qtd_animais: toNumber(item.qtd_animais),
      })),
    };
  }

  if (data.incluir_etapa_frigorifico) {
    payload.etapa_frigorifico = {
      peso_total: toNumber(data.peso_total_frigorifico),
      balancao: toNumber(data.balancao),
      acabamento_carcaca: data.acabamento_carcaca.map((item) => ({
        acabamento: item.acabamento,
        qtd_animais: toNumber(item.qtd_animais),
      })),
      classificacao_frigorifico: data.classificacao_frigorifico.map((item) => ({
        classificacao: item.classificacao,
        qtd_animais: toNumber(item.qtd_animais),
      })),
      distribuicao_peso: data.distribuicao_peso.map((item) => ({
        classificacao: item.classificacao,
        qtd_animais: toNumber(item.qtd_animais),
        peso_total: toNumber(item.peso_total),
      })),
    };
  }

  return payload;
}

export const abateService = {
  list(filters: AbateFilters, pagina = 1, limite = 12) {
    const search = new URLSearchParams({ pagina: String(pagina), limite: String(limite) });
    if (filters.proprietarioId) search.set("proprietario_id", String(filters.proprietarioId));
    if (filters.fazendaId) search.set("fazenda_id", String(filters.fazendaId));
    if (filters.numeroLote) search.set("numero_lote", String(filters.numeroLote));
    if (filters.dataInicio) search.set("data_inicio", filters.dataInicio);
    if (filters.dataFim) search.set("data_fim", filters.dataFim);
    return apiFetch<AbatesResponse>(`/v1/abates?${search.toString()}`);
  },
  async hasNextPage(filters: AbateFilters, pagina: number, limite: number) {
    const firstItemOnNextPage = pagina * limite + 1;
    const response = await this.list(filters, firstItemOnNextPage, 1);
    return (response.abates ?? []).length > 0;
  },
  getById(id: number) {
    return apiFetch<Abate>(`/v1/abate/${id}`);
  },
  async listAllIds(filters: AbateFilters) {
    const ids = new Set<number>();
    for (let page = 1; page <= MAX_REPORT_PAGES; page += 1) {
      const response = await this.list(filters, page, REPORT_PAGE_SIZE);
      const items = response.abates ?? [];
      const previousSize = ids.size;
      items.forEach((abate) => ids.add(abate.id));

      if (items.length < REPORT_PAGE_SIZE) return [...ids];
      if (ids.size === previousSize) {
        throw new Error("Não foi possível percorrer todos os abates porque a API repetiu uma página.");
      }
    }
    throw new Error("A consulta possui abates demais para gerar um único relatório. Refine os filtros e tente novamente.");
  },
  generateReport(ids: number[]) {
    const payload: AbateReportRequest = { abate_ids: ids };
    return apiFetchBlob("/v1/abates/relatorio", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  create(data: AbateFormData) {
    return apiFetch<{ id: number; message: string }>("/v1/abate", {
      method: "POST",
      body: JSON.stringify(createPayload(data)),
    });
  },
  updateFarmStage(id: number, data: EtapaFazendaFormData) {
    return apiFetch<{ message: string }>(`/v1/abate/${id}/etapa-fazenda`, {
      method: "PUT",
      body: JSON.stringify({
        peso_total: toNumber(data.peso_total),
        quantidade_animal: data.quantidade_animal.map((item) => ({
          denticao: toNumber(item.denticao),
          qtd_animais: toNumber(item.qtd_animais),
        })),
      }),
    });
  },
  updateObservation(id: number, dadosGerais: AbateDadosGerais, data: AbateObservacaoFormData) {
    return apiFetch<{ message: string }>(`/v1/abate/${id}/dados-gerais`, {
      method: "PUT",
      body: JSON.stringify({
        ...dadosGerais,
        observacao: data.observacao.trim(),
      }),
    });
  },
  updatePlantStage(id: number, data: EtapaFrigorificoFormData) {
    return apiFetch<{ message: string }>(`/v1/abate/${id}/etapa-frigorifico`, {
      method: "PUT",
      body: JSON.stringify({
        peso_total: toNumber(data.peso_total),
        balancao: toNumber(data.balancao),
        acabamento_carcaca: data.acabamento_carcaca.map((item) => ({
          acabamento: item.acabamento,
          qtd_animais: toNumber(item.qtd_animais),
        })),
        classificacao_frigorifico: data.classificacao_frigorifico.map((item) => ({
          classificacao: item.classificacao,
          qtd_animais: toNumber(item.qtd_animais),
        })),
        distribuicao_peso: data.distribuicao_peso.map((item) => ({
          classificacao: item.classificacao,
          qtd_animais: toNumber(item.qtd_animais),
          peso_total: toNumber(item.peso_total),
        })),
      }),
    });
  },
  uploadPhoto(id: number, etapa: FotoEtapa, file: File) {
    const body = new FormData();
    body.append("foto", file);
    return apiFetch<{
      id: number;
      etapa: FotoEtapa;
      nome_original: string;
      content_type: string;
      tamanho: number;
      sha256: string;
    }>(`/v1/abate/${id}/fotos/${etapa}`, {
      method: "POST",
      body,
    });
  },
};
