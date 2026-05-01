import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { DEPOSIT_WALLETS } from "@/lib/depositWallets";
import { SOLANA_RPC } from "@/lib/solanaRpc";

export async function sendSolWithPhantom(amountSol: number) {
  const provider = (window as any).solana;

  if (!provider?.isPhantom) {
    throw new Error("Phantom wallet not found");
  }

  const connection = new Connection(SOLANA_RPC, "confirmed");

  const connectRes = await provider.connect();
  const from = connectRes.publicKey;
  const to = new PublicKey(DEPOSIT_WALLETS.SOL);

  const latestBlockhash = await connection.getLatestBlockhash("confirmed");

  const transaction = new Transaction({
    feePayer: from,
    recentBlockhash: latestBlockhash.blockhash,
  }).add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: Math.round(amountSol * LAMPORTS_PER_SOL),
    })
  );

  const signed = await provider.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());

  await connection.confirmTransaction(
    {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    },
    "confirmed"
  );

  return signature;
}
