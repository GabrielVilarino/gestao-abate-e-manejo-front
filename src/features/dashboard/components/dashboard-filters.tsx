"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Search, X } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFazendas } from "@/features/fazendas/hooks/use-fazendas";
import { useProprietarios } from "@/features/proprietarios/hooks/use-proprietarios";
import { dashboardFiltersSchema, type DashboardFilterFormData } from "@/features/dashboard/schemas/dashboard-schema";
import type { DashboardFilters } from "@/features/dashboard/types/dashboard";

const defaultValues: DashboardFilterFormData = { proprietario_id: "", fazenda_id: "", data_inicio: "", data_fim: "" };

export function DashboardFilters({ isSearching, onSearch }: { isSearching: boolean; onSearch: (filters: DashboardFilters) => void }) {
  const { proprietarios, isLoading: ownersLoading, error: ownersError } = useProprietarios();
  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DashboardFilterFormData>({ resolver: zodResolver(dashboardFiltersSchema), defaultValues });
  const ownerId = useWatch({ control, name: "proprietario_id" });
  const { fazendas, isLoading: farmsLoading, error: farmsError } = useFazendas(ownerId ? Number(ownerId) : undefined);

  function submit(data: DashboardFilterFormData) {
    onSearch({ proprietarioId: data.proprietario_id ? Number(data.proprietario_id) : undefined, fazendaId: data.fazenda_id ? Number(data.fazenda_id) : undefined, dataInicio: data.data_inicio || undefined, dataFim: data.data_fim || undefined });
  }

  function clear() { reset(defaultValues); onSearch({}); }

  return (
    <form aria-label="Filtros do dashboard" className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5" onSubmit={handleSubmit(submit)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FilterField label="Proprietário" id="dashboard-owner" error={errors.proprietario_id?.message} serverError={ownersError}>
          <Controller name="proprietario_id" control={control} render={({ field }) => (
            <Combobox id="dashboard-owner" options={proprietarios.map((owner) => ({ value: String(owner.id), label: owner.nome }))} value={field.value} onValueChange={(value) => { field.onChange(value); setValue("fazenda_id", "", { shouldValidate: true }); }} placeholder={ownersLoading ? "Carregando..." : "Digite para buscar"} emptyMessage="Nenhum proprietário encontrado." disabled={ownersLoading} invalid={Boolean(errors.proprietario_id)} describedBy={errors.proprietario_id ? "dashboard-owner-error" : undefined} />
          )} />
        </FilterField>
        <FilterField label="Fazenda" id="dashboard-farm" error={errors.fazenda_id?.message} serverError={farmsError}>
          <Controller name="fazenda_id" control={control} render={({ field }) => (
            <Combobox id="dashboard-farm" options={fazendas.map((farm) => ({ value: String(farm.id), label: farm.nome }))} value={field.value} onValueChange={field.onChange} placeholder={!ownerId ? "Selecione o proprietário" : farmsLoading ? "Carregando..." : "Digite para buscar"} emptyMessage="Nenhuma fazenda encontrada." disabled={!ownerId || farmsLoading} invalid={Boolean(errors.fazenda_id)} describedBy={errors.fazenda_id ? "dashboard-farm-error" : undefined} />
          )} />
        </FilterField>
        <FilterField label="Data inicial" id="dashboard-start-date" error={errors.data_inicio?.message}><Input id="dashboard-start-date" type="date" className="h-10" aria-invalid={Boolean(errors.data_inicio)} aria-describedby={errors.data_inicio ? "dashboard-start-date-error" : undefined} {...register("data_inicio")} /></FilterField>
        <FilterField label="Data final" id="dashboard-end-date" error={errors.data_fim?.message}><Input id="dashboard-end-date" type="date" className="h-10" aria-invalid={Boolean(errors.data_fim)} aria-describedby={errors.data_fim ? "dashboard-end-date-error" : undefined} {...register("data_fim")} /></FilterField>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={clear} disabled={isSearching} className="h-10"><X className="size-4" /> Limpar</Button><Button type="submit" disabled={isSearching} className="h-10">{isSearching ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}{isSearching ? "Atualizando..." : "Aplicar filtros"}</Button></div>
    </form>
  );
}

function FilterField({ label, id, error, serverError, children }: { label: string; id: string; error?: string; serverError?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{error ? <p id={`${id}-error`} className="text-sm text-red-600">{error}</p> : null}{serverError ? <p role="alert" className="text-sm text-red-600">{serverError}</p> : null}</div>;
}
