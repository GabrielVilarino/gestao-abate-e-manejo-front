"use client";

import { ChevronLeft, ChevronRight, FileDown, LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";

import { StatusMessage } from "@/components/feedback/status-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AbateCard } from "@/features/abates/components/abate-card";
import { AbateDialog } from "@/features/abates/components/abate-dialog";
import { AbateFiltersForm } from "@/features/abates/components/abate-filters";
import { useAbates } from "@/features/abates/hooks/use-abates";
import { downloadAbateReport } from "@/features/abates/services/abate-report-download";
import { abateService } from "@/features/abates/services/abate-service";
import { getErrorMessage } from "@/lib/api-client";

export function AbatesScreen() {
  const {
    abates,
    filters,
    page,
    isLoading,
    error,
    hasNextPage,
    search,
    reload,
    nextPage,
    previousPage,
  } = useAbates();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [reportError, setReportError] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  async function handleCreated(message: string) {
    setDialogOpen(false);
    setSuccess(message);
    await reload();
  }

  async function generateReport() {
    setIsGeneratingReport(true);
    setReportError("");
    try {
      const ids = await abateService.listAllIds(filters);
      if (!ids.length) throw new Error("Não há abates nos filtros aplicados para gerar o relatório.");
      const report = await abateService.generateReport(ids);
      downloadAbateReport(report, "relatorio-abates.pdf");
      setSuccess(`Relatório gerado com ${ids.length} ${ids.length === 1 ? "abate" : "abates"}.`);
    } catch (reportGenerationError) {
      setReportError(getErrorMessage(reportGenerationError));
    } finally {
      setIsGeneratingReport(false);
    }
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600">Operação</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">Abates</h1>
          <p className="mt-2 text-sm text-zinc-600">Consulte os registros e acompanhe cada etapa do abate.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => void generateReport()} disabled={isLoading || Boolean(error) || abates.length === 0 || isGeneratingReport} className="h-10 w-full sm:w-auto">
            {isGeneratingReport ? <LoaderCircle className="size-4 animate-spin" /> : <FileDown className="size-4" />}
            {isGeneratingReport ? "Gerando relatório..." : "Gerar relatório"}
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="h-10 w-full sm:w-auto">
            <Plus className="size-5" /> Novo abate
          </Button>
        </div>
      </div>

      {success ? <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800"><AlertTitle>{success}</AlertTitle></Alert> : null}
      {reportError ? <Alert variant="destructive"><AlertTitle>Não foi possível gerar o relatório</AlertTitle><AlertDescription>{reportError}</AlertDescription></Alert> : null}

      <AbateFiltersForm isSearching={isLoading} onSearch={search} />

      {isLoading ? (
        <div role="status" aria-label="Carregando abates" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-72 rounded-2xl" />)}
        </div>
      ) : error ? (
        <StatusMessage variant="error" title="Não foi possível carregar os abates" description={error} onRetry={() => void reload()} />
      ) : abates.length === 0 ? (
        <div className="space-y-3">
          <StatusMessage
            title={page > 1 ? "Nenhum abate nesta página" : hasFilters ? "Nenhum abate encontrado" : "Nenhum abate cadastrado"}
            description={page > 1 ? "Volte à página anterior para continuar a consulta." : hasFilters ? "Revise os filtros informados e faça uma nova busca." : "Cadastre o primeiro abate para começar."}
          />
          {page > 1 ? (
            <div className="flex justify-center">
              <Button type="button" variant="outline" className="h-10" onClick={previousPage}>
                <ChevronLeft className="size-4" /> Voltar à página anterior
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <section aria-label="Lista de abates">
          <div className="mb-3 flex items-center justify-between gap-3 text-sm text-zinc-500">
            <p>{abates.length} {abates.length === 1 ? "abate nesta página" : "abates nesta página"}</p>
            <p>Página {page}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {abates.map((abate) => <AbateCard key={abate.id} abate={abate} />)}
          </div>
          {page > 1 || hasNextPage ? (
            <nav aria-label="Paginação dos abates" className="mt-6 flex justify-center gap-2">
              <Button type="button" variant="outline" className="h-10" onClick={previousPage} disabled={page === 1 || isLoading}>
                <ChevronLeft className="size-4" /> Anterior
              </Button>
              <Button type="button" variant="outline" className="h-10" onClick={nextPage} disabled={!hasNextPage || isLoading}>
                Próxima <ChevronRight className="size-4" />
              </Button>
            </nav>
          ) : null}
        </section>
      )}

      <AbateDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={(message) => void handleCreated(message)} />
    </div>
  );
}
