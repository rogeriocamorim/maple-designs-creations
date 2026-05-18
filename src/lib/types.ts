export type MarketplaceType = "etsy" | "amazon" | "generic";

export interface SettingsData {
  id: number;
  electricityRatePerKwh: number;
  targetNetMarginPct: number;
  currency: string;
}

export interface PrinterData {
  id: number;
  name: string;
  brand: string;
  modelName: string;
  nozzleSize: number | null;
  nozzleMaterial: string | null;
  buildPlate: string | null;
  powerWatts: number;
  maintenanceCostPerHr: number;
  purchasePrice: number;
  lifespanHours: number;
  dailyUsageHours: number;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilamentData {
  id: number;
  brand: string;
  material: string;
  colorName: string;
  colorHex: string;
  diameter: number;
  spoolSizeG: number;
  costPerSpool: number;
  wasteFactor: number;
  purchaseUrl: string | null;
  lowStockAlertG: number;
  currentStockG: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplyData {
  id: number;
  name: string;
  quantity: number;
  totalPrice: number;
  unitCost: number;
  currentStock: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdSpendEntryData {
  id: string;
  marketplaceId: number;
  startDate: Date;
  endDate: Date;
  totalSpend: number;
  notes: string | null;
  createdAt: Date;
}

export interface MarketplaceData {
  id: number;
  name: string;
  type: string;
  listingFee: number | null;
  transactionFeePct: number | null;
  paymentProcessingPct: number | null;
  paymentProcessingFixed: number | null;
  referralFeePct: number | null;
  adSpendEntries: AdSpendEntryData[];
  createdAt: Date;
  updatedAt: Date;
}

// Calculator state types
export interface CalculatorFilamentLine {
  id: string;
  label: string;
  filamentId: number | null;
  grams: number;
}

export interface CalculatorPart {
  id: string;
  name: string;
  filaments: CalculatorFilamentLine[];
}

export type PricingMode = "suggested" | "manual";

export interface MarketplacePricingState {
  mode: PricingMode;
  manualPrice: number;
  discountPct: number;
}

export interface CalculatorSupplyLine {
  id: string;
  supplyId: number | null;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface CalculatorState {
  modelName: string;
  modelsPerPlate: number;
  printTimeHours: number;
  printTimeMinutes: number;
  selectedPrinterId: number | null;
  parts: CalculatorPart[];
  laborTimeMinutes: number;
  laborCostPerHr: number;
  supplyLines: CalculatorSupplyLine[];
  marketplacePricing: Record<number, MarketplacePricingState>;
  advancedOpen: boolean;
}

// Calculation result types
export interface COGSBreakdown {
  filamentCost: number;
  printerCost: number;
  laborCost: number;
  suppliesCost: number;
  total: number;
}

export interface MarketplaceResult {
  marketplaceId: number;
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

export interface QuoteData {
  id: number;
  modelName: string;
  savedAt: Date;
  filamentCost: number;
  printerCost: number;
  laborCost: number;
  suppliesCost: number;
  totalCogs: number;
  stateSnapshot: CalculatorState;
  results: QuoteResultData[];
}

export interface QuoteResultData {
  id: number;
  quoteId: number;
  marketplaceId: number;
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
