"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatCpf,
  proprietarioSchema,
  type ProprietarioFormData,
} from "@/features/proprietarios/schemas/proprietario-schema";
import { proprietarioService } from "@/features/proprietarios/services/proprietario-service";
import type { Proprietario } from "@/features/proprietarios/types/proprietario";
import { getErrorMessage } from "@/lib/api-client";

type ProprietarioFormProps = {
  proprietario?: Proprietario;
  onSuccess: (message: string) => void;
  onCancel: () => void;
};

export function ProprietarioForm({ proprietario, onSuccess, onCancel }: ProprietarioFormProps) {
  const [serverError, setServerError] = useState("");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProprietarioFormData>({
    resolver: zodResolver(proprietarioSchema),
    defaultValues: {
      nome: proprietario?.nome ?? "",
      cpf: formatCpf(proprietario?.cpf ?? ""),
      observacao: proprietario?.observacao ?? "",
    },
  });

  async function onSubmit(data: ProprietarioFormData) {
    setServerError("");
    try {
      const response = proprietario
        ? await proprietarioService.update(proprietario, data)
        : await proprietarioService.create(data);
      onSuccess(response.message || `Proprietário ${proprietario ? "atualizado" : "criado"} com sucesso.`);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="owner-name">Nome</Label>
        <Input id="owner-name" autoComplete="name" aria-invalid={Boolean(errors.nome)} {...register("nome")} />
        {errors.nome ? <p className="text-sm text-red-600">{errors.nome.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="owner-cpf">CPF</Label>
        <Controller
          name="cpf"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="owner-cpf"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              aria-invalid={Boolean(errors.cpf)}
              onChange={(event) => field.onChange(formatCpf(event.target.value))}
            />
          )}
        />
        {errors.cpf ? <p className="text-sm text-red-600">{errors.cpf.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="owner-note">Observação</Label>
        <Textarea id="owner-note" placeholder="Informações adicionais (opcional)" {...register("observacao")} />
        {errors.observacao ? <p className="text-sm text-red-600">{errors.observacao.message}</p> : null}
      </div>
      {serverError ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p> : null}
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="size-5 animate-spin" /> : null}
          {isSubmitting ? "Salvando..." : "Salvar proprietário"}
        </Button>
      </div>
    </form>
  );
}
