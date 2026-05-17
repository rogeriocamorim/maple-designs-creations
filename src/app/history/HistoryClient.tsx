"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Trash2, ArrowUpRight, History, Calculator } from "lucide-react";
import { deleteQuote } from "@/actions/quotes";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatPercent } from "@/utils/formatters";
import { useCurrency } from "@/contexts/CurrencyContext";

interface QuoteResult {
  id: number;
  marketplaceName: string;
  listingPrice: number;
  discountPct: number;
  buyerPays: number;
  platformFees: number;
  netProfit: number;
  profitPerHour: number;
  grossMarginPct: number;
  netMarginPct: number;
}

interface Quote {
  id: number;
  modelName: string;
  savedAt: Date;
  filamentCost: number;
  printerCost: number;
  laborCost: number;
  suppliesCost: number;
  totalCogs: number;
  stateSnapshot: unknown;
  results: QuoteResult[];
}

interface Props {
  quotes: Quote[];
}

function QuoteCard({ quote }: { quote: Quote }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { fmt } = useCurrency();
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete quote for "${quote.modelName}"?`)) return;
    setDeleting(true);
    await deleteQuote(quote.id);
  }

  function handleLoadInCalculator() {
    router.push(`/calculator?quoteId=${quote.id}`);
  }

  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
      <div
        className="flex items-start justify-between p-4 cursor-pointer hover:bg-[#fafafa] transition-colors"
        onClick={handleLoadInCalculator}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-[#1a1a1a]">{quote.modelName}</h3>
            <span className="text-xs text-[#6b7280]">{formatDate(quote.savedAt)}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <span className="text-xs text-[#6b7280]">
              COGS: <strong className="text-[#e05a2b]">{fmt(quote.totalCogs)}</strong>
            </span>
            {quote.results.map((r) => (
              <Badge key={r.id} variant={r.netProfit >= 0 ? "success" : "danger"}>
                {r.marketplaceName}: {fmt(r.listingPrice)}
              </Badge>
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-[#e05a2b]">
            <Calculator className="h-3 w-3" />
            <span>Click to load in Calculator</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#e5e5e5] bg-[#f8f8f8] p-4">
          {/* COGS breakdown */}
          <div className="mb-4 grid grid-cols-4 gap-3 rounded-lg border border-[#e5e5e5] bg-white p-3 text-xs">
            <div>
              <div className="text-[#6b7280] uppercase tracking-wide font-medium">Filament</div>
              <div className="font-semibold text-[#1a1a1a]">{fmt(quote.filamentCost)}</div>
            </div>
            <div>
              <div className="text-[#6b7280] uppercase tracking-wide font-medium">Printer</div>
              <div className="font-semibold text-[#1a1a1a]">{fmt(quote.printerCost)}</div>
            </div>
            <div>
              <div className="text-[#6b7280] uppercase tracking-wide font-medium">Labor</div>
              <div className="font-semibold text-[#1a1a1a]">{fmt(quote.laborCost)}</div>
            </div>
            <div>
              <div className="text-[#6b7280] uppercase tracking-wide font-medium">Total COGS</div>
              <div className="font-bold text-[#e05a2b]">{fmt(quote.totalCogs)}</div>
            </div>
          </div>

          {/* Marketplace results */}
          <div className="space-y-3">
            {quote.results.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-[#e5e5e5] bg-white p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1a1a1a]">{r.marketplaceName}</span>
                  <Badge variant={r.netProfit >= 0 ? "success" : "danger"}>
                    {r.netProfit >= 0 ? "Profitable" : "Loss"}
                  </Badge>
                </div>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div>
                    <div className="text-[#6b7280]">Listing Price</div>
                    <div className="font-semibold">{fmt(r.listingPrice)}</div>
                  </div>
                  <div>
                    <div className="text-[#6b7280]">Platform Fees</div>
                    <div className="font-semibold text-red-600">{fmt(r.platformFees)}</div>
                  </div>
                  <div>
                    <div className="text-[#6b7280]">Net Profit</div>
                    <div className={`font-semibold ${r.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {fmt(r.netProfit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#6b7280]">Profit/Hr</div>
                    <div className={`font-semibold ${r.profitPerHour >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {fmt(r.profitPerHour)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#6b7280]">Net Margin</div>
                    <div className={`font-semibold ${r.netMarginPct >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatPercent(r.netMarginPct)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function HistoryClient({ quotes }: Props) {
  const [search, setSearch] = useState("");

  const filtered = quotes.filter((q) =>
    q.modelName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Quote History</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">{quotes.length} saved quote{quotes.length !== 1 ? "s" : ""}</p>
        </div>
        <input
          type="text"
          placeholder="Search by model name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 rounded-md border border-[#e5e5e5] bg-white px-3 text-sm placeholder:text-[#9ca3af] focus:border-[#e05a2b] focus:outline-none focus:ring-2 focus:ring-[#e05a2b]/20"
        />
      </div>

      {quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e5e5] bg-white py-16 text-center">
          <History className="mb-3 h-10 w-10 text-[#e5e5e5]" />
          <p className="text-sm font-medium text-[#6b7280]">No quotes saved yet</p>
          <p className="mt-1 text-xs text-[#9ca3af]">
            Use &ldquo;Save to Model&rdquo; in the Calculator to store pricing snapshots
          </p>
          <a
            href="/calculator"
            className="mt-4 flex items-center gap-1 text-sm text-[#e05a2b] hover:underline"
          >
            Go to Calculator
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-[#6b7280]">
              No quotes match &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
