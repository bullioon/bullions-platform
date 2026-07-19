"use client";

import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  strategyId: string;
};

export function AllocateModal({
  open,
  onClose,
  strategyId,
}: Props) {
  const router = useRouter();

  if (!open) return null;

  function openBullPad() {
    router.push(
      `/bullpad?strategy=${encodeURIComponent(strategyId)}#copy-terminal`
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-[#090909] p-7 text-white shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
          BullPad Allocation
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-[-0.055em]">
          Continue in BullPad
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/45">
          BullPad will open with this strategy selected. Review your balance,
          tier limits and allocation before activating the fund.
        </p>

        <button
          type="button"
          onClick={openBullPad}
          className="mt-7 w-full rounded-2xl bg-[#b6ff00] py-4 text-sm font-black uppercase tracking-[0.16em] text-black"
        >
          Open BullPad →
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-2xl border border-white/10 py-4 text-sm font-black uppercase tracking-[0.16em] text-white/55"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
