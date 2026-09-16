"use client";

import { useCallback, useEffect, useState } from "react";

import { fazendaService } from "@/features/fazendas/services/fazenda-service";
import { proprietarioService } from "@/features/proprietarios/services/proprietario-service";
import type { AgendaFarmOption } from "@/features/agenda/types/agenda";
import { getErrorMessage } from "@/lib/api-client";

export function useAgendaOptions() {
  const [farms, setFarms] = useState<AgendaFarmOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const ownerResponse = await proprietarioService.list();
      const farmResponses = await Promise.all(
        (ownerResponse.proprietarios ?? []).map(async (owner) => ({
          owner,
          response: await fazendaService.listByProprietario(owner.id),
        })),
      );
      setFarms(
        farmResponses
          .flatMap(({ owner, response }) =>
            (response.fazendas ?? []).map((farm) => ({
              id: farm.id,
              nome: farm.nome,
              proprietarioId: owner.id,
              proprietarioNome: owner.nome,
              ativo: owner.ativo && farm.ativo,
            })),
          )
          .sort((first, second) =>
            first.nome.localeCompare(second.nome, "pt-BR"),
          ),
      );
    } catch (loadError) {
      setFarms([]);
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function initialLoad() {
      await Promise.resolve();
      if (active) await load();
    }
    void initialLoad();
    return () => {
      active = false;
    };
  }, [load]);

  return { farms, isLoading, error, reload: load };
}
