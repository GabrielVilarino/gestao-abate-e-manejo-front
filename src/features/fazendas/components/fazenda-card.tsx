import { MapPin, Pencil, Power, Tractor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Fazenda } from "@/features/fazendas/types/fazenda";

export function FazendaCard({ fazenda, onEdit, onToggleStatus }: { fazenda: Fazenda; onEdit: () => void; onToggleStatus: () => void }) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Tractor className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-bold text-zinc-950">{fazenda.nome}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500"><MapPin className="size-4" /> {fazenda.cidade}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit} aria-label={`Editar ${fazenda.nome}`}><Pencil className="size-4" /></Button>
            <Button variant="ghost" size="icon" onClick={onToggleStatus} aria-label={`${fazenda.ativo ? "Desativar" : "Ativar"} ${fazenda.nome}`}><Power className="size-4" /></Button>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 border-t border-zinc-100 pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Inscrição rural</dt>
            <dd className="text-right font-medium text-zinc-800">{fazenda.inscricao_rural || "Não informada"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Situação</dt>
            <dd><Badge variant="outline" className={fazenda.ativo ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}>{fazenda.ativo ? "Ativa" : "Inativa"}</Badge></dd>
          </div>
        </dl>
        {fazenda.observacao ? <p className="mt-4 text-sm leading-6 text-zinc-600">{fazenda.observacao}</p> : null}
      </CardContent>
    </Card>
  );
}
