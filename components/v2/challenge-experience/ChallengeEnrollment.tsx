"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { sendUsdcWithPhantom } from "@/lib/sendUsdcWithPhantom";
import { ChallengeTiers } from "@/core/v2/challenge/tiers";

type TierId = "demo_50k" | "demo_200k";

type RegistrationResult = {
  entryId: string;
  tierId: TierId;
  amountUsd: number;
  alreadyRegistered: boolean;
};

const tiers: Array<{
  id: TierId;
  label: string;
  capital: string;
  fee: number;
}> = [
  {
    id: ChallengeTiers.demo_50k.id,
    label: ChallengeTiers.demo_50k.label,
    capital: ChallengeTiers.demo_50k.displayCapital,
    fee: ChallengeTiers.demo_50k.feeUsd,
  },
  {
    id: ChallengeTiers.demo_200k.id,
    label: ChallengeTiers.demo_200k.label,
    capital: ChallengeTiers.demo_200k.displayCapital,
    fee: ChallengeTiers.demo_200k.feeUsd,
  },
];

export function ChallengeEnrollment({
  strategyId,
}: {
  strategyId: string;
}) {
  const [tierId, setTierId] =
    useState<TierId>("demo_50k");

  const [strategyName, setStrategyName] =
    useState("Your Strategy");

  const [registration, setRegistration] =
    useState<RegistrationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [provisionStep, setProvisionStep] = useState(0);
  const [message, setMessage] = useState("");
  const [assignedMt5, setAssignedMt5] = useState<{
    accountId: string;
    accountLogin: string;
    server: string;
    broker: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    fetch(
      `/api/runtime/strategy/${encodeURIComponent(strategyId)}`,
      { cache: "no-store" }
    )
      .then((response) => response.json())
      .then((data) => {
        const name =
          data?.runtime?.name ||
          data?.strategy?.identity?.name;

        if (name) setStrategyName(name);
      })
      .catch(() => {});
  }, [strategyId]);

  async function simulatePayment() {
    if (!registration) return;

    const user = auth.currentUser;

    if (!user) {
      setMessage("Login required to provision your account.");
      return;
    }

    setPaying(true);
    setProvisionStep(1);
    setMessage("");

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 450)
      );

      setProvisionStep(2);

      const idToken = await user.getIdToken();

      await new Promise((resolve) =>
        setTimeout(resolve, 450)
      );

      setProvisionStep(3);

      const response = await fetch(
        "/api/dev/payments/challenge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            challengeEntryId:
              registration.entryId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.error ||
            "Could not provision the Challenge account."
        );
      }

      setProvisionStep(4);

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      setProvisionStep(5);
      setAssignedMt5(data.mt5);

      setMessage(
        data.alreadyProvisioned
          ? "Your MT5 account was already provisioned."
          : "Your Bullions trading environment is ready."
      );
    } catch (error) {
      setProvisionStep(0);

      setMessage(
        error instanceof Error
          ? error.message
          : "Provisioning failed."
      );
    } finally {
      setPaying(false);
    }
  }

  async function payWithPhantom() {
    if (!registration) return;

    const user = auth.currentUser;

    if (!user) {
      setMessage("Login required to complete payment.");
      return;
    }

    setPaying(true);
    setMessage("");

    try {
      const signature = await sendUsdcWithPhantom(
        registration.amountUsd
      );

      setMessage(
        "Transaction sent. Bullions is verifying the payment..."
      );

      const idToken = await user.getIdToken();

      const response = await fetch(
        "/api/payments/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            challengeEntryId:
              registration.entryId,
            signature,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.error || "Payment verification failed."
        );
      }

      if (!data.mt5) {
        throw new Error(
          "Payment confirmed, but no MT5 account was returned."
        );
      }

      setAssignedMt5(data.mt5);
      setMessage(
        data.alreadyConfirmed
          ? "Payment was already confirmed. Your MT5 account is ready."
          : "Payment confirmed. Your MT5 account has been assigned."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "USDC payment failed."
      );
    } finally {
      setPaying(false);
    }
  }

  async function registerChallenge() {
    const user = auth.currentUser;

    if (!user) {
      setMessage("Login required to enter the Challenge.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const idToken = await user.getIdToken();

      const response = await fetch(
        "/api/challenge/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            strategyId,
            tierId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.error || "Challenge registration failed."
        );
      }

      const entry = data.entry || {};

      setRegistration({
        entryId: String(entry.id || ""),
        tierId: entry.tierId || tierId,
        amountUsd: Number(
          data.checkout?.amountUsd ||
            entry.entryFeeUsd ||
            ChallengeTiers[tierId].feeUsd
        ),
        alreadyRegistered:
          data.alreadyRegistered === true,
      });

      setMessage(
        data.alreadyRegistered
          ? "This strategy is already registered."
          : "Challenge entry created. Continue to payment."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Challenge registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedTier =
    tiers.find((tier) => tier.id === tierId) ??
    tiers[0];

  return (
    <main className="min-h-screen bg-[#050607] px-4 py-10 text-white">
      <div className="mx-auto max-w-[980px]">
        <a
          href="/challenge"
          className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35 hover:text-white"
        >
          ← Back to Challenge
        </a>

        <section className="mt-6 overflow-hidden rounded-[38px] border border-white/10 bg-[#080909]">
          <div className="border-b border-white/10 px-7 py-8 sm:px-10">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
              Challenge Enrollment
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] sm:text-5xl">
              Choose your account.
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/40">
              Strategy:{" "}
              <span className="font-black text-white">
                {strategyName}
              </span>
            </p>
          </div>

          <div className="grid gap-4 p-7 sm:grid-cols-2 sm:p-10">
            {tiers.map((tier) => {
              const selected = tier.id === tierId;

              return (
                <button
                  key={tier.id}
                  type="button"
                  disabled={Boolean(registration)}
                  onClick={() => setTierId(tier.id)}
                  className={`rounded-[28px] border p-6 text-left transition ${
                    selected
                      ? "border-[#b6ff00]/35 bg-[#b6ff00]/[0.07]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                    Demo Account
                  </p>

                  <p className="mt-4 text-4xl font-black text-white">
                    {tier.capital}
                  </p>

                  <p className="mt-5 text-sm font-black text-[#b6ff00]">
                    ${tier.fee.toLocaleString()} entry
                  </p>

                  <p className="mt-3 text-xs leading-6 text-white/35">
                    Includes account provisioning, MT5 monitoring,
                    leaderboard eligibility and Runtime tracking.
                  </p>
                </button>
              );
            })}
          </div>

          <div className="border-t border-white/10 p-7 sm:p-10">
            {!registration ? (
              <button
                type="button"
                onClick={registerChallenge}
                disabled={loading}
                className="h-14 w-full rounded-full bg-[#b6ff00] px-9 text-[10px] font-black uppercase tracking-[0.18em] text-black disabled:opacity-40"
              >
                {loading
                  ? "Creating Entry..."
                  : `Continue — $${selectedTier.fee.toLocaleString()}`}
              </button>
            ) : (
              <div className="rounded-[26px] border border-[#b6ff00]/20 bg-[#b6ff00]/[0.06] p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b6ff00]">
                  Entry Created
                </p>

                <p className="mt-3 text-2xl font-black">
                  Payment required: $
                  {registration.amountUsd.toLocaleString()}
                </p>

                <p className="mt-2 break-all text-xs text-white/35">
                  Entry ID: {registration.entryId}
                </p>

                {!assignedMt5 ? (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={payWithPhantom}
                      disabled={paying}
                      aria-label={`Pay ${registration.amountUsd} USDC using Phantom Wallet`}
                      className="group relative w-full overflow-hidden rounded-[30px] border border-[#ab9ff2]/45 bg-[linear-gradient(135deg,#30225c_0%,#1a1231_52%,#0b0812_100%)] p-6 text-left shadow-[0_24px_80px_rgba(126,96,210,0.24)] transition duration-300 hover:-translate-y-0.5 hover:border-[#c8beff]/75 hover:shadow-[0_28px_90px_rgba(126,96,210,0.34)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#ab9ff2]/25 blur-3xl" />

                      <span className="relative flex items-center gap-5">
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-white/20 bg-[#ab9ff2] shadow-[0_16px_45px_rgba(171,159,242,0.4)]">
                          <Image
                            src="/phantom.png"
                            alt="Phantom Wallet"
                            width={48}
                            height={48}
                            className="h-12 w-12 object-contain"
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-[9px] font-black uppercase tracking-[0.26em] text-[#d7d0ff]">
                            Required payment method
                          </span>

                          <span className="mt-1 block text-xl font-black tracking-[-0.035em] text-white sm:text-2xl">
                            {paying
                              ? "Verifying with Phantom..."
                              : "Continue with Phantom"}
                          </span>

                          <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
                            {registration.amountUsd} USDC · Solana Network
                          </span>
                        </span>

                        <span className="hidden shrink-0 rounded-full border border-[#c8beff]/30 bg-[#ab9ff2]/10 px-4 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-[#d7d0ff] sm:block">
                          Open Wallet →
                        </span>
                      </span>
                    </button>

                    <div className="mt-3 flex items-center justify-center gap-2 text-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ab9ff2]" />
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
                        Phantom Wallet required · USDC on Solana only
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-[24px] border border-[#b6ff00]/20 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b6ff00]">
                          MT5 Account Assigned
                        </p>

                        <p className="mt-2 text-2xl font-black text-white">
                          {assignedMt5.accountLogin}
                        </p>
                      </div>

                      <span className="rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-[#b6ff00]">
                        {assignedMt5.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Credential
                        label="Server"
                        value={assignedMt5.server}
                      />

                      <Credential
                        label="Broker"
                        value={assignedMt5.broker}
                      />
                    </div>

                    <p className="mt-5 text-xs leading-6 text-white/35">
                      Bullions is waiting for the first MT5 snapshot. The account will switch from ASSIGNED to LIVE automatically.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <a
                        href={`/trading-desk?strategyId=${encodeURIComponent(strategyId)}`}
                        className="inline-flex h-13 items-center justify-center rounded-full bg-[#b6ff00] px-7 text-[10px] font-black uppercase tracking-[0.16em] text-black"
                      >
                        Enter Trading Desk
                      </a>

                      <a
                        href={`/s/${strategyId}`}
                        className="inline-flex h-13 items-center justify-center rounded-full border border-white/10 px-7 text-[10px] font-black uppercase tracking-[0.16em] text-white/55"
                      >
                        View Strategy
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paying && provisionStep > 0 ? (
              <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b6ff00]">
                  Provisioning Bullions Workspace
                </p>

                <div className="mt-4 space-y-3">
                  <ProvisionRow
                    label="Confirming Challenge entry"
                    complete={provisionStep >= 1}
                  />

                  <ProvisionRow
                    label="Processing payment"
                    complete={provisionStep >= 2}
                  />

                  <ProvisionRow
                    label="Reserving MT5 account"
                    complete={provisionStep >= 3}
                  />

                  <ProvisionRow
                    label="Binding strategy and Runtime"
                    complete={provisionStep >= 4}
                  />

                  <ProvisionRow
                    label="Trading environment ready"
                    complete={provisionStep >= 5}
                  />
                </div>
              </div>
            ) : null}

            {message ? (
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                {message}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}


function Credential({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/25">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-black text-white">
        {value || "Pending"}
      </p>
    </div>
  );
}


function ProvisionRow({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-black ${
          complete
            ? "border-[#b6ff00]/25 bg-[#b6ff00]/10 text-[#b6ff00]"
            : "border-white/10 text-white/20"
        }`}
      >
        {complete ? "✓" : "·"}
      </span>

      <p
        className={`text-sm ${
          complete
            ? "text-white/70"
            : "text-white/25"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
