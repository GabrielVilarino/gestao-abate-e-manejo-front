"use client";

import { useCallback, useEffect, useState } from "react";

import { abateService } from "@/features/abates/services/abate-service";
import type { Abate } from "@/features/abates/types/abate";
import { getErrorMessage } from "@/lib/api-client";

export function useAbate(id: number) {
  const [abate, setAbate] = useState<Abate>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setAbate(await abateService.getById(id));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;

    async function loadCurrentAbate() {
      await Promise.resolve();
      if (!active) return;
      setIsLoading(true);
      setError("");
      try {
        const response = await abateService.getById(id);
        if (active) setAbate(response);
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadCurrentAbate();
    return () => {
      active = false;
    };
  }, [id]);

  return { abate, isLoading, error, reload: load };
}
