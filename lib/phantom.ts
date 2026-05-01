export const connectPhantom = async (): Promise<string | null> => {
  try {
    const provider = (window as any).solana;

    if (!provider?.isPhantom) {
      alert("Install Phantom Wallet");
      return null;
    }

    const resp = await provider.connect();
    return resp.publicKey.toString();
  } catch (err) {
    console.error(err);
    return null;
  }
};
