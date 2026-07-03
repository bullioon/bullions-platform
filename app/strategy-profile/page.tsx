import { StrategyProfile } from "@/components/v2/strategy/StrategyProfile";
import { strategiesV2 } from "@/mock/v2/strategies";

export default function StrategyProfilePage() {
  return <StrategyProfile strategy={strategiesV2[0]} />;
}
