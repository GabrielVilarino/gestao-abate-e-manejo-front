"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { usuarioSchema, type UsuarioFormData } from "@/features/usuarios/schemas/usuario-schema";
import { usuarioService } from "@/features/usuarios/services/usuario-service";
import type { Usuario } from "@/features/usuarios/types/usuario";
import { getErrorMessage } from "@/lib/api-client";

type UsuarioFormProps = {
  usuario?: Usuario;
  lockRoleReason?: string;
  onSubmittingChange: (submitting: boolean) => void;
  onSuccess: (message: string) => void;
  onCancel: () => void;
};

const roleOptions = [
  { value: "1", label: "Administrador" },
  { value: "2", label: "Usuário" },
] as const;

export function UsuarioForm({ usuario, lockRoleReason, onSubmittingChange, onSuccess, onCancel }: UsuarioFormProps) {
  const [serverError, setServerError] = useState("");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema(Boolean(usuario))),
    defaultValues: {
      nome: usuario?.nome ?? "",
      email: usuario?.email ?? "",
      role: usuario ? String(usuario.role) as "1" | "2" : "2",
      password: "",
    },
  });

  async function onSubmit(data: UsuarioFormData) {
    setServerError("");
    if (usuario && lockRoleReason && Number(data.role) !== usuario.role) {
      setServerError(lockRoleReason);
      return;
    }
    onSubmittingChange(true);
    try {
      const response = usuario
        ? await usuarioService.update(usuario, data)
        : await usuarioService.create(data);
      onSuccess(response.message || `Usuário ${usuario ? "atualizado" : "criado"} com sucesso.`);
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      onSubmittingChange(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="usuario-nome">Nome</Label>
        <Input id="usuario-nome" autoComplete="name" aria-invalid={Boolean(errors.nome)} aria-describedby={errors.nome ? "usuario-nome-error" : undefined} {...register("nome")} />
        {errors.nome ? <p id="usuario-nome-error" className="text-sm text-red-600">{errors.nome.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="usuario-email">E-mail</Label>
        <Input id="usuario-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "usuario-email-error" : undefined} {...register("email")} />
        {errors.email ? <p id="usuario-email-error" className="text-sm text-red-600">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="usuario-role">Perfil</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              id="usuario-role"
              options={roleOptions}
              value={field.value}
              onValueChange={field.onChange}
              disabled={Boolean(lockRoleReason)}
              invalid={Boolean(errors.role)}
              describedBy={errors.role ? "usuario-role-error" : lockRoleReason ? "usuario-role-locked" : undefined}
            />
          )}
        />
        {errors.role ? <p id="usuario-role-error" className="text-sm text-red-600">{errors.role.message}</p> : null}
        {lockRoleReason ? <p id="usuario-role-locked" className="text-sm text-zinc-500">{lockRoleReason}</p> : null}
      </div>
      {!usuario ? (
        <div className="space-y-2">
          <Label htmlFor="usuario-password">Senha</Label>
          <Input id="usuario-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "usuario-password-error" : undefined} {...register("password")} />
          {errors.password ? <p id="usuario-password-error" className="text-sm text-red-600">{errors.password.message}</p> : null}
        </div>
      ) : null}
      {serverError ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p> : null}
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="size-5 animate-spin" /> : null}
          {isSubmitting ? "Salvando..." : "Salvar usuário"}
        </Button>
      </div>
    </form>
  );
}
