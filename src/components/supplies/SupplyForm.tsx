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
  const [cost, setCost] = useState(supply?.cost?.toString() ?? "");
  const [notes, setNotes] = useState(supply?.notes ?? "");
  const { symbol } = useCurrency();

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  async function handleSubmit() {
    if (!name.trim()) return;
    onSavingChange?.(true);
    try {
      if (supply) {
        await updateSupply(supply.id, {
          name: name.trim(),
          cost: parseFloat(cost) || 0,
          notes: notes.trim() || null,
        });
      } else {
        await createSupply({
          name: name.trim(),
          cost: parseFloat(cost) || 0,
          notes: notes.trim() || null,
        });
      }
      onSavingChange?.(false);
      onClose();
    } catch {
      onSavingChange?.(false);
    }
  }

  return (
    <div className="space-y-4">
      <Input
        label="Supply Name *"
        placeholder="e.g. Shipping Box, Bubble Wrap, Magnets"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <Input
        label="Unit Cost *"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        prefix={symbol}
        hint="Cost per unit when used in a quote"
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
