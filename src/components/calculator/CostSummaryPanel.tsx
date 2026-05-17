"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { COGSBreakdown } from "@/lib/types";

interface Props {
  cogs: COGSBreakdown;
}

export function CostSummaryPanel({ cogs }: Props) {
  const { fmt } = useCurrency();
  const items = [
    { label: "Filament", value: cogs.filamentCost, color: "#e05a2b" },
    { label: "Printer", value: cogs.printerCost, color: "#3b82f6" },
    { label: "Labor", value: cogs.laborCost, color: "#22c55e" },
    { label: "Supplies", value: cogs.suppliesCost, color: "#f59e0b" },
  ];

  const total = cogs.total;
  const chartData = items.map((item) => ({
    ...item,
    pct: total > 0 ? (item.value / total) * 100 : 0,
  }));

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
          Cost Summary
        </h3>
        <span className="text-sm font-bold text-[#1a1a1a]">
          {fmt(total)} / unit
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
              {item.label}
            </span>
            <span className="text-base font-bold" style={{ color: item.color }}>
              {fmt(item.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-[#e5e5e5] bg-[#f8f8f8] p-3">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#1a1a1a]">
          <span>Total COGS</span>
          <span className="text-[#e05a2b]">{fmt(total)}</span>
        </div>
        {total > 0 && (
          <>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#e5e5e5]">
              {(() => {
                let left = 0;
                return chartData.map((item) => {
                  const segment = (
                    <div
                      key={item.label}
                      className="absolute h-full transition-all"
                      style={{
                        left: `${left}%`,
                        width: `${item.pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  );
                  left += item.pct;
                  return segment;
                });
              })()}
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              {chartData.map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-[#6b7280]">
                    {item.label} {item.pct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
