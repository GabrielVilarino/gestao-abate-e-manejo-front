"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { agendaService } from "@/features/agenda/services/agenda-service";
import type { Agenda, AgendaPeriod } from "@/features/agenda/types/agenda";
import { getErrorMessage } from "@/lib/api-client";

export function useAgendas(period: AgendaPeriod) {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError("");
    try {
      const response = await agendaService.listAll(period);
      if (requestId === requestIdRef.current) setAgendas(response);
    } catch (loadError) {
      if (requestId === requestIdRef.current) {
        setAgendas([]);
        setError(getErrorMessage(loadError));
      }
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    let active = true;
    async function initialLoad() {
      await Promise.resolve();
      if (active) await load();
    }
    void initialLoad();
    return () => {
      active = false;
      requestIdRef.current += 1;
    };
  }, [load]);

  return { agendas, error, isLoading, reload: load };
}
