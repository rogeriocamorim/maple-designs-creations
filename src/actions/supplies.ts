"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSupplies() {
  return prisma.supply.findMany({ orderBy: { name: "asc" } });
}

export async function createSupply(data: {
  name: string;
  cost: number;
  notes?: string | null;
}) {
  const supply = await prisma.supply.create({ data });
  revalidatePath("/supplies");
  revalidatePath("/calculator");
  return supply;
}

export async function updateSupply(
  id: number,
  data: {
    name?: string;
    cost?: number;
    notes?: string | null;
  }
) {
  const supply = await prisma.supply.update({ where: { id }, data });
  revalidatePath("/supplies");
  revalidatePath("/calculator");
  return supply;
}

export async function deleteSupply(id: number) {
  await prisma.supply.delete({ where: { id } });
  revalidatePath("/supplies");
  revalidatePath("/calculator");
}
