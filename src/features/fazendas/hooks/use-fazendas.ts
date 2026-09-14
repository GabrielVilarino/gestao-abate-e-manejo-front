"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fazendaService } from "@/features/fazendas/services/fazenda-service";
import type { Fazenda } from "@/features/fazendas/types/fazenda";
import { getErrorMessage } from "@/lib/api-client";

export function useFazendas(idProprietario?: number) {
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [loadedId, setLoadedId] = useState<number>();
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  const requestFazendas = useCallback(async (targetId?: number) => {
    const requestId = ++requestIdRef.current;
    setLoadedId(undefined);
    setError("");

    if (!targetId) {
      setFazendas([]);
      return;
    }

    try {
      const response = await fazendaService.listByProprietario(targetId);
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      setFazendas(response.fazendas ?? []);
    } catch (loadError) {
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      setError(getErrorMessage(loadError));
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoadedId(targetId);
      }
    }
  }, []);

  const load = useCallback(
    () => requestFazendas(idProprietario),
    [idProprietario, requestFazendas],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCurrentOwner() {
      await Promise.resolve();
      if (active) await requestFazendas(idProprietario);
    }

    void loadCurrentOwner();
    return () => {
      active = false;
      requestIdRef.current += 1;
    };
  }, [idProprietario, requestFazendas]);

  return {
    fazendas,
    isLoading: Boolean(idProprietario) && loadedId !== idProprietario,
    error,
    reload: load,
  };
}
