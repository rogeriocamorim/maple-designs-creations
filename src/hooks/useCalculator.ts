"use client";

import { useReducer, useMemo } from "react";
import {
  calcFilamentLineCost,
  calcPrinterCost,
  calcLaborCost,
  calcCOGS,
  calcSuggestedPrice,
  calcMarketplaceResult,
} from "@/lib/calculations";
import type {
  CalculatorState,
  CalculatorPart,
  CalculatorFilamentLine,
  CalculatorSupplyLine,
  MarketplacePricingState,
  PricingMode,
  COGSBreakdown,
  MarketplaceResult,
  PrinterData,
  FilamentData,
  MarketplaceData,
  SettingsData,
  SupplyData,
} from "@/lib/types";

const DEFAULT_PART: () => CalculatorPart = () => ({
  id: Math.random().toString(36).slice(2),
  name: "",
  filaments: [
    {
      id: Math.random().toString(36).slice(2),
      label: "",
      filamentId: null,
      grams: 0,
    },
  ],
});

const DEFAULT_FILAMENT_LINE: () => CalculatorFilamentLine = () => ({
  id: Math.random().toString(36).slice(2),
  label: "",
  filamentId: null,
  grams: 0,
});

const DEFAULT_SUPPLY_LINE: () => CalculatorSupplyLine = () => ({
  id: Math.random().toString(36).slice(2),
  supplyId: null,
  name: "",
  quantity: 1,
  unitCost: 0,
});

const INITIAL_STATE: CalculatorState = {
  modelName: "",
  modelsPerPlate: 1,
  printTimeHours: 0,
  printTimeMinutes: 0,
  selectedPrinterId: null,
  parts: [DEFAULT_PART()],
  laborTimeMinutes: 0,
  laborCostPerHr: 15,
  supplyLines: [],
  marketplacePricing: {},
  advancedOpen: false,
};

type Action =
  | { type: "SET_MODEL_NAME"; value: string }
  | { type: "SET_MODELS_PER_PLATE"; value: number }
  | { type: "SET_PRINT_TIME"; hours: number; minutes: number }
  | { type: "SET_PRINTER"; id: number | null }
  | { type: "ADD_PART" }
  | { type: "REMOVE_PART"; partId: string }
  | { type: "SET_PART_NAME"; partId: string; name: string }
  | { type: "ADD_FILAMENT"; partId: string }
  | { type: "REMOVE_FILAMENT"; partId: string; filamentId: string }
  | {
      type: "SET_FILAMENT_LINE";
      partId: string;
      filamentId: string;
      field: keyof CalculatorFilamentLine;
      value: string | number | null;
    }
  | { type: "SET_LABOR_TIME"; minutes: number }
  | { type: "SET_LABOR_COST"; costPerHr: number }
  | { type: "ADD_SUPPLY_LINE" }
  | { type: "REMOVE_SUPPLY_LINE"; lineId: string }
  | { type: "SET_SUPPLY_LINE"; lineId: string; field: keyof CalculatorSupplyLine; value: string | number | null }
  | { type: "SELECT_SUPPLY"; lineId: string; supply: SupplyData }
  | { type: "SET_ADVANCED_OPEN"; open: boolean }
  | { type: "SET_PRICING_MODE"; marketplaceId: number; mode: PricingMode }
  | { type: "SET_MANUAL_PRICE"; marketplaceId: number; price: number }
  | { type: "SET_CALCULATED_PRICE"; marketplaceId: number; price: number }
  | { type: "SET_DISCOUNT"; marketplaceId: number; discountPct: number }
  | { type: "INIT_MARKETPLACE"; marketplaceId: number; suggestedPrice: number }
  | { type: "RESET" }
  | { type: "LOAD_STATE"; state: CalculatorState };

function reducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case "SET_MODEL_NAME":
      return { ...state, modelName: action.value };
    case "SET_MODELS_PER_PLATE":
      return { ...state, modelsPerPlate: action.value };
    case "SET_PRINT_TIME":
      return { ...state, printTimeHours: action.hours, printTimeMinutes: action.minutes };
    case "SET_PRINTER":
      return { ...state, selectedPrinterId: action.id };
    case "ADD_PART":
      return { ...state, parts: [...state.parts, DEFAULT_PART()] };
    case "REMOVE_PART":
      return { ...state, parts: state.parts.filter((p) => p.id !== action.partId) };
    case "SET_PART_NAME":
      return {
        ...state,
        parts: state.parts.map((p) =>
          p.id === action.partId ? { ...p, name: action.name } : p
        ),
      };
    case "ADD_FILAMENT":
      return {
        ...state,
        parts: state.parts.map((p) =>
          p.id === action.partId
            ? { ...p, filaments: [...p.filaments, DEFAULT_FILAMENT_LINE()] }
            : p
        ),
      };
    case "REMOVE_FILAMENT":
      return {
        ...state,
        parts: state.parts.map((p) =>
          p.id === action.partId
            ? {
                ...p,
                filaments: p.filaments.filter((f) => f.id !== action.filamentId),
              }
            : p
        ),
      };
    case "SET_FILAMENT_LINE":
      return {
        ...state,
        parts: state.parts.map((p) =>
          p.id === action.partId
            ? {
                ...p,
                filaments: p.filaments.map((f) =>
                  f.id === action.filamentId ? { ...f, [action.field]: action.value } : f
                ),
              }
            : p
        ),
      };
    case "SET_LABOR_TIME":
      return { ...state, laborTimeMinutes: action.minutes };
    case "SET_LABOR_COST":
      return { ...state, laborCostPerHr: action.costPerHr };
    case "ADD_SUPPLY_LINE":
      return { ...state, supplyLines: [...state.supplyLines, DEFAULT_SUPPLY_LINE()] };
    case "REMOVE_SUPPLY_LINE":
      return { ...state, supplyLines: state.supplyLines.filter((l) => l.id !== action.lineId) };
    case "SET_SUPPLY_LINE":
      return {
        ...state,
        supplyLines: state.supplyLines.map((l) =>
          l.id === action.lineId ? { ...l, [action.field]: action.value } : l
        ),
      };
    case "SELECT_SUPPLY":
      return {
        ...state,
        supplyLines: state.supplyLines.map((l) =>
          l.id === action.lineId
            ? { ...l, supplyId: action.supply.id, name: action.supply.name, unitCost: action.supply.cost }
            : l
        ),
      };
    case "SET_ADVANCED_OPEN":
      return { ...state, advancedOpen: action.open };
    case "SET_PRICING_MODE": {
      const existing = state.marketplacePricing[action.marketplaceId] ?? {
        mode: "suggested",
        manualPrice: 0,
        calculatedPrice: 0,
        discountPct: 0,
      };
      return {
        ...state,
        marketplacePricing: {
          ...state.marketplacePricing,
          [action.marketplaceId]: { ...existing, mode: action.mode },
        },
      };
    }
    case "SET_MANUAL_PRICE": {
      const existing = state.marketplacePricing[action.marketplaceId] ?? {
        mode: "manual",
        manualPrice: 0,
        calculatedPrice: 0,
        discountPct: 0,
      };
      return {
        ...state,
        marketplacePricing: {
          ...state.marketplacePricing,
          [action.marketplaceId]: { ...existing, manualPrice: action.price },
        },
      };
    }
    case "SET_CALCULATED_PRICE": {
      const existing = state.marketplacePricing[action.marketplaceId] ?? {
        mode: "calculated",
        manualPrice: 0,
        calculatedPrice: 0,
        discountPct: 0,
      };
      return {
        ...state,
        marketplacePricing: {
          ...state.marketplacePricing,
          [action.marketplaceId]: { ...existing, calculatedPrice: action.price },
        },
      };
    }
    case "SET_DISCOUNT": {
      const existing = state.marketplacePricing[action.marketplaceId] ?? {
        mode: "suggested",
        manualPrice: 0,
        calculatedPrice: 0,
        discountPct: 0,
      };
      return {
        ...state,
        marketplacePricing: {
          ...state.marketplacePricing,
          [action.marketplaceId]: { ...existing, discountPct: action.discountPct },
        },
      };
    }
    case "INIT_MARKETPLACE": {
      if (state.marketplacePricing[action.marketplaceId]) return state;
      return {
        ...state,
        marketplacePricing: {
          ...state.marketplacePricing,
          [action.marketplaceId]: {
            mode: "suggested",
            manualPrice: Math.max(action.suggestedPrice, 0),
            calculatedPrice: Math.max(action.suggestedPrice, 0),
            discountPct: 0,
          },
        },
      };
    }
    case "RESET":
      return { ...INITIAL_STATE, parts: [DEFAULT_PART()] };
    case "LOAD_STATE": {
      const loaded = action.state;
      // Backward compat: old quotes have suppliesCost instead of supplyLines
      const raw = loaded as unknown as Record<string, unknown>;
      if (!loaded.supplyLines && typeof raw.suppliesCost === "number") {
        const legacyCost = raw.suppliesCost;
        const lines: CalculatorSupplyLine[] = legacyCost > 0
          ? [{ id: Math.random().toString(36).slice(2), supplyId: null, name: "Supplies (legacy)", quantity: 1, unitCost: legacyCost }]
          : [];
        return { ...loaded, supplyLines: lines };
      }
      return loaded;
    }
    default:
      return state;
  }
}

