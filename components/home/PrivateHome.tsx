"use client";

import { BullionsHQ } from "@/components/home/BullionsHQ";

export function PrivateHome({
  userId,
}: {
  userId: string;
}) {
  return <BullionsHQ userId={userId} />;
}
