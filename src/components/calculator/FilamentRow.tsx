"use client";

import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useCurrency } from "@/contexts/CurrencyContext";
import { calcFilamentLineCost } from "@/lib/calculations";
import type { CalculatorFilamentLine, FilamentData } from "@/lib/types";

interface Props {
  line: CalculatorFilamentLine;
  filaments: FilamentData[];
  onUpdate: (field: keyof CalculatorFilamentLine, value: string | number | null) => void;
  onRemove: () => void;
  showRemove: boolean;
}

export function FilamentRow({ line, filaments, onUpdate, onRemove, showRemove }: Props) {
  const { fmt } = useCurrency();
  const selectedFilament = line.filamentId ? filaments.find((f) => f.id === line.filamentId) : null;
  const cost = selectedFilament && line.grams > 0
    ? calcFilamentLineCost(line.grams, selectedFilament.spoolSizeG, selectedFilament.costPerSpool, selectedFilament.wasteFactor)
    : 0;

  return (
    <div className="grid grid-cols-12 gap-2 items-end">
      <div className="col-span-3">
        <Input
          label={line.label ? "" : "Name"}
          placeholder="e.g., Body, Support"
          value={line.label}
          onChange={(e) => onUpdate("label", e.target.value)}
        />
      </div>
      <div className="col-span-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
            Filament
          </label>
          <div className="flex items-center gap-1.5">
            {selectedFilament && (
              <div
                className="h-4 w-4 flex-shrink-0 rounded-full border border-[#e5e5e5]"
                style={{ backgroundColor: selectedFilament.colorHex }}
              />
            )}
            <select
              value={line.filamentId?.toString() ?? ""}
              onChange={(e) => onUpdate("filamentId", e.target.value ? parseInt(e.target.value) : null)}
              className="h-9 w-full rounded-md border border-[#e5e5e5] bg-white px-2 text-sm text-[#1a1a1a] focus:border-[#e05a2b] focus:outline-none focus:ring-2 focus:ring-[#e05a2b]/20"
            >
              <option value="">Search filament...</option>
              {filaments.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.brand} {f.material} - {f.colorName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="col-span-2">
        <Input
          label="Grams"
          type="number"
          min="0"
          step="1"
          placeholder="0"
          value={line.grams}
          onChange={(e) => onUpdate("grams", Math.max(0, parseFloat(e.target.value) || 0))}
        />
      </div>
      <div className="col-span-1">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">Total</label>
          <div className="flex h-9 items-center text-sm font-medium text-[#1a1a1a]">
            {fmt(cost)}
          </div>
        </div>
      </div>
      <div className="col-span-1 flex justify-end">
        {showRemove && (
          <button
            onClick={onRemove}
            className="flex h-9 w-9 items-center justify-center rounded text-[#9ca3af] hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
