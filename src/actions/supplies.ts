"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSupplies() {
  return prisma.supply.findMany({ orderBy: { name: "asc" } });
}

export async function createSupply(data: {
  name: string;
  quantity: number;
  totalPrice: number;
  currentStock: number;
  notes?: string | null;
}) {
  const unitCost = data.quantity > 0 ? data.totalPrice / data.quantity : 0;
  const supply = await prisma.supply.create({
    data: {
      name: data.name,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
      unitCost,
      currentStock: data.currentStock,
      notes: data.notes,
    },
  });
  revalidatePath("/supplies");
  revalidatePath("/calculator");
  return supply;
}

export async function updateSupply(
  id: number,
  data: {
    name?: string;
    quantity?: number;
    totalPrice?: number;
    currentStock?: number;
    notes?: string | null;
  }
) {
  // If quantity or totalPrice changed, recompute unitCost
  let unitCost: number | undefined;
  if (data.quantity !== undefined || data.totalPrice !== undefined) {
    const existing = await prisma.supply.findUniqueOrThrow({ where: { id } });
    const qty = data.quantity ?? existing.quantity;
    const price = data.totalPrice ?? existing.totalPrice;
    unitCost = qty > 0 ? price / qty : 0;
  }

  const supply = await prisma.supply.update({
    where: { id },
    data: {
      ...data,
      ...(unitCost !== undefined ? { unitCost } : {}),
    },
  });
  revalidatePath("/supplies");
  revalidatePath("/calculator");
  return supply;
}

export async function deleteSupply(id: number) {
  await prisma.supply.delete({ where: { id } });
  revalidatePath("/supplies");
  revalidatePath("/calculator");
}
