import { Suspense } from "react";

import { ChallengeExperience } from "@/components/v2/challenge-experience/ChallengeExperience";

function ChallengeLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050607] px-6 text-white">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#b6ff00]" />

        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
          Loading Challenge
        </p>
      </div>
    </main>
  );
}

export default function ChallengePage() {
  return (
    <Suspense fallback={<ChallengeLoading />}>
      <ChallengeExperience />
    </Suspense>
  );
}
