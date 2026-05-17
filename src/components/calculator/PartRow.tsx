"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FilamentRow } from "./FilamentRow";
import { useCurrency } from "@/contexts/CurrencyContext";
import { calcFilamentLineCost } from "@/lib/calculations";
import type { CalculatorPart, CalculatorFilamentLine, FilamentData } from "@/lib/types";

interface Props {
  part: CalculatorPart;
  filaments: FilamentData[];
  onSetName: (name: string) => void;
  onAddFilament: () => void;
  onRemoveFilament: (filamentId: string) => void;
  onUpdateFilament: (
    filamentId: string,
    field: keyof CalculatorFilamentLine,
    value: string | number | null
  ) => void;
  onRemovePart: () => void;
}

export function PartRow({
  part,
  filaments,
  onSetName,
  onAddFilament,
  onRemoveFilament,
  onUpdateFilament,
  onRemovePart,
}: Props) {
  const { fmt } = useCurrency();
  const [expanded, setExpanded] = useState(true);

  const filamentMap = new Map(filaments.map((f) => [f.id, f]));
  const partTotal = part.filaments.reduce((sum, line) => {
    if (line.filamentId && line.grams > 0) {
      const f = filamentMap.get(line.filamentId);
      if (f) {
        sum += calcFilamentLineCost(line.grams, f.spoolSizeG, f.costPerSpool, f.wasteFactor);
      }
    }
    return sum;
  }, 0);

  const filamentCount = part.filaments.filter((f) => f.filamentId).length;
  const totalGrams = part.filaments.reduce((sum, f) => sum + f.grams, 0);

  return (
    <div className="rounded-lg border border-[#e5e5e5] bg-[#f8f8f8]">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[#6b7280] hover:text-[#1a1a1a]"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <Input
          placeholder="Part name"
          value={part.name}
          onChange={(e) => onSetName(e.target.value)}
          className="flex-1 border-0 bg-transparent px-0 focus:ring-0 text-sm font-medium"
        />
        <span className="text-xs text-[#6b7280]">
          {filamentCount} filament{filamentCount !== 1 ? "s" : ""} · {totalGrams}g
        </span>
        <span className="text-sm font-semibold text-[#1a1a1a]">{fmt(partTotal)}</span>
        <button
          onClick={onRemovePart}
          className="text-[#9ca3af] hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="space-y-2 border-t border-[#e5e5e5] bg-white px-4 py-3">
          {part.filaments.map((line) => (
            <FilamentRow
              key={line.id}
              line={line}
              filaments={filaments}
              onUpdate={(field, value) => onUpdateFilament(line.id, field, value)}
              onRemove={() => onRemoveFilament(line.id)}
              showRemove={part.filaments.length > 1}
            />
          ))}
          <Button size="sm" variant="ghost" onClick={onAddFilament} className="mt-1">
            <Plus className="h-3.5 w-3.5" />
            Add Filament
          </Button>
        </div>
      )}
    </div>
  );
}
