import { ManagerStrategyEditor } from "@/components/v2/manager/editor/ManagerStrategyEditor";

export default async function EditStrategyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ManagerStrategyEditor id={id} />;
}
