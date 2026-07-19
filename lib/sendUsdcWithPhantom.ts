import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

import {
  SOLANA_USDC_MINT,
  USDC_DECIMALS,
} from "@/lib/challengeUsdc";

import { SOLANA_RPC } from "@/lib/solanaRpc";

export async function sendUsdcWithPhantom(
  amountUsdc: number
): Promise<string> {
  if (!Number.isFinite(amountUsdc) || amountUsdc <= 0) {
    throw new Error("Invalid USDC amount");
  }

  const provider = (window as any).solana;

  if (!provider?.isPhantom) {
    throw new Error("Phantom wallet not found");
  }

  const recipientAddress =
    process.env.NEXT_PUBLIC_CHALLENGE_USDC_WALLET;

  if (!recipientAddress) {
    throw new Error("Challenge payment wallet is not configured");
  }

  const connection = new Connection(SOLANA_RPC, "confirmed");

  const connectionResult = await provider.connect();
  const payer = new PublicKey(connectionResult.publicKey);
  const recipientOwner = new PublicKey(recipientAddress);
  const mint = new PublicKey(SOLANA_USDC_MINT);

  const senderAta = await getAssociatedTokenAddress(
    mint,
    payer
  );

  const recipientAta = await getAssociatedTokenAddress(
    mint,
    recipientOwner
  );

  const senderAccount =
    await connection.getAccountInfo(senderAta);

  if (!senderAccount) {
    throw new Error(
      "Your Phantom wallet does not contain Solana USDC"
    );
  }

  const transaction = new Transaction();

  const recipientAccount =
    await connection.getAccountInfo(recipientAta);

  if (!recipientAccount) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        recipientAta,
        recipientOwner,
        mint
      )
    );
  }

  const rawAmount = BigInt(
    Math.round(amountUsdc * 10 ** USDC_DECIMALS)
  );

  transaction.add(
    createTransferCheckedInstruction(
      senderAta,
      mint,
      recipientAta,
      payer,
      rawAmount,
      USDC_DECIMALS
    )
  );

  const latestBlockhash =
    await connection.getLatestBlockhash("confirmed");

  transaction.feePayer = payer;
  transaction.recentBlockhash =
    latestBlockhash.blockhash;

  const signed =
    await provider.signTransaction(transaction);

  const signature =
    await connection.sendRawTransaction(
      signed.serialize(),
      {
        skipPreflight: false,
        maxRetries: 3,
      }
    );

  const confirmation =
    await connection.confirmTransaction(
      {
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight:
          latestBlockhash.lastValidBlockHeight,
      },
      "confirmed"
    );

  if (confirmation.value.err) {
    throw new Error("USDC transaction failed");
  }

  return signature;
}
