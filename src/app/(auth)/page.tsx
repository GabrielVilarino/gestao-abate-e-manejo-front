import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col">
        <div className="mb-6 text-center">
          <Image src="/logo.png" alt="TecNutre" width={360} height={138} className="mx-auto h-auto w-64" priority />
          <p className="mt-3 text-sm text-zinc-400">Gestão de abate e manejo</p>
        </div>
        <Card className="border-white/10 shadow-2xl shadow-black/30">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Acesse sua conta</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-600">Entre com suas credenciais para continuar.</p>
            </div>
            <LoginForm />
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-zinc-500">Acesso restrito a usuários autorizados</p>
      </div>
    </main>
  );
}
