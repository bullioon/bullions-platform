import { StrategyWorkspace } from "@/components/v2/workspace/StrategyWorkspace";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <StrategyWorkspace id={id} />;
}
