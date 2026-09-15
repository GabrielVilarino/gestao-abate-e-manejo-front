"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  abateObservacaoSchema,
  type AbateObservacaoFormData,
} from "@/features/abates/schemas/abate-observacao-schema";
import { abateService } from "@/features/abates/services/abate-service";
import type { AbateDadosGerais } from "@/features/abates/types/abate";
import { getErrorMessage } from "@/lib/api-client";

type AbateObservacaoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  abateId: number;
  dadosGerais: AbateDadosGerais;
  onSuccess: (message: string) => void;
};

export function AbateObservacaoDialog({ open, onOpenChange, abateId, dadosGerais, onSuccess }: AbateObservacaoDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isSaving) return;
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-xl" showCloseButton={!isSaving}>
        <DialogHeader>
          <DialogTitle>{dadosGerais.observacao ? "Editar observação" : "Adicionar observação"}</DialogTitle>
          <DialogDescription>Registre informações complementares sobre este abate.</DialogDescription>
        </DialogHeader>
        <AbateObservacaoForm
          key={`${abateId}-${dadosGerais.observacao}`}
          abateId={abateId}
          dadosGerais={dadosGerais}
          onCancel={() => onOpenChange(false)}
          onPendingChange={setIsSaving}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

type AbateObservacaoFormProps = {
  abateId: number;
  dadosGerais: AbateDadosGerais;
  onCancel: () => void;
  onPendingChange: (pending: boolean) => void;
  onSuccess: (message: string) => void;
};

function AbateObservacaoForm({ abateId, dadosGerais, onCancel, onPendingChange, onSuccess }: AbateObservacaoFormProps) {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AbateObservacaoFormData>({
    resolver: zodResolver(abateObservacaoSchema),
    defaultValues: { observacao: dadosGerais.observacao ?? "" },
  });

  async function submit(data: AbateObservacaoFormData) {
    setServerError("");
    onPendingChange(true);
    try {
      const response = await abateService.updateObservation(abateId, dadosGerais, data);
      onSuccess(response.message || "Observação salva com sucesso.");
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      onPendingChange(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="slaughter-observation">Observação</Label>
        <Textarea
          id="slaughter-observation"
          rows={7}
          placeholder="Digite a observação do abate"
          aria-invalid={Boolean(errors.observacao)}
          aria-describedby={errors.observacao ? "slaughter-observation-error" : undefined}
          {...register("observacao")}
        />
        {errors.observacao ? <p id="slaughter-observation-error" className="text-sm text-red-600">{errors.observacao.message}</p> : null}
      </div>
      {serverError ? <Alert variant="destructive"><AlertTitle>Não foi possível salvar a observação</AlertTitle><AlertDescription>{serverError}</AlertDescription></Alert> : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="h-10" disabled={isSubmitting} onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="h-10" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isSubmitting ? "Salvando..." : "Salvar observação"}
        </Button>
      </div>
    </form>
  );
}
