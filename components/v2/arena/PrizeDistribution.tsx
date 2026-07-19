import Link from "next/link";

type Reward = {
  number: string;
  title: string;
  description: string;
  detail: string;
  accent: "green" | "purple";
};

const rewards: Reward[] = [
  {
    number: "$200K",
    title: "Capital",
    description: "Trade with a serious allocation.",
    detail: "Available to leading verified strategies.",
    accent: "green",
  },
  {
    number: "01",
    title: "Strategy Universe",
    description: "Become visible to active investors.",
    detail: "Verified performance enters distribution.",
    accent: "purple",
  },
  {
    number: "30%",
    title: "Recurring Revenue",
    description: "Earn as capital follows your strategy.",
    detail: "Build revenue beyond a one-time reward.",
    accent: "green",
  },
  {
    number: "∞",
    title: "Your Firm",
    description: "Turn your track record into a business.",
    detail: "Build reputation, products and an audience.",
    accent: "purple",
  },
];

export function PrizeDistribution() {
  return (
    <section
      id="prizes"
      className="mx-auto w-full max-w-[1180px] scroll-mt-28 px-4 py-10"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#b6ff00]">
            Trader Rewards
          </p>

          <h2 className="mt-4 max-w-[760px] text-4xl font-black tracking-[-0.065em] text-white md:text-6xl">
            This is what
            <span className="block text-white/25">you are competing for.</span>
          </h2>
        </div>

        <p className="text-sm leading-7 text-white/40">
          Top traders do not simply receive a prize. They gain the capital,
          distribution and infrastructure needed to build an investment
          business.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rewards.map((reward, index) => (
          <RewardCard
            key={reward.title}
            reward={reward}
            index={index}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-5 overflow-hidden rounded-[30px] border border-white/10 bg-[#080909] p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-violet-300">
            More than funding
          </p>

          <h3 className="mt-3 max-w-[720px] text-2xl font-black tracking-[-0.05em] text-white md:text-3xl">
            Great traders make profits.
            <span className="ml-2 text-white/30">
              Verified traders build firms.
            </span>
          </h3>
        </div>

        <Link
          href="/manager/strategies/new?source=challenge&returnTo=/challenge"
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-white px-6 text-[10px] font-black uppercase tracking-[0.16em] text-black transition hover:scale-[1.02] hover:bg-[#b6ff00]"
        >
          Apply for Season 03&nbsp;&nbsp;→
        </Link>
      </div>
    </section>
  );
}

function RewardCard({
  reward,
  index,
}: {
  reward: Reward;
  index: number;
}) {
  const isGreen = reward.accent === "green";

  return (
    <article
      className={[
        "group relative min-h-[260px] overflow-hidden rounded-[29px] border p-5 transition duration-300 hover:-translate-y-1 md:p-6",
        isGreen
          ? "border-[#b6ff00]/15 bg-[radial-gradient(circle_at_top_left,rgba(182,255,0,0.075),transparent_42%),#080909]"
          : "border-violet-400/15 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.095),transparent_42%),#080909]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <span
          className={[
            "flex h-10 w-10 items-center justify-center rounded-full border text-xs font-black",
            isGreen
              ? "border-[#b6ff00]/20 bg-[#b6ff00]/10 text-[#b6ff00]"
              : "border-violet-400/20 bg-violet-500/10 text-violet-300",
          ].join(" ")}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
          Top 6
        </span>
      </div>

      <p
        className={[
          "mt-8 text-4xl font-black tracking-[-0.07em]",
          isGreen ? "text-[#b6ff00]" : "text-violet-300",
        ].join(" ")}
      >
        {reward.number}
      </p>

      <h3 className="mt-3 text-xl font-black tracking-[-0.035em] text-white">
        {reward.title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/45">
        {reward.description}
      </p>

      <p className="absolute bottom-5 left-5 right-5 border-t border-white/10 pt-4 text-[10px] font-bold leading-5 text-white/25 md:bottom-6 md:left-6 md:right-6">
        {reward.detail}
      </p>
    </article>
  );
}
