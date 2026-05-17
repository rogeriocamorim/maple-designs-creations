import { getSupplies } from "@/actions/supplies";
import { SuppliesClient } from "./SuppliesClient";

export const dynamic = "force-dynamic";

export default async function SuppliesPage() {
  const supplies = await getSupplies();
  return <SuppliesClient supplies={supplies} />;
}
