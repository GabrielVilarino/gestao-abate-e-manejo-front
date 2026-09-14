import { AlertCircle, CheckCircle2, Inbox } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type StatusMessageProps = {
  title: string;
  description: string;
  variant?: "error" | "empty" | "success";
  onRetry?: () => void;
};

export function StatusMessage({ title, description, variant = "empty", onRetry }: StatusMessageProps) {
  const Icon = variant === "error" ? AlertCircle : variant === "success" ? CheckCircle2 : Inbox;
  return (
    <Alert variant={variant === "error" ? "destructive" : "default"} className="rounded-2xl px-5 py-8 text-center">
      <Icon className={variant === "error" ? "text-red-600" : "text-orange-500"} />
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription className="mx-auto max-w-md">{description}</AlertDescription>
      {onRetry ? <Button className="mt-4" variant="outline" onClick={onRetry}>Tentar novamente</Button> : null}
    </Alert>
  );
}
