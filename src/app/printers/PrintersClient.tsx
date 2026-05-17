"use client";

import { useState, useRef } from "react";
import { Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PrinterCard } from "@/components/printers/PrinterCard";
import { PrinterForm, type PrinterFormHandle } from "@/components/printers/PrinterForm";
import type { PrinterData } from "@/lib/types";

interface Props {
  printers: PrinterData[];
  electricityRate: number;
}

export function PrintersClient({ printers, electricityRate }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const addFormRef = useRef<PrinterFormHandle>(null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1a1a1a]">Printers</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Printer
        </Button>
      </div>

      {printers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e5e5] bg-white py-16 text-center">
          <Printer className="mb-3 h-10 w-10 text-[#e5e5e5]" />
          <p className="text-sm font-medium text-[#6b7280]">No printers yet</p>
          <p className="mt-1 text-xs text-[#9ca3af]">
            Add a printer to start calculating operating costs
          </p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Printer
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {printers.map((printer) => (
            <PrinterCard key={printer.id} printer={printer} electricityRate={electricityRate} />
          ))}
        </div>
      )}

      <Dialog
        open={addOpen}
        onOpenChange={(open) => { if (!open) setAddSaving(false); setAddOpen(open); }}
        title="Add Printer"
        className="max-w-3xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => addFormRef.current?.submit()} disabled={addSaving}>
              {addSaving ? "Saving..." : "Add Printer"}
            </Button>
          </>
        }
      >
        <PrinterForm
          ref={addFormRef}
          electricityRate={electricityRate}
          onClose={() => setAddOpen(false)}
          onSavingChange={setAddSaving}
        />
      </Dialog>
    </div>
  );
}
