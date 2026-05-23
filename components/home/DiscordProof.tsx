export function DiscordProof() {
  return (
    <section className="relative mx-auto mt-12 w-full max-w-[1480px] overflow-hidden rounded-[38px] border border-white/5 bg-[#0b0b0e] p-8">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(182,255,0,0.10),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(140,82,255,0.18),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(182,255,0,0.08),transparent_40%)]" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b6ff00]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#b6ff00]" />
            Private Discord Access
          </span>

          <h2 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl">
            See the room.
            <br />
            Feel the pressure.
          </h2>

          <p className="mt-6 max-w-[580px] text-lg leading-8 text-white/55">
            Real traders. Live reactions. Copy Engine alerts, withdrawals,
            challenge rankings and market panic — all happening inside the private room.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "Live market reactions",
              "Copy Engine alerts",
              "Challenge rankings",
              "Private updates",
            ].map((item) => (
              <div
                key={item}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 backdrop-blur-xl"
              >
                {item}
              </div>
            ))}
          </div>

          <a
            href="https://discord.gg/YkFBXRD6rz"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex h-[62px] w-fit items-center justify-center rounded-full bg-[#b6ff00] px-9 text-sm font-semibold text-black shadow-[0_0_60px_rgba(182,255,0,0.25)] transition-all duration-300 hover:scale-[1.03]"
          >
            Enter Discord
          </a>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#121218]/90 p-5 backdrop-blur-2xl">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(140,82,255,0.22),transparent_35%)]" />

          <div className="relative z-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  bullions-private-room
                </p>

                <p className="mt-1 text-xs text-white/35">
                  1,284 online
                </p>
              </div>

              <div className="rounded-full border border-[#8c52ff]/20 bg-[#8c52ff]/10 px-3 py-1 text-xs font-semibold text-[#c7adff]">
                LIVE
              </div>
            </div>

            <div className="space-y-3">
              {[
                ["TORION", "Market volatility spike detected."],
                ["Alex", "just activated Copy Engine."],
                ["Nika", "survived another withdrawal cycle."],
                ["Ghost", "up +18.2% this week."],
                ["System", "Leaderboard updated live."],
                ["Maria", "switched to survival mode."],
              ].map(([name, text], index) => (
                <div
                  key={text}
                  className="rounded-[22px] border border-white/5 bg-black/30 p-4 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={
                          index % 2 === 0
                            ? "h-2.5 w-2.5 rounded-full bg-[#b6ff00]"
                            : "h-2.5 w-2.5 rounded-full bg-[#8c52ff]"
                        }
                      />

                      <p className="text-sm font-semibold text-white">
                        {name}
                      </p>
                    </div>

                    <span className="text-[11px] text-white/30">
                      now
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-white/55">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