export function useCalculator(
  printers: PrinterData[],
  filaments: FilamentData[],
  marketplaces: MarketplaceData[],
  settings: SettingsData,
  _supplies?: SupplyData[]
) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const filamentMap = useMemo(
    () => new Map(filaments.map((f) => [f.id, f])),
    [filaments]
  );

  const selectedPrinter = useMemo(
    () => (state.selectedPrinterId ? printers.find((p) => p.id === state.selectedPrinterId) : null),
    [printers, state.selectedPrinterId]
  );

  const printTimeHours = useMemo(
    () => state.printTimeHours + state.printTimeMinutes / 60,
    [state.printTimeHours, state.printTimeMinutes]
  );

  const totalFilamentCost = useMemo(() => {
    let total = 0;
    for (const part of state.parts) {
      for (const line of part.filaments) {
        if (line.filamentId && line.grams > 0) {
          const f = filamentMap.get(line.filamentId);
          if (f) {
            total += calcFilamentLineCost(line.grams, f.spoolSizeG, f.costPerSpool, f.wasteFactor);
          }
        }
      }
    }
    return total;
  }, [state.parts, filamentMap]);

  const printerCost = useMemo(() => {
    if (!selectedPrinter) return 0;
    return calcPrinterCost(
      {
        powerWatts: selectedPrinter.powerWatts,
        maintenanceCostPerHr: selectedPrinter.maintenanceCostPerHr,
        purchasePrice: selectedPrinter.purchasePrice,
        lifespanHours: selectedPrinter.lifespanHours,
      },
      settings.electricityRatePerKwh,
      printTimeHours
    );
  }, [selectedPrinter, settings.electricityRatePerKwh, printTimeHours]);

  const laborCost = useMemo(
    () => calcLaborCost(state.laborTimeMinutes, state.laborCostPerHr),
    [state.laborTimeMinutes, state.laborCostPerHr]
  );

  const suppliesCost = useMemo(
    () => state.supplyLines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0),
    [state.supplyLines]
  );

  const cogs: COGSBreakdown = useMemo(
    () => calcCOGS(totalFilamentCost, printerCost, laborCost, suppliesCost),
    [totalFilamentCost, printerCost, laborCost, suppliesCost]
  );

  const marketplaceResults: MarketplaceResult[] = useMemo(() => {
    return marketplaces.map((mp) => {
      const pricing = state.marketplacePricing[mp.id];
      const suggestedPrice = calcSuggestedPrice(cogs.total, mp, settings.targetNetMarginPct);
      let listingPrice: number;
      if (!pricing || pricing.mode === "suggested") {
        listingPrice = suggestedPrice;
      } else if (pricing.mode === "calculated") {
        listingPrice = pricing.calculatedPrice;
      } else {
        listingPrice = pricing.manualPrice;
      }
      const discountPct = pricing?.discountPct ?? 0;
      return calcMarketplaceResult(listingPrice, discountPct, cogs, mp, printTimeHours);
    });
  }, [marketplaces, state.marketplacePricing, cogs, settings.targetNetMarginPct, printTimeHours]);

  const suggestedPrices = useMemo(() => {
    const map: Record<number, number> = {};
    for (const mp of marketplaces) {
      map[mp.id] = calcSuggestedPrice(cogs.total, mp, settings.targetNetMarginPct);
    }
    return map;
  }, [marketplaces, cogs.total, settings.targetNetMarginPct]);

  return {
    state,
    dispatch,
    // derived
    selectedPrinter,
    printTimeHours,
    totalFilamentCost,
    printerCost,
    laborCost,
    suppliesCost,
    cogs,
    marketplaceResults,
    suggestedPrices,
    filamentMap,
  };
}
