"use client";

import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/lib/api-client";
import { dashboardService } from "@/features/dashboard/services/dashboard-service";
import type { DashboardFilters, DashboardResponse } from "@/features/dashboard/types/dashboard";

export function useDashboard(filters: DashboardFilters) {
  const [dashboard, setDashboard] = useState<DashboardResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setDashboard(await dashboardService.getAbates(filters));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let active = true;
    async function loadCurrent() {
      await Promise.resolve();
      if (active) await load();
    }
    void loadCurrent();
    return () => { active = false; };
  }, [load]);
  return { dashboard, isLoading, error, reload: load };
}
