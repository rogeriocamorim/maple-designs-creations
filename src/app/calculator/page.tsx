import { getPrinters } from "@/actions/printers";
import { getFilaments } from "@/actions/filaments";
import { getMarketplaces } from "@/actions/marketplaces";
import { getSupplies } from "@/actions/supplies";
import { getSettings } from "@/actions/settings";
import { getQuoteSnapshot } from "@/actions/quotes";
import { CalculatorClient } from "@/components/calculator/CalculatorClient";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ quoteId?: string }>;
}

export default async function CalculatorPage({ searchParams }: Props) {
  const params = await searchParams;
  const [printers, filaments, marketplaces, supplies, settings] = await Promise.all([
    getPrinters(),
    getFilaments(),
    getMarketplaces(),
    getSupplies(),
    getSettings(),
  ]);

  const quoteId = params.quoteId ? parseInt(params.quoteId, 10) : undefined;

  const initialState = quoteId
    ? await getQuoteSnapshot(quoteId)
    : null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1a1a1a]">Calculator</h1>
      </div>
      <CalculatorClient
        printers={printers}
        filaments={filaments}
        marketplaces={marketplaces}
        supplies={supplies}
        settings={settings}
        initialState={initialState ?? undefined}
        editingQuoteId={quoteId}
      />
    </div>
  );
}
