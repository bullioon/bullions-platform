"use client";
import { useEffect, useMemo, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { QRCodeSVG } from "qrcode.react";
import { DEPOSIT_WALLETS } from "@/lib/depositWallets";
import { SOLANA_RPC } from "@/lib/solanaRpc";
import { getSolPriceUsd } from "@/lib/price";
import { sendSolWithPhantom } from "@/lib/sendSol";
type Props = {
  type: "deposit" | "withdraw";
  amount: number;
  network: "SOL" | "BTC";
  txHash?: string;
  onAmountChange: (amount: number) => void;
  onNetworkChange: (network: "SOL" | "BTC") => void;
  onTxHashChange?: (tx: string) => void;
  onClose: () => void;
  onConfirm?: () => void;
  onAutoVerified?: (data: {
    network: "SOL";
    amountUsd: number;
    amountCrypto: number;
    txHash: string;
  }) => void;
};
const MIN_DEPOSIT = 200;
const assets = [
  { symbol: "SOL", name: "Solana", icon: "/assets/solana.png", time: "~15 sec" },
] as const;
export function CashModal({
  amount,
  network,
  onAmountChange,
  onNetworkChange,
  onClose,
  onAutoVerified,
}: Props) {
  const [step, setStep] = useState<"asset" | "network" | "warning" | "receive">("asset");
  const [status, setStatus] = useState<"idle" | "waiting" | "verified">("idle");
  const [lastTx, setLastTx] = useState("500");
  const [solPriceUsd, setSolPriceUsd] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    async function loadSolPrice() {
      try {
        const price = await getSolPriceUsd();
        if (active) setSolPriceUsd(price);
      } catch (error) {
        console.error("SOL price error:", error);
      }
    }
    loadSolPrice();
    const interval = setInterval(loadSolPrice, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);
  const depositAddress = DEPOSIT_WALLETS[network];
  const selectedAsset = assets.find((a) => a.symbol === network);
  const cryptoAmount =
    network === "SOL" && solPriceUsd ? amount / solPriceUsd : 0;
  const paymentUri = useMemo(() => {
    if (network === "SOL") {
      return `solana:${depositAddress}?amount=${cryptoAmount.toFixed(6)}`;
    }
    return depositAddress;
  }, [network, depositAddress, cryptoAmount]);
  useEffect(() => {
    if (step !== "receive") return;
    if (network !== "SOL") return;
    if (amount < MIN_DEPOSIT) return;
    if (status !== "waiting") return;
    const connection = new Connection(SOLANA_RPC, "confirmed");
    const wallet = new PublicKey(DEPOSIT_WALLETS.SOL);
    const expectedSol = cryptoAmount;
    const interval = setInterval(async () => {
      try {
        const signatures = await connection.getSignaturesForAddress(wallet, { limit: 10 });
        for (const sig of signatures) {
          if (!sig.signature || sig.signature === lastTx) continue;
          const tx = await connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          });
          if (!tx?.meta) continue;
          const keys = tx.transaction.message.accountKeys.map((a) => a.pubkey.toBase58());
          const walletIndex = keys.findIndex((key) => key === DEPOSIT_WALLETS.SOL);
          if (walletIndex === -1) continue;
          const pre = tx.meta.preBalances[walletIndex] || 0;
          const post = tx.meta.postBalances[walletIndex] || 0;
          const receivedSol = (post - pre) / 1_000_000_000;
          if (receivedSol >= expectedSol * 0.98) {
            setLastTx(sig.signature);
            setStatus("verified");
            onAutoVerified?.({
              network: "SOL",
              amountUsd: amount,
              amountCrypto: receivedSol,
              txHash: sig.signature,
            });
            clearInterval(interval);
            return;
          }
        }
      } catch (error) {
        console.error("Deposit listener error:", error);
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [step, network, amount, cryptoAmount, status, lastTx, onAutoVerified]);
  function goBack() {
    if (step === "asset") return onClose();
    if (step === "network") return setStep("asset");
    if (step === "warning") return setStep("network");
    if (step === "receive") return setStep("network");
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
      <section className="max-h-[92vh] w-full max-w-[500px] overflow-y-auto rounded-[34px] bg-[#121417] p-7 shadow-[0_24px_90px_rgba(0,0,0,.75)] ring-1 ring-white/5 scrollbar-hide">
        <div className="mb-6 grid grid-cols-[40px_1fr_40px] items-center">
          <button onClick={goBack} className="grid h-10 w-10 place-items-center rounded-full text-2xl text-white/80 hover:bg-white/[0.06]">
            ←
          </button>
          <h2 className="text-center text-xl font-semibold text-white">
            {step === "asset" && "Select asset to receive"}
            {step === "network" && "Select network"}
            {step === "warning" && "Warning"}
            {step === "receive" && `Receive ${network}`}
          </h2>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.08] text-xl text-white/80 hover:bg-white/[0.12]">
            ×
          </button>
        </div>
        {step === "asset" && (
          <>
            <div className="mb-5 rounded-full bg-white/[0.08] px-5 py-4 text-lg text-white/45">
              🔍 Search
            </div>
            <div className="space-y-2">
              {assets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => {
                    onNetworkChange(asset.symbol);
                    setStep("network");
                  }}
                  className="grid w-full grid-cols-[52px_1fr_auto] items-center gap-4 rounded-[20px] px-3 py-4 text-left hover:bg-white/[0.06]"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-white/95 p-2">
                    <img src={asset.icon} alt={asset.name} className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{asset.name}</p>
                    <p className="text-sm text-white/45">{asset.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white/45">—</p>
                    <p className="text-sm text-white/45">Receive {asset.symbol}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
        {step === "network" && (
          <>
            <div className="mb-6 rounded-[22px] bg-white/[0.08] p-5">
              <p className="text-sm font-semibold text-white">What should I pick?</p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Select the network you’re using to transfer the asset.
              </p>
            </div>
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-white">Supported networks</p>
              <p className="text-sm text-white/45">Est. time</p>
            </div>
            {assets.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => {
                  onNetworkChange(asset.symbol);
                  setStep("warning");
                }}
                className="grid w-full grid-cols-[52px_1fr_auto] items-center gap-4 rounded-[20px] px-3 py-4 text-left hover:bg-white/[0.06]"
              >
                <div className="grid h-11 w-11 place-items-center rounded-full bg-white/95 p-2">
                  <img src={asset.icon} alt={asset.name} className="h-full w-full object-contain" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{asset.name}</p>
                  <p className="text-sm text-white/45">
                    {asset.symbol === "SOL" ? "Solana network" : "Bitcoin network"}
                  </p>
                </div>
                <p className="text-sm font-medium text-white/70">{asset.time}</p>
              </button>
            ))}
          </>
        )}
        {step === "warning" && (
          <div className="text-center">
            <div className="relative mx-auto mb-6 flex h-[280px] w-full max-w-[390px] items-center justify-center overflow-hidden rounded-[26px] bg-[#121417]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(182,255,0,0.20),transparent_58%)]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#121417]" />
              <img
                src="/warning.png"
                alt="Bullions warning"
                className="relative z-10 h-full w-full scale-[1.22] select-none object-cover object-center opacity-90 mix-blend-screen"
              />
            </div>
            <h3 className="text-[42px] font-semibold tracking-tight text-white">
              Warning
            </h3>
            <p className="mx-auto mt-5 max-w-[370px] text-[16px] leading-8 text-white/55">
              Receiving crypto over the wrong network could mean losing your funds.
              Be sure to choose the right network.
            </p>
            <button
              onClick={() => setStep("receive")}
              className="mt-9 h-[60px] w-full rounded-full bg-[#b6ff00] text-sm font-semibold text-black shadow-[0_0_45px_rgba(182,255,0,0.18)] transition hover:opacity-90 active:scale-[0.98]"
            >
              I understand
            </button>
          </div>
        )}
        {step === "receive" && (
          <>
            <p className="mb-6 text-center text-sm text-white/45">
              on the {selectedAsset?.name} network
            </p>
            <label className="text-xs text-white/45">Amount USD</label>
            <div className="mt-2 rounded-full bg-black/25 px-5 py-4 ring-1 ring-white/10">
              <input
                type="number"
                value={amount || ""}
                onChange={(e) => {
                  onAmountChange(Number(e.target.value));
                  setStatus("idle");
                }}
                placeholder="0"
                className="w-full bg-transparent text-3xl font-semibold text-white outline-none placeholder:text-white/20"
              />
            </div>
            {amount > 0 && amount < MIN_DEPOSIT && (
              <p className="mt-2 text-xs text-red-400">Minimum deposit is $200</p>
            )}
            {amount >= MIN_DEPOSIT && (
              <>
                <div className="mt-6 rounded-[22px] border border-[#8b5cf6]/35 bg-[#8b5cf6]/10 p-4 shadow-[0_0_35px_rgba(139,92,246,0.12)]">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#8b5cf6]/20 ring-1 ring-[#8b5cf6]/30">
                      <img
                        src="/assets/phantom.png"
                        alt="Phantom Wallet"
                        className="h-8 w-8 object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        Payment via <span className="text-[#a78bfa]">Phantom Wallet</span>
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/55">
                        Scan this QR with Phantom or tap Pay with Phantom. The SOL amount and wallet address will be filled automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative mt-5 overflow-hidden rounded-[28px] bg-[#1b1d22] p-6 ring-1 ring-white/5">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(182,255,0,0.16),transparent_58%)]" />
                  <div className="relative z-10 mx-auto grid h-[210px] w-[210px] place-items-center rounded-[26px] bg-white p-3 shadow-[0_0_45px_rgba(182,255,0,0.18)]">
                    <QRCodeSVG value={paymentUri} size={180} />
                  </div>
                  <div className="relative z-10 mt-5 text-center">
                    <p className="text-xs text-white/45">Send exactly</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-[#b6ff00]">
                      {solPriceUsd ? cryptoAmount.toFixed(4) : "..."} {network}
                    </p>
                    {network === "SOL" && solPriceUsd && (
                      <p className="mt-1 text-xs text-white/40">
                        Live SOL price: ${solPriceUsd.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-sm font-semibold text-white">Your address</p>
                  <div className="mt-3 flex items-center gap-3 rounded-full bg-black/25 px-4 py-3 ring-1 ring-white/5">
                    <p className="min-w-0 flex-1 truncate text-sm text-white/65">
                      {depositAddress}
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(depositAddress)}
                      className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.08] text-white/70 transition hover:bg-white/[0.12]"
                    >
                      ⧉
                    </button>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (network !== "SOL") return;
                    try {
                      setStatus("waiting");
                      const signature = await sendSolWithPhantom(cryptoAmount);
                      setStatus("verified");
                      onAutoVerified?.({
                        network: "SOL",
                        amountUsd: amount,
                        amountCrypto: cryptoAmount,
                        txHash: signature,
                      });
                    } catch (error) {
                      console.error("Phantom payment failed:", error);
                      setStatus("idle");
                      alert("Payment failed or cancelled.");
                    }
                  }}
                  disabled={network !== "SOL" || amount < MIN_DEPOSIT || status === "waiting" || !solPriceUsd}
                  className="mt-6 h-[56px] w-full rounded-full bg-[#b6ff00] text-sm font-semibold text-black shadow-[0_0_40px_rgba(182,255,0,0.16)] transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                >
                  {status === "idle" && "Pay with Phantom"}
                  {status === "waiting" && "Waiting for confirmation..."}
                  {status === "verified" && "Deposit verified"}
                </button>
                <button
                  onClick={() => setStatus("waiting")}
                  disabled={network !== "SOL" || status === "waiting" || status === "verified"}
                  className="mt-3 h-[46px] w-full rounded-full border border-white/10 text-xs font-semibold text-white/55 transition hover:bg-white/[0.05] disabled:opacity-40"
                >
                  {status === "waiting" ? "Scanning blockchain..." : "I already sent it — detect deposit"}
                </button>

                {status === "verified" && (
                  <div className="mt-5 animate-success-pop rounded-[24px] bg-[#b6ff00]/10 p-5 text-center ring-1 ring-[#b6ff00]/25 animate-success-glow">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#b6ff00] text-2xl text-black">
                      ✓
                    </div>

                    <h3 className="mt-4 text-xl font-semibold text-white">
                      Deposit received
                    </h3>

                    <p className="mt-2 text-sm text-white/55">
                      Your SOL deposit was confirmed and added to your Bullions balance.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
