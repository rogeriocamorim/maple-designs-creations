import { getPrinters } from "@/actions/printers";
import { getSettings } from "@/actions/settings";
import { PrintersClient } from "./PrintersClient";

export const dynamic = "force-dynamic";

export default async function PrintersPage() {
  const [printers, settings] = await Promise.all([getPrinters(), getSettings()]);
  return <PrintersClient printers={printers} electricityRate={settings.electricityRatePerKwh} />;
}
