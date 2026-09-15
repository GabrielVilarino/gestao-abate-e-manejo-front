"use client";

import type { Control, FieldErrors, UseFormClearErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";

import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AbateFormData } from "@/features/abates/schemas/abate-schema";
import { useFazendas } from "@/features/fazendas/hooks/use-fazendas";
import { useProprietarios } from "@/features/proprietarios/hooks/use-proprietarios";

type AbateGeneralFieldsProps = {
  control: Control<AbateFormData>;
  register: UseFormRegister<AbateFormData>;
  setValue: UseFormSetValue<AbateFormData>;
  clearErrors: UseFormClearErrors<AbateFormData>;
  errors: FieldErrors<AbateFormData>;
};

export function AbateGeneralFields({ control, register, setValue, clearErrors, errors }: AbateGeneralFieldsProps) {
  const { proprietarios, isLoading: isLoadingOwners, error: ownersError } = useProprietarios();
  const ownerId = useWatch({ control, name: "proprietario_id" });
  const { fazendas, isLoading: isLoadingFarms, error: farmsError } = useFazendas(ownerId || undefined);

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 p-4 sm:p-5">
      <div>
        <h3 className="font-semibold text-zinc-950">Dados gerais</h3>
        <p className="mt-1 text-sm text-zinc-500">Estes dados são obrigatórios para criar o abate.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Proprietário" id="slaughter-owner" error={errors.proprietario_id?.message}>
          <Controller
            name="proprietario_id"
            control={control}
            render={({ field }) => (
              <Combobox
                id="slaughter-owner"
                options={proprietarios.map((owner) => ({
                  value: String(owner.id),
                  label: owner.ativo ? owner.nome : `${owner.nome} (inativo)`,
                  disabled: !owner.ativo,
                }))}
                value={field.value > 0 ? String(field.value) : ""}
                onValueChange={(value) => {
                  const selectedOwnerId = Number(value);
                  setValue("proprietario_id", Number.isInteger(selectedOwnerId) && selectedOwnerId > 0 ? selectedOwnerId : 0, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                  setValue("fazenda_id", 0, {
                    shouldDirty: true,
                    shouldTouch: false,
                    shouldValidate: false,
                  });
                  clearErrors("fazenda_id");
                }}
                placeholder={isLoadingOwners ? "Carregando..." : "Digite para buscar"}
                emptyMessage="Nenhum proprietário ativo encontrado."
                disabled={isLoadingOwners}
                invalid={Boolean(errors.proprietario_id)}
                describedBy={errors.proprietario_id ? "slaughter-owner-error" : undefined}
              />
            )}
          />
          {ownersError ? <p role="alert" className="text-sm text-red-600">{ownersError}</p> : null}
        </Field>

        {ownerId ? (
          <Field label="Fazenda" id="slaughter-farm" error={errors.fazenda_id?.message}>
            <Controller
              name="fazenda_id"
              control={control}
              render={({ field }) => (
                <Combobox
                  id="slaughter-farm"
                  options={fazendas.map((farm) => ({
                    value: String(farm.id),
                    label: farm.ativo ? farm.nome : `${farm.nome} (inativa)`,
                    disabled: !farm.ativo,
                  }))}
                  value={field.value > 0 ? String(field.value) : ""}
                  onValueChange={(value) => {
                    const selectedFarmId = Number(value);
                    const validFarmId = Number.isInteger(selectedFarmId) && selectedFarmId > 0 ? selectedFarmId : 0;
                    setValue("fazenda_id", validFarmId, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                    if (validFarmId > 0) clearErrors("fazenda_id");
                  }}
                  placeholder={isLoadingFarms ? "Carregando..." : "Digite para buscar"}
                  emptyMessage="Nenhuma fazenda ativa encontrada."
                  disabled={isLoadingFarms}
                  invalid={Boolean(errors.fazenda_id)}
                  describedBy={errors.fazenda_id ? "slaughter-farm-error" : undefined}
                />
              )}
            />
            {farmsError ? <p role="alert" className="text-sm text-red-600">{farmsError}</p> : null}
          </Field>
        ) : (
          <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500 sm:self-end">
            Selecione o proprietário para escolher a fazenda.
          </div>
        )}

        <Field label="Data do abate" id="slaughter-date" error={errors.data_abate?.message}>
          <Input id="slaughter-date" type="date" className="h-10" aria-invalid={Boolean(errors.data_abate)} aria-describedby={errors.data_abate ? "slaughter-date-error" : undefined} {...register("data_abate")} />
        </Field>
        <Field label="Número do lote" id="slaughter-lot" error={errors.numero_lote?.message}>
          <Input id="slaughter-lot" inputMode="numeric" className="h-10" aria-invalid={Boolean(errors.numero_lote)} aria-describedby={errors.numero_lote ? "slaughter-lot-error" : undefined} {...register("numero_lote")} />
        </Field>
        <Field label="Frigorífico" id="slaughter-plant" error={errors.nome_frigorifico?.message}>
          <Input id="slaughter-plant" className="h-10" aria-invalid={Boolean(errors.nome_frigorifico)} aria-describedby={errors.nome_frigorifico ? "slaughter-plant-error" : undefined} {...register("nome_frigorifico")} />
        </Field>
        <Field label="Distância até o frigorífico (km)" id="slaughter-distance" error={errors.distancia_frigorifico?.message}>
          <Input id="slaughter-distance" inputMode="decimal" placeholder="0,00" className="h-10" aria-invalid={Boolean(errors.distancia_frigorifico)} aria-describedby={errors.distancia_frigorifico ? "slaughter-distance-error" : undefined} {...register("distancia_frigorifico")} />
        </Field>
        <Field label="Categoria animal" id="slaughter-category" error={errors.categoria_animal?.message}>
          <Input id="slaughter-category" placeholder="Ex.: Bovino" className="h-10" aria-invalid={Boolean(errors.categoria_animal)} aria-describedby={errors.categoria_animal ? "slaughter-category-error" : undefined} {...register("categoria_animal")} />
        </Field>
        <Field label="Preço com Funrural" id="slaughter-funrural-price" error={errors.preco_funrural?.message}>
          <Input id="slaughter-funrural-price" inputMode="decimal" placeholder="0,00" className="h-10" aria-invalid={Boolean(errors.preco_funrural)} aria-describedby={errors.preco_funrural ? "slaughter-funrural-price-error" : undefined} {...register("preco_funrural")} />
        </Field>
        <Field label="Preço sem Funrural" id="slaughter-no-funrural-price" error={errors.preco_sem_funrural?.message}>
          <Input id="slaughter-no-funrural-price" inputMode="decimal" placeholder="0,00" className="h-10" aria-invalid={Boolean(errors.preco_sem_funrural)} aria-describedby={errors.preco_sem_funrural ? "slaughter-no-funrural-price-error" : undefined} {...register("preco_sem_funrural")} />
        </Field>
      </div>
    </section>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p id={`${id}-error`} className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
