import { redirect } from "next/navigation";

export default async function LegacyStrategyProfilePage({
  searchParams,
}: {
  searchParams: Promise<{
    id?: string;
    strategyId?: string;
  }>;
}) {
  const params = await searchParams;

  const strategyId = String(
    params.id || params.strategyId || ""
  ).trim();

  if (!strategyId) {
    redirect("/discover");
  }

  redirect(
    `/s/${encodeURIComponent(strategyId)}`
  );
}
