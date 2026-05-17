"use client";

import { useState, useRef } from "react";
import { Plus, Layers, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FilamentCard } from "@/components/filaments/FilamentCard";
import { FilamentForm, type FilamentFormHandle } from "@/components/filaments/FilamentForm";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { FilamentData } from "@/lib/types";

interface Props {
  filaments: FilamentData[];
}

export function FilamentsClient({ filaments }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const addFormRef = useRef<FilamentFormHandle>(null);
  const [filter, setFilter] = useState("");

  const filtered = filaments.filter(
    (f) =>
      f.brand.toLowerCase().includes(filter.toLowerCase()) ||
      f.material.toLowerCase().includes(filter.toLowerCase()) ||
      f.colorName.toLowerCase().includes(filter.toLowerCase())
  );

  const lowStockCount = filaments.filter((f) => f.currentStockG <= f.lowStockAlertG).length;
  const { fmt } = useCurrency();

  function inventoryValue(list: FilamentData[]) {
    return list.reduce((sum, f) => sum + (f.costPerSpool / f.spoolSizeG) * f.currentStockG, 0);
  }
  function totalWeight(list: FilamentData[]) {
    return list.reduce((sum, f) => sum + f.currentStockG, 0);
  }

  const globalValue = inventoryValue(filaments);
  const globalWeight = totalWeight(filaments);
  const isFiltered = filter.trim() !== "" && filtered.length !== filaments.length;
  const filteredValue = isFiltered ? inventoryValue(filtered) : 0;
  const filteredWeight = isFiltered ? totalWeight(filtered) : 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Filaments</h1>
          {lowStockCount > 0 && (
            <p className="mt-0.5 text-sm text-amber-600">
              {lowStockCount} filament{lowStockCount > 1 ? "s" : ""} low on stock
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search filaments..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 rounded-md border border-[#e5e5e5] bg-white px-3 text-sm placeholder:text-[#9ca3af] focus:border-[#e05a2b] focus:outline-none focus:ring-2 focus:ring-[#e05a2b]/20"
          />
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Filament
          </Button>
        </div>
      </div>

      {filaments.length > 0 && (
        <div className="mb-4 rounded-xl border border-[#e5e5e5] bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-[#e05a2b]" />
            <span className="font-medium text-[#1a1a1a]">
              Total Inventory: {fmt(globalValue)}
            </span>
            <span className="text-[#6b7280]">·</span>
            <span className="text-[#6b7280]">
              {globalWeight.toLocaleString()}g
            </span>
          </div>
          {isFiltered && (
            <div className="mt-1 flex items-center gap-2 pl-6 text-xs text-[#6b7280]">
              <span>
                Showing: {fmt(filteredValue)} · {filteredWeight.toLocaleString()}g
              </span>
            </div>
          )}
        </div>
      )}

      {filaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e5e5] bg-white py-16 text-center">
          <Layers className="mb-3 h-10 w-10 text-[#e5e5e5]" />
          <p className="text-sm font-medium text-[#6b7280]">No filaments yet</p>
          <p className="mt-1 text-xs text-[#9ca3af]">
            Add filaments to use in your cost calculations
          </p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Filament
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((filament) => (
            <FilamentCard key={filament.id} filament={filament} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-[#6b7280]">
              No filaments match &ldquo;{filter}&rdquo;
            </p>
          )}
        </div>
      )}

      <Dialog
        open={addOpen}
        onOpenChange={(open) => { if (!open) setAddSaving(false); setAddOpen(open); }}
        title="Add Filament"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => addFormRef.current?.submit()} disabled={addSaving}>
              {addSaving ? "Saving..." : "Add Filament"}
            </Button>
          </>
        }
      >
        <FilamentForm
          ref={addFormRef}
          onClose={() => setAddOpen(false)}
          onSavingChange={setAddSaving}
        />
      </Dialog>
    </div>
  );
}
