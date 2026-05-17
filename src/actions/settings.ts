"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: 1, electricityRatePerKwh: 0.12, targetNetMarginPct: 45, currency: "USD" },
    });
  }
  return settings;
}

export async function updateSettings(data: {
  electricityRatePerKwh?: number;
  targetNetMarginPct?: number;
  currency?: string;
}) {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, electricityRatePerKwh: 0.12, targetNetMarginPct: 45, currency: "USD", ...data },
  });
  revalidatePath("/", "layout");
}
