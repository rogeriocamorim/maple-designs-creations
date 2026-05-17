"use client";

import { useState, useRef } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { deleteFilament, addFilamentStock } from "@/actions/filaments";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { FilamentForm, type FilamentFormHandle } from "./FilamentForm";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { FilamentData } from "@/lib/types";

interface Props {
  filament: FilamentData;
}

export function FilamentCard({ filament }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const editFormRef = useRef<FilamentFormHandle>(null);
  const [stockOpen, setStockOpen] = useState(false);
  const [stockGrams, setStockGrams] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [addingStock, setAddingStock] = useState(false);

  const costPerGram = filament.costPerSpool / filament.spoolSizeG;
  const inventoryValue = costPerGram * filament.currentStockG;
  const isLowStock = filament.currentStockG <= filament.lowStockAlertG;
  const isOutOfStock = filament.currentStockG <= 0;
  const { fmt } = useCurrency();

  let stockBadge: { variant: "success" | "warning" | "danger"; label: string };
  if (isOutOfStock) {
    stockBadge = { variant: "danger", label: "Out of stock" };
  } else if (isLowStock) {
    stockBadge = { variant: "warning", label: "Low stock" };
  } else {
    stockBadge = { variant: "success", label: "In stock" };
  }

  async function handleDelete() {
    if (!confirm(`Delete "${filament.brand} ${filament.colorName}"?`)) return;
    setDeleting(true);
    await deleteFilament(filament.id);
  }

  async function handleAddStock() {
    const grams = parseFloat(stockGrams);
    if (!grams || grams <= 0) return;
    setAddingStock(true);
    await addFilamentStock(filament.id, grams);
    setStockGrams("");
    setStockOpen(false);
    setAddingStock(false);
  }

  return (
    <>
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border border-[#e5e5e5]"
            style={{ backgroundColor: filament.colorHex }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-[#1a1a1a]">
                  {filament.brand} {filament.material} - {filament.colorName}
                </h3>
                <p className="text-xs text-[#6b7280]">
                  {filament.diameter}mm · {filament.spoolSizeG}g · ${filament.costPerSpool.toFixed(2)}/spool
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-semibold text-[#1a1a1a]">
                  ${costPerGram.toFixed(4)}/g
                </div>
                {filament.wasteFactor > 0 && (
                  <div className="text-xs text-[#6b7280]">{filament.wasteFactor}% waste</div>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={stockBadge.variant}>{stockBadge.label}</Badge>
                <span className="text-xs text-[#6b7280]">
                  {filament.currentStockG}g · {fmt(inventoryValue)} value
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setStockOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Stock
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => { if (!open) setEditSaving(false); setEditOpen(open); }}
        title="Edit Filament"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => editFormRef.current?.submit()} disabled={editSaving}>
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        <FilamentForm
          ref={editFormRef}
          filament={filament}
          onClose={() => setEditOpen(false)}
          onSavingChange={setEditSaving}
        />
      </Dialog>

      <Dialog open={stockOpen} onOpenChange={setStockOpen} title="Add Stock">
        <div className="space-y-4">
          <p className="text-sm text-[#6b7280]">
            Current stock: <strong>{filament.currentStockG}g</strong>
          </p>
          <Input
            label="Grams to Add"
            type="number"
            min="1"
            value={stockGrams}
            onChange={(e) => setStockGrams(e.target.value)}
            suffix="g"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setStockOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStock} disabled={addingStock || !stockGrams}>
              {addingStock ? "Adding..." : "Add Stock"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
