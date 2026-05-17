"use client";

import { useState, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteSupply } from "@/actions/supplies";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SupplyForm, type SupplyFormHandle } from "./SupplyForm";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { SupplyData } from "@/lib/types";

interface Props {
  supply: SupplyData;
}

export function SupplyCard({ supply }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const editFormRef = useRef<SupplyFormHandle>(null);
  const [deleting, setDeleting] = useState(false);
  const { fmt } = useCurrency();

  const inventoryValue = supply.unitCost * supply.currentStock;

  async function handleDelete() {
    if (!confirm(`Delete "${supply.name}"?`)) return;
    setDeleting(true);
    await deleteSupply(supply.id);
  }

  return (
    <>
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[#1a1a1a]">{supply.name}</h3>
            {supply.notes && (
              <p className="mt-0.5 text-xs text-[#6b7280] line-clamp-2">{supply.notes}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-semibold text-[#e05a2b]">{fmt(supply.unitCost)}/unit</div>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-[#6b7280]">
          <span>{supply.currentStock} of {supply.quantity} units in stock</span>
          <span className="text-[#e5e5e5]">|</span>
          <span>{fmt(inventoryValue)} value</span>
        </div>
        <div className="mt-3 flex justify-end gap-2">
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
        title="Edit Supply"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => editFormRef.current?.submit()} disabled={editSaving}>
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        <SupplyForm
          ref={editFormRef}
          supply={supply}
          onClose={() => setEditOpen(false)}
          onSavingChange={setEditSaving}
        />
      </Dialog>
    </>
  );
}
