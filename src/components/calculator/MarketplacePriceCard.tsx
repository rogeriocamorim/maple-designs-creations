"use client";

import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/Slider";
import { Badge } from "@/components/ui/Badge";
import { formatPercent } from "@/utils/formatters";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { MarketplaceData, MarketplaceResult, MarketplacePricingState } from "@/lib/types";

interface Props {
  marketplace: MarketplaceData;
  result: MarketplaceResult;
  suggestedPrice: number;
  pricing: MarketplacePricingState;
  onModeChange: (mode: "suggested" | "manual") => void;
  onManualPriceChange: (price: number) => void;
  onDiscountChange: (pct: number) => void;
}

const SLIDER_MAX = 500;

/** Small inline numeric input that allows intermediate values like "0.", "0.2" */
function InlineNumericInput({
  value,
  onChange,
  className,
  ...props
}: {
  value: number;
  onChange: (n: number) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  const [local, setLocal] = useState(value ? String(value) : "");
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setLocal(value ? String(value) : "");
    }
  }, [value]);

  return (
    <input
      type="number"
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        const n = parseFloat(e.target.value);
        if (!isNaN(n)) onChange(n);
        else if (e.target.value === "") onChange(0);
      }}
      onFocus={() => { focused.current = true; }}
      onBlur={() => {
        focused.current = false;
        setLocal(value ? String(value) : "");
      }}
      className={className}
      {...props}
    />
  );
}

export function MarketplacePriceCard({
  marketplace,
  result,
  suggestedPrice,
  pricing,
  onModeChange,
  onManualPriceChange,
  onDiscountChange,
}: Props) {
  const { fmt, symbol } = useCurrency();
  const isPositive = result.netProfit >= 0;

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#e5e5e5] px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked
            readOnly
            className="h-4 w-4 rounded border-[#e05a2b] accent-[#e05a2b]"
          />
          <span className="font-semibold text-[#1a1a1a]">{marketplace.name}</span>
          <span className="h-2 w-2 rounded-full bg-[#e05a2b]" />
        </div>
      </div>

      {/* Pricing mode cards */}
      <div className="grid grid-cols-2 gap-2 p-3">
        {(["suggested", "manual"] as const).map((mode) => {
          const modePrice = mode === "suggested" ? suggestedPrice : pricing.manualPrice;
          const modeLabel = mode === "suggested" ? "Suggested" : "Manual Override";
          const isActive = pricing.mode === mode;

          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`rounded-lg border-2 p-3 text-left transition-colors ${
                isActive
                  ? "border-[#e05a2b] bg-[#fff0ec]"
                  : "border-[#e5e5e5] bg-white hover:border-[#e05a2b]/40"
              }`}
            >
              <div
                className={`mb-1 text-[10px] font-semibold uppercase tracking-wide ${
                  isActive ? "text-[#e05a2b]" : "text-[#6b7280]"
                }`}
              >
                {modeLabel}
              </div>
              <div className={`text-lg font-bold ${isActive ? "text-[#1a1a1a]" : "text-[#6b7280]"}`}>
                {fmt(modePrice)}
              </div>
              {mode === "suggested" && (
                <div className="text-[10px] text-[#6b7280]">
                  {formatPercent(result.grossMarginPct, 0)} gross ·{" "}
                  {formatPercent(Math.abs(result.netMarginPct), 0)} net
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Manual override slider */}
      {pricing.mode === "manual" && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3">
            <Slider
              value={pricing.manualPrice}
              onValueChange={onManualPriceChange}
              min={0}
              max={SLIDER_MAX}
              step={0.01}
              className="flex-1"
            />
            <InlineNumericInput
              min={0}
              step={0.01}
              value={pricing.manualPrice}
              onChange={(n) => onManualPriceChange(Math.max(0, n))}
              className="w-20 rounded border border-[#e5e5e5] px-2 py-1 text-right text-sm focus:border-[#e05a2b] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="border-t border-[#e5e5e5] bg-[#f8f8f8] px-4 py-3">
        <div className="grid grid-cols-3 gap-3 text-xs mb-3">
          <div>
            <div className="text-[#6b7280] uppercase tracking-wide font-medium">Listing Price</div>
            <div className="font-semibold text-[#1a1a1a]">{fmt(result.listingPrice)}</div>
            <div className="text-[#9ca3af]">
              {pricing.mode === "suggested" ? "Suggested" : "Manual"}
            </div>
          </div>
          <div>
            <div className="text-[#6b7280] uppercase tracking-wide font-medium">Discount</div>
            <div className="flex items-center gap-1">
              <InlineNumericInput
                min={0}
                max={100}
                value={pricing.discountPct}
                onChange={(n) => onDiscountChange(Math.min(100, Math.max(0, n)))}
                className="w-12 rounded border border-[#e5e5e5] px-1.5 py-0.5 text-xs focus:border-[#e05a2b] focus:outline-none"
              />
              <span className="text-[#6b7280]">%</span>
            </div>
          </div>
          <div>
            <div className="text-[#6b7280] uppercase tracking-wide font-medium">Buyer Pays</div>
            <div className="font-semibold text-[#1a1a1a]">{fmt(result.buyerPays)}</div>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div>
            <div className="text-[#6b7280] uppercase tracking-wide font-medium">COGS</div>
            <div className="font-semibold text-[#1a1a1a]">{fmt(result.platformFees + result.netProfit > 0 ? result.buyerPays - result.netProfit - result.platformFees : 0)}</div>
          </div>
          <div>
            <div className="text-[#6b7280] uppercase tracking-wide font-medium">Plat. Fees</div>
            <div className="font-semibold text-red-600">{fmt(result.platformFees)}</div>
          </div>
          <div>
            <div className="text-[#6b7280] uppercase tracking-wide font-medium">Net Profit</div>
            <div className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {fmt(result.netProfit)}
            </div>
          </div>
          <div>
            <div className="text-[#6b7280] uppercase tracking-wide font-medium">Profit/Hr</div>
            <div className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {fmt(result.profitPerHour)}
            </div>
          </div>
          <div>
            <div className="text-[#6b7280] uppercase tracking-wide font-medium">Gross/Net</div>
            <div className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {formatPercent(result.grossMarginPct, 0)}/{formatPercent(result.netMarginPct, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
