"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoPicker } from "@/features/abates/components/photo-picker";
import {
  etapaFazendaSchema,
  type EtapaFazendaFormData,
} from "@/features/abates/schemas/abate-stage-schema";
import { abateService } from "@/features/abates/services/abate-service";
import type { AbateEtapaFazenda } from "@/features/abates/types/abate";
import { getErrorMessage } from "@/lib/api-client";

type EtapaFazendaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  abateId: number;
  etapa?: AbateEtapaFazenda | null;
  onSuccess: (message: string) => void;
};

export function EtapaFazendaDialog({ open, onOpenChange, abateId, etapa, onSuccess }: EtapaFazendaDialogProps) {
  const [locked, setLocked] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && locked) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="grid max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-3xl" showCloseButton={!locked}>
        <DialogHeader className="border-b px-4 py-4 pr-12 sm:px-6">
          <DialogTitle>Configurar etapa na fazenda</DialogTitle>
          <DialogDescription>Salve os dados da etapa e, se desejar, envie novas fotos.</DialogDescription>
        </DialogHeader>
        <EtapaFazendaForm
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

type EtapaFazendaFormProps = Omit<EtapaFazendaDialogProps, "open" | "onOpenChange"> & {
  onCancel: () => void;
  onLockChange: (locked: boolean) => void;
};

function EtapaFazendaForm({ abateId, etapa, onCancel, onSuccess, onLockChange }: EtapaFazendaFormProps) {
  const [serverError, setServerError] = useState("");
  const [stageSaved, setStageSaved] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EtapaFazendaFormData>({
    resolver: zodResolver(etapaFazendaSchema),
    defaultValues: {
      peso_total: etapa ? String(etapa.peso_total) : "",
      quantidade_animal: (etapa?.quantidade_animal ?? []).map((item) => ({
        denticao: String(item.denticao),
        qtd_animais: String(item.qtd_animais),
      })),
      fotos: [],
    },
  });
  const quantities = useFieldArray({ control, name: "quantidade_animal" });
  const photos = useWatch({ control, name: "fotos" });
  const locked = isSubmitting || (stageSaved && photos.length > 0);

  useEffect(() => {
    onLockChange(locked);
  }, [locked, onLockChange]);

  async function submit(data: EtapaFazendaFormData) {
    setServerError("");
    try {
      let message = savedMessage;
      if (!stageSaved) {
        const response = await abateService.updateFarmStage(abateId, data);
        message = response.message || "Etapa na fazenda salva com sucesso.";
        setSavedMessage(message);
        setStageSaved(true);
      }

      const failed: File[] = [];
      for (const photo of data.fotos) {
        try {
          await abateService.uploadPhoto(abateId, "FAZENDA", photo);
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
      onSuccess("Etapa na fazenda salva. As fotos pendentes não foram enviadas.");
      return;
    }
    onCancel();
  }

  return (
    <form className="flex min-h-0 flex-col" onSubmit={handleSubmit(submit)} noValidate>
      <div className="min-h-0 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
        <fieldset disabled={isSubmitting || stageSaved} className="space-y-5 disabled:opacity-70">
          <Field label="Peso total" id="edit-farm-weight" error={errors.peso_total?.message}>
            <Input id="edit-farm-weight" inputMode="decimal" className="h-10" aria-invalid={Boolean(errors.peso_total)} aria-describedby={errors.peso_total ? "edit-farm-weight-error" : undefined} {...register("peso_total")} />
          </Field>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Quantidade por dentição</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => quantities.append({ denticao: "", qtd_animais: "" })}><Plus className="size-4" /> Adicionar</Button>
            </div>
            {quantities.fields.length ? quantities.fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-xl bg-zinc-50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
                <Field label="Dentição" id={`edit-dentition-${index}`} error={errors.quantidade_animal?.[index]?.denticao?.message}>
                  <Input id={`edit-dentition-${index}`} inputMode="numeric" className="h-10 bg-white" aria-invalid={Boolean(errors.quantidade_animal?.[index]?.denticao)} aria-describedby={errors.quantidade_animal?.[index]?.denticao ? `edit-dentition-${index}-error` : undefined} {...register(`quantidade_animal.${index}.denticao`)} />
                </Field>
                <Field label="Quantidade" id={`edit-farm-quantity-${index}`} error={errors.quantidade_animal?.[index]?.qtd_animais?.message}>
                  <Input id={`edit-farm-quantity-${index}`} inputMode="numeric" className="h-10 bg-white" aria-invalid={Boolean(errors.quantidade_animal?.[index]?.qtd_animais)} aria-describedby={errors.quantidade_animal?.[index]?.qtd_animais ? `edit-farm-quantity-${index}-error` : undefined} {...register(`quantidade_animal.${index}.qtd_animais`)} />
                </Field>
                <Button type="button" variant="ghost" size="icon" className="mt-6" aria-label={`Remover faixa ${index + 1}`} onClick={() => quantities.remove(index)}><Trash2 className="size-4" /></Button>
              </div>
            )) : <p className="rounded-xl bg-zinc-50 px-3 py-4 text-sm text-zinc-500">Nenhuma faixa adicionada.</p>}
          </div>

          <PhotoPicker label="Novas fotos da fazenda" files={photos} error={errors.fotos?.message} onChange={(files) => setValue("fotos", files, { shouldValidate: true })} />
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
