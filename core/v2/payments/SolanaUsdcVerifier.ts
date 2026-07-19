import {
  Connection,
  PublicKey,
} from "@solana/web3.js";

import {
  getAssociatedTokenAddress,
} from "@solana/spl-token";

import {
  SOLANA_USDC_MINT,
  USDC_DECIMALS,
  getChallengeUsdcWallet,
} from "@/lib/challengeUsdc";

export type VerifiedUsdcPayment = {
  signature: string;
  senderWallet: string | null;
  recipientWallet: string;
  recipientTokenAccount: string;
  amountUsdc: number;
  slot: number;
  blockTime: number | null;
};

function getRpcUrl() {
  const rpc =
    process.env.SOLANA_RPC_URL ||
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    "";

  if (!rpc) {
    throw new Error("SOLANA_RPC_URL is not configured");
  }

  return rpc;
}

export async function verifySolanaUsdcPayment(input: {
  signature: string;
  expectedAmountUsdc: number;
}): Promise<VerifiedUsdcPayment> {
  const signature = input.signature.trim();

  if (!signature) {
    throw new Error("Missing transaction signature");
  }

  if (
    !Number.isFinite(input.expectedAmountUsdc) ||
    input.expectedAmountUsdc <= 0
  ) {
    throw new Error("Invalid expected USDC amount");
  }

  const connection = new Connection(
    getRpcUrl(),
    "confirmed"
  );

  const transaction =
    await connection.getParsedTransaction(
      signature,
      {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      }
    );

  if (!transaction) {
    throw new Error(
      "Transaction was not found or is not confirmed yet"
    );
  }

  if (transaction.meta?.err) {
    throw new Error("Transaction failed on Solana");
  }

  const recipientWallet =
    getChallengeUsdcWallet();

  const recipientOwner =
    new PublicKey(recipientWallet);

  const mint =
    new PublicKey(SOLANA_USDC_MINT);

  const recipientTokenAccount =
    await getAssociatedTokenAddress(
      mint,
      recipientOwner
    );

  const accountKeys =
    transaction.transaction.message.accountKeys;

  const recipientIndex =
    accountKeys.findIndex((account) => {
      const pubkey =
        "pubkey" in account
          ? account.pubkey
          : account;

      return (
        pubkey.toString() ===
        recipientTokenAccount.toString()
      );
    });

  if (recipientIndex === -1) {
    throw new Error(
      "USDC was not sent to the Bullions payment wallet"
    );
  }

  const preBalance =
    transaction.meta?.preTokenBalances?.find(
      (balance) =>
        balance.accountIndex === recipientIndex &&
        balance.mint === SOLANA_USDC_MINT
    );

  const postBalance =
    transaction.meta?.postTokenBalances?.find(
      (balance) =>
        balance.accountIndex === recipientIndex &&
        balance.mint === SOLANA_USDC_MINT
    );

  const preRaw = BigInt(
    preBalance?.uiTokenAmount.amount || "0"
  );

  const postRaw = BigInt(
    postBalance?.uiTokenAmount.amount || "0"
  );

  const receivedRaw = postRaw - preRaw;

  const expectedRaw = BigInt(
    Math.round(
      input.expectedAmountUsdc *
        10 ** USDC_DECIMALS
    )
  );

  if (receivedRaw !== expectedRaw) {
    const received =
      Number(receivedRaw) /
      10 ** USDC_DECIMALS;

    throw new Error(
      `Incorrect payment amount. Expected ${input.expectedAmountUsdc} USDC, received ${received} USDC`
    );
  }

  const senderAccount =
    accountKeys.find((account) => {
      return (
        "signer" in account &&
        account.signer === true
      );
    });

  const senderWallet = senderAccount
    ? senderAccount.pubkey.toString()
    : null;

  return {
    signature,
    senderWallet,
    recipientWallet,
    recipientTokenAccount:
      recipientTokenAccount.toString(),
    amountUsdc: input.expectedAmountUsdc,
    slot: transaction.slot,
    blockTime:
      transaction.blockTime || null,
  };
}
