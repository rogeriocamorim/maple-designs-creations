"use client";

import { useState, useRef } from "react";
import { Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { MarketplaceCard } from "@/components/marketplaces/MarketplaceCard";
import { MarketplaceForm, type MarketplaceFormHandle } from "@/components/marketplaces/MarketplaceForm";
import type { MarketplaceData } from "@/lib/types";

interface Props {
  marketplaces: MarketplaceData[];
}

export function MarketplacesClient({ marketplaces }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const addFormRef = useRef<MarketplaceFormHandle>(null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1a1a1a]">Marketplaces</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Marketplace
        </Button>
      </div>

      {marketplaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e5e5] bg-white py-16 text-center">
          <ShoppingBag className="mb-3 h-10 w-10 text-[#e5e5e5]" />
          <p className="text-sm font-medium text-[#6b7280]">No marketplaces yet</p>
          <p className="mt-1 text-xs text-[#9ca3af]">
            Add marketplaces to calculate platform fees and profit
          </p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Marketplace
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marketplaces.map((marketplace) => (
            <MarketplaceCard key={marketplace.id} marketplace={marketplace} />
          ))}
        </div>
      )}

      <Dialog
        open={addOpen}
        onOpenChange={(open) => { if (!open) setAddSaving(false); setAddOpen(open); }}
        title="Add Marketplace"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => addFormRef.current?.submit()} disabled={addSaving}>
              {addSaving ? "Saving..." : "Add Marketplace"}
            </Button>
          </>
        }
      >
        <MarketplaceForm
          ref={addFormRef}
          onClose={() => setAddOpen(false)}
          onSavingChange={setAddSaving}
        />
      </Dialog>
    </div>
  );
}
