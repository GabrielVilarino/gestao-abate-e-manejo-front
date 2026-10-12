"use client";

import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";

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
  const photos = useWatch({ control, name: "fotos_fazenda" });

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 p-4 sm:p-5">
      <div>
        <h3 className="font-semibold text-zinc-950">Etapa na fazenda</h3>
        <p className="mt-1 text-sm text-zinc-500">Informe a quantidade total, a pesagem e os arquivos desta etapa.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Quantidade total de cabeças" id="farm-total-heads" error={errors.quantidade_total_cabecas_fazenda?.message}>
          <Input id="farm-total-heads" inputMode="numeric" className="h-10" aria-invalid={Boolean(errors.quantidade_total_cabecas_fazenda)} aria-describedby={errors.quantidade_total_cabecas_fazenda ? "farm-total-heads-error" : undefined} {...register("quantidade_total_cabecas_fazenda")} />
        </Field>
        <Field label="Peso total" id="farm-total-weight" error={errors.peso_total_fazenda?.message}>
          <Input id="farm-total-weight" inputMode="decimal" placeholder="0,00" className="h-10" aria-invalid={Boolean(errors.peso_total_fazenda)} aria-describedby={errors.peso_total_fazenda ? "farm-total-weight-error" : undefined} {...register("peso_total_fazenda")} />
        </Field>
      </div>

      <PhotoPicker label="Arquivos da fazenda" files={photos} disabled={disabled} error={errors.fotos_fazenda?.message} onChange={(files) => setValue("fotos_fazenda", files, { shouldValidate: true })} />
    </section>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{error ? <p id={`${id}-error`} className="text-sm text-red-600">{error}</p> : null}</div>;
}
