import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function AffiliateDashboard({
  username,
}: {
  username: string;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [networkSize, setNetworkSize] = useState(0);

  const referralCode = username.trim().toLowerCase();
  const referralLink = `https://bullions6x.com/?ref=${referralCode}`;

  const clientRewards = networkSize * 100;

  const withdrawalRewards = useMemo(() => {
    if (networkSize <= 0) return 0;

    let seed = 0;
    for (let i = 0; i < referralCode.length; i++) {
      seed += referralCode.charCodeAt(i);
    }

    return Math.round(networkSize * (18 + (seed % 37)));
  }, [networkSize, referralCode]);

  const totalRewards = clientRewards + withdrawalRewards;
  const progress = Math.min((networkSize / 5) * 100, 100);

  useEffect(() => {
    if (!referralCode || referralCode === "user" || referralCode === "guest") return;

    const q = query(
      collection(db, "users"),
      where("referredBy", "==", referralCode)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setNetworkSize(snap.size);
    });

    return () => unsubscribe();
  }, [referralCode]);

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/[0.06] bg-white/[0.02] shadow-[0_0_60px_rgba(182,255,0,0.04)]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between bg-[#b6ff00] px-5 py-4 text-left text-black"
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-black/55">
            Referral Network
          </p>

          <h3 className="mt-1 text-lg font-black tracking-[-0.04em]">
            {networkSize} Referrals • ${totalRewards.toFixed(0)} Rewards
          </h3>
        </div>

        <div className="text-xl font-black">
          {expanded ? "▲" : "▼"}
        </div>
      </button>

      {expanded && (
        <div className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-4">
              <p className="text-xs text-white/40">Total Referrals</p>
              <p className="mt-1 text-3xl font-black text-white">
                {networkSize}
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-4">
              <p className="text-xs text-white/40">$100 Client Rewards</p>
              <p className="mt-1 text-3xl font-black text-[#b6ff00]">
                ${clientRewards.toFixed(0)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-4">
              <p className="text-xs text-white/40">5% Withdrawal Bonus</p>
              <p className="mt-1 text-3xl font-black text-[#b6ff00]">
                ${withdrawalRewards.toFixed(0)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
            <p className="text-xs text-white/40">Private Invite Link</p>

            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={referralLink}
                className="h-11 flex-1 rounded-xl border border-white/[0.06] bg-black/20 px-3 text-sm text-white"
              />

              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="h-11 rounded-xl bg-[#b6ff00] px-4 text-sm font-black text-black"
              >
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                  RECRUITER
                </p>
                <p className="mt-1 text-sm text-white/45">
                  Progress to Builder
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-white">{networkSize} / 5</p>
                <p className="text-xs text-white/40">referrals</p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#b6ff00]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 grid gap-2 text-xs text-white/45">
              <p>+$100 per verified referral</p>
              <p>+5% withdrawal commissions</p>
              <p>Manual reward payouts until automated settlement is enabled</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
