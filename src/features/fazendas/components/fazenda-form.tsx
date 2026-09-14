"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fazendaSchema, type FazendaFormData } from "@/features/fazendas/schemas/fazenda-schema";
import { fazendaService } from "@/features/fazendas/services/fazenda-service";
import type { Fazenda } from "@/features/fazendas/types/fazenda";
import { getErrorMessage } from "@/lib/api-client";

type FazendaFormProps = {
  idProprietario: number;
  fazenda?: Fazenda;
  onSuccess: (message: string) => void;
  onCancel: () => void;
};

export function FazendaForm({ idProprietario, fazenda, onSuccess, onCancel }: FazendaFormProps) {
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FazendaFormData>({
    resolver: zodResolver(fazendaSchema),
    defaultValues: {
      nome: fazenda?.nome ?? "",
      cidade: fazenda?.cidade ?? "",
      inscricao_rural: fazenda?.inscricao_rural ?? "",
      observacao: fazenda?.observacao ?? "",
    },
  });

  async function onSubmit(data: FazendaFormData) {
    setServerError("");
    try {
      const response = fazenda
        ? await fazendaService.update(fazenda, data)
        : await fazendaService.create(idProprietario, data);
      onSuccess(response.message || `Fazenda ${fazenda ? "atualizada" : "criada"} com sucesso.`);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="farm-name">Nome</Label>
        <Input id="farm-name" aria-invalid={Boolean(errors.nome)} {...register("nome")} />
        {errors.nome ? <p className="text-sm text-red-600">{errors.nome.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="farm-city">Cidade</Label>
        <Input id="farm-city" autoComplete="address-level2" aria-invalid={Boolean(errors.cidade)} {...register("cidade")} />
        {errors.cidade ? <p className="text-sm text-red-600">{errors.cidade.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="farm-registration">Inscrição rural</Label>
        <Input id="farm-registration" placeholder="Opcional" {...register("inscricao_rural")} />
        {errors.inscricao_rural ? <p className="text-sm text-red-600">{errors.inscricao_rural.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="farm-note">Observação</Label>
        <Textarea id="farm-note" placeholder="Informações adicionais (opcional)" {...register("observacao")} />
        {errors.observacao ? <p className="text-sm text-red-600">{errors.observacao.message}</p> : null}
      </div>
      {serverError ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p> : null}
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="size-5 animate-spin" /> : null}
          {isSubmitting ? "Salvando..." : "Salvar fazenda"}
        </Button>
      </div>
    </form>
  );
}
