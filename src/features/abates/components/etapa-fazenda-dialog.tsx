"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoPicker } from "@/features/abates/components/photo-picker";
import { etapaFazendaSchema, type EtapaFazendaFormData } from "@/features/abates/schemas/abate-stage-schema";
import { abateService } from "@/features/abates/services/abate-service";
import type { AbateEtapaFazenda } from "@/features/abates/types/abate";
import { getErrorMessage } from "@/lib/api-client";

type EtapaFazendaDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; abateId: number; etapa?: AbateEtapaFazenda | null; onSuccess: (message: string) => void };

export function EtapaFazendaDialog({ open, onOpenChange, abateId, etapa, onSuccess }: EtapaFazendaDialogProps) {
  const [locked, setLocked] = useState(false);
  return <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen && locked) return; onOpenChange(nextOpen); }}>
    <DialogContent className="grid max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-3xl" showCloseButton={!locked}>
      <DialogHeader className="border-b px-4 py-4 pr-12 sm:px-6"><DialogTitle>Configurar etapa na fazenda</DialogTitle><DialogDescription>Salve os dados da etapa e, se desejar, envie novos arquivos.</DialogDescription></DialogHeader>
      <EtapaFazendaForm key={`${abateId}-${etapa ? "edit" : "new"}`} abateId={abateId} etapa={etapa} onCancel={() => onOpenChange(false)} onSuccess={onSuccess} onLockChange={setLocked} />
    </DialogContent>
  </Dialog>;
}

type EtapaFazendaFormProps = Omit<EtapaFazendaDialogProps, "open" | "onOpenChange"> & { onCancel: () => void; onLockChange: (locked: boolean) => void };

function EtapaFazendaForm({ abateId, etapa, onCancel, onSuccess, onLockChange }: EtapaFazendaFormProps) {
  const [serverError, setServerError] = useState("");
  const [stageSaved, setStageSaved] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<EtapaFazendaFormData>({
    resolver: zodResolver(etapaFazendaSchema),
    defaultValues: { quantidade_total_cabecas: etapa ? String(etapa.quantidade_total_cabecas) : "", peso_total: etapa ? String(etapa.peso_total) : "", fotos: [] },
  });
  const photos = useWatch({ control, name: "fotos" });
  const locked = isSubmitting || (stageSaved && photos.length > 0);

  useEffect(() => onLockChange(locked), [locked, onLockChange]);

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
      for (const file of data.fotos) { try { await abateService.uploadPhoto(abateId, "FAZENDA", file); } catch { failed.push(file); } }
      setValue("fotos", failed, { shouldValidate: true });
      if (failed.length) { setServerError(`A etapa foi salva, mas ${failed.length} arquivo(s) não foram enviados. Tente novamente.`); return; }
      onSuccess(message);
    } catch (error) { setServerError(getErrorMessage(error)); }
  }

  return <form className="flex min-h-0 flex-col" onSubmit={handleSubmit(submit)} noValidate>
    <div className="min-h-0 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
      <fieldset disabled={isSubmitting || stageSaved} className="space-y-5 disabled:opacity-70">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quantidade total de cabeças" id="edit-farm-total-heads" error={errors.quantidade_total_cabecas?.message}><Input id="edit-farm-total-heads" inputMode="numeric" className="h-10" aria-invalid={Boolean(errors.quantidade_total_cabecas)} {...register("quantidade_total_cabecas")} /></Field>
          <Field label="Peso total" id="edit-farm-weight" error={errors.peso_total?.message}><Input id="edit-farm-weight" inputMode="decimal" className="h-10" aria-invalid={Boolean(errors.peso_total)} {...register("peso_total")} /></Field>
        </div>
        <PhotoPicker label="Novos arquivos da fazenda" files={photos} error={errors.fotos?.message} onChange={(files) => setValue("fotos", files, { shouldValidate: true })} />
      </fieldset>
      {serverError ? <Alert variant="destructive"><AlertTitle>Não foi possível concluir</AlertTitle><AlertDescription>{serverError}</AlertDescription></Alert> : null}
    </div>
    <div className="flex flex-col-reverse gap-2 border-t bg-zinc-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6"><Button type="button" variant="outline" className="h-10" disabled={isSubmitting} onClick={() => stageSaved ? onSuccess("Etapa na fazenda salva. Os arquivos pendentes não foram enviados.") : onCancel()}>{stageSaved ? "Fechar sem enviar arquivos" : "Cancelar"}</Button><Button type="submit" className="h-10" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : stageSaved ? <Upload className="size-4" /> : null}{isSubmitting ? "Salvando..." : stageSaved ? "Tentar enviar arquivos novamente" : "Salvar etapa"}</Button></div>
  </form>;
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) { return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}{error ? <p id={`${id}-error`} className="text-sm text-red-600">{error}</p> : null}</div>; }
