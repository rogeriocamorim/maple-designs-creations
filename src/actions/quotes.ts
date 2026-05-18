"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { CalculatorState, COGSBreakdown, MarketplaceResult } from "@/lib/types";

export async function getQuotes() {
  return prisma.quote.findMany({
    include: { results: { include: { marketplace: true } } },
    orderBy: { savedAt: "desc" },
  });
}

export async function saveQuote(data: {
  id?: number;
  modelName: string;
  cogs: COGSBreakdown;
  stateSnapshot: CalculatorState;
  marketplaceResults: MarketplaceResult[];
}) {
  const resultRows = data.marketplaceResults.map((r) => ({
    marketplaceId: r.marketplaceId,
    marketplaceName: r.marketplaceName,
    listingPrice: r.listingPrice,
    discountPct: r.discountPct,
    buyerPays: r.buyerPays,
    platformFees: r.platformFees,
    netProfit: r.netProfit,
    profitPerHour: r.profitPerHour,
    grossMarginPct: r.grossMarginPct,
    netMarginPct: r.netMarginPct,
  }));

  const fields = {
    modelName: data.modelName,
    filamentCost: data.cogs.filamentCost,
    printerCost: data.cogs.printerCost,
    laborCost: data.cogs.laborCost,
    suppliesCost: data.cogs.suppliesCost,
    totalCogs: data.cogs.total,
    stateSnapshot: data.stateSnapshot as object,
  };

  let quote;
  if (data.id) {
    // Delete old results and replace with new ones
    await prisma.quoteMarketplaceResult.deleteMany({ where: { quoteId: data.id } });
    quote = await prisma.quote.update({
      where: { id: data.id },
      data: {
        ...fields,
        savedAt: new Date(),
        results: { create: resultRows },
      },
      include: { results: true },
    });
  } else {
    quote = await prisma.quote.create({
      data: {
        ...fields,
        results: { create: resultRows },
      },
      include: { results: true },
    });
  }

  revalidatePath("/quotes");
  return quote;
}

export async function deleteQuote(id: number) {
  await prisma.quote.delete({ where: { id } });
  revalidatePath("/quotes");
}

export async function getQuoteSnapshot(id: number): Promise<CalculatorState | null> {
  const quote = await prisma.quote.findUnique({
    where: { id },
    select: { stateSnapshot: true },
  });
  if (!quote) return null;
  return quote.stateSnapshot as unknown as CalculatorState;
}
