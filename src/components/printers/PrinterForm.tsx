"use client";

import { useState, useImperativeHandle, type Ref } from "react";
import { createPrinter, updatePrinter } from "@/actions/printers";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { calcPrinterHourlyCost } from "@/lib/calculations";
import { useCurrency } from "@/contexts/CurrencyContext";
import { PRINTER_BRANDS, NOZZLE_SIZES, NOZZLE_MATERIALS, BUILD_PLATES } from "@/lib/filamentDatabase";
import type { PrinterData } from "@/lib/types";

export interface PrinterFormHandle {
  submit: () => void;
}

interface Props {
  ref?: Ref<PrinterFormHandle>;
  printer?: PrinterData;
  electricityRate: number;
  onClose: () => void;
  onSavingChange?: (saving: boolean) => void;
}

export function PrinterForm({ ref, printer, electricityRate, onClose, onSavingChange }: Props) {
  const [name, setName] = useState(printer?.name ?? "");
  const [brand, setBrand] = useState(printer?.brand ?? "");
  const [modelName, setModelName] = useState(printer?.modelName ?? "");
  const [nozzleSize, setNozzleSize] = useState(printer?.nozzleSize?.toString() ?? "");
  const [nozzleMaterial, setNozzleMaterial] = useState(printer?.nozzleMaterial ?? "");
  const [buildPlate, setBuildPlate] = useState(printer?.buildPlate ?? "");
  const [powerWatts, setPowerWatts] = useState(printer?.powerWatts.toString() ?? "250");
  const [maintenanceCost, setMaintenanceCost] = useState(
    printer?.maintenanceCostPerHr.toString() ?? "0.06"
  );
  const [purchasePrice, setPurchasePrice] = useState(printer?.purchasePrice.toString() ?? "0");
  const [lifespanHours, setLifespanHours] = useState(printer?.lifespanHours.toString() ?? "0");
  const [dailyUsage, setDailyUsage] = useState(printer?.dailyUsageHours.toString() ?? "0");
  const [imageUrl, setImageUrl] = useState(printer?.imageUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { symbol } = useCurrency();

  const watts = parseFloat(powerWatts) || 0;
  const price = parseFloat(purchasePrice) || 0;
  const lifespan = parseFloat(lifespanHours) || 0;

  const costBreakdown = calcPrinterHourlyCost(
    {
      powerWatts: watts,
      maintenanceCostPerHr: parseFloat(maintenanceCost) || 0,
      purchasePrice: price,
      lifespanHours: lifespan,
    },
    electricityRate
  );

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!brand.trim()) errs.brand = "Brand is required";
    if (!modelName.trim()) errs.modelName = "Model name is required";
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
      name: name.trim(),
      brand: brand.trim(),
      modelName: modelName.trim(),
      nozzleSize: nozzleSize ? parseFloat(nozzleSize) : null,
      nozzleMaterial: nozzleMaterial || null,
      buildPlate: buildPlate || null,
      powerWatts: watts,
      maintenanceCostPerHr: parseFloat(maintenanceCost) || 0,
      purchasePrice: price,
      lifespanHours: lifespan,
      dailyUsageHours: parseFloat(dailyUsage) || 0,
      imageUrl: imageUrl || null,
    };
    if (printer) {
      await updatePrinter(printer.id, data);
    } else {
      await createPrinter(data);
    }
    setSaving(false);
    onSavingChange?.(false);
    onClose();
  }

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  const brandOptions = PRINTER_BRANDS.map((b) => ({ value: b, label: b }));
  const nozzleSizeOptions = NOZZLE_SIZES.map((s) => ({ value: s.toString(), label: `${s}mm` }));
  const nozzleMaterialOptions = NOZZLE_MATERIALS.map((m) => ({ value: m, label: m }));
  const buildPlateOptions = BUILD_PLATES.map((b) => ({ value: b, label: b }));

  return (
    <div className="grid grid-cols-2 gap-x-10">
      {/* LEFT — Printer Identity */}
      <div className="space-y-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
          Printer Identity
        </p>
        <Input
          label="Printer Name *"
          placeholder="My Printer"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Select
          label="Brand *"
          placeholder="Select brand..."
          options={brandOptions}
          value={brand}
          onValueChange={setBrand}
          error={errors.brand}
        />
        <Input
          label="Model Name *"
          placeholder="P1S"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          error={errors.modelName}
        />
        <Select
          label="Nozzle Size"
          placeholder="Select..."
          options={nozzleSizeOptions}
          value={nozzleSize}
          onValueChange={setNozzleSize}
        />
        <Select
          label="Nozzle Material"
          placeholder="Select..."
          options={nozzleMaterialOptions}
          value={nozzleMaterial}
          onValueChange={setNozzleMaterial}
        />
        <Select
          label="Build Plate"
          placeholder="Select..."
          options={buildPlateOptions}
          value={buildPlate}
          onValueChange={setBuildPlate}
        />
        <Input
          label="Image URL (Optional)"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      {/* RIGHT — Cost Configuration */}
      <div className="space-y-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
          Cost Configuration
        </p>
        <Input
          label="Power (Watts)"
          type="number"
          min="0"
          value={powerWatts}
          onChange={(e) => setPowerWatts(e.target.value)}
        />
        <Input
          label={`Maintenance (${symbol}/hr)`}
          type="number"
          min="0"
          step="0.01"
          value={maintenanceCost}
          onChange={(e) => setMaintenanceCost(e.target.value)}
          prefix={symbol}
        />
        <Input
          label="Purchase Price"
          type="number"
          min="0"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          prefix={symbol}
        />
        <Input
          label="Lifespan (hours)"
          type="number"
          min="0"
          value={lifespanHours}
          onChange={(e) => setLifespanHours(e.target.value)}
          hint="Total expected print hours"
        />
        <Input
          label="Daily Usage (hours)"
          type="number"
          min="0"
          step="0.5"
          value={dailyUsage}
          onChange={(e) => setDailyUsage(e.target.value)}
          hint="Avg hours per day"
        />

        {/* Estimated Operating Cost */}
        <div className="rounded-lg border border-[#e5e5e5] bg-[#f8f8f8] p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Estimated Operating Cost
          </p>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-[#e5e5e5]">
              <tr>
                <td className="py-1.5 font-medium text-[#1a1a1a]">Electricity</td>
                <td className="py-1.5 text-[#9ca3af]">
                  {watts}W ÷ 1,000 × {symbol}{electricityRate}/kWh
                </td>
                <td className="py-1.5 text-right font-mono text-[#1a1a1a]">
                  {symbol}{costBreakdown.electricity.toFixed(4)}/hr
                </td>
              </tr>
              <tr>
                <td className="py-1.5 font-medium text-[#1a1a1a]">Maintenance</td>
                <td className="py-1.5 text-[#9ca3af]">set directly</td>
                <td className="py-1.5 text-right font-mono text-[#1a1a1a]">
                  {symbol}{costBreakdown.maintenance.toFixed(4)}/hr
                </td>
              </tr>
              <tr>
                <td className="py-1.5 font-medium text-[#1a1a1a]">Depreciation</td>
                <td className="py-1.5 text-[#9ca3af]">
                  {lifespan > 0 ? `${symbol}${price} ÷ ${lifespan}h` : "no lifespan set"}
                </td>
                <td className="py-1.5 text-right font-mono text-[#1a1a1a]">
                  {symbol}{costBreakdown.depreciation.toFixed(4)}/hr
                </td>
              </tr>
              <tr>
                <td className="py-1.5 font-semibold text-[#e05a2b]">Total</td>
                <td />
                <td className="py-1.5 text-right font-mono font-semibold text-[#e05a2b]">
                  {symbol}{costBreakdown.total.toFixed(4)}/hr
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
