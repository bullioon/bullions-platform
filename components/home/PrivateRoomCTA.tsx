const DISCORD_URL = "https://discord.gg/YkFBXRD6rz";

export function PrivateRoomCTA() {
  return (
    <section className="mx-auto mt-6 w-full max-w-[980px] px-4">
      <div className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-gradient-to-br from-[#0b0713] via-[#151020] to-[#1f1235] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(182,255,0,0.18),transparent_32%),radial-gradient(circle_at_85%_25%,rgba(124,58,237,0.28),transparent_36%)]" />
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#b6ff00]/10 blur-[40px] md:blur-[80px]" />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#b6ff00]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b6ff00] ring-1 ring-[#b6ff00]/20">
              <span className="h-2 w-2 md:animate-pulse rounded-full bg-[#b6ff00]" />
              Live private access
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Private Room is Live
            </h2>

            <p className="mt-3 max-w-[520px] text-sm leading-6 text-white/55">
              Watch real trades, live updates and weekly challenge activity before the public sees it.
            </p>
          </div>

          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex h-[54px] items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-black shadow-[0_0_45px_rgba(182,255,0,0.18)] transition hover:scale-[1.025] hover:bg-[#b6ff00]"
          >
            Enter the Room
            <span className="ml-2 transition group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
