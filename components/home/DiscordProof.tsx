export function DiscordProof() {
  const discordUrl = "https://discord.gg/YkFBXRD6rz";

  return (
    <section className="relative overflow-hidden rounded-[42px] border border-white/[0.06] bg-[#0b0d11] p-6 md:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(108,255,114,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.16),transparent_35%)]" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-[620px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6CFF72]/25 bg-[#6CFF72]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#b6ff00]">
            <div className="h-2 w-2 rounded-full bg-[#b6ff00]" />
            Private AI trading community
          </div>

          <h1 className="mt-6 max-w-[620px] text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white md:text-7xl">
            Join the
            <br />
            Bullions
            <br />
            Trading Club
          </h1>

          <p className="mt-6 max-w-[560px] text-base leading-8 text-white/72 md:text-lg">
            Live traders. AI-powered copy trading. Real-time leaderboard.
            Follow profitable traders, compete against the bot, and access
            private BullPad launches before the public.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {["94+ members", "Live trading chat", "AI copy trading signals", "Weekly challenges"].map((item) => (
              <div key={item} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/70">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-[64px] items-center justify-center rounded-full bg-[#5865F2] px-8 text-sm font-semibold text-white transition hover:scale-[1.02]"
            >
              Join Discord
            </a>

            <a
              href="/bullpad#leaderboard"
              className="inline-flex h-[64px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] px-8 text-sm font-semibold text-white/80 transition hover:bg-white/[0.06]"
            >
              View Leaderboard
            </a>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#b6ff00] text-xs font-black text-black ring-2 ring-[#0b0d11]">A</div>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#8b5cf6] text-xs font-black text-white ring-2 ring-[#0b0d11]">G</div>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-black text-black ring-2 ring-[#0b0d11]">N</div>
            </div>

            <div>
              <p className="text-xs font-semibold text-white">Online now</p>
              <p className="text-xs text-white/40">traders + investors</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute right-[8%] top-[8%] h-[240px] w-[240px] rounded-full bg-[#7c3aed]/20 blur-[60px] md:blur-[120px]" />

          <div className="relative mx-auto max-w-[520px] rounded-[38px] border border-white/[0.08] bg-[#111318]/96 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">bullions trading club</p>
                <p className="mt-1 text-xs text-white/35">Private AI trading room</p>
              </div>

              <div className="rounded-full bg-[#6CFF72]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#6CFF72]">
                Live
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                "TORION detected recovery momentum",
                "Alex activated Copy Engine",
                "Nika survived withdrawal cycle",
                "Leaderboard updated live",
                "Ghost Alpha up +18.4%",
              ].map((msg, i) => (
                <div key={msg} className="flex items-center gap-3 rounded-[18px] border border-white/[0.06] bg-white/[0.03] px-4 py-4">
                  <div className={`h-2.5 w-2.5 rounded-full ${i % 2 === 0 ? "bg-[#6CFF72]" : "bg-[#8b5cf6]"}`} />
                  <p className="text-sm text-white/78">{msg}</p>
                </div>
              ))}
            </div>

            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex h-[56px] items-center justify-center rounded-full bg-[#5865F2] text-sm font-semibold text-white transition hover:scale-[1.02]"
            >
              Accept Invite
            </a>

            <div className="mt-5 rounded-[24px] border border-white/[0.06] bg-black/25 p-4">
              <p className="text-xs text-white/35">Community status</p>
              <p className="mt-1 text-2xl font-semibold text-white">94+ members</p>
              <p className="mt-1 text-xs text-[#6CFF72]">Live room active</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
