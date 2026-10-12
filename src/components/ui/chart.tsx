"use client";

import * as React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<string, { label: string; color?: string }>;

const ChartContext = React.createContext<ChartConfig>({});

export function ChartContainer({ config, className, children }: { config: ChartConfig; className?: string; children: React.ComponentProps<typeof ResponsiveContainer>["children"] }) {
  return (
    <ChartContext.Provider value={config}>
      <div className={cn("h-full w-full min-w-0", className)} data-chart="chart">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip(props: React.ComponentProps<typeof Tooltip>) {
  return <Tooltip {...props} />;
}

type ChartTooltipEntry = { name?: string | number; dataKey?: string | number; value?: string | number; color?: string };
type ChartTooltipContentProps = { active?: boolean; payload?: ChartTooltipEntry[]; label?: React.ReactNode; formatter?: (value: number, name: string) => React.ReactNode };

export function ChartTooltipContent({ active, payload, label, formatter }: ChartTooltipContentProps) {
  const config = React.useContext(ChartContext);
  if (!active || !payload?.length) return null;

  return (
    <div className="grid min-w-36 gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs shadow-xl">
      {label ? <p className="font-semibold text-zinc-950">{label}</p> : null}
      {payload.map((entry) => {
        const name = String(entry.name ?? entry.dataKey ?? "Valor");
        const value = Number(entry.value ?? 0);
        return (
          <div key={name} className="flex items-center justify-between gap-4 text-zinc-600">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ backgroundColor: entry.color ?? "#f97316" }} />{config[name]?.label ?? name}</span>
            <span className="font-semibold text-zinc-900">{formatter ? formatter(value, name) : value}</span>
          </div>
        );
      })}
    </div>
  );
}
