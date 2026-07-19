import { StrategyFirmRedirect } from "@/components/v2/navigation/StrategyFirmRedirect";

export default async function StrategyRoute({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  return (
    <StrategyFirmRedirect
      strategyId={decodeURIComponent(id)}
    />
  );
}
