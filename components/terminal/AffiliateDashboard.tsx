import { useState } from "react";

export function AffiliateDashboard({
  username,
}: {
  username: string;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="rounded-[30px] border border-[#b6ff00]/10 bg-[#050705] p-6 shadow-[0_0_60px_rgba(182,255,0,0.05)]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-2xl border border-[#b6ff00]/15 bg-[#b6ff00]/5 px-4 py-3 text-left"
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
            Referral Network
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            Build Your Network
          </h3>

          <p className="mt-1 text-sm text-white/45">
            Earn 5% on direct deposits from your network.
          </p>
        </div>

        <div className="text-xl font-bold text-[#b6ff00]">
          {expanded ? "▲" : "▼"}
        </div>
      </button>

      {expanded && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/[0.03] p-4">
              <p className="text-xs text-white/40">Network Size</p>
              <p className="mt-1 text-3xl font-black text-white">0</p>
            </div>

            <div className="rounded-2xl bg-white/[0.03] p-4">
              <p className="text-xs text-white/40">Volume Generated</p>
              <p className="mt-1 text-3xl font-black text-white">$0</p>
            </div>

            <div className="rounded-2xl bg-white/[0.03] p-4">
              <p className="text-xs text-white/40">Rewards Earned</p>
              <p className="mt-1 text-3xl font-black text-[#b6ff00]">$0</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/20 p-4">
            <p className="text-xs text-white/40">
              Your referral link
            </p>

            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={`https://bullions6x.com/?ref=${username}`}
                className="h-11 flex-1 rounded-xl border border-white/[0.06] bg-black/20 px-3 text-sm text-white"
              />

              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://bullions6x.com/?ref=${username}`
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="h-11 rounded-xl bg-[#b6ff00] px-4 text-sm font-black text-black"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#b6ff00]/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                  Network Level I
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  Recruiter
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-white">0 / 5</p>
                <p className="text-xs text-white/40">partners</p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-0 rounded-full bg-[#b6ff00]" />
            </div>

            <p className="mt-3 text-xs text-white/40">
              Unlock Builder level at 5 partners.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
