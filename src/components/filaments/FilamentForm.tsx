"use client";

import { useState, useImperativeHandle, type Ref } from "react";
import { createFilament, updateFilament } from "@/actions/filaments";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FILAMENT_BRANDS, FILAMENT_MATERIALS } from "@/lib/filamentDatabase";
import type { FilamentData } from "@/lib/types";

export interface FilamentFormHandle {
  submit: () => void;
}

interface Props {
  ref?: Ref<FilamentFormHandle>;
  filament?: FilamentData;
  onClose: () => void;
  onSavingChange?: (saving: boolean) => void;
}

export function FilamentForm({ ref, filament, onClose, onSavingChange }: Props) {
  const [brand, setBrand] = useState(filament?.brand ?? "");
  const [material, setMaterial] = useState(filament?.material ?? "");
  const [colorName, setColorName] = useState(filament?.colorName ?? "");
  const [colorHex, setColorHex] = useState(filament?.colorHex ?? "#000000");
  const [diameter, setDiameter] = useState(filament?.diameter.toString() ?? "1.75");
  const [spoolSize, setSpoolSize] = useState(filament?.spoolSizeG.toString() ?? "1000");
  const [costPerSpool, setCostPerSpool] = useState(filament?.costPerSpool.toString() ?? "");
  const [wasteFactor, setWasteFactor] = useState(filament?.wasteFactor.toString() ?? "0");
  const [purchaseUrl, setPurchaseUrl] = useState(filament?.purchaseUrl ?? "");
  const [lowStockAlert, setLowStockAlert] = useState(filament?.lowStockAlertG.toString() ?? "200");
  const [currentStock, setCurrentStock] = useState(filament?.currentStockG.toString() ?? "0");
  const [notes, setNotes] = useState(filament?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { symbol } = useCurrency();

  const costPerGram =
    parseFloat(spoolSize) > 0 ? parseFloat(costPerSpool) / parseFloat(spoolSize) : 0;

  function validate() {
    const errs: Record<string, string> = {};
    if (!brand.trim()) errs.brand = "Brand is required";
    if (!material.trim()) errs.material = "Material is required";
    if (!colorName.trim()) errs.colorName = "Color name is required";
    if (!costPerSpool || parseFloat(costPerSpool) <= 0) errs.costPerSpool = "Cost required";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    onSavingChange?.(true);
    const data = {
      brand: brand.trim(),
      material: material.trim(),
      colorName: colorName.trim(),
      colorHex,
      diameter: parseFloat(diameter) || 1.75,
      spoolSizeG: parseFloat(spoolSize) || 1000,
      costPerSpool: parseFloat(costPerSpool) || 0,
      wasteFactor: parseFloat(wasteFactor) || 0,
      purchaseUrl: purchaseUrl || null,
      lowStockAlertG: parseFloat(lowStockAlert) || 200,
      currentStockG: parseFloat(currentStock) || 0,
      notes: notes || null,
    };
    if (filament) {
      await updateFilament(filament.id, data);
    } else {
      await createFilament(data);
    }
    setSaving(false);
    onSavingChange?.(false);
    onClose();
  }

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  const brandOptions = FILAMENT_BRANDS.map((b) => ({ value: b, label: b }));
  const materialOptions = FILAMENT_MATERIALS.map((m) => ({ value: m, label: m }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Brand *"
          placeholder="Select brand..."
          options={brandOptions}
          value={brand}
          onValueChange={setBrand}
          error={errors.brand}
        />
        <Select
          label="Material *"
          placeholder="Select material..."
          options={materialOptions}
          value={material}
          onValueChange={setMaterial}
          error={errors.material}
        />
        <Input
          label="Color Name *"
          placeholder="Black"
          value={colorName}
          onChange={(e) => setColorName(e.target.value)}
          error={errors.colorName}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
            Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="h-9 w-14 cursor-pointer rounded border border-[#e5e5e5] p-1"
            />
            <Input
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              placeholder="#000000"
              className="font-mono"
            />
          </div>
        </div>
      </div>

      <hr className="border-[#e5e5e5]" />

      <div className="grid grid-cols-3 gap-4">
        <Select
          label="Diameter"
          options={[
            { value: "1.75", label: "1.75mm" },
            { value: "2.85", label: "2.85mm" },
          ]}
          value={diameter}
          onValueChange={setDiameter}
        />
        <Input
          label="Spool Size (g)"
          type="number"
          min="0"
          value={spoolSize}
          onChange={(e) => setSpoolSize(e.target.value)}
        />
        <div>
          <Input
            label="Cost per Spool *"
            type="number"
            min="0"
            step="0.01"
            value={costPerSpool}
            onChange={(e) => setCostPerSpool(e.target.value)}
            prefix={symbol}
            error={errors.costPerSpool}
          />
          {costPerGram > 0 && (
            <p className="mt-1 text-xs text-[#6b7280]">
              ${costPerGram.toFixed(4)}/g
            </p>
          )}
        </div>
        <Input
          label="Waste Factor (%)"
          type="number"
          min="0"
          max="100"
          value={wasteFactor}
          onChange={(e) => setWasteFactor(e.target.value)}
          suffix="%"
          hint="Extra filament for failed prints"
        />
      </div>

      <div className="col-span-2">
        <Input
          label="Purchase URL (Optional)"
          placeholder="https://amzn.to/..."
          value={purchaseUrl}
          onChange={(e) => setPurchaseUrl(e.target.value)}
        />
      </div>

      <hr className="border-[#e5e5e5]" />
      <h3 className="text-sm font-semibold text-[#1a1a1a]">Stock Tracking</h3>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Low Stock Alert (g)"
          type="number"
          min="0"
          value={lowStockAlert}
          onChange={(e) => setLowStockAlert(e.target.value)}
          hint="Alert when stock drops below this"
        />
        <Input
          label="Current Stock (g)"
          type="number"
          min="0"
          value={currentStock}
          onChange={(e) => setCurrentStock(e.target.value)}
          hint="Set manually or use +Add Stock"
        />
      </div>

      <Input
        label="Notes (Optional)"
        placeholder="Any notes about this filament..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

    </div>
  );
}
