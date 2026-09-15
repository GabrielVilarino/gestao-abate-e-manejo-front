"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { abateService } from "@/features/abates/services/abate-service";
import type { Abate, AbateFilters } from "@/features/abates/types/abate";
import { getErrorMessage } from "@/lib/api-client";

const PAGE_SIZE = 12;

export function useAbates() {
  const [abates, setAbates] = useState<Abate[]>([]);
  const [filters, setFilters] = useState<AbateFilters>({});
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    setIsLoading(true);
    setError("");
    try {
      const response = await abateService.list(filters, page, PAGE_SIZE);
      if (requestId !== requestRef.current) return;
      setAbates(response.abates ?? []);
      let nextPageExists = false;
      if ((response.abates ?? []).length === PAGE_SIZE) {
        try {
          nextPageExists = await abateService.hasNextPage(filters, page, PAGE_SIZE);
        } catch {
          // A sondagem não deve ocultar uma página que já foi carregada com sucesso.
        }
      }
      if (requestId !== requestRef.current) return;
      setHasNextPage(nextPageExists);
    } catch (loadError) {
      if (requestId === requestRef.current) {
        setHasNextPage(false);
        setError(getErrorMessage(loadError));
      }
    } finally {
      if (requestId === requestRef.current) setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    let active = true;

    async function loadCurrentPage() {
      await Promise.resolve();
      if (active) await load();
    }

    void loadCurrentPage();
    return () => {
      active = false;
      requestRef.current += 1;
    };
  }, [load]);

  const search = useCallback((nextFilters: AbateFilters) => {
    setPage(1);
    setFilters(nextFilters);
  }, []);

  return {
    abates,
    filters,
    page,
    isLoading,
    error,
    hasNextPage,
    search,
    reload: load,
    nextPage: () => setPage((current) => current + 1),
    previousPage: () => setPage((current) => Math.max(1, current - 1)),
  };
}
