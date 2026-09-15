import { Beef, Building2, Info, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-4 sm:py-10">
      <div className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">Sistema TecNutre</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">Gestão de abate e manejo</h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-600">
          Centralize os cadastros dos proprietários rurais e das fazendas vinculadas, mantendo as informações organizadas e atualizadas.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Building2 className="size-5" /></span>
          <CardTitle>O que você encontra aqui</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3 text-sm leading-6 text-zinc-700">
            <li className="flex gap-3"><Info className="mt-1 size-4 shrink-0 text-orange-600" />Consulta, cadastro e edição de proprietários.</li>
            <li className="flex gap-3"><Info className="mt-1 size-4 shrink-0 text-orange-600" />Gestão das fazendas vinculadas a cada proprietário.</li>
            <li className="flex gap-3"><Info className="mt-1 size-4 shrink-0 text-orange-600" />Ativação e desativação de cadastros quando necessário.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Beef className="size-5" /></span>
          <CardTitle>Gestão de abates</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3 text-sm leading-6 text-zinc-700">
            <li className="flex gap-3"><Info className="mt-1 size-4 shrink-0 text-orange-600" />Consulte a listagem com filtros e cadastre abates com dados gerais, etapa Fazenda e etapa Frigorífico.</li>
            <li className="flex gap-3"><Info className="mt-1 size-4 shrink-0 text-orange-600" />Registre pesagens, quantidades, acabamento, classificação e distribuição de peso.</li>
            <li className="flex gap-3"><Info className="mt-1 size-4 shrink-0 text-orange-600" />Adicione fotos das etapas e gere relatórios em PDF.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <p className="text-sm leading-6 text-emerald-900">O acesso às informações é protegido pela sua sessão autenticada.</p>
        </CardContent>
      </Card>
    </section>
  );
}
