"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginData } from "@/features/auth/schemas/login-schema";
import { authService } from "@/features/auth/services/auth-service";
import { getErrorMessage } from "@/lib/api-client";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginData) {
    setServerError("");
    try {
      await authService.login(data);
      router.replace("/home");
      router.refresh();
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <InputGroup>
          <InputGroupAddon>
            <Mail aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            id="email"
            type="email"
            autoComplete="username"
            autoFocus
            placeholder="seu@email.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </InputGroup>
        {errors.email ? <p id="email-error" className="text-sm text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <InputGroup>
          <InputGroupAddon>
            <LockKeyhole aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
            size="icon-sm"
            className=" text-zinc-500"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {errors.password ? <p id="password-error" className="text-sm text-red-600">{errors.password.message}</p> : null}
      </div>

      {serverError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : null}
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
