"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PhotoPicker } from "@/features/abates/components/photo-picker";
import {
  etapaFrigorificoSchema,
  type EtapaFrigorificoFormData,
} from "@/features/abates/schemas/abate-stage-schema";
import { abateService } from "@/features/abates/services/abate-service";
import type { AbateEtapaFrigorifico } from "@/features/abates/types/abate";
import {
  ACABAMENTO_CARCACA_VALUES,
  CLASSIFICACAO_FRIGORIFICO_VALUES,
  DISTRIBUICAO_PESO_VALUES,
} from "@/features/abates/types/abate-options";
import { getErrorMessage } from "@/lib/api-client";

const acabamentoOptions = ACABAMENTO_CARCACA_VALUES.map((value) => ({ value, label: value }));
const classificacaoOptions = CLASSIFICACAO_FRIGORIFICO_VALUES.map((value) => ({ value, label: value }));
const distribuicaoOptions = DISTRIBUICAO_PESO_VALUES.map((value) => ({ value, label: value }));

type EtapaFrigorificoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  abateId: number;
  etapa?: AbateEtapaFrigorifico | null;
  onSuccess: (message: string) => void;
};

export function EtapaFrigorificoDialog({ open, onOpenChange, abateId, etapa, onSuccess }: EtapaFrigorificoDialogProps) {
  const [locked, setLocked] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && locked) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="grid max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-4xl" showCloseButton={!locked}>
        <DialogHeader className="border-b px-4 py-4 pr-12 sm:px-6">
          <DialogTitle>Configurar etapa no frigorífico</DialogTitle>
          <DialogDescription>Salve os dados da etapa e, se desejar, envie novas fotos.</DialogDescription>
        </DialogHeader>
        <EtapaFrigorificoForm
          key={`${abateId}-${etapa ? "edit" : "new"}`}
          abateId={abateId}
          etapa={etapa}
          onCancel={() => onOpenChange(false)}
          onSuccess={onSuccess}
          onLockChange={setLocked}
        />
      </DialogContent>
    </Dialog>
  );
}

type EtapaFrigorificoFormProps = Omit<EtapaFrigorificoDialogProps, "open" | "onOpenChange"> & {
  onCancel: () => void;
  onLockChange: (locked: boolean) => void;
};

