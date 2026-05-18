"use client";

import { useState, useImperativeHandle, type Ref } from "react";
import { createSupply, updateSupply } from "@/actions/supplies";
import { Input } from "@/components/ui/Input";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { SupplyData } from "@/lib/types";

export interface SupplyFormHandle {
  submit: () => void;
}

interface Props {
  ref?: Ref<SupplyFormHandle>;
  supply?: SupplyData;
  onClose: () => void;
  onSavingChange?: (saving: boolean) => void;
}

export function SupplyForm({ ref, supply, onClose, onSavingChange }: Props) {
  const [name, setName] = useState(supply?.name ?? "");
  const [quantity, setQuantity] = useState(supply?.quantity?.toString() ?? "1");
  const [totalPrice, setTotalPrice] = useState(supply?.totalPrice?.toString() ?? "");
  const [currentStock, setCurrentStock] = useState(supply?.currentStock?.toString() ?? "0");
  const [notes, setNotes] = useState(supply?.notes ?? "");
  const { symbol, fmt } = useCurrency();

  const qty = parseInt(quantity) || 0;
  const price = parseFloat(totalPrice) || 0;
  const computedUnitCost = qty > 0 ? price / qty : 0;

  async function handleSubmit() {
    if (!name.trim() || qty < 1) return;
    onSavingChange?.(true);
    try {
      if (supply) {
        await updateSupply(supply.id, {
          name: name.trim(),
          quantity: qty,
          totalPrice: price,
          currentStock: parseInt(currentStock) || 0,
          notes: notes.trim() || null,
        });
      } else {
        await createSupply({
          name: name.trim(),
          quantity: qty,
          totalPrice: price,
          currentStock: parseInt(currentStock) || 0,
          notes: notes.trim() || null,
        });
      }
      onSavingChange?.(false);
      onClose();
    } catch {
      onSavingChange?.(false);
    }
  }

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  return (
    <div className="space-y-4">
      <Input
        label="Supply Name *"
        placeholder="e.g. Shipping Box, Bubble Wrap, Magnets"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Quantity Purchased *"
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 100"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          hint="Units bought in this batch"
        />
        <Input
          label="Total Price *"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={totalPrice}
          onChange={(e) => setTotalPrice(e.target.value)}
          prefix={symbol}
          hint="Price paid for entire batch"
        />
      </div>
      <div className="rounded-md bg-[#f9fafb] border border-[#e5e5e5] px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">Price per Unit</span>
        <p className="text-sm font-semibold text-[#1a1a1a]">
          {qty > 0 ? fmt(computedUnitCost) : "--"}
          {qty > 0 && <span className="ml-1 font-normal text-[#6b7280]">/unit</span>}
        </p>
      </div>
      <Input
        label="Current Stock"
        type="number"
        min="0"
        step="1"
        placeholder="0"
        value={currentStock}
        onChange={(e) => setCurrentStock(e.target.value)}
        hint="Units currently on hand"
      />
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#6b7280]">
          Notes
        </label>
        <textarea
          className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 text-sm placeholder:text-[#9ca3af] focus:border-[#e05a2b] focus:outline-none focus:ring-2 focus:ring-[#e05a2b]/20"
          rows={2}
          placeholder="Optional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
}
