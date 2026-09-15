"use client";

import { Beef, Building2, LoaderCircle, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authService } from "@/features/auth/services/auth-service";
import { getErrorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (isLeaving) return;
    setIsLeaving(true);
    setError("");
    try {
      await authService.logout();
      router.replace("/");
      router.refresh();
    } catch (logoutError) {
      setError(getErrorMessage(logoutError));
      setIsLeaving(false);
    }
  }

  const isOwners = pathname.startsWith("/proprietarios");
  const isSlaughters = pathname.startsWith("/abates");

  return (
    <div className="min-h-dvh bg-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:h-24 sm:px-6 lg:px-8">
          <Link href="/home" aria-label="TecNutre — Assessoria em abates, contenção e pesagem em bovinos" className="flex h-18 w-63 shrink-0 items-start overflow-hidden sm:h-22 sm:w-76">
              <Image src="/logo.png" alt="TecNutre" width={1231} height={471} className="h-auto w-full max-w-none" priority />
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLeaving}>
            {isLeaving ? <LoaderCircle className="size-5 animate-spin" /> : <LogOut className="size-5" />}
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
        {error ? <p role="alert" className="border-t border-red-100 bg-red-50 px-4 py-2 text-center text-sm text-red-700">{error}</p> : null}
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-8 sm:pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:px-8">{children}</main>
      <footer className="fixed bottom-0 left-0 z-40 w-full border-t bg-background py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-center">
        <nav aria-label="Navegação principal" className="flex items-center justify-center gap-1 sm:gap-2">
          <Link
            href="/proprietarios"
            aria-current={isOwners ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
              isOwners ? "bg-orange-50 text-orange-700" : "text-zinc-600 hover:bg-zinc-100",
            )}
          >
            <Building2 className="size-5" />
            <span className="hidden sm:inline">Proprietários</span>
          </Link>
          <Link
            href="/abates"
            aria-label="Abates"
            aria-current={isSlaughters ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
              isSlaughters ? "bg-orange-50 text-orange-700" : "text-zinc-600 hover:bg-zinc-100",
            )}
          >
            <Beef className="size-5" />
            <span className="hidden sm:inline">Abates</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
}
