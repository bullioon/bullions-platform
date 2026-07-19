import { TradingDesk } from "@/components/v2/trading-desk/TradingDesk";

export default async function TradingDeskPage({
  searchParams,
}: {
  searchParams: Promise<{
    strategyId?: string;
  }>;
}) {
  const params = await searchParams;
  const strategyId = String(
    params.strategyId || ""
  ).trim();

  return (
    <TradingDesk strategyId={strategyId} />
  );
}
