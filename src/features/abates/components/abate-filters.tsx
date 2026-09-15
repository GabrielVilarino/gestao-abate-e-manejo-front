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
import {
  abateFiltersSchema,
  type AbateFilterFormData,
} from "@/features/abates/schemas/abate-schema";
import type { AbateFilters } from "@/features/abates/types/abate";

const defaultValues: AbateFilterFormData = {
  proprietario_id: "",
  fazenda_id: "",
  numero_lote: "",
  data_inicio: "",
  data_fim: "",
};

type AbateFiltersProps = {
  isSearching: boolean;
  onSearch: (filters: AbateFilters) => void;
};

export function AbateFiltersForm({ isSearching, onSearch }: AbateFiltersProps) {
  const { proprietarios, isLoading: isLoadingOwners, error: ownersError } = useProprietarios();
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AbateFilterFormData>({
    resolver: zodResolver(abateFiltersSchema),
    defaultValues,
  });
  const ownerId = useWatch({ control, name: "proprietario_id" });
  const {
    fazendas,
    isLoading: isLoadingFarms,
    error: farmsError,
  } = useFazendas(ownerId ? Number(ownerId) : undefined);

  function submit(data: AbateFilterFormData) {
    onSearch({
      proprietarioId: data.proprietario_id ? Number(data.proprietario_id) : undefined,
      fazendaId: data.fazenda_id ? Number(data.fazenda_id) : undefined,
      numeroLote: data.numero_lote ? Number(data.numero_lote) : undefined,
      dataInicio: data.data_inicio || undefined,
      dataFim: data.data_fim || undefined,
    });
  }

  function clear() {
    reset(defaultValues);
    onSearch({});
  }

  return (
    <form
      aria-label="Filtros de abates"
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
      onSubmit={handleSubmit(submit)}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="filter-owner">Proprietário</Label>
          <Controller
            name="proprietario_id"
            control={control}
            render={({ field }) => (
              <Combobox
                id="filter-owner"
                options={proprietarios.map((owner) => ({
                  value: String(owner.id),
                  label: owner.nome,
                }))}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue("fazenda_id", "", { shouldValidate: true });
                }}
                placeholder={isLoadingOwners ? "Carregando..." : "Digite para buscar"}
                emptyMessage="Nenhum proprietário encontrado."
                disabled={isLoadingOwners}
                invalid={Boolean(errors.proprietario_id)}
                describedBy={errors.proprietario_id ? "filter-owner-error" : undefined}
              />
            )}
          />
          {errors.proprietario_id ? <p id="filter-owner-error" className="text-sm text-red-600">{errors.proprietario_id.message}</p> : null}
          {ownersError ? <p role="alert" className="text-sm text-red-600">{ownersError}</p> : null}
        </div>

        {ownerId ? (
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="filter-farm">Fazenda</Label>
            <Controller
              name="fazenda_id"
              control={control}
              render={({ field }) => (
                <Combobox
                  id="filter-farm"
                  options={fazendas.map((farm) => ({ value: String(farm.id), label: farm.nome }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={isLoadingFarms ? "Carregando..." : "Digite para buscar"}
                  emptyMessage="Nenhuma fazenda encontrada."
                  disabled={isLoadingFarms}
                  invalid={Boolean(errors.fazenda_id)}
                  describedBy={errors.fazenda_id ? "filter-farm-error" : undefined}
                />
              )}
            />
            {errors.fazenda_id ? <p id="filter-farm-error" className="text-sm text-red-600">{errors.fazenda_id.message}</p> : null}
            {farmsError ? <p role="alert" className="text-sm text-red-600">{farmsError}</p> : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="filter-lot">Número do lote</Label>
          <Input
            id="filter-lot"
            inputMode="numeric"
            placeholder="Ex.: 120"
            aria-invalid={Boolean(errors.numero_lote)}
            aria-describedby={errors.numero_lote ? "filter-lot-error" : undefined}
            className="h-10"
            {...register("numero_lote")}
          />
          {errors.numero_lote ? <p id="filter-lot-error" className="text-sm text-red-600">{errors.numero_lote.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-start-date">Data inicial</Label>
          <Input id="filter-start-date" type="date" className="h-10" aria-invalid={Boolean(errors.data_inicio)} aria-describedby={errors.data_inicio ? "filter-start-date-error" : undefined} {...register("data_inicio")} />
          {errors.data_inicio ? <p id="filter-start-date-error" className="text-sm text-red-600">{errors.data_inicio.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-end-date">Data final</Label>
          <Input
            id="filter-end-date"
            type="date"
            className="h-10"
            aria-invalid={Boolean(errors.data_fim)}
            aria-describedby={errors.data_fim ? "filter-end-date-error" : undefined}
            {...register("data_fim")}
          />
          {errors.data_fim ? <p id="filter-end-date-error" className="text-sm text-red-600">{errors.data_fim.message}</p> : null}
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={clear} disabled={isSearching} className="h-10">
          <X className="size-4" /> Limpar
        </Button>
        <Button type="submit" disabled={isSearching} className="h-10">
          {isSearching ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
          {isSearching ? "Buscando..." : "Buscar"}
        </Button>
      </div>
    </form>
  );
}
