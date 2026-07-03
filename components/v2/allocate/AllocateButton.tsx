"use client";

type Props = {
  onClick: () => void;
};

export function AllocateButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl bg-[#b6ff00] px-6 py-4 font-bold text-black hover:opacity-90 transition"
    >
      Allocate Capital
    </button>
  );
}
