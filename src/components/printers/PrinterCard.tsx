"use client";

import { useState, useRef } from "react";
import { Pencil, Trash2, Printer } from "lucide-react";
import { deletePrinter } from "@/actions/printers";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PrinterForm, type PrinterFormHandle } from "./PrinterForm";
import { calcPrinterHourlyCost } from "@/lib/calculations";
import type { PrinterData } from "@/lib/types";

interface Props {
  printer: PrinterData;
  electricityRate: number;
}

export function PrinterCard({ printer, electricityRate }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const editFormRef = useRef<PrinterFormHandle>(null);
  const [deleting, setDeleting] = useState(false);

  const cost = calcPrinterHourlyCost(
    {
      powerWatts: printer.powerWatts,
      maintenanceCostPerHr: printer.maintenanceCostPerHr,
      purchasePrice: printer.purchasePrice,
      lifespanHours: printer.lifespanHours,
    },
    electricityRate
  );

  async function handleDelete() {
    if (!confirm(`Delete "${printer.name}"?`)) return;
    setDeleting(true);
    await deletePrinter(printer.id);
  }

  return (
    <>
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#f5f5f5]">
            {printer.imageUrl ? (
              <img
                src={printer.imageUrl}
                alt={printer.name}
                className="h-10 w-10 rounded object-contain"
              />
            ) : (
              <Printer className="h-6 w-6 text-[#6b7280]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-[#1a1a1a]">{printer.name}</h3>
                <p className="text-sm text-[#6b7280]">
                  {printer.brand} {printer.modelName}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-[#e05a2b]">
                  ${cost.total.toFixed(4)}/hr
                </div>
                <div className="text-xs text-[#6b7280]">operating cost</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#6b7280]">
              {printer.nozzleSize && <span>{printer.nozzleSize}mm nozzle</span>}
              {printer.nozzleMaterial && <span>{printer.nozzleMaterial}</span>}
              {printer.buildPlate && <span>{printer.buildPlate}</span>}
              <span>{printer.powerWatts}W</span>
            </div>
          </div>
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
        title="Edit Printer"
        className="max-w-3xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => editFormRef.current?.submit()} disabled={editSaving}>
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        <PrinterForm
          ref={editFormRef}
          printer={printer}
          electricityRate={electricityRate}
          onClose={() => setEditOpen(false)}
          onSavingChange={setEditSaving}
        />
      </Dialog>
    </>
  );
}
