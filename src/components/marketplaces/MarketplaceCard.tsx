"use client";

import { useState, useRef } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Pencil, Trash2, ShoppingBag } from "lucide-react";
import { deleteMarketplace } from "@/actions/marketplaces";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MarketplaceForm, type MarketplaceFormHandle } from "./MarketplaceForm";
import type { MarketplaceData } from "@/lib/types";

interface Props {
  marketplace: MarketplaceData;
}

const TYPE_LABELS: Record<string, string> = {
  direct_sale: "Direct Sale",
  etsy: "Etsy",
  amazon: "Amazon",
  ebay: "eBay",
  generic: "Generic",
};

export function MarketplaceCard({ marketplace }: Props) {
  const { symbol } = useCurrency();
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const editFormRef = useRef<MarketplaceFormHandle>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    setConfirmOpen(false);
    setDeleting(true);
    await deleteMarketplace(marketplace.id);
  }

  function feesSummary() {
    const parts: string[] = [];

    if (marketplace.transactionFeePct != null) {
      parts.push(`${marketplace.transactionFeePct}% txn`);
    }
    if (marketplace.paymentProcessingPct != null) {
      parts.push(`${marketplace.paymentProcessingPct}% proc`);
    }
    if (marketplace.paymentProcessingFixed != null) {
      parts.push(`${symbol}${marketplace.paymentProcessingFixed} proc fixed`);
    }
    if (marketplace.listingFee != null) {
      parts.push(`${symbol}${marketplace.listingFee} listing`);
    }
    if (marketplace.referralFeePct != null) {
      parts.push(`${marketplace.referralFeePct}% referral`);
    }

    return parts.length > 0 ? parts.join(" + ") : "No platform fees";
  }

  return (
    <>
      <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5f5f5]">
              <ShoppingBag className="h-5 w-5 text-[#6b7280]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#1a1a1a]">{marketplace.name}</h3>
                <Badge variant="muted">{TYPE_LABELS[marketplace.type] ?? marketplace.type}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-[#6b7280]">{feesSummary()}</p>
            </div>
          </div>
        </div>
        {marketplace.adSpendEntries.length > 0 && (
          <p className="mt-2 text-xs text-[#6b7280]">
            {marketplace.adSpendEntries.length} ad spend entr
            {marketplace.adSpendEntries.length > 1 ? "ies" : "y"}
          </p>
        )}
        <div className="mt-3 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)} disabled={deleting}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => { if (!open) setEditSaving(false); setEditOpen(open); }}
        title={`Edit Marketplace — ${marketplace.name}`}
        className="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => editFormRef.current?.submit()} disabled={editSaving}>
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        <MarketplaceForm
          ref={editFormRef}
          marketplace={marketplace}
          onClose={() => setEditOpen(false)}
          onSavingChange={setEditSaving}
        />
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Marketplace"
        description={`Are you sure you want to delete "${marketplace.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        disabled={deleting}
      />
    </>
  );
}
