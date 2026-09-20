"use client";

import { Bell, BellOff, LoaderCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/features/notifications/hooks/use-push-notifications";

export function PushNotifications({ disabled }: { disabled: boolean }) {
  const { status, error, enable } = usePushNotifications(disabled);

  if (disabled) return null;

  if (status === "enabled") {
    return null;
  }

  if (status === "loading" || status === "saving") {
    return <p role="status" className="mb-5 flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle aria-hidden className="size-4 animate-spin" />{status === "loading" ? "Preparando notificações..." : "Ativando notificações..."}</p>;
  }

  if (status === "needs-consent") {
    return (
      <Alert className="mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <Bell aria-hidden className="mt-0.5 size-5 shrink-0" />
          <div>
            <AlertTitle>Receba notificações neste dispositivo</AlertTitle>
            <AlertDescription>Ative para receber avisos mesmo quando o aplicativo estiver fechado.</AlertDescription>
          </div>
        </div>
        <Button type="button" onClick={enable}>Ativar notificações</Button>
      </Alert>
    );
  }

  if (status === "install-required") {
    return (
      <Alert className="mb-5 p-4">
        <Bell aria-hidden className="size-5" />
        <AlertTitle>Instale o aplicativo para receber notificações</AlertTitle>
        <AlertDescription>No iPhone ou iPad, abra este site no Safari, toque em Compartilhar e depois em Adicionar à Tela de Início. Abra o aplicativo instalado para ativar as notificações.</AlertDescription>
      </Alert>
    );
  }

  const description =
    status === "unsupported"
      ? "Este navegador não oferece suporte a notificações push."
      : status === "denied"
        ? "As notificações estão bloqueadas. Permita-as nas configurações do navegador para receber avisos."
        : status === "unconfigured"
          ? "As notificações ainda não estão configuradas neste aplicativo."
          : error || "Não foi possível ativar as notificações.";

  return (
    <Alert variant={status === "error" ? "destructive" : "default"} className="mb-5 p-4">
      <BellOff aria-hidden className="size-5" />
      <AlertTitle>Notificações indisponíveis</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {status === "error" ? <Button type="button" variant="outline" className="mt-3" onClick={() => window.location.reload()}>Tentar novamente</Button> : null}
    </Alert>
  );
}
