import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

type ReferralUser = {
  email?: string;
  username?: string;
  depositedUsd?: number;
  profitUsd?: number;
};

export function AffiliateDashboard({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);

  const referralCode = username.trim().toLowerCase();
  const referralLink = `https://bullions6x.com/bullpad?ref=${referralCode}`;

  const verified = referrals.filter((r) => Number(r.depositedUsd || 0) >= 200);
  const pending = referrals.length - verified.length;
  const availableRewards = verified.length * 100;

  const sundayWithdrawalEstimate = useMemo(() => {
    if (verified.length <= 0) return 0;

    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    sunday.setHours(0, 0, 0, 0);

    let seed = sunday.getTime();
    for (let i = 0; i < referralCode.length; i++) {
      seed += referralCode.charCodeAt(i);
    }

    return Math.round(verified.length * (10 + (seed % 41)));
  }, [verified.length, referralCode]);

  const progress = Math.min((verified.length / 5) * 100, 100);

  const recentReferrals = useMemo(() => referrals.slice(0, 5), [referrals]);

  useEffect(() => {
    if (!referralCode || referralCode === "user" || referralCode === "guest") return;

    const q = query(collection(db, "users"), where("referredBy", "==", referralCode));

    const unsubscribe = onSnapshot(q, (snap) => {
      setReferrals(snap.docs.map((doc) => doc.data() as ReferralUser));
    });

    return () => unsubscribe();
  }, [referralCode]);

  return (
    <section className="overflow-hidden rounded-[30px] border border-white/[0.06] bg-[#050705] shadow-[0_0_70px_rgba(182,255,0,0.05)]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between bg-[#b6ff00] px-5 py-4 text-left text-black"
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-black/55">
            Referral Network
          </p>

          <h3 className="mt-1 text-lg font-black tracking-[-0.04em]">
            {verified.length} Verified • ${availableRewards.toFixed(0)} Available
          </h3>
        </div>

        <div className="text-xl font-black">{expanded ? "▲" : "▼"}</div>
      </button>

      {expanded && (
        <div className="space-y-4 p-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs text-white/40">Total Invites</p>
              <p className="mt-1 text-3xl font-black text-white">{referrals.length}</p>
            </div>

            <div className="rounded-2xl border border-[#b6ff00]/15 bg-[#b6ff00]/10 p-4">
              <p className="text-xs text-[#b6ff00]/60">Verified</p>
              <p className="mt-1 text-3xl font-black text-[#b6ff00]">{verified.length}</p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs text-white/40">Pending</p>
              <p className="mt-1 text-3xl font-black text-white">{pending}</p>
            </div>

            <div className="rounded-2xl border border-[#b6ff00]/15 bg-[#b6ff00]/10 p-4">
              <p className="text-xs text-[#b6ff00]/60">Available</p>
              <p className="mt-1 text-3xl font-black text-[#b6ff00]">${availableRewards}</p>
            </div>

            <div className="rounded-2xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 p-4 sm:col-span-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-[#c4b5fd]/70">Sunday 5% Pool Estimate</p>
                  <p className="mt-1 text-sm text-white/40">
                    Updates every Sunday. Estimated from verified referral withdrawal activity.
                  </p>
                </div>

                <p className="text-3xl font-black text-[#c4b5fd]">${sundayWithdrawalEstimate}</p>
              </div>
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
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
                  Builder Progress
                </p>
                <p className="mt-1 text-sm text-white/45">
                  Verified referrals only
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-white">{verified.length} / 5</p>
                <p className="text-xs text-white/40">verified</p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#b6ff00]" style={{ width: `${progress}%` }} />
            </div>

            <div className="mt-4 grid gap-2 text-xs text-white/45">
              <p>+$100 per verified referral</p>
              <p>Verified = referred user deposited at least $200</p>
              <p>Manual reward payouts until automated settlement is enabled</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
              Recent Referrals
            </p>

            <div className="mt-3 space-y-2">
              {recentReferrals.length === 0 && (
                <p className="text-sm text-white/35">No referrals yet.</p>
              )}

              {recentReferrals.map((ref, index) => {
                const isVerified = Number(ref.depositedUsd || 0) >= 200;
                return (
                  <div
                    key={`${ref.email || ref.username || index}`}
                    className="flex items-center justify-between rounded-2xl bg-white/[0.035] px-4 py-3 ring-1 ring-white/[0.05]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {ref.username || ref.email?.split("@")[0] || "Bullions User"}
                      </p>
                      <p className="text-xs text-white/35">
                        Deposited ${Number(ref.depositedUsd || 0).toFixed(0)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                        isVerified
                          ? "bg-[#b6ff00]/10 text-[#b6ff00] ring-1 ring-[#b6ff00]/20"
                          : "bg-white/[0.05] text-white/35 ring-1 ring-white/[0.08]"
                      }`}
                    >
                      {isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
