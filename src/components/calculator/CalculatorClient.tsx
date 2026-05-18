"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Plus, RotateCcw, Save, Settings, X } from "lucide-react";
import { saveQuote } from "@/actions/quotes";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PartRow } from "./PartRow";
import { MarketplacePriceCard } from "./MarketplacePriceCard";
import { CostSummaryPanel } from "./CostSummaryPanel";
import { useCalculator } from "@/hooks/useCalculator";
import { formatTime } from "@/utils/formatters";
import { useCurrency } from "@/contexts/CurrencyContext";
import type {
  PrinterData,
  FilamentData,
  MarketplaceData,
  SettingsData,
  SupplyData,
  CalculatorState,
  CalculatorFilamentLine,
} from "@/lib/types";

interface Props {
  printers: PrinterData[];
  filaments: FilamentData[];
  marketplaces: MarketplaceData[];
  supplies: SupplyData[];
  settings: SettingsData;
  initialState?: CalculatorState;
  editingQuoteId?: number;
}

export function CalculatorClient({ printers, filaments, marketplaces, supplies, settings, initialState, editingQuoteId }: Props) {
  const { state, dispatch, selectedPrinter, cogs, marketplaceResults, suggestedPrices, totalFilamentCost, printerCost, laborCost, suppliesCost } =
    useCalculator(printers, filaments, marketplaces, settings, supplies);
  const { fmt, symbol } = useCurrency();
  const router = useRouter();

  // Load initial state from saved quote
  useEffect(() => {
    if (initialState) {
      dispatch({ type: "LOAD_STATE", state: initialState });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize marketplace pricing when cogs change
  useEffect(() => {
    for (const mp of marketplaces) {
      dispatch({
        type: "INIT_MARKETPLACE",
        marketplaceId: mp.id,
        suggestedPrice: suggestedPrices[mp.id] ?? 0,
      });
    }
  }, [marketplaces]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cmd+S to save
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, cogs, marketplaceResults]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    if (!state.modelName.trim()) {
      alert("Please enter a model name before saving.");
      return;
    }
    await saveQuote({
      id: editingQuoteId,
      modelName: state.modelName.trim(),
      cogs,
      stateSnapshot: state,
      marketplaceResults,
    });
    router.push("/quotes");
  }

  const printerOptions = printers.map((p) => ({
    value: p.id.toString(),
    label: `${p.brand} - ${p.modelName} (${p.name})`,
  }));

  const printTimeHours = state.printTimeHours + state.printTimeMinutes / 60;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_560px]">
      {/* LEFT PANEL */}
      <div className="space-y-4">
        {/* Model Information */}
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Model Information
          </h2>
          <div className="space-y-3">
            <Input
              label="Model Name *"
              placeholder="Model Name"
              value={state.modelName}
              onChange={(e) => dispatch({ type: "SET_MODEL_NAME", value: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Input
                  label="Models Per Plate"
                  type="number"
                  min="1"
                  value={state.modelsPerPlate || ""}
                  onChange={(e) =>
                    dispatch({ type: "SET_MODELS_PER_PLATE", value: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                />
              </div>
              <div>
                <Input
                  label="Print Time — Hours"
                  type="number"
                  min="0"
                  value={state.printTimeHours || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_PRINT_TIME",
                      hours: Math.max(0, parseInt(e.target.value) || 0),
                      minutes: state.printTimeMinutes,
                    })
                  }
                  hint="Hours"
                />
              </div>
              <div>
                <Input
                  label="Print Time — Minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={state.printTimeMinutes || ""}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_PRINT_TIME",
                      hours: state.printTimeHours,
                      minutes: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)),
                    })
                  }
                  hint="Minutes"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Printer */}
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Printer Model for Costing
          </h2>
          <Select
            label="Printer Model *"
            placeholder="Select printer..."
            options={printerOptions}
            value={state.selectedPrinterId?.toString() ?? ""}
            onValueChange={(v) =>
              dispatch({ type: "SET_PRINTER", id: v ? parseInt(v) : null })
            }
          />
          {selectedPrinter && (
            <p className="mt-2 text-xs text-[#6b7280]">
              {symbol}{printerCost.toFixed(4)} for {formatTime(state.printTimeHours, state.printTimeMinutes)}
            </p>
          )}
        </div>

        {/* Parts & Filaments */}
        <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              Parts &amp; Filaments
            </h2>
            <span className="text-sm font-semibold text-[#e05a2b]">
              Total: {state.parts.reduce((s, p) => s + p.filaments.reduce((ss, f) => ss + f.grams, 0), 0)}g · {fmt(totalFilamentCost)}
            </span>
          </div>
          <div className="space-y-3">
            {state.parts.map((part) => (
              <PartRow
                key={part.id}
                part={part}
                filaments={filaments}
                onSetName={(name) => dispatch({ type: "SET_PART_NAME", partId: part.id, name })}
                onAddFilament={() => dispatch({ type: "ADD_FILAMENT", partId: part.id })}
                onRemoveFilament={(filamentId) =>
                  dispatch({ type: "REMOVE_FILAMENT", partId: part.id, filamentId })
                }
                onUpdateFilament={(filamentId, field, value) =>
                  dispatch({ type: "SET_FILAMENT_LINE", partId: part.id, filamentId, field, value })
                }
                onRemovePart={() => dispatch({ type: "REMOVE_PART", partId: part.id })}
              />
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="mt-3"
            onClick={() => dispatch({ type: "ADD_PART" })}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Printed Part
          </Button>
        </div>

        {/* Advanced Settings */}
        <div className="rounded-xl border border-[#e5e5e5] bg-white">
          <button
            className="flex w-full items-center justify-between px-4 py-3"
            onClick={() => dispatch({ type: "SET_ADVANCED_OPEN", open: !state.advancedOpen })}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-[#6b7280]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                Advanced Settings
              </span>
            </div>
            {state.advancedOpen ? (
              <ChevronUp className="h-4 w-4 text-[#6b7280]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#6b7280]" />
            )}
          </button>
          {state.advancedOpen && (
            <div className="border-t border-[#e5e5e5] px-4 py-4 space-y-5">
              {/* Labor Costs */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    Labor Costs
                  </h3>
                  <span className="text-xs font-semibold text-[#e05a2b]">
                    Total: {fmt(laborCost)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Time (minutes)"
                    type="number"
                    min="0"
                    value={state.laborTimeMinutes || ""}
                    onChange={(e) =>
                      dispatch({ type: "SET_LABOR_TIME", minutes: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                  />
                  <Input
                    label="Cost Per Hour"
                    type="number"
                    min="0"
                    step="0.01"
                    value={state.laborCostPerHr || ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_LABOR_COST",
                        costPerHr: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    prefix={symbol}
                  />
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                      Total Cost
                    </label>
                    <div className="flex h-9 items-center text-sm font-medium">
                      {fmt(laborCost)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Supplies */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                    Other Model Supplies
                  </h3>
                  <span className="text-xs font-semibold text-[#e05a2b]">
                    Total: {fmt(suppliesCost)}
                  </span>
                </div>
                {state.supplyLines.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {state.supplyLines.map((line) => (
                      <div key={line.id} className="flex items-end gap-2">
                        {supplies.length > 0 ? (
                          <>
                            <div className="flex-1">
                              <Select
                                label="Supply"
                                placeholder="Select supply..."
                                options={[
                                  { value: "__manual__", label: "-- Manual entry --" },
                                  ...supplies.map((s) => ({
                                    value: s.id.toString(),
                                    label: `${s.name} (${fmt(s.unitCost)}/unit)`,
                                  })),
                                ]}
                                value={line.supplyId?.toString() ?? "__manual__"}
                                onValueChange={(v) => {
                                  if (v === "__manual__") {
                                    dispatch({ type: "SET_SUPPLY_LINE", lineId: line.id, field: "supplyId", value: null });
                                  } else {
                                    const s = supplies.find((s) => s.id === parseInt(v));
                                    if (s) dispatch({ type: "SELECT_SUPPLY", lineId: line.id, supply: s });
                                  }
                                }}
                              />
                            </div>
                            {!line.supplyId && (
                              <div className="flex-1">
                                <Input
                                  label="Name"
                                  placeholder="e.g. Box, Magnets"
                                  value={line.name}
                                  onChange={(e) =>
                                    dispatch({ type: "SET_SUPPLY_LINE", lineId: line.id, field: "name", value: e.target.value })
                                  }
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex-1">
                            <Input
                              label="Name"
                              placeholder="e.g. Box, Magnets"
                              value={line.name}
                              onChange={(e) =>
                                dispatch({ type: "SET_SUPPLY_LINE", lineId: line.id, field: "name", value: e.target.value })
                              }
                            />
                          </div>
                        )}
                        <div className="w-16">
                          <Input
                            label="Qty"
                            type="number"
                            min="1"
                            value={line.quantity || ""}
                            onChange={(e) =>
                              dispatch({ type: "SET_SUPPLY_LINE", lineId: line.id, field: "quantity", value: Math.max(1, parseInt(e.target.value) || 1) })
                            }
                          />
                        </div>
                        <div className="w-24">
                          <Input
                            label="Cost"
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitCost || ""}
                            onChange={(e) =>
                              dispatch({ type: "SET_SUPPLY_LINE", lineId: line.id, field: "unitCost", value: Math.max(0, parseFloat(e.target.value) || 0) })
                            }
                            prefix={symbol}
                          />
                        </div>
                        <div className="w-16 text-right">
                          <label className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                            Total
                          </label>
                          <div className="flex h-9 items-center justify-end text-sm font-medium">
                            {fmt(line.quantity * line.unitCost)}
                          </div>
                        </div>
                        <button
                          className="mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-[#6b7280] hover:bg-[#fee2e2] hover:text-red-600"
                          onClick={() => dispatch({ type: "REMOVE_SUPPLY_LINE", lineId: line.id })}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dispatch({ type: "ADD_SUPPLY_LINE" })}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Supply
                </Button>
                {supplies.length === 0 && state.supplyLines.length === 0 && (
                  <p className="mt-2 text-xs text-[#9ca3af]">
                    Tip: Add reusable supplies in the{" "}
                    <a href="/supplies" className="text-[#e05a2b] underline">Supplies</a>{" "}
                    tab to quickly select them here.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons (bottom) */}
        <div className="flex justify-end gap-3 lg:hidden">
          <Button variant="secondary" onClick={() => dispatch({ type: "RESET" })}>
            <RotateCcw className="h-4 w-4" />
            Reset Calculator
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            {editingQuoteId ? "Update Quote" : "Save Quote"}
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="space-y-4">
        {/* Cost Summary */}
        <CostSummaryPanel cogs={cogs} />

        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Marketplaces
          </h2>
          <div className="hidden items-center gap-3 lg:flex">
            <Button size="sm" variant="secondary" onClick={() => dispatch({ type: "RESET" })}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" />
              {editingQuoteId ? "Update Quote" : "Save Quote"}
            </Button>
          </div>
        </div>

        {marketplaces.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#e5e5e5] bg-white py-8 text-center text-sm text-[#6b7280]">
            Add marketplaces in the Marketplaces tab to see pricing here
          </div>
        ) : (
          <>
            {marketplaces.map((mp, i) => {
              const result = marketplaceResults[i];
              const pricing = state.marketplacePricing[mp.id] ?? {
                mode: "suggested" as const,
                manualPrice: suggestedPrices[mp.id] ?? 0,
                discountPct: 0,
              };
              return (
                <MarketplacePriceCard
                  key={mp.id}
                  marketplace={mp}
                  result={result}
                  suggestedPrice={suggestedPrices[mp.id] ?? 0}
                  pricing={pricing}
                  onModeChange={(mode) =>
                    dispatch({ type: "SET_PRICING_MODE", marketplaceId: mp.id, mode })
                  }
                  onManualPriceChange={(price) =>
                    dispatch({ type: "SET_MANUAL_PRICE", marketplaceId: mp.id, price })
                  }
                  onDiscountChange={(discountPct) =>
                    dispatch({ type: "SET_DISCOUNT", marketplaceId: mp.id, discountPct })
                  }
                />
              );
            })}

            {/* Add another marketplace link */}
            <a
              href="/marketplaces"
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#e5e5e5] py-3 text-sm text-[#6b7280] hover:text-[#e05a2b]"
            >
              <Plus className="h-4 w-4" />
              Add another marketplace
            </a>
          </>
        )}
      </div>
    </div>
  );
}
