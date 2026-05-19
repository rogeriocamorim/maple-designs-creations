"use client";

import { useState, useImperativeHandle, type Ref } from "react";
import { Trash2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  createMarketplace,
  updateMarketplace,
  addAdSpendEntry,
  deleteAdSpendEntry,
} from "@/actions/marketplaces";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { MarketplaceData } from "@/lib/types";

export interface MarketplaceFormHandle {
  submit: () => void;
}

interface Props {
  ref?: Ref<MarketplaceFormHandle>;
  marketplace?: MarketplaceData;
  onClose: () => void;
  onSavingChange?: (saving: boolean) => void;
}

export function MarketplaceForm({ ref, marketplace, onClose, onSavingChange }: Props) {
  const [name, setName] = useState(marketplace?.name ?? "");
  const [type, setType] = useState<string>(marketplace?.type ?? "generic");

  // Fee toggles — enabled when the marketplace has a non-null value
  const [hasListingFee, setHasListingFee] = useState(marketplace?.listingFee != null);
  const [hasTransactionFee, setHasTransactionFee] = useState(marketplace?.transactionFeePct != null);
  const [hasPaymentProcessing, setHasPaymentProcessing] = useState(
    marketplace?.paymentProcessingPct != null || marketplace?.paymentProcessingFixed != null
  );
  const [hasReferralFee, setHasReferralFee] = useState(marketplace?.referralFeePct != null);

  // Fee values
  const [listingFee, setListingFee] = useState(marketplace?.listingFee?.toString() ?? "0.20");
  const [transactionFeePct, setTransactionFeePct] = useState(
    marketplace?.transactionFeePct?.toString() ?? "6.5"
  );
  const [paymentProcessingPct, setPaymentProcessingPct] = useState(
    marketplace?.paymentProcessingPct?.toString() ?? "3.0"
  );
  const [paymentProcessingFixed, setPaymentProcessingFixed] = useState(
    marketplace?.paymentProcessingFixed?.toString() ?? "0.25"
  );
  const [referralFeePct, setReferralFeePct] = useState(
    marketplace?.referralFeePct?.toString() ?? "15"
  );

  // Ad spend form
  const [adStartDate, setAdStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [adEndDate, setAdEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [adSpend, setAdSpend] = useState("");
  const [adNotes, setAdNotes] = useState("");
  const [addingAdSpend, setAddingAdSpend] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [adSpendDeleteId, setAdSpendDeleteId] = useState<string | null>(null);

  const { symbol, fmt } = useCurrency();

  function handlePresetChange(newType: string) {
    setType(newType);
    if (newType === "etsy") {
      setHasListingFee(true);
      setHasTransactionFee(true);
      setHasPaymentProcessing(true);
      setHasReferralFee(false);
      setListingFee("0.20");
      setTransactionFeePct("6.5");
      setPaymentProcessingPct("3.0");
      setPaymentProcessingFixed("0.25");
    } else if (newType === "amazon") {
      setHasListingFee(false);
      setHasTransactionFee(false);
      setHasPaymentProcessing(false);
      setHasReferralFee(true);
      setReferralFeePct("15");
    } else if (newType === "ebay") {
      setHasListingFee(false);
      setHasTransactionFee(true);
      setHasPaymentProcessing(true);
      setHasReferralFee(false);
      setTransactionFeePct("13.25");
      setPaymentProcessingPct("2.95");
      setPaymentProcessingFixed("0.30");
    } else if (newType === "direct_sale") {
      setHasListingFee(false);
      setHasTransactionFee(false);
      setHasPaymentProcessing(false);
      setHasReferralFee(false);
    }
    // "generic" — keep current toggles, user picks manually
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
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
      type,
      listingFee: hasListingFee ? parseFloat(listingFee) || 0 : null,
      transactionFeePct: hasTransactionFee ? parseFloat(transactionFeePct) || 0 : null,
      paymentProcessingPct: hasPaymentProcessing ? parseFloat(paymentProcessingPct) || 0 : null,
      paymentProcessingFixed: hasPaymentProcessing ? parseFloat(paymentProcessingFixed) || 0 : null,
      referralFeePct: hasReferralFee ? parseFloat(referralFeePct) || 0 : null,
    };
    if (marketplace) {
      await updateMarketplace(marketplace.id, data);
    } else {
      await createMarketplace(data);
    }
    setSaving(false);
    onSavingChange?.(false);
    onClose();
  }

  useImperativeHandle(ref, () => ({ submit: handleSubmit }));

  async function handleAddAdSpend() {
    if (!marketplace || !adSpend || parseFloat(adSpend) <= 0) return;
    setAddingAdSpend(true);
    await addAdSpendEntry({
      marketplaceId: marketplace.id,
      startDate: adStartDate,
      endDate: adEndDate,
      totalSpend: parseFloat(adSpend),
      notes: adNotes || null,
    });
    setAdSpend("");
    setAdNotes("");
    setAddingAdSpend(false);
  }

  async function handleDeleteAdSpend(id: string) {
    setAdSpendDeleteId(null);
    await deleteAdSpendEntry(id);
  }

  const typeOptions = [
    { value: "direct_sale", label: "Direct Sale (no fees)" },
    { value: "etsy", label: "Etsy" },
    { value: "amazon", label: "Amazon" },
    { value: "ebay", label: "eBay" },
    { value: "generic", label: "Generic / Other" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Marketplace Name *"
          placeholder="My Shop"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Select
          label="Preset"
          options={typeOptions}
          value={type}
          onValueChange={handlePresetChange}
        />
      </div>

      <hr className="border-[#e5e5e5]" />
      <h3 className="text-sm font-semibold text-[#1a1a1a]">Fee Structure</h3>
      <p className="text-xs text-[#6b7280]">
        Select which fees this marketplace charges, then set their values.
      </p>

      <div className="space-y-4">
        {/* Listing Fee */}
        <div className="space-y-2">
          <Checkbox
            label="Listing Fee"
            hint="(fixed per-item fee)"
            checked={hasListingFee}
            onCheckedChange={setHasListingFee}
          />
          {hasListingFee && (
            <div className="ml-6">
              <Input
                label={`Amount (${symbol})`}
                type="number"
                min="0"
                step="0.01"
                value={listingFee}
                onChange={(e) => setListingFee(e.target.value)}
                prefix={symbol}
                hint={`e.g., ${symbol}0.20 for Etsy`}
              />
            </div>
          )}
        </div>

        {/* Transaction Fee */}
        <div className="space-y-2">
          <Checkbox
            label="Transaction Fee"
            hint="(% of sale price)"
            checked={hasTransactionFee}
            onCheckedChange={setHasTransactionFee}
          />
          {hasTransactionFee && (
            <div className="ml-6">
              <Input
                label="Rate (%)"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={transactionFeePct}
                onChange={(e) => setTransactionFeePct(e.target.value)}
                suffix="%"
                hint="e.g., 6.5% for Etsy, 13.25% for eBay"
              />
            </div>
          )}
        </div>

        {/* Payment Processing */}
        <div className="space-y-2">
          <Checkbox
            label="Payment Processing"
            hint="(% + fixed fee)"
            checked={hasPaymentProcessing}
            onCheckedChange={setHasPaymentProcessing}
          />
          {hasPaymentProcessing && (
            <div className="ml-6 grid grid-cols-2 gap-3">
              <Input
                label="Rate (%)"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={paymentProcessingPct}
                onChange={(e) => setPaymentProcessingPct(e.target.value)}
                suffix="%"
                hint="e.g., 3%"
              />
              <Input
                label={`Fixed (${symbol})`}
                type="number"
                min="0"
                step="0.01"
                value={paymentProcessingFixed}
                onChange={(e) => setPaymentProcessingFixed(e.target.value)}
                prefix={symbol}
                hint={`e.g., ${symbol}0.25`}
              />
            </div>
          )}
        </div>

        {/* Referral Fee */}
        <div className="space-y-2">
          <Checkbox
            label="Referral Fee"
            hint="(% commission, e.g. Amazon)"
            checked={hasReferralFee}
            onCheckedChange={setHasReferralFee}
          />
          {hasReferralFee && (
            <div className="ml-6">
              <Input
                label="Rate (%)"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={referralFeePct}
                onChange={(e) => setReferralFeePct(e.target.value)}
                suffix="%"
                hint="e.g., 15% for Amazon"
              />
            </div>
          )}
        </div>
      </div>

      {marketplace && (
        <>
          <hr className="border-[#e5e5e5]" />
          <h3 className="text-sm font-semibold text-[#1a1a1a]">Manual Ad Spend</h3>
          <p className="text-xs text-[#6b7280]">
            Enter a total across a date range. Spread evenly across those dates for accurate
            dashboard time filtering.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={adStartDate}
              onChange={(e) => setAdStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={adEndDate}
              onChange={(e) => setAdEndDate(e.target.value)}
            />
            <Input
              label={`Total Ad Spend (${symbol})`}
              type="number"
              min="0"
              step="0.01"
              value={adSpend}
              onChange={(e) => setAdSpend(e.target.value)}
              prefix={symbol}
            />
            <Input
              label="Notes (Optional)"
              placeholder="e.g., Etsy Offsite Ads March"
              value={adNotes}
              onChange={(e) => setAdNotes(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddAdSpend}
            disabled={addingAdSpend || !adSpend}
          >
            {addingAdSpend ? "Adding..." : "Add Entry"}
          </Button>

          {marketplace.adSpendEntries.length > 0 && (
            <div className="rounded-lg border border-[#e5e5e5]">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280] border-b border-[#e5e5e5]">
                Manual Spend History
              </div>
              <div className="divide-y divide-[#e5e5e5]">
                {marketplace.adSpendEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <div className="text-sm font-medium">
                        {fmt(entry.totalSpend)}
                      </div>
                      <div className="text-xs text-[#6b7280]">
                        {new Date(entry.startDate).toLocaleDateString()} –{" "}
                        {new Date(entry.endDate).toLocaleDateString()}
                        {entry.notes && ` · ${entry.notes}`}
                      </div>
                    </div>
                    <button
                      onClick={() => setAdSpendDeleteId(entry.id)}
                      className="p-1 text-[#6b7280] hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={adSpendDeleteId !== null}
        onOpenChange={(open) => { if (!open) setAdSpendDeleteId(null); }}
        title="Remove Ad Spend Entry"
        description="Are you sure you want to remove this ad spend entry? This action cannot be undone."
        confirmLabel="Remove"
        onConfirm={() => { if (adSpendDeleteId) handleDeleteAdSpend(adSpendDeleteId); }}
      />
    </div>
  );
}
