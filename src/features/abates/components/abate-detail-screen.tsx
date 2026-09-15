"use client";

import { ArrowLeft, Camera, Download, FileDown, LoaderCircle, MapPin, MessageSquareText, Pencil, Plus, Scale, UsersRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { StatusMessage } from "@/components/feedback/status-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EtapaFazendaDialog } from "@/features/abates/components/etapa-fazenda-dialog";
import { EtapaFrigorificoDialog } from "@/features/abates/components/etapa-frigorifico-dialog";
import { AbateObservacaoDialog } from "@/features/abates/components/abate-observacao-dialog";
import { useAbate } from "@/features/abates/hooks/use-abate";
import { formatCurrency, formatDate, formatFileSize, formatNumber } from "@/features/abates/schemas/abate-formatters";
import type { AbateFoto } from "@/features/abates/types/abate";
import { downloadAbateReport } from "@/features/abates/services/abate-report-download";
import { abateService } from "@/features/abates/services/abate-service";
import { getErrorMessage } from "@/lib/api-client";

export function AbateDetailScreen({ id }: { id: string }) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return <StatusMessage variant="error" title="Abate inválido" description="O identificador informado não é válido." />;
  }

  return <ValidAbateDetail numericId={numericId} />;
}

function ValidAbateDetail({ numericId }: { numericId: number }) {
  const { abate, isLoading, error, reload } = useAbate(numericId);
  const [farmDialogOpen, setFarmDialogOpen] = useState(false);
  const [plantDialogOpen, setPlantDialogOpen] = useState(false);
  const [observationDialogOpen, setObservationDialogOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [reportError, setReportError] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  if (isLoading) {
    return <div role="status" aria-label="Carregando detalhes do abate" className="space-y-4"><Skeleton className="h-12 w-48" /><Skeleton className="h-72 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>;
  }

  if (error || !abate) {
    return <StatusMessage variant="error" title="Não foi possível carregar o abate" description={error || "O abate não foi encontrado."} onRetry={() => void reload()} />;
  }

  const general = abate.dados_gerais;
  const abateId = abate.id;

  async function handleStageSuccess(message: string) {
    setFarmDialogOpen(false);
    setPlantDialogOpen(false);
    setSuccess(message);
    await reload();
  }

  async function handleObservationSuccess(message: string) {
    setObservationDialogOpen(false);
    setSuccess(message);
    await reload();
  }

  async function generateReport() {
    setIsGeneratingReport(true);
    setReportError("");
    try {
      const report = await abateService.generateReport([abateId]);
      downloadAbateReport(report, `relatorio-abate-${abateId}.pdf`);
      setSuccess("Relatório gerado com sucesso.");
    } catch (reportGenerationError) {
      setReportError(getErrorMessage(reportGenerationError));
    } finally {
      setIsGeneratingReport(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/abates" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-zinc-600 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
        <ArrowLeft className="size-4" /> Voltar para abates
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600">Detalhes do abate</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">Lote #{general.numero_lote}</h1>
          <p className="mt-2 text-sm text-zinc-600">{abate.nome_proprietario} · {abate.nome_fazenda}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Badge variant="outline" className="w-fit border-orange-200 bg-orange-50 px-3 py-1 text-orange-700">{formatDate(general.data_abate)}</Badge>
          <Button type="button" variant="outline" className="h-10" disabled={isGeneratingReport} onClick={() => void generateReport()}>
            {isGeneratingReport ? <LoaderCircle className="size-4 animate-spin" /> : <FileDown className="size-4" />}
            {isGeneratingReport ? "Gerando relatório..." : "Gerar relatório"}
          </Button>
        </div>
      </div>

      {success ? <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800"><AlertTitle>{success}</AlertTitle></Alert> : null}
      {reportError ? <Alert variant="destructive"><AlertTitle>Não foi possível gerar o relatório</AlertTitle><AlertDescription>{reportError}</AlertDescription></Alert> : null}

      <Card>
        <CardHeader><CardTitle>Dados gerais</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DataItem label="Proprietário" value={abate.nome_proprietario} />
            <DataItem label="Fazenda" value={abate.nome_fazenda} />
            <DataItem label="Data" value={formatDate(general.data_abate)} />
            <DataItem label="Frigorífico" value={general.nome_frigorifico} />
            <DataItem label="Distância" value={`${formatNumber(general.distancia_frigorifico)} km`} />
            <DataItem label="Categoria animal" value={general.categoria_animal} />
            <DataItem label="Preço com Funrural" value={formatCurrency(general.preco_funrural)} />
            <DataItem label="Preço sem Funrural" value={formatCurrency(general.preco_sem_funrural)} />
          </dl>
        </CardContent>
      </Card>

      {abate.etapa_fazenda ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="size-5 text-orange-500" /> Etapa na fazenda</CardTitle>
            <CardAction><Button type="button" variant="outline" className="h-9" onClick={() => setFarmDialogOpen(true)}><Pencil className="size-4" /> Configurar etapa</Button></CardAction>
          </CardHeader>
          <CardContent className="space-y-5">
            <DataItem label="Peso total" value={`${formatNumber(abate.etapa_fazenda.peso_total)} kg`} />
            <DetailTable
              title="Quantidade por dentição"
              headers={["Dentição", "Quantidade"]}
              rows={(abate.etapa_fazenda.quantidade_animal ?? []).map((item) => [String(item.denticao), String(item.qtd_animais)])}
            />
            <PhotoList photos={abate.etapa_fazenda.fotos ?? []} />
          </CardContent>
        </Card>
      ) : <MissingStage title="Etapa na fazenda não informada" actionLabel="Configurar etapa na fazenda" onAction={() => setFarmDialogOpen(true)} />}

      {abate.etapa_frigorifico ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Scale className="size-5 text-orange-500" /> Etapa no frigorífico</CardTitle>
            <CardAction><Button type="button" variant="outline" className="h-9" onClick={() => setPlantDialogOpen(true)}><Pencil className="size-4" /> Configurar etapa</Button></CardAction>
          </CardHeader>
          <CardContent className="space-y-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              <DataItem label="Peso total" value={`${formatNumber(abate.etapa_frigorifico.peso_total)} kg`} />
              <DataItem label="Balancão" value={`${formatNumber(abate.etapa_frigorifico.balancao)} kg`} />
            </dl>
            <DetailTable title="Acabamento de carcaça" headers={["Acabamento", "Quantidade"]} rows={(abate.etapa_frigorifico.acabamento_carcaca ?? []).map((item) => [item.acabamento, String(item.qtd_animais)])} />
            <DetailTable title="Classificação do frigorífico" headers={["Classificação", "Quantidade"]} rows={(abate.etapa_frigorifico.classificacao_frigorifico ?? []).map((item) => [item.classificacao, String(item.qtd_animais)])} />
            <DetailTable title="Distribuição de peso" headers={["Classificação", "Quantidade", "Peso total"]} rows={(abate.etapa_frigorifico.distribuicao_peso ?? []).map((item) => [item.classificacao, String(item.qtd_animais), `${formatNumber(item.peso_total)} kg`])} />
            <PhotoList photos={abate.etapa_frigorifico.fotos ?? []} />
          </CardContent>
        </Card>
      ) : <MissingStage title="Etapa no frigorífico não informada" actionLabel="Configurar etapa no frigorífico" onAction={() => setPlantDialogOpen(true)} />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquareText className="size-5 text-orange-500" /> Observação</CardTitle>
          <CardAction>
            <Button type="button" variant="outline" className="h-9" onClick={() => setObservationDialogOpen(true)}>
              {general.observacao ? <Pencil className="size-4" /> : <Plus className="size-4" />}
              {general.observacao ? "Editar observação" : "Adicionar observação"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">{general.observacao || "Nenhuma observação informada."}</p>
        </CardContent>
      </Card>

      <EtapaFazendaDialog open={farmDialogOpen} onOpenChange={setFarmDialogOpen} abateId={abate.id} etapa={abate.etapa_fazenda} onSuccess={(message) => void handleStageSuccess(message)} />
      <EtapaFrigorificoDialog open={plantDialogOpen} onOpenChange={setPlantDialogOpen} abateId={abate.id} etapa={abate.etapa_frigorifico} onSuccess={(message) => void handleStageSuccess(message)} />
      <AbateObservacaoDialog open={observationDialogOpen} onOpenChange={setObservationDialogOpen} abateId={abate.id} dadosGerais={general} onSuccess={(message) => void handleObservationSuccess(message)} />
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">{label}</dt><dd className="mt-1 font-medium text-zinc-900">{value}</dd></div>;
}

function MissingStage({ title, actionLabel, onAction }: { title: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-dashed bg-white px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm text-zinc-500"><UsersRound className="size-5 text-zinc-400" /> {title}</div>
      <Button type="button" variant="outline" className="h-10" onClick={onAction}><Plus className="size-4" /> {actionLabel}</Button>
    </div>
  );
}

function DetailTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-zinc-900">{title}</h3>
      {rows.length ? (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-md text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600"><tr>{headers.map((header) => <th key={header} className="px-3 py-2 font-medium">{header}</th>)}</tr></thead>
            <tbody className="divide-y">{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-2 text-zinc-700">{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : <p className="rounded-xl bg-zinc-50 px-3 py-4 text-sm text-zinc-500">Nenhum item informado.</p>}
    </section>
  );
}

function PhotoList({ photos }: { photos: AbateFoto[] }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-zinc-900">Fotos</h3>
      {photos.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {photos.map((photo) => (
            <li key={photo.id} className="flex items-center gap-3 rounded-xl border p-3">
              <Camera className="size-5 shrink-0 text-orange-500" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{photo.nome_original}</p><p className="text-xs text-zinc-500">{formatFileSize(photo.tamanho)}</p></div>
              <Button nativeButton={false} render={<a href={`/api/backend/v1/abate/fotos/${photo.id}`} download />} variant="ghost" size="icon" aria-label={`Baixar ${photo.nome_original}`}><Download className="size-4" /></Button>
            </li>
          ))}
        </ul>
      ) : <p className="rounded-xl bg-zinc-50 px-3 py-4 text-sm text-zinc-500">Nenhuma foto enviada.</p>}
    </section>
  );
}
