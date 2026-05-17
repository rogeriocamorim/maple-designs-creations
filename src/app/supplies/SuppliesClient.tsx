"use client";

import { useState, useRef } from "react";
import { Plus, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SupplyCard } from "@/components/supplies/SupplyCard";
import { SupplyForm, type SupplyFormHandle } from "@/components/supplies/SupplyForm";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { SupplyData } from "@/lib/types";

interface Props {
  supplies: SupplyData[];
}

function inventoryValue(list: SupplyData[]) {
  return list.reduce((sum, s) => sum + s.unitCost * s.currentStock, 0);
}

export function SuppliesClient({ supplies }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const addFormRef = useRef<SupplyFormHandle>(null);
  const [filter, setFilter] = useState("");
  const { fmt } = useCurrency();

  const filtered = supplies.filter((s) =>
    s.name.toLowerCase().includes(filter.toLowerCase())
  );

  const globalValue = inventoryValue(supplies);
  const filteredValue = inventoryValue(filtered);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Supplies</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">
            {supplies.length} supply item{supplies.length !== 1 ? "s" : ""} · Total Inventory: {fmt(globalValue)}
          </p>
          {filter && filtered.length !== supplies.length && (
            <p className="mt-0.5 text-xs text-[#9ca3af]">
              Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""} · {fmt(filteredValue)} value
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search supplies..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 rounded-md border border-[#e5e5e5] bg-white px-3 text-sm placeholder:text-[#9ca3af] focus:border-[#e05a2b] focus:outline-none focus:ring-2 focus:ring-[#e05a2b]/20"
          />
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Supply
          </Button>
        </div>
      </div>

      {supplies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e5e5] bg-white py-16 text-center">
          <PackageOpen className="mb-3 h-10 w-10 text-[#e5e5e5]" />
          <p className="text-sm font-medium text-[#6b7280]">No supplies yet</p>
          <p className="mt-1 text-xs text-[#9ca3af]">
            Add supplies like boxes, screws, and magnets to quickly include them in quotes
          </p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Supply
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((supply) => (
            <SupplyCard key={supply.id} supply={supply} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-[#6b7280]">
              No supplies match &ldquo;{filter}&rdquo;
            </p>
          )}
        </div>
      )}

      <Dialog
        open={addOpen}
        onOpenChange={(open) => { if (!open) setAddSaving(false); setAddOpen(open); }}
        title="Add Supply"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => addFormRef.current?.submit()} disabled={addSaving}>
              {addSaving ? "Saving..." : "Add Supply"}
            </Button>
          </>
        }
      >
        <SupplyForm
          ref={addFormRef}
          onClose={() => setAddOpen(false)}
          onSavingChange={setAddSaving}
        />
      </Dialog>
    </div>
  );
}
