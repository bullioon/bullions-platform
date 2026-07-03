import { Badge } from "@/components/v2/ui/Badge";
import type { ManagerStrategy } from "@/types/v2/managerStrategy";

export function StrategyStatusBadge({ status }: { status: ManagerStrategy["status"] }) {
  if (status === "ACTIVE") return <Badge tone="success">Active</Badge>;
  if (status === "PAUSED") return <Badge tone="warning">Paused</Badge>;
  return <Badge tone="neutral">Draft</Badge>;
}
