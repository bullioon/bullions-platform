type Props = {
  label: string;
  value: string;
  helper?: string;
  tone?: "green" | "neutral";
};

export function Stat({
  label,
  value,
  helper,
  tone = "neutral",
}: Props) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">
        {label}
      </p>

      <p
        className={
          tone === "green"
            ? "mt-3 text-4xl font-black tracking-[-0.05em] text-[#b6ff00]"
            : "mt-3 text-4xl font-black tracking-[-0.05em] text-white"
        }
      >
        {value}
      </p>

      {helper ? (
        <p className="mt-2 text-sm text-white/35">{helper}</p>
      ) : null}
    </div>
  );
}
