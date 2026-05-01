export function SkullMark({ size = 88 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-full bg-lime-400/10 shadow-[0_0_38px_rgba(163,255,18,.55)]"
      style={{ width: size, height: size }}
    >
      <span className="text-5xl">🐂</span>
    </div>
  );
}
