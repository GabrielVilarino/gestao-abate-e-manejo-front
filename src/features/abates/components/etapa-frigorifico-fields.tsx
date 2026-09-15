"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Controller, useFieldArray, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PhotoPicker } from "@/features/abates/components/photo-picker";
import type { AbateFormData } from "@/features/abates/schemas/abate-schema";
import {
  ACABAMENTO_CARCACA_VALUES,
  CLASSIFICACAO_FRIGORIFICO_VALUES,
  DISTRIBUICAO_PESO_VALUES,
} from "@/features/abates/types/abate-options";

const acabamentoOptions = ACABAMENTO_CARCACA_VALUES.map((value) => ({ value, label: value }));
const classificacaoOptions = CLASSIFICACAO_FRIGORIFICO_VALUES.map((value) => ({ value, label: value }));
const distribuicaoOptions = DISTRIBUICAO_PESO_VALUES.map((value) => ({ value, label: value }));

type EtapaFrigorificoFieldsProps = {
  control: Control<AbateFormData>;
  register: UseFormRegister<AbateFormData>;
  setValue: UseFormSetValue<AbateFormData>;
  errors: FieldErrors<AbateFormData>;
  disabled: boolean;
};

export function EtapaFrigorificoFields({ control, register, setValue, errors, disabled }: EtapaFrigorificoFieldsProps) {
  const acabamento = useFieldArray({ control, name: "acabamento_carcaca" });
  const classificacao = useFieldArray({ control, name: "classificacao_frigorifico" });
  const distribuicao = useFieldArray({ control, name: "distribuicao_peso" });
  const photos = useWatch({ control, name: "fotos_frigorifico" });

  return (
    <section className="space-y-5 rounded-2xl border border-zinc-200 p-4 sm:p-5">
      <div>
        <h3 className="font-semibold text-zinc-950">Etapa no frigorífico</h3>
        <p className="mt-1 text-sm text-zinc-500">Registre pesagens, classificações e fotos desta etapa.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Peso total" id="plant-total-weight" error={errors.peso_total_frigorifico?.message}>
          <Input id="plant-total-weight" inputMode="decimal" placeholder="0,00" className="h-10" aria-invalid={Boolean(errors.peso_total_frigorifico)} aria-describedby={errors.peso_total_frigorifico ? "plant-total-weight-error" : undefined} {...register("peso_total_frigorifico")} />
        </Field>
        <Field label="Balancão" id="scale-weight" error={errors.balancao?.message}>
          <Input id="scale-weight" inputMode="decimal" placeholder="0,00" className="h-10" aria-invalid={Boolean(errors.balancao)} aria-describedby={errors.balancao ? "scale-weight-error" : undefined} {...register("balancao")} />
        </Field>
      </div>

      <ArraySection title="Acabamento de carcaça" onAdd={() => acabamento.append({ acabamento: ACABAMENTO_CARCACA_VALUES[0], qtd_animais: "" })} disabled={disabled} empty={acabamento.fields.length === 0}>
        {acabamento.fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-xl bg-zinc-50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
            <Field label="Acabamento" id={`finish-${index}`} error={errors.acabamento_carcaca?.[index]?.acabamento?.message}>
              <Controller name={`acabamento_carcaca.${index}.acabamento`} control={control} render={({ field: selectField }) => <Select id={`finish-${index}`} options={acabamentoOptions} value={selectField.value} onValueChange={selectField.onChange} invalid={Boolean(errors.acabamento_carcaca?.[index]?.acabamento)} describedBy={errors.acabamento_carcaca?.[index]?.acabamento ? `finish-${index}-error` : undefined} className="bg-white" />} />
            </Field>
            <Field label="Quantidade" id={`finish-quantity-${index}`} error={errors.acabamento_carcaca?.[index]?.qtd_animais?.message}>
              <Input id={`finish-quantity-${index}`} inputMode="numeric" className="h-10 bg-white" aria-invalid={Boolean(errors.acabamento_carcaca?.[index]?.qtd_animais)} aria-describedby={errors.acabamento_carcaca?.[index]?.qtd_animais ? `finish-quantity-${index}-error` : undefined} {...register(`acabamento_carcaca.${index}.qtd_animais`)} />
            </Field>
            <RemoveButton label={`Remover acabamento ${index + 1}`} disabled={disabled} onClick={() => acabamento.remove(index)} />
          </div>
        ))}
      </ArraySection>

      <ArraySection title="Classificação do frigorífico" onAdd={() => classificacao.append({ classificacao: CLASSIFICACAO_FRIGORIFICO_VALUES[0], qtd_animais: "" })} disabled={disabled} empty={classificacao.fields.length === 0}>
        {classificacao.fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-xl bg-zinc-50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
            <Field label="Classificação" id={`classification-${index}`} error={errors.classificacao_frigorifico?.[index]?.classificacao?.message}>
              <Controller name={`classificacao_frigorifico.${index}.classificacao`} control={control} render={({ field: selectField }) => <Select id={`classification-${index}`} options={classificacaoOptions} value={selectField.value} onValueChange={selectField.onChange} invalid={Boolean(errors.classificacao_frigorifico?.[index]?.classificacao)} describedBy={errors.classificacao_frigorifico?.[index]?.classificacao ? `classification-${index}-error` : undefined} className="bg-white" />} />
            </Field>
            <Field label="Quantidade" id={`classification-quantity-${index}`} error={errors.classificacao_frigorifico?.[index]?.qtd_animais?.message}>
              <Input id={`classification-quantity-${index}`} inputMode="numeric" className="h-10 bg-white" aria-invalid={Boolean(errors.classificacao_frigorifico?.[index]?.qtd_animais)} aria-describedby={errors.classificacao_frigorifico?.[index]?.qtd_animais ? `classification-quantity-${index}-error` : undefined} {...register(`classificacao_frigorifico.${index}.qtd_animais`)} />
            </Field>
            <RemoveButton label={`Remover classificação ${index + 1}`} disabled={disabled} onClick={() => classificacao.remove(index)} />
          </div>
        ))}
      </ArraySection>

      <ArraySection title="Distribuição de peso" onAdd={() => distribuicao.append({ classificacao: DISTRIBUICAO_PESO_VALUES[0], qtd_animais: "", peso_total: "" })} disabled={disabled} empty={distribuicao.fields.length === 0}>
        {distribuicao.fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-xl bg-zinc-50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-start">
            <Field label="Classificação" id={`weight-classification-${index}`} error={errors.distribuicao_peso?.[index]?.classificacao?.message}>
              <Controller name={`distribuicao_peso.${index}.classificacao`} control={control} render={({ field: selectField }) => <Select id={`weight-classification-${index}`} options={distribuicaoOptions} value={selectField.value} onValueChange={selectField.onChange} invalid={Boolean(errors.distribuicao_peso?.[index]?.classificacao)} describedBy={errors.distribuicao_peso?.[index]?.classificacao ? `weight-classification-${index}-error` : undefined} className="bg-white" />} />
            </Field>
            <Field label="Quantidade" id={`weight-quantity-${index}`} error={errors.distribuicao_peso?.[index]?.qtd_animais?.message}>
              <Input id={`weight-quantity-${index}`} inputMode="numeric" className="h-10 bg-white" aria-invalid={Boolean(errors.distribuicao_peso?.[index]?.qtd_animais)} aria-describedby={errors.distribuicao_peso?.[index]?.qtd_animais ? `weight-quantity-${index}-error` : undefined} {...register(`distribuicao_peso.${index}.qtd_animais`)} />
            </Field>
            <Field label="Peso total" id={`distributed-weight-${index}`} error={errors.distribuicao_peso?.[index]?.peso_total?.message}>
              <Input id={`distributed-weight-${index}`} inputMode="decimal" className="h-10 bg-white" aria-invalid={Boolean(errors.distribuicao_peso?.[index]?.peso_total)} aria-describedby={errors.distribuicao_peso?.[index]?.peso_total ? `distributed-weight-${index}-error` : undefined} {...register(`distribuicao_peso.${index}.peso_total`)} />
            </Field>
            <RemoveButton label={`Remover distribuição ${index + 1}`} disabled={disabled} onClick={() => distribuicao.remove(index)} />
          </div>
        ))}
      </ArraySection>

      <PhotoPicker
        label="Fotos do frigorífico"
        files={photos}
        disabled={disabled}
        error={errors.fotos_frigorifico?.message}
        onChange={(files) => setValue("fotos_frigorifico", files, { shouldValidate: true })}
      />
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

function ArraySection({ title, onAdd, disabled, empty, children }: { title: string; onAdd: () => void; disabled: boolean; empty: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-zinc-900">{title}</h4>
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onAdd}><Plus className="size-4" /> Adicionar</Button>
      </div>
      {empty ? <p className="rounded-xl bg-zinc-50 px-3 py-4 text-sm text-zinc-500">Nenhum item adicionado.</p> : <div className="space-y-3">{children}</div>}
    </div>
  );
}

function RemoveButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon" className="mt-6" disabled={disabled} aria-label={label} onClick={onClick}>
      <Trash2 className="size-4" />
    </Button>
  );
}
