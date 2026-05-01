import { Connection, PublicKey } from "@solana/web3.js";
import { SOLANA_RPC } from "@/lib/solanaRpc";
import { DEPOSIT_WALLET } from "@/lib/depositWallet";

export async function verifySolDeposit(txHash: string) {
  const connection = new Connection(SOLANA_RPC, "confirmed");

  const tx = await connection.getParsedTransaction(txHash, {
    maxSupportedTransactionVersion: 0,
  });

  if (!tx) throw new Error("Transaction not found");

  const instructions = tx.transaction.message.instructions;

  let received = 0;

  for (const ix of instructions as any[]) {
    if (ix.parsed?.type === "transfer") {
      const info = ix.parsed.info;

      if (info.destination === DEPOSIT_WALLET) {
        received += info.lamports / 1e9;
      }
    }
  }

  if (received <= 0) {
    throw new Error("No SOL sent to deposit wallet");
  }

  return received;
}
