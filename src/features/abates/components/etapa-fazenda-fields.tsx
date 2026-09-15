"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useFieldArray, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoPicker } from "@/features/abates/components/photo-picker";
import type { AbateFormData } from "@/features/abates/schemas/abate-schema";

type EtapaFazendaFieldsProps = {
  control: Control<AbateFormData>;
  register: UseFormRegister<AbateFormData>;
  setValue: UseFormSetValue<AbateFormData>;
  errors: FieldErrors<AbateFormData>;
  disabled: boolean;
};

export function EtapaFazendaFields({ control, register, setValue, errors, disabled }: EtapaFazendaFieldsProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "quantidade_animal" });
  const photos = useWatch({ control, name: "fotos_fazenda" });

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 p-4 sm:p-5">
      <div>
        <h3 className="font-semibold text-zinc-950">Etapa na fazenda</h3>
        <p className="mt-1 text-sm text-zinc-500">Informe pesagem, quantidade de animais e fotos desta etapa.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="farm-total-weight">Peso total</Label>
        <Input
          id="farm-total-weight"
          inputMode="decimal"
          placeholder="0,00"
          className="h-10"
          aria-invalid={Boolean(errors.peso_total_fazenda)}
          aria-describedby={errors.peso_total_fazenda ? "farm-total-weight-error" : undefined}
          {...register("peso_total_fazenda")}
        />
        {errors.peso_total_fazenda ? <p id="farm-total-weight-error" className="text-sm text-red-600">{errors.peso_total_fazenda.message}</p> : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">Quantidade por dentição</h4>
            <p className="text-xs text-zinc-500">Adicione quantas faixas forem necessárias.</p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => append({ denticao: "", qtd_animais: "" })}>
            <Plus className="size-4" /> Adicionar
          </Button>
        </div>

        {fields.length ? (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-xl bg-zinc-50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
                <div className="space-y-2">
                  <Label htmlFor={`dentition-${index}`}>Dentição</Label>
                  <Input
                    id={`dentition-${index}`}
                    inputMode="numeric"
                    className="h-10 bg-white"
                    aria-invalid={Boolean(errors.quantidade_animal?.[index]?.denticao)}
                    aria-describedby={errors.quantidade_animal?.[index]?.denticao ? `dentition-${index}-error` : undefined}
                    {...register(`quantidade_animal.${index}.denticao`)}
                  />
                  {errors.quantidade_animal?.[index]?.denticao ? <p id={`dentition-${index}-error`} className="text-sm text-red-600">{errors.quantidade_animal[index]?.denticao?.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`animal-quantity-${index}`}>Quantidade</Label>
                  <Input
                    id={`animal-quantity-${index}`}
                    inputMode="numeric"
                    className="h-10 bg-white"
                    aria-invalid={Boolean(errors.quantidade_animal?.[index]?.qtd_animais)}
                    aria-describedby={errors.quantidade_animal?.[index]?.qtd_animais ? `animal-quantity-${index}-error` : undefined}
                    {...register(`quantidade_animal.${index}.qtd_animais`)}
                  />
                  {errors.quantidade_animal?.[index]?.qtd_animais ? <p id={`animal-quantity-${index}-error`} className="text-sm text-red-600">{errors.quantidade_animal[index]?.qtd_animais?.message}</p> : null}
                </div>
                <Button type="button" variant="ghost" size="icon" disabled={disabled} aria-label={`Remover faixa ${index + 1}`} className="mt-6" onClick={() => remove(index)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : <p className="rounded-xl bg-zinc-50 px-3 py-4 text-sm text-zinc-500">Nenhuma faixa de dentição adicionada.</p>}
      </div>

      <PhotoPicker
        label="Fotos da fazenda"
        files={photos}
        disabled={disabled}
        error={errors.fotos_fazenda?.message}
        onChange={(files) => setValue("fotos_fazenda", files, { shouldValidate: true })}
      />
    </section>
  );
}