function EtapaFrigorificoForm({ abateId, etapa, onCancel, onSuccess, onLockChange }: EtapaFrigorificoFormProps) {
  const [serverError, setServerError] = useState("");
  const [stageSaved, setStageSaved] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EtapaFrigorificoFormData>({
    resolver: zodResolver(etapaFrigorificoSchema),
    defaultValues: {
      peso_total: etapa ? String(etapa.peso_total) : "",
      balancao: etapa ? String(etapa.balancao) : "",
      acabamento_carcaca: (etapa?.acabamento_carcaca ?? []).map((item) => ({ acabamento: item.acabamento, qtd_animais: String(item.qtd_animais) })),
      classificacao_frigorifico: (etapa?.classificacao_frigorifico ?? []).map((item) => ({ classificacao: item.classificacao, qtd_animais: String(item.qtd_animais) })),
      distribuicao_peso: (etapa?.distribuicao_peso ?? []).map((item) => ({ classificacao: item.classificacao, qtd_animais: String(item.qtd_animais), peso_total: String(item.peso_total) })),
      fotos: [],
    },
  });
  const finishes = useFieldArray({ control, name: "acabamento_carcaca" });
  const classifications = useFieldArray({ control, name: "classificacao_frigorifico" });
  const weights = useFieldArray({ control, name: "distribuicao_peso" });
  const photos = useWatch({ control, name: "fotos" });
  const locked = isSubmitting || (stageSaved && photos.length > 0);

  useEffect(() => {
    onLockChange(locked);
  }, [locked, onLockChange]);

  async function submit(data: EtapaFrigorificoFormData) {
    setServerError("");
    try {
      let message = savedMessage;
      if (!stageSaved) {
        const response = await abateService.updatePlantStage(abateId, data);
        message = response.message || "Etapa no frigorífico salva com sucesso.";
        setSavedMessage(message);
        setStageSaved(true);
      }

      const failed: File[] = [];
      for (const photo of data.fotos) {
        try {
          await abateService.uploadPhoto(abateId, "FRIGORIFICO", photo);
        } catch {
          failed.push(photo);
        }
      }
      setValue("fotos", failed, { shouldValidate: true });

      if (failed.length) {
        setServerError(`A etapa foi salva, mas ${failed.length} foto(s) não foram enviadas. Tente novamente.`);
        return;
      }

      onSuccess(message);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  function cancel() {
    if (stageSaved) {
      onSuccess("Etapa no frigorífico salva. As fotos pendentes não foram enviadas.");
      return;
    }
    onCancel();
  }

  return (
    <form className="flex min-h-0 flex-col" onSubmit={handleSubmit(submit)} noValidate>
      <div className="min-h-0 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
        <fieldset disabled={isSubmitting || stageSaved} className="space-y-5 disabled:opacity-70">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Peso total" id="edit-plant-weight" error={errors.peso_total?.message}>
              <Input id="edit-plant-weight" inputMode="decimal" className="h-10" aria-invalid={Boolean(errors.peso_total)} aria-describedby={errors.peso_total ? "edit-plant-weight-error" : undefined} {...register("peso_total")} />
            </Field>
            <Field label="Balancão" id="edit-scale-weight" error={errors.balancao?.message}>
              <Input id="edit-scale-weight" inputMode="decimal" className="h-10" aria-invalid={Boolean(errors.balancao)} aria-describedby={errors.balancao ? "edit-scale-weight-error" : undefined} {...register("balancao")} />
            </Field>
          </div>

          <Collection title="Acabamento de carcaça" empty={finishes.fields.length === 0} onAdd={() => finishes.append({ acabamento: ACABAMENTO_CARCACA_VALUES[0], qtd_animais: "" })}>
            {finishes.fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-xl bg-zinc-50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
                <Field label="Acabamento" id={`edit-finish-${index}`} error={errors.acabamento_carcaca?.[index]?.acabamento?.message}>
                  <Controller name={`acabamento_carcaca.${index}.acabamento`} control={control} render={({ field: selectField }) => <Select id={`edit-finish-${index}`} options={acabamentoOptions} value={selectField.value} onValueChange={selectField.onChange} invalid={Boolean(errors.acabamento_carcaca?.[index]?.acabamento)} describedBy={errors.acabamento_carcaca?.[index]?.acabamento ? `edit-finish-${index}-error` : undefined} className="bg-white" />} />
                </Field>
                <Field label="Quantidade" id={`edit-finish-quantity-${index}`} error={errors.acabamento_carcaca?.[index]?.qtd_animais?.message}>
                  <Input id={`edit-finish-quantity-${index}`} inputMode="numeric" className="h-10 bg-white" aria-invalid={Boolean(errors.acabamento_carcaca?.[index]?.qtd_animais)} aria-describedby={errors.acabamento_carcaca?.[index]?.qtd_animais ? `edit-finish-quantity-${index}-error` : undefined} {...register(`acabamento_carcaca.${index}.qtd_animais`)} />
                </Field>
                <RemoveButton label={`Remover acabamento ${index + 1}`} onClick={() => finishes.remove(index)} />
              </div>
            ))}
          </Collection>

          <Collection title="Classificação do frigorífico" empty={classifications.fields.length === 0} onAdd={() => classifications.append({ classificacao: CLASSIFICACAO_FRIGORIFICO_VALUES[0], qtd_animais: "" })}>
            {classifications.fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-xl bg-zinc-50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
                <Field label="Classificação" id={`edit-classification-${index}`} error={errors.classificacao_frigorifico?.[index]?.classificacao?.message}>
                  <Controller name={`classificacao_frigorifico.${index}.classificacao`} control={control} render={({ field: selectField }) => <Select id={`edit-classification-${index}`} options={classificacaoOptions} value={selectField.value} onValueChange={selectField.onChange} invalid={Boolean(errors.classificacao_frigorifico?.[index]?.classificacao)} describedBy={errors.classificacao_frigorifico?.[index]?.classificacao ? `edit-classification-${index}-error` : undefined} className="bg-white" />} />
                </Field>
                <Field label="Quantidade" id={`edit-classification-quantity-${index}`} error={errors.classificacao_frigorifico?.[index]?.qtd_animais?.message}>
                  <Input id={`edit-classification-quantity-${index}`} inputMode="numeric" className="h-10 bg-white" aria-invalid={Boolean(errors.classificacao_frigorifico?.[index]?.qtd_animais)} aria-describedby={errors.classificacao_frigorifico?.[index]?.qtd_animais ? `edit-classification-quantity-${index}-error` : undefined} {...register(`classificacao_frigorifico.${index}.qtd_animais`)} />
                </Field>
                <RemoveButton label={`Remover classificação ${index + 1}`} onClick={() => classifications.remove(index)} />
              </div>
            ))}
          </Collection>

          <Collection title="Distribuição de peso" empty={weights.fields.length === 0} onAdd={() => weights.append({ classificacao: DISTRIBUICAO_PESO_VALUES[0], qtd_animais: "", peso_total: "" })}>
            {weights.fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-xl bg-zinc-50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-start">
                <Field label="Classificação" id={`edit-weight-classification-${index}`} error={errors.distribuicao_peso?.[index]?.classificacao?.message}>
                  <Controller name={`distribuicao_peso.${index}.classificacao`} control={control} render={({ field: selectField }) => <Select id={`edit-weight-classification-${index}`} options={distribuicaoOptions} value={selectField.value} onValueChange={selectField.onChange} invalid={Boolean(errors.distribuicao_peso?.[index]?.classificacao)} describedBy={errors.distribuicao_peso?.[index]?.classificacao ? `edit-weight-classification-${index}-error` : undefined} className="bg-white" />} />
                </Field>
                <Field label="Quantidade" id={`edit-weight-quantity-${index}`} error={errors.distribuicao_peso?.[index]?.qtd_animais?.message}>
                  <Input id={`edit-weight-quantity-${index}`} inputMode="numeric" className="h-10 bg-white" aria-invalid={Boolean(errors.distribuicao_peso?.[index]?.qtd_animais)} aria-describedby={errors.distribuicao_peso?.[index]?.qtd_animais ? `edit-weight-quantity-${index}-error` : undefined} {...register(`distribuicao_peso.${index}.qtd_animais`)} />
                </Field>
                <Field label="Peso total" id={`edit-distributed-weight-${index}`} error={errors.distribuicao_peso?.[index]?.peso_total?.message}>
                  <Input id={`edit-distributed-weight-${index}`} inputMode="decimal" className="h-10 bg-white" aria-invalid={Boolean(errors.distribuicao_peso?.[index]?.peso_total)} aria-describedby={errors.distribuicao_peso?.[index]?.peso_total ? `edit-distributed-weight-${index}-error` : undefined} {...register(`distribuicao_peso.${index}.peso_total`)} />
                </Field>
                <RemoveButton label={`Remover distribuição ${index + 1}`} onClick={() => weights.remove(index)} />
              </div>
            ))}
          </Collection>

          <PhotoPicker label="Novas fotos do frigorífico" files={photos} error={errors.fotos?.message} onChange={(files) => setValue("fotos", files, { shouldValidate: true })} />
        </fieldset>

        {serverError ? <Alert variant="destructive"><AlertTitle>Não foi possível concluir</AlertTitle><AlertDescription>{serverError}</AlertDescription></Alert> : null}
      </div>
      <div className="flex flex-col-reverse gap-2 border-t bg-zinc-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button type="button" variant="outline" className="h-10" disabled={isSubmitting} onClick={cancel}>{stageSaved ? "Fechar sem enviar fotos" : "Cancelar"}</Button>
        <Button type="submit" className="h-10" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : stageSaved ? <Upload className="size-4" /> : null}
          {isSubmitting ? "Salvando..." : stageSaved ? "Tentar enviar fotos novamente" : "Salvar etapa"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{error ? <p id={`${id}-error`} className="text-sm text-red-600">{error}</p> : null}</div>;
}

function Collection({ title, empty, onAdd, children }: { title: string; empty: boolean; onAdd: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{title}</h3><Button type="button" variant="outline" size="sm" onClick={onAdd}><Plus className="size-4" /> Adicionar</Button></div>
      {empty ? <p className="rounded-xl bg-zinc-50 px-3 py-4 text-sm text-zinc-500">Nenhum item adicionado.</p> : <div className="space-y-3">{children}</div>}
    </div>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button type="button" variant="ghost" size="icon" className="mt-6" aria-label={label} onClick={onClick}><Trash2 className="size-4" /></Button>;
}
