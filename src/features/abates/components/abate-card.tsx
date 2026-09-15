import { Beef, CalendarDays, ChevronRight, MapPin, UsersRound } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { formatDate } from "@/features/abates/schemas/abate-formatters";
import type { Abate } from "@/features/abates/types/abate";

function animalCount(abate: Abate) {
  const quantities = abate.etapa_fazenda?.quantidade_animal ?? [];
  if (!quantities.length) return undefined;
  return quantities.reduce((total, item) => total + item.qtd_animais, 0);
}

export function AbateCard({ abate }: { abate: Abate }) {
  const quantity = animalCount(abate);

  return (
    <Card className="group p-0 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
      <Link
        href={`/abates/${abate.id}`}
        className="flex h-full flex-col p-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
        aria-label={`Ver detalhes do abate do lote ${abate.dados_gerais.numero_lote}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">
              <Beef className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-orange-600 uppercase">Lote</p>
              <h2 className="truncate text-lg font-bold text-zinc-950">#{abate.dados_gerais.numero_lote}</h2>
            </div>
          </div>
          <ChevronRight className="mt-2 size-5 shrink-0 text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
        </div>

        <dl className="mt-5 grid gap-3 text-sm">
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-zinc-400" />
            <div><dt className="sr-only">Data</dt><dd className="font-medium text-zinc-800">{formatDate(abate.dados_gerais.data_abate)}</dd></div>
          </div>
          <div className="flex items-start gap-2">
            <UsersRound className="mt-0.5 size-4 shrink-0 text-zinc-400" />
            <div className="min-w-0"><dt className="sr-only">Proprietário</dt><dd className="truncate text-zinc-600">{abate.nome_proprietario}</dd></div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-zinc-400" />
            <div className="min-w-0"><dt className="sr-only">Fazenda</dt><dd className="truncate text-zinc-600">{abate.nome_fazenda}</dd></div>
          </div>
        </dl>

        <div className="mt-5 border-t border-zinc-100 pt-4 text-sm text-zinc-500">
          {quantity === undefined ? "Quantidade de animais não informada" : `${quantity} ${quantity === 1 ? "animal" : "animais"}`}
        </div>
      </Link>
    </Card>
  );
}
