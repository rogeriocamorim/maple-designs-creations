"use client";

import { useState } from "react";
import { updateSettings } from "@/actions/settings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface Props {
  settings: {
    electricityRatePerKwh: number;
    targetNetMarginPct: number;
    currency: string;
  };
}

export function SettingsClient({ settings }: Props) {
  const [electricityRate, setElectricityRate] = useState(
    settings.electricityRatePerKwh.toString()
  );
  const [targetMargin, setTargetMargin] = useState(settings.targetNetMarginPct.toString());
  const [currency, setCurrency] = useState(settings.currency);
  const [saving, setSaving] = useState(false);

  const symbol =
    new Intl.NumberFormat("en-US", { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? "$";
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateSettings({
      electricityRatePerKwh: parseFloat(electricityRate) || 0.12,
      targetNetMarginPct: parseFloat(targetMargin) || 45,
      currency,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-semibold text-[#1a1a1a]">Settings</h1>
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-6">
        <div className="space-y-5">
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#6b7280]">
              Electricity
            </h2>
            <Input
              label={`Electricity Rate (${symbol}/kWh)`}
              type="number"
              min="0"
              step="0.01"
              value={electricityRate}
              onChange={(e) => setElectricityRate(e.target.value)}
              hint={`Used to calculate printer electricity cost. Default: ${symbol}0.12/kWh`}
              prefix={symbol}
            />
          </div>
          <hr className="border-[#e5e5e5]" />
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#6b7280]">
              Pricing
            </h2>
            <Input
              label="Target Net Margin (%)"
              type="number"
              min="0"
              max="100"
              step="1"
              value={targetMargin}
              onChange={(e) => setTargetMargin(e.target.value)}
              hint="Used to calculate 3DPF Suggested prices. Default: 45%"
              suffix="%"
            />
          </div>
          <hr className="border-[#e5e5e5]" />
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#6b7280]">
              Currency
            </h2>
            <Select
              label="Display Currency"
              value={currency}
              onValueChange={setCurrency}
              options={[
                { value: "USD", label: "USD ($)" },
                { value: "EUR", label: "EUR (€)" },
                { value: "GBP", label: "GBP (£)" },
                { value: "CAD", label: "CAD ($)" },
                { value: "AUD", label: "AUD ($)" },
              ]}
            />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
          {saved && <span className="text-sm text-green-600">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
