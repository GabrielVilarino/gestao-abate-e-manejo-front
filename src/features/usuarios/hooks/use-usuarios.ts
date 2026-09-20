"use client";

import { useCallback, useEffect, useState } from "react";

import { usuarioService } from "@/features/usuarios/services/usuario-service";
import type { Usuario } from "@/features/usuarios/types/usuario";
import { getErrorMessage } from "@/lib/api-client";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await usuarioService.list();
      setUsuarios(response.users ?? []);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void usuarioService
      .list()
      .then((response) => {
        if (active) setUsuarios(response.users ?? []);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { usuarios, isLoading, error, reload };
}
