import { getMarketplaces } from "@/actions/marketplaces";
import { MarketplacesClient } from "./MarketplacesClient";

export const dynamic = "force-dynamic";

export default async function MarketplacesPage() {
  const marketplaces = await getMarketplaces();
  return <MarketplacesClient marketplaces={marketplaces} />;
}
