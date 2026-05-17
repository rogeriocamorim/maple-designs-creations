import { getQuotes } from "@/actions/quotes";
import { HistoryClient } from "./HistoryClient";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const quotes = await getQuotes();
  return <HistoryClient quotes={quotes} />;
}
