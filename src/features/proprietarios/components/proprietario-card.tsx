import { ChevronRight, Pencil, Power, UserRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCpf } from "@/features/proprietarios/schemas/proprietario-schema";
import type { Proprietario } from "@/features/proprietarios/types/proprietario";

export function ProprietarioCard({ proprietario, onEdit, onToggleStatus }: { proprietario: Proprietario; onEdit: () => void; onToggleStatus: () => void }) {
  return (
    <Card className="group flex min-h-44 flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
      <Link
        href={`/proprietarios/${proprietario.id}`}
        className="flex flex-1 flex-col p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
        aria-label={`Ver detalhes de ${proprietario.nome}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
              <UserRound className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-bold text-zinc-950">{proprietario.nome}</h2>
              <p className="mt-1 text-sm text-zinc-500">CPF {formatCpf(proprietario.cpf)}</p>
            </div>
          </div>
          <ChevronRight className="mt-1 size-5 shrink-0 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-zinc-600">
          {proprietario.observacao || "Sem observações cadastradas."}
        </p>
      </Link>
      <div className="flex justify-between items-center p-4">
        <div>
          <Badge variant="outline" className={proprietario.ativo ? "mt-auto self-start border-emerald-200 bg-emerald-50 text-emerald-700" : "mt-auto self-start border-red-200 bg-red-50 text-red-700"}>
            {proprietario.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={onEdit} aria-label={`Editar ${proprietario.nome}`}>
            <Pencil className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onToggleStatus} aria-label={`${proprietario.ativo ? "Desativar" : "Ativar"} ${proprietario.nome}`}>
            <Power className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
