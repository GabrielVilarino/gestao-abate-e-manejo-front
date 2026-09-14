import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-zinc-50 px-4 text-center">
      <div>
        <p className="text-sm font-semibold text-orange-600">Erro 404</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-950">Página não encontrada</h1>
        <p className="mt-3 text-zinc-600">O endereço informado não existe.</p>
        <Link href="/proprietarios" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600">Voltar para proprietários</Link>
      </div>
    </main>
  );
}
