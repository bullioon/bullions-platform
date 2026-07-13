import { StrategyProfilePage } from "@/components/v2/strategy-profile/StrategyProfilePage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    id?: string;
    allocate?: string;
  }>;
}) {
  const params = await searchParams;

  const strategyId =
    params.id || "strategy_mia_capital";

  return (
    <StrategyProfilePage
      strategyId={strategyId}
      initialAllocateOpen={params.allocate === "true"}
    />
  );
}
