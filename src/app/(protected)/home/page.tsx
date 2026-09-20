import { Beef, Building2, CalendarDays, ChevronRight, Info, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifySession } from "@/lib/auth-session";

type FeatureCardProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
};

function FeatureCard({ href, icon, title, description, items }: FeatureCardProps) {
  return (
    <Card className="transition hover:border-orange-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">{icon}</span>
        <div className="min-w-0 flex-1">
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="flex flex-col gap-2 text-sm leading-6 text-zinc-700">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <Info className="mt-1 size-4 shrink-0 text-orange-600" />
              {item}
            </li>
          ))}
        </ul>
        <Link
          href={href}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          Acessar funcionalidade
          <ChevronRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default async function HomePage() {
  const session = await verifySession((await cookies()).get("auth")?.value);
  const isAdmin = session?.role === 1;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-4 sm:py-10">
      <div className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">Sistema TecNutre</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">Gestão de abate e manejo</h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-600">
          Centralize a rotina de campo, dos cadastros de proprietários ao acompanhamento de abates e da agenda.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <FeatureCard
          href="/proprietarios"
          icon={<Building2 className="size-5" />}
          title="Proprietários e fazendas"
          description="Mantenha os cadastros rurais organizados e atualizados."
          items={[
            "Consulte, cadastre e edite proprietários.",
            "Gerencie as fazendas vinculadas a cada proprietário.",
            "Ative ou desative cadastros quando necessário.",
          ]}
        />
        <FeatureCard
          href="/abates"
          icon={<Beef className="size-5" />}
          title="Gestão de abates"
          description="Registre e acompanhe cada etapa do processo de abate."
          items={[
            "Consulte a listagem com filtros e cadastre abates.",
            "Registre pesagens, quantidades, acabamento e classificação.",
            "Adicione fotos das etapas e gere relatórios em PDF.",
          ]}
        />
        <FeatureCard
          href="/agenda"
          icon={<CalendarDays className="size-5" />}
          title="Agenda"
          description="Planeje e acompanhe os compromissos da operação."
          items={[
            "Visualize os compromissos agendados.",
            "Organize os atendimentos e atividades de campo.",
          ]}
        />
        {isAdmin ? (
          <FeatureCard
            href="/usuarios"
            icon={<UsersRound className="size-5" />}
            title="Gestão de usuários"
            description="Administre os acessos da equipe ao sistema."
            items={[
              "Cadastre e edite usuários.",
              "Defina perfis de administrador ou usuário.",
              "Ative ou desative acessos quando necessário.",
            ]}
          />
        ) : null}
      </div>

      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />
          <p className="text-sm leading-6 text-emerald-900">O acesso às informações é protegido pela sua sessão autenticada.</p>
        </CardContent>
      </Card>
    </section>
  );
}
