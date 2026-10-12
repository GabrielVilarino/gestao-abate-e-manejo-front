"use client";

import { Activity, Beef, Gauge, Scale, Truck, Weight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardFilters } from "@/features/dashboard/components/dashboard-filters";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import type { DashboardFilters as DashboardFilterValues } from "@/features/dashboard/types/dashboard";
import { formatDate, formatNumber } from "@/features/abates/schemas/abate-formatters";

const orange = "#ea580c";
const green = "#16a34a";
const blue = "#2563eb";

export function DashboardScreen() {
  const [filters, setFilters] = useState<DashboardFilterValues>({});
  const { dashboard, isLoading, error, reload } = useDashboard(filters);

  return <section className="space-y-6">
    <header><p className="text-sm font-semibold text-orange-600">Visão geral da operação</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">Dashboard de abates</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">Acompanhe volume, quantidade de cabeças, peso e rendimento por período, proprietário e fazenda.</p></header>
    <DashboardFilters isSearching={isLoading} onSearch={setFilters} />
    {isLoading ? <DashboardLoading /> : error ? <Alert variant="destructive"><AlertTitle>Não foi possível carregar o dashboard</AlertTitle><AlertDescription className="flex flex-col gap-3"><span>{error}</span><button type="button" className="w-fit font-semibold underline" onClick={() => void reload()}>Tentar novamente</button></AlertDescription></Alert> : dashboard ? <DashboardContent dashboard={dashboard} /> : null}
  </section>;
}

function DashboardContent({ dashboard }: { dashboard: NonNullable<ReturnType<typeof useDashboard>["dashboard"]> }) {
  const { resumo } = dashboard;
  const dailyData = dashboard.evolucao.map((item) => ({ ...item, dataFormatada: formatDate(item.data) }));
  return <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard icon={<Beef />} label="Total de abates" value={formatNumber(resumo.total_abates, 0)} help="Quantidade de lotes abatidos" />
      <MetricCard icon={<Activity />} label="Total de cabeças" value={formatNumber(resumo.total_cabecas, 0)} help="Animais registrados nos abates" />
      <MetricCard icon={<Gauge />} label="Cabeças por abate" value={formatNumber(resumo.media_cabecas_por_abate)} help="Média de animais por lote" />
      <MetricCard icon={<Scale />} label="Rendimento de carcaça" value={`${formatNumber(resumo.rendimento_medio_carcaca)}%`} help="Média do peso aproveitado" />
      <MetricCard icon={<Weight />} label="Peso médio na fazenda" value={`${formatNumber(resumo.peso_medio_fazenda)} kg`} help="Peso médio antes do transporte" />
      <MetricCard icon={<Weight />} label="Peso médio no frigorífico" value={`${formatNumber(resumo.peso_medio_frigorifico)} kg`} help="Peso médio recebido" />
      <MetricCard icon={<Truck />} label="Distância média" value={`${formatNumber(resumo.distancia_media_frigorifico)} km`} help="Distância média até o frigorífico" />
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Evolução diária" description="Veja quantos abates e cabeças foram registrados em cada dia.">
        {dailyData.length ? <ChartContainer className="h-80" config={{ total_abates: { label: "Abates", color: orange }, total_cabecas: { label: "Cabeças", color: blue } }}><LineChart data={dailyData} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="dataFormatada" tickLine={false} axisLine={false} minTickGap={24} /><YAxis yAxisId="abates" allowDecimals={false} tickLine={false} axisLine={false} width={34} /><YAxis yAxisId="cabecas" orientation="right" allowDecimals={false} tickLine={false} axisLine={false} width={42} /><Tooltip content={<ChartTooltipContent formatter={(value, name) => `${formatNumber(value, 0)} ${name === "total_abates" ? "abates" : "cabeças"}`} />} /><Line yAxisId="abates" type="monotone" dataKey="total_abates" stroke={orange} strokeWidth={3} dot={{ r: 3 }} /><Line yAxisId="cabecas" type="monotone" dataKey="total_cabecas" stroke={blue} strokeWidth={3} dot={{ r: 3 }} /></LineChart></ChartContainer> : <EmptyChart message="Não há movimentação diária para os filtros escolhidos." />}
      </ChartCard>
      <ChartCard title="Cabeças por fazenda" description="Compare o volume total de animais abatidos entre as fazendas.">
        {dashboard.por_fazenda.length ? <ChartContainer className="h-80" config={{ total_cabecas: { label: "Cabeças", color: green } }}><BarChart data={dashboard.por_fazenda} layout="vertical" margin={{ left: 12, right: 12, top: 8, bottom: 4 }}><CartesianGrid horizontal={false} strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} /><YAxis type="category" dataKey="nome_fazenda" width={110} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><Tooltip content={<ChartTooltipContent formatter={(value, name) => `${formatNumber(value, 0)} ${name === "total_cabecas" ? "cabeças" : "abates"}`} />} /><Bar dataKey="total_cabecas" fill={green} radius={[0, 6, 6, 0]} /></BarChart></ChartContainer> : <EmptyChart message="Não há fazendas com abates para os filtros escolhidos." />}
      </ChartCard>
      <ChartCard title="Categorias de animal" description="Entenda quais categorias concentram os animais abatidos.">
        {dashboard.por_categoria_animal.length ? <ChartContainer className="h-80" config={{ total_cabecas: { label: "Cabeças", color: orange } }}><BarChart data={dashboard.por_categoria_animal} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}><CartesianGrid vertical={false} strokeDasharray="3 3" /><XAxis dataKey="categoria_animal" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} width={42} /><Tooltip content={<ChartTooltipContent formatter={(value, name) => `${formatNumber(value, 0)} ${name === "total_cabecas" ? "cabeças" : "abates"}`} />} /><Bar dataKey="total_cabecas" fill={orange} radius={[6, 6, 0, 0]} /></BarChart></ChartContainer> : <EmptyChart message="Não há categorias registradas para os filtros escolhidos." />}
      </ChartCard>
      <ChartCard title="Abates por fazenda" description="Quantidade de lotes registrados em cada fazenda.">
        {dashboard.por_fazenda.length ? <ChartContainer className="h-80" config={{ total_abates: { label: "Abates", color: blue } }}><BarChart data={dashboard.por_fazenda} layout="vertical" margin={{ left: 12, right: 12, top: 8, bottom: 4 }}><CartesianGrid horizontal={false} strokeDasharray="3 3" /><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} /><YAxis type="category" dataKey="nome_fazenda" width={110} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} /><Tooltip content={<ChartTooltipContent formatter={(value) => `${formatNumber(value, 0)} abates`} />} /><Bar dataKey="total_abates" fill={blue} radius={[0, 6, 6, 0]} /></BarChart></ChartContainer> : <EmptyChart message="Não há abates para os filtros escolhidos." />}
      </ChartCard>
    </div>
  </>;
}

function MetricCard({ icon, label, value, help }: { icon: React.ReactNode; label: string; value: string; help: string }) { return <Card><CardContent className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600">{icon}</span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-1 text-2xl font-bold text-zinc-950">{value}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{help}</p></div></CardContent></Card>; }
function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{children}</CardContent></Card>; }
function EmptyChart({ message }: { message: string }) { return <div className="grid h-80 place-items-center rounded-xl bg-zinc-50 px-6 text-center text-sm text-zinc-500">{message}</div>; }
function DashboardLoading() { return <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)}</div><div className="grid gap-5 xl:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-96 rounded-2xl" />)}</div></>; }
