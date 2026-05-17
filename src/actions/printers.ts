"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPrinters() {
  return prisma.printer.findMany({ orderBy: { name: "asc" } });
}

export async function createPrinter(data: {
  name: string;
  brand: string;
  modelName: string;
  nozzleSize?: number | null;
  nozzleMaterial?: string | null;
  buildPlate?: string | null;
  powerWatts: number;
  maintenanceCostPerHr: number;
  purchasePrice: number;
  lifespanHours: number;
  dailyUsageHours: number;
  imageUrl?: string | null;
}) {
  const printer = await prisma.printer.create({ data });
  revalidatePath("/printers");
  revalidatePath("/calculator");
  return printer;
}

export async function updatePrinter(
  id: number,
  data: {
    name?: string;
    brand?: string;
    modelName?: string;
    nozzleSize?: number | null;
    nozzleMaterial?: string | null;
    buildPlate?: string | null;
    powerWatts?: number;
    maintenanceCostPerHr?: number;
    purchasePrice?: number;
    lifespanHours?: number;
    dailyUsageHours?: number;
    imageUrl?: string | null;
  }
) {
  const printer = await prisma.printer.update({ where: { id }, data });
  revalidatePath("/printers");
  revalidatePath("/calculator");
  return printer;
}

export async function deletePrinter(id: number) {
  await prisma.printer.delete({ where: { id } });
  revalidatePath("/printers");
  revalidatePath("/calculator");
}
