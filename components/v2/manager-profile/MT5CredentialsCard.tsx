"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";

type Credentials = {
  accountId: string;
  login: string;
  password: string | null;
  investorPassword: string | null;
  server: string;
  broker: string;
  accountSize: number;
  status: string;
  lastSyncAt: number | null;
};

export function MT5CredentialsCard({
  strategyId,
  strategyName,
}: {
  strategyId: string;
  strategyName: string;
}) {
  const [credentials, setCredentials] =
    useState<Credentials | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showPasswords, setShowPasswords] =
    useState(false);

  const [copiedField, setCopiedField] =
    useState<string | null>(null);

  async function loadCredentials() {
    const user = auth.currentUser;

    if (!user) {
      setError("Login required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const idToken = await user.getIdToken();

      const response = await fetch(
        "/api/mt5/credentials",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            strategyId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(
          data.error ||
            "Could not load MT5 credentials."
        );
      }

      setCredentials(data.mt5);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not load MT5 credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copy(
    value: string | null,
    field: string
  ) {
    if (!value) {
      setError("This credential is not available.");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea =
          document.createElement("textarea");

        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const copied =
          document.execCommand("copy");

        textarea.remove();

        if (!copied) {
          throw new Error("Clipboard unavailable");
        }
      }

      setError("");
      setCopiedField(field);

      window.setTimeout(() => {
        setCopiedField((current) =>
          current === field ? null : current
        );
      }, 1600);
    } catch {
      setError(
        "Could not copy automatically. Show the password and copy it manually."
      );
    }
  }

  return (
    <section className="rounded-[30px] border border-[#b6ff00]/20 bg-[#b6ff00]/[0.035] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b6ff00]">
            MT5 Access
          </p>

          <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">
            {strategyName}
          </h3>

          <p className="mt-2 text-sm text-white/40">
            Your private trading credentials.
          </p>
        </div>

        {credentials ? (
          <span className="rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-[#b6ff00]">
            {credentials.status}
          </span>
        ) : null}
      </div>

      {!credentials ? (
        <button
          type="button"
          onClick={loadCredentials}
          disabled={loading}
          className="mt-6 h-13 w-full rounded-full bg-[#b6ff00] px-6 text-[10px] font-black uppercase tracking-[0.16em] text-black disabled:opacity-40"
        >
          {loading
            ? "Loading Credentials..."
            : "Reveal MT5 Credentials"}
        </button>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Credential
              label="Login"
              value={credentials.login}
              onCopy={() =>
                copy(credentials.login, "login")
              }
              copied={copiedField === "login"}
            />

            <Credential
              label="Server"
              value={credentials.server}
              onCopy={() =>
                copy(credentials.server, "server")
              }
              copied={copiedField === "server"}
            />

            <Credential
              label="Master Password"
              value={
                showPasswords
                  ? credentials.password ||
                    "Not available"
                  : "••••••••••••"
              }
              onCopy={() =>
                copy(
                  credentials.password,
                  "masterPassword"
                )
              }
              copied={
                copiedField === "masterPassword"
              }
            />

            <Credential
              label="Investor Password"
              value={
                showPasswords
                  ? credentials.investorPassword ||
                    "Not available"
                  : "••••••••••••"
              }
              onCopy={() =>
                copy(
                  credentials.investorPassword,
                  "investorPassword"
                )
              }
              copied={
                copiedField === "investorPassword"
              }
            />

            <Credential
              label="Broker"
              value={credentials.broker}
            />

            <Credential
              label="Account Size"
              value={`$${credentials.accountSize.toLocaleString()}`}
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setShowPasswords((value) => !value)
            }
            className="mt-4 w-full rounded-full border border-white/10 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/55"
          >
            {showPasswords
              ? "Hide Passwords"
              : "Show Passwords"}
          </button>
        </>
      )}

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function Credential({
  label,
  value,
  onCopy,
  copied = false,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/25">
        {label}
      </p>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="min-w-0 break-all text-sm font-black text-white">
          {value}
        </p>

        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-[#b6ff00] transition hover:bg-[#b6ff00]/20"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
