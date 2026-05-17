import { getFilaments } from "@/actions/filaments";
import { FilamentsClient } from "./FilamentsClient";

export const dynamic = "force-dynamic";

export default async function FilamentsPage() {
  const filaments = await getFilaments();
  return <FilamentsClient filaments={filaments} />;
}
