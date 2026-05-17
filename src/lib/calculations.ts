import type { MarketplaceData, COGSBreakdown, MarketplaceResult } from "./types";

export interface PrinterCostParams {
  powerWatts: number;
  maintenanceCostPerHr: number;
  purchasePrice: number;
  lifespanHours: number;
}

export function calcFilamentLineCost(
  grams: number,
  spoolSizeG: number,
  costPerSpool: number,
  wasteFactor: number
): number {
  if (grams <= 0 || spoolSizeG <= 0) return 0;
  const baseCost = (grams / spoolSizeG) * costPerSpool;
  return baseCost * (1 + wasteFactor / 100);
}

export function calcPrinterHourlyCost(
  params: PrinterCostParams,
  electricityRatePerKwh: number
): { electricity: number; maintenance: number; depreciation: number; total: number } {
  const electricity = (params.powerWatts / 1000) * electricityRatePerKwh;
  const depreciation = params.lifespanHours > 0 ? params.purchasePrice / params.lifespanHours : 0;
  const total = electricity + params.maintenanceCostPerHr + depreciation;
  return { electricity, maintenance: params.maintenanceCostPerHr, depreciation, total };
}

export function calcPrinterCost(
  params: PrinterCostParams,
  electricityRatePerKwh: number,
  printTimeHours: number
): number {
  const { total } = calcPrinterHourlyCost(params, electricityRatePerKwh);
  return total * printTimeHours;
}

export function calcLaborCost(laborTimeMinutes: number, laborCostPerHr: number): number {
  return (laborTimeMinutes / 60) * laborCostPerHr;
}

export function calcCOGS(
  filamentCost: number,
  printerCost: number,
  laborCost: number,
  suppliesCost: number
): COGSBreakdown {
  const total = filamentCost + printerCost + laborCost + suppliesCost;
  return { filamentCost, printerCost, laborCost, suppliesCost, total };
}

export function calcEtsyFees(
  listingPrice: number,
  listingFee: number,
  transactionFeePct: number,
  paymentProcessingPct: number,
  paymentProcessingFixed: number
): number {
  const transaction = listingPrice * (transactionFeePct / 100);
  const payProc = listingPrice * (paymentProcessingPct / 100) + paymentProcessingFixed;
  return listingFee + transaction + payProc;
}

export function calcGenericFees(listingPrice: number, referralFeePct: number): number {
  return listingPrice * (referralFeePct / 100);
}

export function calcMarketplaceFees(listingPrice: number, marketplace: MarketplaceData): number {
  let fees = 0;
  if (marketplace.listingFee != null) {
    fees += marketplace.listingFee;
  }
  if (marketplace.transactionFeePct != null) {
    fees += listingPrice * (marketplace.transactionFeePct / 100);
  }
  if (marketplace.paymentProcessingPct != null || marketplace.paymentProcessingFixed != null) {
    fees += listingPrice * ((marketplace.paymentProcessingPct ?? 0) / 100) + (marketplace.paymentProcessingFixed ?? 0);
  }
  if (marketplace.referralFeePct != null) {
    fees += listingPrice * (marketplace.referralFeePct / 100);
  }
  return fees;
}

export function calcNetProfit(
  listingPrice: number,
  discountPct: number,
  cogs: number,
  platformFees: number
): number {
  const effectivePrice = listingPrice * (1 - discountPct / 100);
  return effectivePrice - cogs - platformFees;
}

export function calcGrossMarginPct(listingPrice: number, cogs: number): number {
  if (listingPrice <= 0) return 0;
  return ((listingPrice - cogs) / listingPrice) * 100;
}

export function calcNetMarginPct(netProfit: number, listingPrice: number): number {
  if (listingPrice <= 0) return 0;
  return (netProfit / listingPrice) * 100;
}

export function calcProfitPerHour(netProfit: number, printTimeHours: number): number {
  if (printTimeHours <= 0) return 0;
  return netProfit / printTimeHours;
}

export function calcSuggestedPrice(
  cogs: number,
  marketplace: MarketplaceData,
  targetNetMarginPct: number
): number {
  const target = targetNetMarginPct / 100;

  // Sum all fixed fees from enabled fee types
  let fixedFees = 0;
  if (marketplace.listingFee != null) {
    fixedFees += marketplace.listingFee;
  }
  if (marketplace.paymentProcessingFixed != null) {
    fixedFees += marketplace.paymentProcessingFixed;
  }

  // Sum all variable rate fees from enabled fee types
  let variableRate = 0;
  if (marketplace.transactionFeePct != null) {
    variableRate += marketplace.transactionFeePct / 100;
  }
  if (marketplace.paymentProcessingPct != null) {
    variableRate += marketplace.paymentProcessingPct / 100;
  }
  if (marketplace.referralFeePct != null) {
    variableRate += marketplace.referralFeePct / 100;
  }

  const denominator = 1 - variableRate - target;
  if (denominator <= 0) return cogs * 3;
  return (cogs + fixedFees) / denominator;
}

export function calcMarketplaceResult(
  listingPrice: number,
  discountPct: number,
  cogs: COGSBreakdown,
  marketplace: MarketplaceData,
  printTimeHours: number
): MarketplaceResult {
  const fees = calcMarketplaceFees(listingPrice, marketplace);
  const netProfit = calcNetProfit(listingPrice, discountPct, cogs.total, fees);
  return {
    marketplaceId: marketplace.id,
    marketplaceName: marketplace.name,
    listingPrice,
    discountPct,
    buyerPays: listingPrice * (1 - discountPct / 100),
    platformFees: fees,
    netProfit,
    profitPerHour: calcProfitPerHour(netProfit, printTimeHours),
    grossMarginPct: calcGrossMarginPct(listingPrice, cogs.total),
    netMarginPct: calcNetMarginPct(netProfit, listingPrice),
  };
}
