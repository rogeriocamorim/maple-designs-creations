"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMarketplaces() {
  return prisma.marketplace.findMany({
    include: { adSpendEntries: { orderBy: { createdAt: "desc" } } },
    orderBy: { name: "asc" },
  });
}

export async function createMarketplace(data: {
  name: string;
  type: string;
  listingFee?: number | null;
  transactionFeePct?: number | null;
  paymentProcessingPct?: number | null;
  paymentProcessingFixed?: number | null;
  referralFeePct?: number | null;
}) {
  const marketplace = await prisma.marketplace.create({ data });
  revalidatePath("/marketplaces");
  revalidatePath("/calculator");
  return marketplace;
}

export async function updateMarketplace(
  id: number,
  data: {
    name?: string;
    type?: string;
    listingFee?: number | null;
    transactionFeePct?: number | null;
    paymentProcessingPct?: number | null;
    paymentProcessingFixed?: number | null;
    referralFeePct?: number | null;
  }
) {
  const marketplace = await prisma.marketplace.update({ where: { id }, data });
  revalidatePath("/marketplaces");
  revalidatePath("/calculator");
  return marketplace;
}

export async function deleteMarketplace(id: number) {
  await prisma.marketplace.delete({ where: { id } });
  revalidatePath("/marketplaces");
  revalidatePath("/calculator");
}

export async function addAdSpendEntry(data: {
  marketplaceId: number;
  startDate: string;
  endDate: string;
  totalSpend: number;
  notes?: string | null;
}) {
  const entry = await prisma.adSpendEntry.create({
    data: {
      marketplaceId: data.marketplaceId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalSpend: data.totalSpend,
      notes: data.notes,
    },
  });
  revalidatePath("/marketplaces");
  return entry;
}

export async function deleteAdSpendEntry(id: string) {
  await prisma.adSpendEntry.delete({ where: { id } });
  revalidatePath("/marketplaces");
}
