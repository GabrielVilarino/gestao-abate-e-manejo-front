"use client";

import { useCallback, useEffect, useState } from "react";

import { proprietarioService } from "@/features/proprietarios/services/proprietario-service";
import type { Proprietario } from "@/features/proprietarios/types/proprietario";
import { getErrorMessage } from "@/lib/api-client";

export function useProprietarios() {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setHasLoaded(false);
    setError("");
    try {
      const response = await proprietarioService.list();
      setProprietarios(response.proprietarios ?? []);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void proprietarioService
      .list()
      .then((response) => {
        if (active) setProprietarios(response.proprietarios ?? []);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setHasLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return { proprietarios, isLoading: !hasLoaded, error, reload: load };
}
