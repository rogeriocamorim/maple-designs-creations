"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFilaments() {
  return prisma.filament.findMany({ orderBy: [{ brand: "asc" }, { colorName: "asc" }] });
}

export async function createFilament(data: {
  brand: string;
  material: string;
  colorName: string;
  colorHex: string;
  diameter: number;
  spoolSizeG: number;
  costPerSpool: number;
  wasteFactor: number;
  purchaseUrl?: string | null;
  lowStockAlertG: number;
  currentStockG: number;
  notes?: string | null;
}) {
  const filament = await prisma.filament.create({ data });
  revalidatePath("/filaments");
  revalidatePath("/calculator");
  return filament;
}

export async function updateFilament(
  id: number,
  data: {
    brand?: string;
    material?: string;
    colorName?: string;
    colorHex?: string;
    diameter?: number;
    spoolSizeG?: number;
    costPerSpool?: number;
    wasteFactor?: number;
    purchaseUrl?: string | null;
    lowStockAlertG?: number;
    currentStockG?: number;
    notes?: string | null;
  }
) {
  const filament = await prisma.filament.update({ where: { id }, data });
  revalidatePath("/filaments");
  revalidatePath("/calculator");
  return filament;
}

export async function addFilamentStock(id: number, gramsToAdd: number) {
  const filament = await prisma.filament.findUniqueOrThrow({ where: { id } });
  await prisma.filament.update({
    where: { id },
    data: { currentStockG: filament.currentStockG + gramsToAdd },
  });
  revalidatePath("/filaments");
}

export async function deleteFilament(id: number) {
  await prisma.filament.delete({ where: { id } });
  revalidatePath("/filaments");
  revalidatePath("/calculator");
}
