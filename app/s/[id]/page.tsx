import { StrategyProfilePage } from "@/components/v2/strategy-profile/StrategyProfilePage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <StrategyProfilePage strategyId={id} />;
}
