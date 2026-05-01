export async function getSolPriceUsd() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Failed to fetch SOL price");

  const data = await res.json();
  return Number(data.solana.usd);
}
