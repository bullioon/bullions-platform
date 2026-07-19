"use client";

import { useSearchParams } from "next/navigation";

import { Arena } from "@/components/v2/arena/Arena";
import { ChallengeEnrollment } from "./ChallengeEnrollment";

export function ChallengeExperience() {
  const searchParams = useSearchParams();
  const strategyId =
    searchParams.get("strategyId")?.trim() || "";

  if (strategyId) {
    return (
      <ChallengeEnrollment strategyId={strategyId} />
    );
  }

  return <Arena />;
}
